import { notFound, redirect } from "next/navigation";
import { AdminPostRevisions } from "@/components/AdminPostRevisions";
import { getCurrentSession, isAdmin } from "@/lib/auth-store";
import { getEditableBlogPost, listEditableBlogPostRevisions } from "@/lib/admin-content";

export const metadata = {
  title: "版本历史",
};

export default async function AdminPostVersionsPage({ params }: { params: Promise<{ slug: string }> }) {
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

  const revisions = await listEditableBlogPostRevisions(slug);

  return (
    <article className="article-shell">
      <header className="article-header">
        <p className="eyebrow">后台</p>
        <h1>版本历史</h1>
        <p>这里会列出文章保存时留下的历史版本，可以直接恢复到任意一个旧版本。</p>
      </header>

      <div className="article-body">
        <p>
          当前文章：<strong>{post.title}</strong>
        </p>
        <AdminPostRevisions slug={slug} revisions={revisions} />
      </div>
    </article>
  );
}
