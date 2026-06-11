import { ContentCard } from "@/components/ContentCard";
import { TopicBrowser } from "@/components/TopicBrowser";
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
      <div className="post-feed">
        {posts.map((post) => (
          <ContentCard
            eyebrow={post.category}
            title={post.title}
            description={post.description}
            href={`/blog/${post.slug}`}
            date={post.date}
            tags={post.tags}
            cover={post.cover}
            key={post.slug}
          />
        ))}
      </div>
    </>
  );
}
