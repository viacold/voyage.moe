import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AdminPostEditor } from "@/components/AdminPostEditor";
import { getCurrentSession, isAdmin } from "@/lib/auth-store";
import { getEditableBlogPost } from "@/lib/admin-content";

export const metadata = {
  title: "编辑文章",
};

export default async function EditAdminPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login?next=/admin/posts");
  }

  if (!isAdmin(session)) {
    redirect("/profile");
  }

  const { slug } = await params;
  const post = await getEditableBlogPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="article-shell">
      <header className="article-header">
        <p className="eyebrow">后台</p>
        <h1>编辑文章</h1>
        <p>更新后会覆盖对应的 Markdown 文件。</p>
        <p className="link-cluster">
          <Link href={`/admin/posts/${slug}/versions`}>版本历史</Link>
          <Link href="/admin/posts">返回列表</Link>
        </p>
      </header>

      <AdminPostEditor
        mode="edit"
        initialValues={{
          slug: post.slug,
          title: post.title,
          description: post.description,
          date: post.date,
          updated: post.updated ?? "",
          authorName: post.authorName ?? "",
          authorEmail: post.authorEmail ?? "",
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
