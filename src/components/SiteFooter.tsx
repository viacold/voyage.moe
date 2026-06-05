import Link from "next/link";
import { site } from "@/content/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <span>{site.name}</span>
      <nav aria-label="Footer links">
        <Link href="/rss.xml">RSS</Link>
        <a href={`mailto:${site.email}`}>{site.email}</a>
      </nav>
    </footer>
  );
}
