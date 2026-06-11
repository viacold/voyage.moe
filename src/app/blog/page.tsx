import { ContentCard } from "@/components/ContentCard";
import { TopicBrowser } from "@/components/TopicBrowser";
import { getPublishedPosts } from "@/lib/content";
import { countItems } from "@/lib/topic";

export const metadata = {
  title: "Blog",
  description: "Published notes from voyage.moe.",
};

export default async function BlogPage() {
  const posts = await getPublishedPosts();
  const categoryCounts = countItems(posts.map((post) => post.category));
  const tagCounts = countItems(posts.flatMap((post) => post.tags));
  const categories = Object.keys(categoryCounts).sort();
  const tags = Object.keys(tagCounts).sort();

  return (
    <>
      <header className="page-heading">
        <p className="eyebrow">Blog</p>
        <h1>Published Notes</h1>
        <p>Writing, build logs, quiet observations, and future fragments.</p>
      </header>

      <TopicBrowser categories={categories} categoryCounts={categoryCounts} tags={tags} tagCounts={tagCounts} />

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
