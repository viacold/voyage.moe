import { render, screen, within } from "@testing-library/react";
import { expect, test } from "vitest";
import App from "./App";

test("renders the voyage.moe landing page with future section entrances", () => {
  render(<App />);

  expect(
    screen.getByRole("heading", { level: 1, name: "voyage.moe" }),
  ).toBeInTheDocument();
  expect(screen.getByText(/clear skies, soft signals/i)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /see the map/i })).toHaveAttribute(
    "href",
    "#future",
  );

  const futureSection = screen.getByRole("region", { name: /future sections/i });

  for (const section of ["Profile", "Notes", "Gallery", "Links"]) {
    expect(within(futureSection).getByText(section)).toBeInTheDocument();
  }
});
