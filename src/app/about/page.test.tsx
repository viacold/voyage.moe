import { render, screen, within } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import AboutPage from "./page";

vi.mock("@/components/ThemeProvider", () => ({
  useTheme: () => ({
    theme: "clear",
    setTheme: () => undefined,
  }),
}));

describe("AboutPage", () => {
  test("explains version and update history without making versions a top-level nav item", () => {
    render(<AboutPage />);

    const sectionHeading = screen.getByRole("heading", { name: /version & updates/i });
    const section = sectionHeading.closest("section");

    expect(sectionHeading).toBeInTheDocument();
    expect(screen.getByText(/downloadable tagged releases remain available/i)).toBeInTheDocument();
    expect(section).not.toBeNull();
    expect(within(section as HTMLElement).getByRole("link", { name: /versions/i })).toHaveAttribute("href", "/versions");
    expect(within(section as HTMLElement).getByRole("link", { name: /updates/i })).toHaveAttribute("href", "/updates");
  });
});
