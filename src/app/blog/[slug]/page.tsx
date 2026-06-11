import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/ArticleBody";
import { site } from "@/content/site";
import { getPostBySlug, getPublishedPosts } from "@/lib/content";
import { getCurrentSession } from "@/lib/auth-store";
import { canEditPost } from "@/lib/post-permissions";
import { formatDate } from "@/lib/format";
import { PluginSlot } from "@/plugins/PluginSlot";

export const dynamicParams = false;

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {};
  }

  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: `${site.url}/blog/${post.slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  const session = await getCurrentSession();

  if (!post) {
    notFound();
  }

  const canEdit = canEditPost(session, post);
  const hasCover = Boolean(post.cover && (/^https?:\/\//.test(post.cover) || post.cover.startsWith("/")));

  return (
    <article className="article-shell">
      <header className="article-header">
        <p className="eyebrow">{post.category}</p>
        <h1>{post.title}</h1>
        <p>{post.description}</p>
        <div className="article-meta">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span>{post.readingMinutes} min read</span>
          {post.authorName ? <span>{post.authorName}</span> : null}
          {!post.authorName && post.authorEmail ? <span>{post.authorEmail}</span> : null}
        </div>
        {canEdit ? (
          <p className="link-cluster">
            <Link href={`/blog/${post.slug}/edit`}>编辑文章</Link>
          </p>
        ) : null}
      </header>

      {hasCover ? (
        <figure className="article-cover">
          <img src={post.cover} alt={post.title} />
        </figure>
      ) : null}

      <ArticleBody html={post.html} />
      <PluginSlot slot="article.afterContent" />
    </article>
  );
}
