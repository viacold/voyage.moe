import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getAllCategories, getAllTags, getPublishedPosts } from "@/lib/content";
import { countItems } from "@/lib/topic";
import { TopicBrowser } from "@/components/TopicBrowser";

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

        <TopicBrowser
          categories={categories}
          categoryCounts={categoryCounts}
          tags={tags}
          tagCounts={tagCounts}
        />

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
