import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { ThemeSwitcher } from "./ThemeSwitcher";

afterEach(() => {
  cleanup();
});

describe("ThemeSwitcher", () => {
  test("opens the theme panel from a compact trigger", () => {
    render(<ThemeSwitcher theme="clear" onThemeChange={() => undefined} />);

    expect(screen.queryByRole("button", { name: /voyage/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /选择主题/i }));

    expect(screen.getByRole("button", { name: /voyage/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /archive/i })).toBeInTheDocument();
  });

  test("applies the chosen theme and closes the panel", () => {
    const onThemeChange = vi.fn();
    render(<ThemeSwitcher theme="clear" onThemeChange={onThemeChange} />);

    fireEvent.click(screen.getByRole("button", { name: /选择主题/i }));
    fireEvent.click(screen.getByRole("button", { name: /night/i }));

    expect(onThemeChange).toHaveBeenCalledWith("night");
    expect(screen.queryByRole("button", { name: /archive/i })).not.toBeInTheDocument();
  });
});
