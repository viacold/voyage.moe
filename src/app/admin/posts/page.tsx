import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentSession, isAdmin } from "@/lib/auth-store";
import { listEditableBlogPosts } from "@/lib/admin-content";
import { AdminPostList } from "@/components/AdminPostList";

export const metadata = {
  title: "文章管理",
};

export default async function AdminPostsPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login?next=/admin/posts");
  }

  if (!isAdmin(session)) {
    redirect("/profile");
  }

  const posts = await listEditableBlogPosts();

  return (
    <article className="article-shell">
      <header className="article-header">
        <p className="eyebrow">后台</p>
        <h1>文章管理</h1>
        <p>在这里可以新建、编辑、筛选和删除博客文章。</p>
      </header>

      <div className="article-body">
        <p className="link-cluster">
          <Link href="/admin">返回后台</Link>
          <Link href="/admin/posts/new">新建文章</Link>
        </p>

        <AdminPostList posts={posts} />
      </div>
    </article>
  );
}
