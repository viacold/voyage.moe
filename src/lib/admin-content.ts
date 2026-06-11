import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import type { BlogPost } from "./content";

let blogDirectory = path.join(/*turbopackIgnore: true*/ process.cwd(), "content", "blog");

export type EditableBlogPost = BlogPost;

export type SaveBlogPostInput = {
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
};

export type BlogPostRevision = EditableBlogPost & {
  revisionId: string;
  createdAt: string;
};

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function frontmatterLines(input: SaveBlogPostInput) {
  const lines = [
    "---",
    `title: ${JSON.stringify(input.title)}`,
    `description: ${JSON.stringify(input.description)}`,
    `date: ${JSON.stringify(input.date)}`,
  ];

  if (input.updated) {
    lines.push(`updated: ${JSON.stringify(input.updated)}`);
  }

  if (input.authorName) {
    lines.push(`authorName: ${JSON.stringify(input.authorName)}`);
  }

  if (input.authorEmail) {
    lines.push(`authorEmail: ${JSON.stringify(input.authorEmail)}`);
  }

  lines.push("tags:");
  for (const tag of input.tags) {
    lines.push(`  - ${tag}`);
  }
  lines.push(`category: ${JSON.stringify(input.category)}`);
  if (input.cover) {
    lines.push(`cover: ${JSON.stringify(input.cover)}`);
  }
  lines.push(`featured: ${input.featured ? "true" : "false"}`);
  lines.push(`draft: ${input.draft ? "true" : "false"}`);
  lines.push("---");
  lines.push("");
  lines.push(input.content.trimEnd());
  lines.push("");

  return lines.join("\n");
}

function revisionDirectory(slug: string) {
  return path.join(blogDirectory, ".revisions", slug);
}

function revisionIdFromFilename(filename: string) {
  return filename.replace(/\.mdx?$/, "");
}

function parseRevisionId(value?: string) {
  const normalized = typeof value === "string" ? value.trim() : "";
  return normalized || null;
}

export function setBlogDirectoryForTest(directory: string) {
  blogDirectory = directory;
}

export function buildSlugFromTitle(title: string) {
  const slug = normalizeSlug(title);
  return slug || `post-${Date.now()}`;
}

