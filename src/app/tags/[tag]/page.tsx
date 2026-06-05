import { ContentCard } from "@/components/ContentCard";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getAllTags, getPostsByTag } from "@/lib/content";

export async function generateStaticParams() {
  const tags = await getAllTags();
  return tags.map((tag) => ({ tag }));
}

export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params;
  const posts = await getPostsByTag(tag);

  return (
    <>
      <SiteHeader />
      <main className="site-main page-stack">
        <header className="page-heading">
          <p className="eyebrow">Tag</p>
          <h1>{tag}</h1>
        </header>
        <div className="card-grid">
          {posts.map((post) => (
            <ContentCard
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
