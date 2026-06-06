import Link from "next/link";
import { site } from "@/content/site";

export const metadata = { title: "个人主页" };

export default function ProfilePage() {
  return (
    <article className="article-shell">
      <header className="article-header">
        <p className="eyebrow">个人主页</p>
        <h1>{site.name}</h1>
        <p>这里会作为你的个人主页入口，先放站点与联系信息。</p>
      </header>

      <div className="article-body">
        <p>
          voyage.moe 会长期作为一个安静、清晰、便于浏览的内容主页，承载笔记、项目、图片和链接。
        </p>

        <section className="about-section" aria-labelledby="profile-links-heading">
          <h2 id="profile-links-heading">站内入口</h2>
          <p>
            <Link href="/archive">归档</Link>、<Link href="/friends">朋友</Link>、
            <Link href="/updates">更新</Link>，以及 <Link href="/rss.xml">RSS</Link> 都可以从这里再进入。
          </p>
        </section>

        <section className="about-section" aria-labelledby="contact-heading">
          <h2 id="contact-heading">联系</h2>
          <p>
            邮箱：<a href={`mailto:${site.email}`}>{site.email}</a>
          </p>
        </section>
      </div>
    </article>
  );
}
