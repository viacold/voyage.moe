import { describe, expect, test } from "vitest";
import { searchEntries } from "./search-filter";
import { createSearchIndex } from "./search";

describe("search index", () => {
  test("indexes published blog posts, projects, updates, releases, and enabled plugins", async () => {
    const index = await createSearchIndex();
    const keys = index.map((entry) => `${entry.section}:${entry.slug}`);

    expect(keys).toContain("blog:hello-voyage");
    expect(keys).toContain("project:voyage-moe");
    expect(keys).toContain("update:nextjs-portal-plan-approved");
    expect(keys).toContain("release:v0-2-0");
    expect(keys).toContain("plugin:release-downloads");
    expect(keys).not.toContain("blog:private-draft");
    expect(keys).not.toContain("plugin:article-notes");
  });

  test("filters entries by title, description, tags, section, and plugin metadata", async () => {
    const index = await createSearchIndex();

    expect(searchEntries(index, "roadmap").map((entry) => entry.slug)).toContain("site-roadmap");
    expect(searchEntries(index, "nextjs").map((entry) => entry.section)).toContain("project");
    expect(searchEntries(index, "release").map((entry) => entry.section)).toContain("update");
    expect(searchEntries(index, "downloadable").map((entry) => entry.section)).toContain("release");
    expect(searchEntries(index, "extension").map((entry) => entry.section)).toContain("plugin");
  });
});
