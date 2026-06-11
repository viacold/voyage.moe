import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminDashboard } from "./AdminDashboard";
import { friendItems } from "@/content/friends";
import { galleryItems } from "@/content/gallery";
import { projectItems } from "@/content/projects";
import { releaseItems } from "@/content/releases";
import { updateItems } from "@/content/updates";
import { getPublishedPosts } from "@/lib/content";
import { getCurrentSession, isAdmin } from "@/lib/auth-store";
import { listMediaAssets } from "@/lib/media-library";

export const metadata: Metadata = {
  title: "后台",
};

export default async function AdminPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login?next=/admin");
  }

  if (!isAdmin(session)) {
    return (
      <article className="article-shell">
        <header className="article-header">
          <p className="eyebrow">访问受限</p>
          <h1>你暂时没有后台权限</h1>
          <p>当前账号已经登录，但它不是管理员账号。</p>
        </header>
        <div className="article-body">
          <p>
            你可以先返回 <a href="/profile">个人主页</a>，或者联系站点管理员开通权限。
          </p>
        </div>
      </article>
    );
  }

  const [posts, media] = await Promise.all([getPublishedPosts(), listMediaAssets()]);

  return (
    <AdminDashboard
      summaries={[
        {
          label: "已发布文章",
          value: String(posts.length),
          detail: "当前公开内容",
          href: "/blog",
        },
        {
          label: "图片素材",
          value: String(media.length),
          detail: "上传后的媒体库",
          href: "/admin/media",
        },
        {
          label: "更新记录",
          value: String(updateItems.length),
          detail: "站点与内容动态",
          href: "/updates",
        },
        {
          label: "版本记录",
          value: String(releaseItems.length),
          detail: "可下载版本",
          href: "/versions",
        },
        {
          label: "项目",
          value: String(projectItems.length),
          detail: "长期维护栏目",
          href: "/projects",
        },
        {
          label: "相册",
          value: String(galleryItems.length),
          detail: "视觉内容",
          href: "/gallery",
        },
        {
          label: "友链",
          value: String(friendItems.length),
          detail: "站外链接",
          href: "/friends",
        },
      ]}
      quickLinks={[
        { label: "新建文章", detail: "写作入口预留", href: "/admin/posts/new" },
        { label: "文章管理", detail: "编辑、删除与版本", href: "/admin/posts" },
        { label: "媒体库", detail: "图片管理与复用", href: "/admin/media" },
        { label: "版本管理", detail: "下载与记录", href: "/versions" },
        { label: "更新日志", detail: "站点说明", href: "/updates" },
        { label: "账户中心", detail: "登录与注册", href: "/login" },
      ]}
      recentPosts={posts.slice(0, 3).map((post) => ({
        title: post.title,
        description: post.description,
        date: post.date,
        href: `/blog/${post.slug}`,
      }))}
      recentUpdates={updateItems.slice(0, 3).map((item) => ({
        title: item.title,
        description: item.body,
        date: item.date,
        href: "/updates",
      }))}
      releases={releaseItems.slice(0, 3).map((release) => ({
        title: release.title,
        version: release.version,
        date: release.date,
        downloads: release.downloads,
      }))}
    />
  );
}
