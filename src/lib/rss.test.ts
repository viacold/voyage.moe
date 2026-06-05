import { describe, expect, test } from "vitest";
import { getPublishedPosts } from "./content";
import { buildRssXml } from "./rss";

describe("rss", () => {
  test("renders valid RSS XML for published posts only", async () => {
    const posts = await getPublishedPosts();
    const xml = buildRssXml(posts);

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<rss version="2.0">');
    expect(xml).toContain("<title>voyage.moe</title>");
    expect(xml).toContain("<link>https://voyage.moe/blog/site-roadmap</link>");
    expect(xml).not.toContain("Private Draft");
  });

  test("escapes XML special characters", () => {
    const xml = buildRssXml([
      {
        slug: "a-b",
        title: "A & B",
        description: "One < two",
        date: "2026-06-05",
        tags: [],
        category: "notes",
        featured: false,
        draft: false,
        content: "",
        html: "",
        excerpt: "",
        readingMinutes: 1,
      },
    ]);

    expect(xml).toContain("A &amp; B");
    expect(xml).toContain("One &lt; two");
  });
});
