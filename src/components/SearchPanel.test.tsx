import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import { SearchPanel } from "./SearchPanel";
import type { SearchEntry } from "@/lib/search";

const entries: SearchEntry[] = [
  {
    title: "Hello, voyage.moe",
    description: "The first note",
    href: "/blog/hello-voyage",
    section: "blog",
    slug: "hello-voyage",
    date: "2026-06-05",
    tags: ["intro"],
    text: "hello voyage first note intro",
  },
  {
    title: "Content Portal System",
    description: "Static-first architecture",
    href: "/projects",
    section: "project",
    slug: "content-portal-system",
    tags: ["architecture"],
    text: "content portal static-first architecture",
  },
];

describe("SearchPanel", () => {
  test("filters entries by user input", async () => {
    const user = userEvent.setup();
    render(<SearchPanel entries={entries} />);

    await user.type(screen.getByRole("searchbox", { name: /search/i }), "portal");

    expect(screen.getByText("Content Portal System")).toBeInTheDocument();
    expect(screen.queryByText("Hello, voyage.moe")).not.toBeInTheDocument();
  });
});
