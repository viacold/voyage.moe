import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import matter from "gray-matter";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
  buildSlugFromTitle,
  deleteBlogPost,
  getEditableBlogPost,
  listEditableBlogPostRevisions,
  listEditableBlogPosts,
  restoreBlogPostRevision,
  saveBlogPost,
  setBlogDirectoryForTest,
} from "./admin-content";
import { setVoyageDbPathForTest } from "./voyage-db";

const tempRoot = path.join(os.tmpdir(), `voyage-admin-content-${Date.now()}-${Math.random().toString(16).slice(2)}`);
const tempBlogDirectory = path.join(tempRoot, "blog");
const tempDbPath = path.join(tempRoot, "voyage.db");

beforeEach(async () => {
  setBlogDirectoryForTest(tempBlogDirectory);
  setVoyageDbPathForTest(tempDbPath);
  await fs.mkdir(tempBlogDirectory, { recursive: true });
});

afterEach(async () => {
  setVoyageDbPathForTest(null);
  await fs.rm(tempRoot, { recursive: true, force: true });
});

describe("admin content store", () => {
  test("normalizes slugs from titles", () => {
    expect(buildSlugFromTitle("Hello, voyage.moe!")).toBe("hello-voyage-moe");
  });

  test("lists editable posts newest first", async () => {
    await fs.writeFile(
      path.join(tempBlogDirectory, "older.md"),
      [
        "---",
        'title: "Older"',
        'description: "Older post"',
        'date: "2024-01-01"',
        "tags:",
        "  - archive",
        'category: "notes"',
        "featured: false",
        "draft: false",
        "---",
        "",
        "Older content.",
        "",
      ].join("\n"),
      "utf8",
    );

    await fs.writeFile(
      path.join(tempBlogDirectory, "newer.md"),
      [
        "---",
        'title: "Newer"',
        'description: "Newer post"',
        'date: "2024-02-01"',
        "tags:",
        "  - launch",
        'category: "updates"',
        "featured: true",
        "draft: true",
        "---",
        "",
        "Newer content.",
        "",
      ].join("\n"),
      "utf8",
    );

    const posts = await listEditableBlogPosts();

    expect(posts.map((post) => post.slug)).toEqual(["newer", "older"]);
    expect(posts[0]).toMatchObject({
      title: "Newer",
      category: "updates",
      featured: true,
      draft: true,
    });
  });

  test("saves, reads, and deletes markdown posts", async () => {
    const saved = await saveBlogPost({
      slug: "draft-post",
      title: "Draft Post",
      description: "A short draft",
      date: "2024-03-01",
      updated: "2024-03-02",
      tags: ["draft", "cms"],
      category: "notes",
      cover: "/covers/draft.jpg",
      featured: false,
      draft: true,
      content: "Hello from the editor.",
    });

    const raw = await fs.readFile(saved.filename, "utf8");
    const parsed = matter(raw);

    expect(saved.slug).toBe("draft-post");
    expect(parsed.data).toMatchObject({
      title: "Draft Post",
      description: "A short draft",
      date: "2024-03-01",
      updated: "2024-03-02",
      category: "notes",
      cover: "/covers/draft.jpg",
      featured: false,
      draft: true,
    });
    expect(parsed.data.tags).toEqual(["draft", "cms"]);
    expect(parsed.content).toContain("Hello from the editor.");

    await expect(getEditableBlogPost("draft-post")).resolves.toMatchObject({
      title: "Draft Post",
      draft: true,
    });

    await deleteBlogPost("draft-post");
    await expect(fs.stat(saved.filename)).rejects.toThrow();
  });

  test("keeps revision history when a post is updated and can restore it", async () => {
    const now = vi.spyOn(Date, "now");
    now.mockReturnValueOnce(1710000000000).mockReturnValueOnce(1710000001000);

    try {
      await saveBlogPost({
        slug: "versioned-post",
        title: "Versioned Post",
        description: "First draft",
        date: "2024-04-01",
        tags: ["history"],
        category: "notes",
        featured: false,
        draft: false,
        content: "First version.",
      });

      await saveBlogPost({
        slug: "versioned-post",
        title: "Versioned Post",
        description: "Second draft",
        date: "2024-04-02",
        tags: ["history"],
        category: "notes",
        featured: true,
        draft: true,
        content: "Second version.",
      });

      const revisions = await listEditableBlogPostRevisions("versioned-post");
      expect(revisions).toHaveLength(1);
      expect(revisions[0]).toMatchObject({
        revisionId: "1710000000000",
        description: "First draft",
        featured: false,
        draft: false,
      });

      await restoreBlogPostRevision("versioned-post", revisions[0].revisionId);

      await expect(getEditableBlogPost("versioned-post")).resolves.toMatchObject({
        description: "First draft",
        featured: false,
        draft: false,
      });
    } finally {
      now.mockRestore();
    }
  });
});
