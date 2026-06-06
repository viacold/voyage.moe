import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import BlogPage from "./page";

vi.mock("@/components/ThemeProvider", () => ({
  useTheme: () => ({
    theme: "clear",
    setTheme: () => undefined,
  }),
}));

describe("BlogPage", () => {
  test("shows published notes and topic navigation", async () => {
    render(await BlogPage());

    expect(screen.getByRole("heading", { name: /browse by topic/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /notes\s*1/i })).toHaveAttribute("href", "/categories/notes");
    expect(screen.getByRole("link", { name: /projects\s*1/i })).toHaveAttribute("href", "/categories/projects");
    expect(screen.getByRole("link", { name: /intro\s*1/i })).toHaveAttribute("href", "/tags/intro");
    expect(screen.getByRole("link", { name: /voyage\s*1/i })).toHaveAttribute("href", "/tags/voyage");
    expect(screen.getByRole("link", { name: /roadmap\s*1/i })).toHaveAttribute("href", "/tags/roadmap");
    expect(screen.getByRole("link", { name: /build\s*1/i })).toHaveAttribute("href", "/tags/build");
    expect(screen.getByText("Hello, voyage.moe")).toBeInTheDocument();
    expect(screen.getByText("Site Roadmap")).toBeInTheDocument();
    expect(screen.queryByText("Private Draft")).not.toBeInTheDocument();
  });
});
