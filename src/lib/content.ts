import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkHtml from "remark-html";
import { byNewestDate, uniqueSorted } from "./format";

const blogDirectory = path.join(process.cwd(), "content", "blog");

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  updated?: string;
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

async function readPostFile(filename: string): Promise<BlogPost> {
  const slug = filename.replace(/\.mdx?$/, "");
  const raw = await fs.readFile(path.join(blogDirectory, filename), "utf8");
  const parsed = matter(raw);

  return {
    slug,
    title: asString(parsed.data.title, slug),
    description: asString(parsed.data.description),
    date: asString(parsed.data.date),
    updated: asString(parsed.data.updated) || undefined,
    tags: asStringArray(parsed.data.tags),
    category: asString(parsed.data.category, "notes"),
    cover: asString(parsed.data.cover) || undefined,
    featured: asBoolean(parsed.data.featured),
    draft: asBoolean(parsed.data.draft),
    content: parsed.content,
    html: await renderMarkdown(parsed.content),
    excerpt: createExcerpt(parsed.content),
    readingMinutes: estimateReadingMinutes(parsed.content),
  };
}

export async function getAllPosts() {
  const filenames = await fs.readdir(blogDirectory);
  const markdownFiles = filenames.filter((filename) => /\.mdx?$/.test(filename));
  const posts = await Promise.all(markdownFiles.map(readPostFile));
  return byNewestDate(posts);
}

export async function getPublishedPosts() {
  const posts = await getAllPosts();
  return posts.filter((post) => !post.draft);
}

export async function getPostBySlug(slug: string) {
  const posts = await getPublishedPosts();
  return posts.find((post) => post.slug === slug) ?? null;
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
