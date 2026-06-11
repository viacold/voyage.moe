import Link from "next/link";
import { site } from "@/content/site";
import { getCurrentSession } from "@/lib/auth-store";
import { SignOutButton } from "@/components/SignOutButton";

export const metadata = { title: "个人主页" };

export default async function ProfilePage() {
  const session = await getCurrentSession();

  return (
    <article className="article-shell">
      <header className="article-header">
        <p className="eyebrow">个人主页</p>
        <h1>{site.name}</h1>
        <p>这里会作为个人信息、账户入口和站点控制中心的汇合页。</p>
      </header>

      <div className="article-body">
        {session ? (
          <>
            <section className="about-section" aria-labelledby="profile-account-heading">
              <h2 id="profile-account-heading">我的账号</h2>
              <p>
                当前登录的是 <strong>{session.name}</strong>，邮箱 <strong>{session.email}</strong>，身份为{" "}
                <strong>{session.role === "admin" ? "管理员" : "成员"}</strong>。
              </p>
              <p className="link-cluster">
                <Link href="/admin">后台</Link>
                <Link href="/updates">更新</Link>
                <Link href="/versions">版本</Link>
              </p>
            </section>

            <section className="about-section" aria-labelledby="profile-actions-heading">
              <h2 id="profile-actions-heading">账户操作</h2>
              <p>登录后这里不再显示注册和登录入口，只保留你的账号状态和退出操作。</p>
              <SignOutButton />
            </section>
          </>
        ) : (
          <>
            <p>
              voyage.moe 会继续作为一个安静、清晰、便于浏览的内容主页，承载写作、项目、图片和链接，也会逐步接入账户和后台能力。
            </p>

            <section className="about-section" aria-labelledby="profile-links-heading">
              <h2 id="profile-links-heading">站内入口</h2>
              <p className="link-cluster">
                <Link href="/login">登录</Link>
                <Link href="/register">注册</Link>
                <Link href="/admin">后台</Link>
                <Link href="/updates">更新</Link>
                <Link href="/versions">版本</Link>
              </p>
            </section>

            <section className="about-section" aria-labelledby="contact-heading">
              <h2 id="contact-heading">联系</h2>
              <p>
                邮箱：<a href={`mailto:${site.email}`}>{site.email}</a>
              </p>
            </section>
          </>
        )}
      </div>
    </article>
  );
}
