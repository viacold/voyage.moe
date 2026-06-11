import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminMediaLibrary } from "@/components/AdminMediaLibrary";
import { getCurrentSession, isAdmin } from "@/lib/auth-store";

export const metadata: Metadata = {
  title: "媒体库",
};

export default async function AdminMediaPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login?next=/admin/media");
  }

  if (!isAdmin(session)) {
    redirect("/profile");
  }

  return (
    <article className="article-shell">
      <header className="article-header">
        <p className="eyebrow">后台</p>
        <h1>媒体库</h1>
        <p>上传后的图片会出现在这里，方便继续复制链接、删除或在文章里复用。</p>
      </header>

      <div className="article-body">
        <AdminMediaLibrary />
      </div>
    </article>
  );
}
