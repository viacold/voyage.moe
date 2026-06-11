"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/format";
import type { EditableBlogPost } from "@/lib/admin-content";

type AdminPostListProps = {
  posts: EditableBlogPost[];
};

export function AdminPostList({ posts }: Readonly<AdminPostListProps>) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [draftOnly, setDraftOnly] = useState(false);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  const visiblePosts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return posts.filter((post) => {
      if (draftOnly && !post.draft) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const haystack = [post.slug, post.title, post.description, post.category, ...(post.tags ?? [])]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [draftOnly, posts, query]);

  async function handleDelete(slug: string) {
    if (typeof window !== "undefined" && !window.confirm(`确定删除文章 ${slug} 吗？`)) {
      return;
    }

    setDeletingSlug(slug);

    try {
      const response = await fetch(`/api/admin/posts/${encodeURIComponent(slug)}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "删除失败。");
      }

      router.refresh();
    } catch (cause) {
      window.alert(cause instanceof Error ? cause.message : "删除失败。");
    } finally {
      setDeletingSlug(null);
    }
  }

  return (
    <div className="admin-post-tools">
      <div className="admin-post-toolbar">
        <label className="auth-field">
          <span>搜索文章</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="按标题、slug、分类或标签搜索"
          />
        </label>

        <label className="admin-toggle">
          <input type="checkbox" checked={draftOnly} onChange={(event) => setDraftOnly(event.target.checked)} />
          <span>只看草稿</span>
        </label>
      </div>

      <div className="admin-list">
        {visiblePosts.map((post) => (
          <article className="admin-row" key={post.slug}>
            <div>
              <h3>
                <Link href={`/admin/posts/${post.slug}`}>{post.title}</Link>
              </h3>
              <p>{post.description}</p>
              <div className="link-cluster">
                <Link href={`/admin/posts/${post.slug}`}>编辑</Link>
                <Link href={`/blog/${post.slug}`}>查看</Link>
                <button
                  className="auth-secondary-link"
                  type="button"
                  disabled={deletingSlug === post.slug}
                  onClick={() => handleDelete(post.slug)}
                >
                  {deletingSlug === post.slug ? "删除中..." : "删除"}
                </button>
              </div>
            </div>
            <span>
              {formatDate(post.date)}
              {post.draft ? " · 草稿" : ""}
            </span>
          </article>
        ))}

        {visiblePosts.length === 0 ? <p>没有找到匹配的文章。</p> : null}
      </div>
    </div>
  );
}
