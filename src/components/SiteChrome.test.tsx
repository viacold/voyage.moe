import { render, screen, within } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

vi.mock("./ThemeProvider", () => ({
  useTheme: () => ({
    theme: "clear",
    setTheme: () => undefined,
  }),
}));

describe("site chrome", () => {
  test("keeps only primary links in the header and moves secondary links to the footer", () => {
    render(
      <>
        <SiteHeader />
        <SiteFooter />
      </>,
    );

    const headerNav = screen.getByRole("navigation", { name: /primary navigation/i });
    const footerNav = screen.getByRole("navigation", { name: /footer links/i });

    expect(within(headerNav).getByRole("link", { name: "Blog" })).toBeInTheDocument();
    expect(within(headerNav).getByRole("link", { name: "Projects" })).toBeInTheDocument();
    expect(within(headerNav).getByRole("link", { name: "Gallery" })).toBeInTheDocument();
    expect(within(headerNav).getByRole("link", { name: "About" })).toBeInTheDocument();
    expect(within(headerNav).queryByRole("link", { name: "Updates" })).not.toBeInTheDocument();
    expect(within(headerNav).queryByRole("link", { name: "Friends" })).not.toBeInTheDocument();

    expect(within(footerNav).getByRole("link", { name: "Archive" })).toBeInTheDocument();
    expect(within(footerNav).getByRole("link", { name: "Friends" })).toBeInTheDocument();
    expect(within(footerNav).getByRole("link", { name: "Updates" })).toBeInTheDocument();
    expect(within(footerNav).getByRole("link", { name: "RSS" })).toBeInTheDocument();
  });
});
