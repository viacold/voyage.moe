import { ContentCard } from "@/components/ContentCard";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getPublishedPosts } from "@/lib/content";

export const metadata = {
  title: "Blog",
  description: "Published notes from voyage.moe.",
};

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  return (
    <>
      <SiteHeader />
      <main className="site-main page-stack">
        <header className="page-heading">
          <p className="eyebrow">Blog</p>
          <h1>Published Notes</h1>
          <p>Writing, build logs, quiet observations, and future fragments.</p>
        </header>
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
