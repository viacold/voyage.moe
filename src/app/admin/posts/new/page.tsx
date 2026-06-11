import { redirect } from "next/navigation";
import { AdminPostEditor } from "@/components/AdminPostEditor";
import { getCurrentSession, isAdmin } from "@/lib/auth-store";

export const metadata = {
  title: "新建文章",
};

export default async function NewAdminPostPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login?next=/admin/posts/new");
  }

  if (!isAdmin(session)) {
    redirect("/profile");
  }

  return (
    <article className="article-shell">
      <header className="article-header">
        <p className="eyebrow">后台</p>
        <h1>新建文章</h1>
        <p>可以直接在后台编写 Markdown 文章，保存后会写回站点内容目录。</p>
      </header>

      <AdminPostEditor
        mode="create"
        initialValues={{
          slug: "",
          title: "",
          description: "",
          date: new Date().toISOString().slice(0, 10),
          updated: "",
          authorName: session.name,
          authorEmail: session.email,
          tags: [],
          category: "notes",
          cover: "",
          featured: false,
          draft: false,
          content: "",
        }}
      />
    </article>
  );
}
