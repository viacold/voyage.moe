import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { ThemeSwitcher } from "./ThemeSwitcher";

describe("ThemeSwitcher", () => {
  test("renders the four theme choices", () => {
    render(<ThemeSwitcher theme="clear" onThemeChange={() => undefined} />);

    for (const name of ["Clear", "Voyage", "Night", "Archive"]) {
      expect(screen.getByRole("button", { name: new RegExp(name, "i") })).toBeInTheDocument();
    }
  });
});
