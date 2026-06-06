import Link from "next/link";
import { site } from "@/content/site";

export const metadata = { title: "留言" };

export default function MessagePage() {
  return (
    <article className="article-shell">
      <header className="article-header">
        <p className="eyebrow">留言</p>
        <h1>给我留个话</h1>
        <p>这里会作为一个轻量留言入口，先把联系路径铺好。</p>
      </header>

      <div className="article-body">
        <p>
          现在你可以先通过 <a href={`mailto:${site.email}`}>{site.email}</a> 直接联系我。
        </p>
        <p>后续我们会把留言表单、审核和回复流逐步补上。</p>
        <p>
          你也可以先去 <Link href="/updates">更新</Link> 或 <Link href="/blog">文章</Link> 看看。
        </p>
      </div>
    </article>
  );
}
