import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getPublishedPosts } from "@/lib/content";

export const metadata = {
  title: "Archive",
  description: "A chronological archive of voyage.moe posts.",
};

export default async function ArchivePage() {
  const posts = await getPublishedPosts();

  return (
    <>
      <SiteHeader />
      <main className="site-main page-stack archive-layout">
        <header className="page-heading">
          <p className="eyebrow">Archive</p>
          <h1>All Entries</h1>
          <p>A denser index for browsing every published note.</p>
        </header>
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
