import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkHtml from "remark-html";
import { byNewestDate, uniqueSorted } from "./format";
import { getMetaValue, getVoyageDatabase, setMetaValue } from "./voyage-db";

let blogDirectory = path.join(process.cwd(), "content", "blog");

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  updated?: string;
  authorName?: string;
  authorEmail?: string;
  tags: string[];
  category: string;
  cover?: string;
  featured: boolean;
  draft: boolean;
  content: string;
  html: string;
  excerpt: string;
  readingMinutes: number;
};

export function setBlogDirectoryForTest(directory: string) {
  blogDirectory = directory;
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function asBoolean(value: unknown) {
  return value === true;
}

function createExcerpt(content: string) {
  return content
    .replace(/[`*_#>-]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
}

function estimateReadingMinutes(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

async function renderMarkdown(content: string) {
  const processed = await remark().use(remarkHtml).process(content);
  return processed.toString();
}

function tagsToJson(tags: string[]) {
  return JSON.stringify(tags);
}

function parseTags(value: unknown) {
  if (typeof value !== "string") {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function rowToPost(row: Record<string, unknown>): BlogPost {
  return {
    slug: String(row.slug),
    title: String(row.title),
    description: String(row.description),
    date: String(row.date),
    updated: typeof row.updated === "string" && row.updated ? row.updated : undefined,
    authorName: typeof row.authorName === "string" && row.authorName ? row.authorName : undefined,
    authorEmail: typeof row.authorEmail === "string" && row.authorEmail ? row.authorEmail : undefined,
    tags: parseTags(row.tagsJson),
    category: String(row.category),
    cover: typeof row.cover === "string" && row.cover ? row.cover : undefined,
    featured: row.featured === 1,
    draft: row.draft === 1,
    content: String(row.content),
    html: String(row.html),
    excerpt: String(row.excerpt),
    readingMinutes: Number(row.readingMinutes) || 1,
  };
}

async function readMarkdownPost(filename: string): Promise<BlogPost> {
  const slug = filename.replace(/\.mdx?$/, "");
  const raw = await fs.readFile(path.join(blogDirectory, filename), "utf8");
  const parsed = matter(raw);
  const content = parsed.content;

  return {
    slug,
    title: asString(parsed.data.title, slug),
    description: asString(parsed.data.description),
    date: asString(parsed.data.date),
    updated: asString(parsed.data.updated) || undefined,
    authorName: asString(parsed.data.authorName) || undefined,
    authorEmail: asString(parsed.data.authorEmail) || undefined,
    tags: asStringArray(parsed.data.tags),
    category: asString(parsed.data.category, "notes"),
    cover: asString(parsed.data.cover) || undefined,
    featured: asBoolean(parsed.data.featured),
    draft: asBoolean(parsed.data.draft),
    content,
    html: await renderMarkdown(content),
    excerpt: createExcerpt(content),
    readingMinutes: estimateReadingMinutes(content),
  };
}

async function seedPostsFromMarkdownIfNeeded() {
  if (getMetaValue("posts_seeded") === "true") {
    return;
  }

  const db = getVoyageDatabase();
  const count = db.prepare("SELECT COUNT(*) AS count FROM posts").get() as { count?: number } | undefined;

  if ((count?.count ?? 0) === 0) {
    const filenames = await fs.readdir(blogDirectory);
    const markdownFiles = filenames.filter((filename) => /\.mdx?$/.test(filename));
    const posts = await Promise.all(markdownFiles.map(readMarkdownPost));

    const insert = db.prepare(`
      INSERT OR REPLACE INTO posts (
        slug,
        title,
        description,
        date,
        updated,
        authorName,
        authorEmail,
        tagsJson,
        category,
        cover,
        featured,
        draft,
        content,
        html,
        excerpt,
        readingMinutes,
        createdAt,
        updatedAt
      ) VALUES (
        @slug,
        @title,
        @description,
        @date,
        @updated,
        @authorName,
        @authorEmail,
        @tagsJson,
        @category,
        @cover,
        @featured,
        @draft,
        @content,
        @html,
        @excerpt,
        @readingMinutes,
        @createdAt,
        @updatedAt
      )
    `);

    const transaction = db.transaction((seedPosts: BlogPost[]) => {
      for (const post of seedPosts) {
        insert.run({
          ...post,
          tagsJson: tagsToJson(post.tags),
          featured: post.featured ? 1 : 0,
          draft: post.draft ? 1 : 0,
          createdAt: post.date,
          updatedAt: post.updated ?? post.date,
        });
      }
    });

    transaction(posts);
  }

  setMetaValue("posts_seeded", "true");
}

function readPostsQuery(includeDrafts: boolean) {
  const rows = getVoyageDatabase()
    .prepare(
      `
        SELECT *
        FROM posts
        ${includeDrafts ? "" : "WHERE draft = 0"}
        ORDER BY date DESC, slug DESC
      `,
    )
    .all() as Record<string, unknown>[];

  return rows.map(rowToPost);
}

export async function getAllPosts() {
  await seedPostsFromMarkdownIfNeeded();
  return readPostsQuery(true);
}

export async function getPublishedPosts() {
  await seedPostsFromMarkdownIfNeeded();
  return readPostsQuery(false);
}

export async function getPostBySlug(slug: string) {
  await seedPostsFromMarkdownIfNeeded();
  const row = getVoyageDatabase()
    .prepare("SELECT * FROM posts WHERE slug = ? AND draft = 0")
    .get(slug) as Record<string, unknown> | undefined;

  return row ? rowToPost(row) : null;
}

export async function getPostBySlugIncludingDrafts(slug: string) {
  await seedPostsFromMarkdownIfNeeded();
  const row = getVoyageDatabase().prepare("SELECT * FROM posts WHERE slug = ?").get(slug) as Record<string, unknown> | undefined;

  return row ? rowToPost(row) : null;
}

export async function getFeaturedPost() {
  const posts = await getPublishedPosts();
  return posts.find((post) => post.featured) ?? posts[0] ?? null;
}

export async function getAllTags() {
  const posts = await getPublishedPosts();
  return uniqueSorted(posts.flatMap((post) => post.tags));
}

export async function getAllCategories() {
  const posts = await getPublishedPosts();
  return uniqueSorted(posts.map((post) => post.category));
}

export async function getPostsByTag(tag: string) {
  const posts = await getPublishedPosts();
  return posts.filter((post) => post.tags.includes(tag));
}

export async function getPostsByCategory(category: string) {
  const posts = await getPublishedPosts();
  return posts.filter((post) => post.category === category);
}

export async function getPostRowsForTesting() {
  return byNewestDate(await getAllPosts());
}
