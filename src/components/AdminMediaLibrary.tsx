"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type MediaAsset = {
  filename: string;
  url: string;
  size: number;
  type: string;
  updatedAt: string;
};

function formatSize(size: number) {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function AdminMediaLibrary() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadAssets() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/admin/media", { credentials: "include" });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as { error?: string } | null;
          throw new Error(payload?.error ?? "无法读取媒体库。");
        }

        const payload = (await response.json()) as { media?: MediaAsset[] };
        if (active) {
          setAssets(Array.isArray(payload.media) ? payload.media : []);
        }
      } catch (cause) {
        if (active) {
          setError(cause instanceof Error ? cause.message : "无法读取媒体库。");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadAssets();

    return () => {
      active = false;
    };
  }, []);

  const visibleAssets = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return assets;
    }

    return assets.filter((asset) => {
      const haystack = [asset.filename, asset.url, asset.type].join(" ").toLowerCase();
      return haystack.includes(normalized);
    });
  }, [assets, query]);

  async function copyUrl(url: string) {
    await navigator.clipboard.writeText(`${window.location.origin}${url}`);
    setMessage("已复制图片链接。");
  }

  async function handleDelete(filename: string) {
    if (!window.confirm(`确定删除 ${filename} 吗？`)) {
      return;
    }

    setDeleting(filename);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`/api/admin/media/${encodeURIComponent(filename)}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "删除失败。");
      }

      setAssets((items) => items.filter((item) => item.filename !== filename));
      setMessage("图片已删除。");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "删除失败。");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <section className="admin-media-library">
      <div className="admin-post-toolbar">
        <label className="auth-field">
          <span>搜索图片</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="按文件名或类型搜索" />
        </label>
        <div className="link-cluster">
          <Link href="/admin/posts/new">新建文章</Link>
          <Link href="/admin/posts">文章管理</Link>
        </div>
      </div>

      {error ? (
        <p className="auth-error" role="alert">
          {error}
        </p>
      ) : null}
      {message ? <p className="auth-success">{message}</p> : null}

      {loading ? (
        <p className="admin-editor-hint">正在读取媒体库……</p>
      ) : visibleAssets.length ? (
        <div className="admin-media-grid">
          {visibleAssets.map((asset) => (
            <article key={asset.filename} className="admin-media-card">
              <img src={asset.url} alt={asset.filename} className="admin-media-thumb" />
              <div className="admin-media-meta">
                <strong>{asset.filename}</strong>
                <span>
                  {asset.type || "image"} · {formatSize(asset.size)} · {asset.updatedAt.slice(0, 10)}
                </span>
              </div>
              <div className="admin-media-actions">
                <button type="button" className="admin-media-action" onClick={() => void copyUrl(asset.url)}>
                  复制链接
                </button>
                <button type="button" className="admin-media-action" onClick={() => void handleDelete(asset.filename)} disabled={deleting === asset.filename}>
                  {deleting === asset.filename ? "删除中..." : "删除"}
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="admin-editor-hint">还没有可管理的图片。你可以先去文章编辑器里上传一张。</p>
      )}
    </section>
  );
}
