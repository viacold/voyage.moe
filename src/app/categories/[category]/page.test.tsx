import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import CategoryPage from "./page";

vi.mock("@/components/ThemeProvider", () => ({
  useTheme: () => ({
    theme: "clear",
    setTheme: () => undefined,
  }),
}));

describe("CategoryPage", () => {
  test("shows the category topic browser and category entries", async () => {
    render(await CategoryPage({ params: Promise.resolve({ category: "notes" }) }));

    expect(screen.getByRole("heading", { name: /filter by topic/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /notes\s*1/i })).toHaveAttribute("href", "/categories/notes");
    expect(screen.getByRole("link", { name: /projects\s*1/i })).toHaveAttribute("href", "/categories/projects");
    expect(screen.getByRole("link", { name: /intro\s*1/i })).toHaveAttribute("href", "/tags/intro");
    expect(screen.getByRole("link", { name: /voyage\s*1/i })).toHaveAttribute("href", "/tags/voyage");
    expect(screen.getByRole("link", { name: /Hello, voyage.moe/i })).toHaveAttribute("href", "/blog/hello-voyage");
    expect(screen.queryByText("Private Draft")).not.toBeInTheDocument();
  });
});
