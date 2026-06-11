import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import TagPage from "./page";

vi.mock("@/components/ThemeProvider", () => ({
  useTheme: () => ({
    theme: "clear",
    setTheme: () => undefined,
  }),
}));

describe("TagPage", () => {
  test("shows the tag topic browser and tag entries", async () => {
    render(await TagPage({ params: Promise.resolve({ tag: "intro" }) }));

    expect(screen.getByRole("heading", { name: /filter by topic/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /notes\s*1/i })).toHaveAttribute("href", "/categories/notes");
    expect(screen.getByRole("link", { name: /projects\s*1/i })).toHaveAttribute("href", "/categories/projects");
    expect(screen.getByRole("link", { name: /intro\s*1/i })).toHaveAttribute("href", "/tags/intro");
    expect(screen.getByRole("link", { name: /voyage\s*1/i })).toHaveAttribute("href", "/tags/voyage");
    expect(screen.getByRole("link", { name: /Hello, voyage.moe/i })).toHaveAttribute("href", "/blog/hello-voyage");
    expect(screen.queryByText("Private Draft")).not.toBeInTheDocument();
  });
});
