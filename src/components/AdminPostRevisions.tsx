"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { BlogPostRevision } from "@/lib/admin-content";
import { formatDate } from "@/lib/format";

type AdminPostRevisionsProps = {
  slug: string;
  revisions: BlogPostRevision[];
};

export function AdminPostRevisions({ slug, revisions }: Readonly<AdminPostRevisionsProps>) {
  const router = useRouter();
  const [restoringRevision, setRestoringRevision] = useState<string | null>(null);

  async function restoreRevision(revisionId: string) {
    if (typeof window !== "undefined" && !window.confirm("确定恢复到这个版本吗？当前文章会先被备份。")) {
      return;
    }

    setRestoringRevision(revisionId);

    try {
      const response = await fetch(`/api/admin/posts/${encodeURIComponent(slug)}/revisions`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ revisionId }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "恢复失败。");
      }

      router.refresh();
    } catch (cause) {
      window.alert(cause instanceof Error ? cause.message : "恢复失败。");
    } finally {
      setRestoringRevision(null);
    }
  }

  return (
    <div className="admin-post-tools">
      <p className="link-cluster">
        <Link href={`/admin/posts/${slug}`}>返回编辑页</Link>
        <Link href="/admin/posts">返回文章列表</Link>
      </p>

      <div className="admin-list">
        {revisions.map((revision) => (
          <article className="admin-row" key={revision.revisionId}>
            <div>
              <h3>{revision.title}</h3>
              <p>{revision.description}</p>
              <div className="link-cluster">
                <span>{revision.draft ? "草稿版本" : "已发布版本"}</span>
                <span>{revision.featured ? "置顶" : "非置顶"}</span>
              </div>
              <div className="link-cluster">
                <button
                  className="auth-secondary-link"
                  type="button"
                  disabled={restoringRevision === revision.revisionId}
                  onClick={() => restoreRevision(revision.revisionId)}
                >
                  {restoringRevision === revision.revisionId ? "恢复中..." : "恢复此版本"}
                </button>
              </div>
            </div>
            <span>
              {formatDate(revision.date)}
              <br />
              {formatDate(revision.createdAt)}
            </span>
          </article>
        ))}

        {revisions.length === 0 ? <p>这个文章还没有版本历史。</p> : null}
      </div>
    </div>
  );
}
