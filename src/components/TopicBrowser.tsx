import Link from "next/link";
import { PortalSection } from "./PortalSection";

type TopicBrowserProps = {
  categories: string[];
  categoryCounts: Record<string, number>;
  tags: string[];
  tagCounts: Record<string, number>;
  activeCategory?: string;
  activeTag?: string;
};

function TopicPill({
  href,
  label,
  count,
  active,
}: Readonly<{
  href: string;
  label: string;
  count: number;
  active?: boolean;
}>) {
  return (
    <Link aria-current={active ? "page" : undefined} className="topic-pill" data-active={active} href={href}>
      <span>{label}</span>
      <span>{count}</span>
    </Link>
  );
}

export function TopicBrowser({
  categories,
  categoryCounts,
  tags,
  tagCounts,
  activeCategory,
  activeTag,
}: TopicBrowserProps) {
  return (
    <PortalSection
      eyebrow="Browse"
      title="Filter By Topic"
      description="Use categories and tags to narrow the page without leaving the topic set."
    >
      <div className="topic-groups">
        <section className="topic-group" aria-labelledby="topic-categories-title">
          <h3 id="topic-categories-title">Categories</h3>
          <div className="topic-list">
            {categories.map((category) => (
              <TopicPill
                active={activeCategory === category}
                href={`/categories/${category}`}
                label={category}
                count={categoryCounts[category] ?? 0}
                key={category}
              />
            ))}
          </div>
        </section>

        <section className="topic-group" aria-labelledby="topic-tags-title">
          <h3 id="topic-tags-title">Tags</h3>
          <div className="topic-list">
            {tags.map((tag) => (
              <TopicPill
                active={activeTag === tag}
                href={`/tags/${tag}`}
                label={tag}
                count={tagCounts[tag] ?? 0}
                key={tag}
              />
            ))}
          </div>
        </section>
      </div>
    </PortalSection>
  );
}
