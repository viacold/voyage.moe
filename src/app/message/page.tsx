import Link from "next/link";
import { site } from "@/content/site";

export const metadata = { title: "留言" };

export default function MessagePage() {
  return (
    <article className="article-shell">
      <header className="article-header">
        <p className="eyebrow">留言</p>
        <h1>给我留一句话</h1>
        <p>这里会作为轻量留言入口，先把联系方式和后续表单路径放好。</p>
      </header>

      <div className="article-body">
        <p>
          现在你可以直接通过 <a href={`mailto:${site.email}`}>{site.email}</a> 联系我。后续会把留言表单、审核和回复流程接到这里。
        </p>
        <p>
          如果你想先看看别的入口，可以去 <Link href="/blog">文章</Link>、<Link href="/updates">更新</Link> 或{" "}
          <Link href="/admin">后台</Link>。
        </p>
      </div>
    </article>
  );
}
