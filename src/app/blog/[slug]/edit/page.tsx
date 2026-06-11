import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AdminPostEditor } from "@/components/AdminPostEditor";
import { getCurrentSession } from "@/lib/auth-store";
import { getPostBySlugIncludingDrafts } from "@/lib/content";
import { canEditPost } from "@/lib/post-permissions";

export default async function BlogPostEditPage({ params }: { params: Promise<{ slug: string }> }) {
  const session = await getCurrentSession();
  const { slug } = await params;
  const post = await getPostBySlugIncludingDrafts(slug);

  if (!post) {
    notFound();
  }

  if (!session) {
    redirect(`/login?next=/blog/${slug}/edit`);
  }

  if (!canEditPost(session, post)) {
    notFound();
  }

  return (
    <article className="article-shell">
      <header className="article-header">
        <p className="eyebrow">前台编辑</p>
        <h1>编辑文章</h1>
        <p>作者本人和管理员都可以直接在这里修改文章，不必先绕后台。</p>
        <p className="link-cluster">
          <Link href={`/blog/${slug}`}>返回文章</Link>
          <Link href={`/admin/posts/${slug}/versions`}>版本历史</Link>
        </p>
      </header>

      <AdminPostEditor
        mode="edit"
        endpointBase="/api/blog/posts"
        initialValues={{
          slug: post.slug,
          title: post.title,
          description: post.description,
          date: post.date,
          updated: post.updated ?? "",
          authorName: post.authorName ?? session.name,
          authorEmail: post.authorEmail ?? session.email,
          tags: post.tags,
          category: post.category,
          cover: post.cover ?? "",
          featured: post.featured,
          draft: post.draft,
          content: post.content,
        }}
      />
    </article>
  );
}
