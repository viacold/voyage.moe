"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouteTransition } from "./RouteTransitionProvider";

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteFooter() {
  const pathname = usePathname() ?? "/";
  const { beginTransition } = useRouteTransition();
  const footerItems = [
    { label: "首页", href: "/" },
    { label: "文章", href: "/blog" },
    { label: "相册", href: "/gallery" },
    { label: "留言", href: "/message" },
    { label: "个人主页", href: "/profile" },
  ];

  return (
    <footer className="site-footer">
      <nav className="site-dock site-dock-primary" aria-label="Main navigation">
        {footerItems.map((item) => {
          const active = isActivePath(pathname, item.href);

          return (
            <Link
              aria-current={active ? "page" : undefined}
              className="dock-link dock-link-primary"
              data-active={active}
              href={item.href}
              key={item.href}
              onClick={() => {
                if (!active) {
                  beginTransition();
                }
              }}
            >
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </footer>
  );
}
