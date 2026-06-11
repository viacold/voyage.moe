import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import {
  getAllCategories,
  getAllTags,
  getFeaturedPost,
  getPostBySlug,
  getPublishedPosts,
} from "./content";
import { setVoyageDbPathForTest } from "./voyage-db";

const tempRoot = path.join(os.tmpdir(), `voyage-content-${Date.now()}-${Math.random().toString(16).slice(2)}`);
const tempDbPath = path.join(tempRoot, "voyage.db");

afterEach(async () => {
  setVoyageDbPathForTest(null);
  await fs.rm(tempRoot, { recursive: true, force: true });
});

describe("blog content", () => {
  beforeEach(() => {
    setVoyageDbPathForTest(tempDbPath);
  });

  test("returns published posts newest first and excludes drafts", async () => {
    const posts = await getPublishedPosts();

    expect(posts.map((post) => post.slug)).toEqual(["site-roadmap", "hello-voyage"]);
    expect(posts.some((post) => post.slug === "private-draft")).toBe(false);
  });

  test("parses frontmatter, excerpts, reading time, and html", async () => {
    const post = await getPostBySlug("hello-voyage");

    expect(post?.title).toBe("Hello, voyage.moe");
    expect(post?.tags).toEqual(["intro", "voyage"]);
    expect(post?.category).toBe("notes");
    expect(post?.excerpt).toContain("first public note");
    expect(post?.readingMinutes).toBeGreaterThanOrEqual(1);
    expect(post?.html).toContain("<p>");
  });

  test("finds the featured post", async () => {
    const featured = await getFeaturedPost();

    expect(featured?.slug).toBe("hello-voyage");
  });

  test("returns sorted tags and categories from published posts", async () => {
    await expect(getAllTags()).resolves.toEqual(["build", "intro", "roadmap", "voyage"]);
    await expect(getAllCategories()).resolves.toEqual(["notes", "projects"]);
  });
});
