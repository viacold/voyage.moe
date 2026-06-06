import { ContentCard } from "@/components/ContentCard";
import { TopicBrowser } from "@/components/TopicBrowser";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getAllCategories, getAllTags, getPostsByTag, getPublishedPosts } from "@/lib/content";
import { countItems } from "@/lib/topic";

export const dynamicParams = false;

export async function generateStaticParams() {
  const tags = await getAllTags();
  return tags.map((tag) => ({ tag }));
}

export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params;
  const [posts, categories, tags] = await Promise.all([
    getPostsByTag(tag),
    getAllCategories(),
    getAllTags(),
  ]);
  const allPosts = await getPublishedPosts();
  const categoryCounts = countItems(allPosts.map((post) => post.category));
  const tagCounts = countItems(allPosts.flatMap((post) => post.tags));

  return (
    <>
      <SiteHeader />
      <main className="site-main page-stack">
        <header className="page-heading">
          <p className="eyebrow">Tag</p>
          <h1>{tag}</h1>
          <p>All published notes with this tag, plus nearby topics for the next click.</p>
        </header>
        <TopicBrowser
          categories={categories}
          categoryCounts={categoryCounts}
          tags={tags}
          tagCounts={tagCounts}
          activeTag={tag}
        />
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
