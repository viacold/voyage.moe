import Link from "next/link";
import { PortalSection } from "@/components/PortalSection";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getAllCategories, getAllTags, getPublishedPosts } from "@/lib/content";

function countItems(items: string[]) {
  return items.reduce<Record<string, number>>((counts, item) => {
    counts[item] = (counts[item] ?? 0) + 1;
    return counts;
  }, {});
}

export const metadata = {
  title: "Archive",
  description: "A chronological archive of voyage.moe posts.",
};

export default async function ArchivePage() {
  const [posts, categories, tags] = await Promise.all([
    getPublishedPosts(),
    getAllCategories(),
    getAllTags(),
  ]);
  const categoryCounts = countItems(posts.map((post) => post.category));
  const tagCounts = countItems(posts.flatMap((post) => post.tags));

  return (
    <>
      <SiteHeader />
      <main className="site-main page-stack archive-layout">
        <header className="page-heading">
          <p className="eyebrow">Archive</p>
          <h1>All Entries</h1>
          <p>A denser index for browsing every published note.</p>
        </header>

        <PortalSection
          eyebrow="Browse"
          title="Filter By Topic"
          description="Use categories and tags to narrow the archive without leaving the page."
        >
          <div className="topic-groups">
            <section className="topic-group" aria-labelledby="archive-category-links-title">
              <h3 id="archive-category-links-title">Categories</h3>
              <div className="topic-list">
                {categories.map((category) => (
                  <Link className="topic-pill" href={`/categories/${category}`} key={category}>
                    <span>{category}</span>
                    <span>{categoryCounts[category]}</span>
                  </Link>
                ))}
              </div>
            </section>

            <section className="topic-group" aria-labelledby="archive-tag-links-title">
              <h3 id="archive-tag-links-title">Tags</h3>
              <div className="topic-list">
                {tags.map((tag) => (
                  <Link className="topic-pill" href={`/tags/${tag}`} key={tag}>
                    <span>{tag}</span>
                    <span>{tagCounts[tag]}</span>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </PortalSection>

        <ol className="archive-list">
          {posts.map((post) => (
            <li key={post.slug}>
              <time dateTime={post.date}>{post.date}</time>
              <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              <span>{post.category}</span>
            </li>
          ))}
        </ol>
      </main>
      <SiteFooter />
    </>
  );
}
