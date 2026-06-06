"use client";

import Link from "next/link";
import { primaryNavigationItems, site } from "@/content/site";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { useTheme } from "./ThemeProvider";

export function SiteHeader() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label={`${site.name} home`}>
        {site.name}
      </Link>
      <nav className="site-nav" aria-label="Primary navigation">
        {primaryNavigationItems.map((item) => (
          <Link href={item.href} key={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
      <ThemeSwitcher theme={theme} onThemeChange={setTheme} />
    </header>
  );
}
