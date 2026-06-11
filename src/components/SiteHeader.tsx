"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/content/site";
import { useRouteTransition } from "./RouteTransitionProvider";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { useTheme } from "./ThemeProvider";

export function SiteHeader() {
  const pathname = usePathname() ?? "/";
  const { beginTransition } = useRouteTransition();
  const { theme, setTheme } = useTheme();

  return (
    <header className="site-header">
      <Link
        className="brand"
        href="/"
        aria-label={`${site.name} home`}
        onClick={() => {
          if (pathname !== "/") {
            beginTransition();
          }
        }}
      >
        {site.name}
      </Link>
      <ThemeSwitcher compact theme={theme} onThemeChange={setTheme} />
    </header>
  );
}