export async function listEditableBlogPosts() {
  const filenames = await fs.readdir(blogDirectory);
  const markdownFiles = filenames.filter((filename) => /\.mdx?$/.test(filename));
  const posts = await Promise.all(
    markdownFiles.map(async (filename) => {
      const slug = filename.replace(/\.mdx?$/, "");
      const raw = await fs.readFile(path.join(blogDirectory, filename), "utf8");
      const parsed = matter(raw);

      return {
        slug,
        title: typeof parsed.data.title === "string" ? parsed.data.title : slug,
        description: typeof parsed.data.description === "string" ? parsed.data.description : "",
        date: typeof parsed.data.date === "string" ? parsed.data.date : "",
        updated: typeof parsed.data.updated === "string" ? parsed.data.updated : undefined,
        authorName: typeof parsed.data.authorName === "string" ? parsed.data.authorName : undefined,
        authorEmail: typeof parsed.data.authorEmail === "string" ? parsed.data.authorEmail : undefined,
        tags: Array.isArray(parsed.data.tags) ? parsed.data.tags.filter((item): item is string => typeof item === "string") : [],
        category: typeof parsed.data.category === "string" ? parsed.data.category : "notes",
        cover: typeof parsed.data.cover === "string" ? parsed.data.cover : undefined,
        featured: parsed.data.featured === true,
        draft: parsed.data.draft === true,
        content: parsed.content,
        html: "",
        excerpt: "",
        readingMinutes: 0,
      } satisfies EditableBlogPost;
    }),
  );

  return posts.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export async function getEditableBlogPost(slug: string) {
  const posts = await listEditableBlogPosts();
  return posts.find((post) => post.slug === slug) ?? null;
}

async function archiveCurrentBlogPost(slug: string, currentRaw: string) {
  const revisionId = `${Date.now()}`;
  const directory = revisionDirectory(slug);
  await fs.mkdir(directory, { recursive: true });
  await fs.writeFile(path.join(directory, `${revisionId}.md`), currentRaw, "utf8");
}

export async function listEditableBlogPostRevisions(slug: string) {
  const directory = revisionDirectory(slug);

  try {
    const filenames = await fs.readdir(directory);
    const markdownFiles = filenames.filter((filename) => /\.mdx?$/.test(filename));
    const revisions = await Promise.all(
      markdownFiles.map(async (filename) => {
        const revisionId = revisionIdFromFilename(filename);
        const createdAt = new Date(Number(revisionId)).toISOString();
        const raw = await fs.readFile(path.join(directory, filename), "utf8");
        const parsed = matter(raw);

        return {
          slug,
          revisionId,
          createdAt,
          title: typeof parsed.data.title === "string" ? parsed.data.title : slug,
          description: typeof parsed.data.description === "string" ? parsed.data.description : "",
          date: typeof parsed.data.date === "string" ? parsed.data.date : "",
          updated: typeof parsed.data.updated === "string" ? parsed.data.updated : undefined,
          authorName: typeof parsed.data.authorName === "string" ? parsed.data.authorName : undefined,
          authorEmail: typeof parsed.data.authorEmail === "string" ? parsed.data.authorEmail : undefined,
          tags: Array.isArray(parsed.data.tags)
            ? parsed.data.tags.filter((item): item is string => typeof item === "string")
            : [],
          category: typeof parsed.data.category === "string" ? parsed.data.category : "notes",
          cover: typeof parsed.data.cover === "string" ? parsed.data.cover : undefined,
          featured: parsed.data.featured === true,
          draft: parsed.data.draft === true,
          content: parsed.content,
          html: "",
          excerpt: "",
          readingMinutes: 0,
        } satisfies BlogPostRevision;
      }),
    );

    return revisions.sort((a, b) => Number(b.revisionId) - Number(a.revisionId));
  } catch {
    return [];
  }
}

export async function saveBlogPost(input: SaveBlogPostInput) {
  const slug = normalizeSlug(input.slug);
  if (!slug) {
    throw new Error("请输入有效的文章 slug。");
  }

  await fs.mkdir(blogDirectory, { recursive: true });
  const filename = path.join(blogDirectory, `${slug}.md`);
  const nextRaw = frontmatterLines(input);

  try {
    const currentRaw = await fs.readFile(filename, "utf8");
    if (currentRaw.trim() !== nextRaw.trim()) {
      await archiveCurrentBlogPost(slug, currentRaw);
    }
  } catch {
    // First save does not create a snapshot.
  }

  await fs.writeFile(filename, nextRaw, "utf8");
  return { slug, filename };
}

export async function deleteBlogPost(slug: string) {
  const normalized = normalizeSlug(slug);
  if (!normalized) {
    throw new Error("请输入有效的文章 slug。");
  }

  await fs.unlink(path.join(blogDirectory, `${normalized}.md`));
}

export async function restoreBlogPostRevision(slug: string, revisionId: string) {
  const normalizedSlug = normalizeSlug(slug);
  const normalizedRevisionId = parseRevisionId(revisionId);

  if (!normalizedSlug || !normalizedRevisionId) {
    throw new Error("请输入有效的文章版本。");
  }

  const directory = revisionDirectory(normalizedSlug);
  const filename = path.join(directory, `${normalizedRevisionId}.md`);
  const currentFilename = path.join(blogDirectory, `${normalizedSlug}.md`);
  const raw = await fs.readFile(filename, "utf8");

  try {
    const currentRaw = await fs.readFile(currentFilename, "utf8");
    if (currentRaw.trim() !== raw.trim()) {
      await archiveCurrentBlogPost(normalizedSlug, currentRaw);
    }
  } catch {
    // Nothing to archive if the live file does not exist yet.
  }

  await fs.writeFile(currentFilename, raw, "utf8");
  return { slug: normalizedSlug, revisionId: normalizedRevisionId };
}
