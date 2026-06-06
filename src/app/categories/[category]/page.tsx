import { ContentCard } from "@/components/ContentCard";
import { TopicBrowser } from "@/components/TopicBrowser";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getAllCategories, getAllTags, getPublishedPosts, getPostsByCategory } from "@/lib/content";
import { countItems } from "@/lib/topic";

export const dynamicParams = false;

export async function generateStaticParams() {
  const categories = await getAllCategories();
  return categories.map((category) => ({ category }));
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const [posts, categories, tags] = await Promise.all([
    getPostsByCategory(category),
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
          <p className="eyebrow">Category</p>
          <h1>{category}</h1>
          <p>All published notes in this category, with the wider topic map above.</p>
        </header>
        <TopicBrowser
          categories={categories}
          categoryCounts={categoryCounts}
          tags={tags}
          tagCounts={tagCounts}
          activeCategory={category}
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
