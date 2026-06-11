import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import ArchivePage from "./page";

vi.mock("@/components/ThemeProvider", () => ({
  useTheme: () => ({
    theme: "clear",
    setTheme: () => undefined,
  }),
}));

describe("ArchivePage", () => {
  test("shows topic filters and published entries only", async () => {
    render(await ArchivePage());

    expect(screen.getByRole("heading", { name: /filter by topic/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /notes\s*1/i })).toHaveAttribute("href", "/categories/notes");
    expect(screen.getByRole("link", { name: /projects\s*1/i })).toHaveAttribute("href", "/categories/projects");
    expect(screen.getByRole("link", { name: /intro\s*1/i })).toHaveAttribute("href", "/tags/intro");
    expect(screen.getByRole("link", { name: /voyage\s*1/i })).toHaveAttribute("href", "/tags/voyage");
    expect(screen.getByText("Hello, voyage.moe")).toBeInTheDocument();
    expect(screen.getByText("Site Roadmap")).toBeInTheDocument();
    expect(screen.queryByText("Private Draft")).not.toBeInTheDocument();
  });
});
