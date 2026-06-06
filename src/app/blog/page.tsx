import { ContentCard } from "@/components/ContentCard";
import { PortalSection } from "@/components/PortalSection";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getPublishedPosts } from "@/lib/content";

function countItems(items: string[]) {
  return items.reduce<Record<string, number>>((counts, item) => {
    counts[item] = (counts[item] ?? 0) + 1;
    return counts;
  }, {});
}

export const metadata = {
  title: "Blog",
  description: "Published notes from voyage.moe.",
};

export default async function BlogPage() {
  const posts = await getPublishedPosts();
  const categoryCounts = countItems(posts.map((post) => post.category));
  const tagCounts = countItems(posts.flatMap((post) => post.tags));
  const categories = Object.keys(categoryCounts).sort();
  const tags = Object.keys(tagCounts).sort();

  return (
    <>
      <SiteHeader />
      <main className="site-main page-stack">
        <header className="page-heading">
          <p className="eyebrow">Blog</p>
          <h1>Published Notes</h1>
          <p>Writing, build logs, quiet observations, and future fragments.</p>
        </header>

        <PortalSection eyebrow="Browse" title="Browse By Topic" description="Jump to a category or tag when you want a narrower path through the published notes.">
          <div className="topic-groups">
            <section className="topic-group" aria-labelledby="category-links-title">
              <h3 id="category-links-title">Categories</h3>
              <div className="topic-list">
                {categories.map((category) => (
                  <a className="topic-pill" href={`/categories/${category}`} key={category}>
                    <span>{category}</span>
                    <span>{categoryCounts[category]}</span>
                  </a>
                ))}
              </div>
            </section>

            <section className="topic-group" aria-labelledby="tag-links-title">
              <h3 id="tag-links-title">Tags</h3>
              <div className="topic-list">
                {tags.map((tag) => (
                  <a className="topic-pill" href={`/tags/${tag}`} key={tag}>
                    <span>{tag}</span>
                    <span>{tagCounts[tag]}</span>
                  </a>
                ))}
              </div>
            </section>
          </div>
        </PortalSection>

        <div className="card-grid">
          {posts.map((post) => (
            <ContentCard
              eyebrow={post.category}
              title={post.title}
              description={post.description}
              href={`/blog/${post.slug}`}
              date={post.date}
              tags={post.tags}
              key={post.slug}
            />
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
