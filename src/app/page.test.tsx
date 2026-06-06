import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import HomePage from "./page";

vi.mock("@/components/ThemeProvider", () => ({
  useTheme: () => ({
    theme: "clear",
    setTheme: () => undefined,
  }),
}));

describe("HomePage", () => {
  test("shows only published articles on the homepage", async () => {
    render(await HomePage());

    expect(screen.getByRole("heading", { name: /published articles/i })).toBeInTheDocument();
    expect(screen.getByText("Hello, voyage.moe")).toBeInTheDocument();
    expect(screen.getByText("Site Roadmap")).toBeInTheDocument();
    expect(screen.queryByText("Private Draft")).not.toBeInTheDocument();
    expect(screen.queryByText(/latest release/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/image signals/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/build log/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/recent changes/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/ports and links/i)).not.toBeInTheDocument();
  });
});
