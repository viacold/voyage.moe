import { ContentCard } from "@/components/ContentCard";
import { getPublishedPosts } from "@/lib/content";

export default async function HomePage() {
  const posts = await getPublishedPosts();

  return (
    <>
      <header className="page-heading">
        <p className="eyebrow">Blog</p>
        <h1>Published Articles</h1>
        <p>Only published articles appear here.</p>
      </header>

      <div className="post-feed">
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
    </>
  );
}
