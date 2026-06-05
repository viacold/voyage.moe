import { ContentCard } from "@/components/ContentCard";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getAllCategories, getPostsByCategory } from "@/lib/content";

export const dynamicParams = false;

export async function generateStaticParams() {
  const categories = await getAllCategories();
  return categories.map((category) => ({ category }));
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const posts = await getPostsByCategory(category);

  return (
    <>
      <SiteHeader />
      <main className="site-main page-stack">
        <header className="page-heading">
          <p className="eyebrow">Category</p>
          <h1>{category}</h1>
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
