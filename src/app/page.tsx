import { ArticleBody } from "@/components/ArticleBody";
import { getPublishedPosts } from "@/lib/content";
import { formatDate } from "@/lib/format";

export default async function HomePage() {
  const posts = await getPublishedPosts();

  return (
    <>
      <header className="page-heading">
        <p className="eyebrow">Blog</p>
        <h1>Published Articles</h1>
        <p>Only published articles appear here, with their full content expanded below.</p>
      </header>

      <div className="home-feed">
        {posts.map((post) => (
          <article className="home-post" key={post.slug}>
            <header className="home-post-header">
              <div className="card-meta">
                <span>{post.category}</span>
                <time dateTime={post.date}>{formatDate(post.date)}</time>
              </div>
              <h2>{post.title}</h2>
              <p>{post.description}</p>
            </header>

            <ArticleBody html={post.html} />
          </article>
        ))}
      </div>
    </>
  );
}
