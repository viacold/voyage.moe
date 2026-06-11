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
  test("keeps the header minimal and moves navigation into the fixed footer dock", () => {
    render(
      <>
        <SiteHeader />
        <SiteFooter />
      </>,
    );

    const headerNav = screen.queryByRole("navigation", { name: /primary navigation/i });
    const footerMainNav = screen.getByRole("navigation", { name: /主导航/i });

    expect(headerNav).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /选择主题/i })).toBeInTheDocument();

    expect(within(footerMainNav).getByRole("link", { name: "首页" })).toBeInTheDocument();
    expect(within(footerMainNav).getByRole("link", { name: "文章" })).toBeInTheDocument();
    expect(within(footerMainNav).getByRole("link", { name: "相册" })).toBeInTheDocument();
    expect(within(footerMainNav).getByRole("link", { name: "留言" })).toBeInTheDocument();
    expect(within(footerMainNav).getByRole("link", { name: "个人主页" })).toBeInTheDocument();
    expect(within(footerMainNav).queryByRole("link", { name: "RSS" })).not.toBeInTheDocument();
  });
});
