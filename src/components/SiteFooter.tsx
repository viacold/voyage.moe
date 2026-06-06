import Link from "next/link";
import { secondaryNavigationItems, site } from "@/content/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <span>{site.name}</span>
      <nav aria-label="Footer links">
        {secondaryNavigationItems.map((item) => (
          <Link href={item.href} key={item.href}>
            {item.label}
          </Link>
        ))}
        <Link href="/rss.xml">RSS</Link>
        <a href={`mailto:${site.email}`}>{site.email}</a>
      </nav>
    </footer>
  );
}
