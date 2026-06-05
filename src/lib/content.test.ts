import { describe, expect, test } from "vitest";
import {
  getAllCategories,
  getAllTags,
  getFeaturedPost,
  getPostBySlug,
  getPublishedPosts,
} from "./content";

describe("blog content", () => {
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
