"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type AdminPostEditorProps = {
  mode: "create" | "edit";
  endpointBase?: string;
  initialValues: {
    slug: string;
    title: string;
    description: string;
    date: string;
    updated: string;
    authorName: string;
    authorEmail: string;
    tags: string[];
    category: string;
    cover: string;
    featured: boolean;
    draft: boolean;
    content: string;
  };
};

type InsertRule = {
  label: string;
  insert: (selection: string) => string;
};

type MediaAsset = {
  filename: string;
  url: string;
  size: number;
  type: string;
  updatedAt: string;
};

function joinTags(tags: string[]) {
  return tags.join(", ");
}

function buildLinkSnippet(selection: string) {
  const text = selection.trim() || "链接文字";
  return `[${text}](https://example.com)`;
}

function buildImageSnippet(selection: string) {
  const alt = selection.trim() || "图片说明";
  return `![${alt}](https://example.com/image.jpg)`;
}

function getAltTextFromFilename(filename: string) {
  return filename.replace(/^\d+-[0-9a-f]+-/i, "").replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim() || "图片";
}

export function AdminPostEditor({ mode, endpointBase = "/api/admin/posts", initialValues }: AdminPostEditorProps) {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [slug, setSlug] = useState(initialValues.slug);
  const [title, setTitle] = useState(initialValues.title);
  const [description, setDescription] = useState(initialValues.description);
  const [date, setDate] = useState(initialValues.date);
  const [updated, setUpdated] = useState(initialValues.updated);
  const [authorName, setAuthorName] = useState(initialValues.authorName);
  const [authorEmail, setAuthorEmail] = useState(initialValues.authorEmail);
  const [tags, setTags] = useState(joinTags(initialValues.tags));
  const [category, setCategory] = useState(initialValues.category);
  const [cover, setCover] = useState(initialValues.cover);
  const [featured, setFeatured] = useState(initialValues.featured);
  const [draft, setDraft] = useState(initialValues.draft);
  const [content, setContent] = useState(initialValues.content);
  const [mediaItems, setMediaItems] = useState<MediaAsset[]>([]);
  const [mediaLoading, setMediaLoading] = useState(true);
  const [mediaUploading, setMediaUploading] = useState(false);
  const [mediaMessage, setMediaMessage] = useState("");
  const [mediaError, setMediaError] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const endpoint = useMemo(() => {
    if (mode === "create") {
      return endpointBase;
    }

    return `${endpointBase}/${encodeURIComponent(initialValues.slug)}`;
  }, [endpointBase, initialValues.slug, mode]);

  const toolbarRules = useMemo<InsertRule[]>(
    () => [
      { label: "标题", insert: (selection) => `# ${selection.trim() || "标题"}\n` },
      { label: "加粗", insert: (selection) => `**${selection.trim() || "加粗文本"}**` },
      { label: "斜体", insert: (selection) => `*${selection.trim() || "斜体文本"}*` },
      { label: "链接", insert: (selection) => buildLinkSnippet(selection) },
      { label: "图片", insert: (selection) => buildImageSnippet(selection) },
      { label: "引用", insert: (selection) => `> ${selection.trim() || "引用内容"}\n` },
      { label: "代码", insert: (selection) => `\`\`\`\n${selection.trim() || "// code"}\n\`\`\`\n` },
      {
        label: "列表",
        insert: (selection) =>
          selection.trim()
            ? `${selection
                .split("\n")
                .map((line) => `- ${line.replace(/^-+\s*/, "").trim()}`)
                .join("\n")}\n`
            : "- 列表项一\n- 列表项二\n",
      },
    ],
    [],
  );

  useEffect(() => {
    let active = true;

    async function loadMedia() {
      setMediaLoading(true);
      setMediaError("");

      try {
        const response = await fetch("/api/admin/media", { credentials: "include" });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as { error?: string } | null;
          throw new Error(payload?.error ?? "无法读取媒体库。");
        }

        const payload = (await response.json()) as { media?: MediaAsset[] };
        if (active) {
          setMediaItems(Array.isArray(payload.media) ? payload.media : []);
        }
      } catch (cause) {
        if (active) {
          setMediaError(cause instanceof Error ? cause.message : "无法读取媒体库。");
        }
      } finally {
        if (active) {
          setMediaLoading(false);
        }
      }
    }

    void loadMedia();

    return () => {
      active = false;
    };
  }, []);

  function applyInsertion(insert: (selection: string) => string) {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    const start = textarea.selectionStart ?? content.length;
    const end = textarea.selectionEnd ?? content.length;
    const selectedText = content.slice(start, end);
    const insertedText = insert(selectedText);
    const nextText = `${content.slice(0, start)}${insertedText}${content.slice(end)}`;

    setContent(nextText);

    window.requestAnimationFrame(() => {
      const nextCursor = start + insertedText.length;
      textarea.focus();
      textarea.setSelectionRange(nextCursor, nextCursor);
    });
  }

  function insertMediaAsset(asset: MediaAsset) {
    applyInsertion((selection) => {
      const alt = selection.trim() || getAltTextFromFilename(asset.filename);
      return `![${alt}](${asset.url})\n`;
    });
  }

  function setCoverFromAsset(asset: MediaAsset) {
    setCover(asset.url);
    setMessage(`已将 ${asset.filename} 设为封面。`);
  }

  async function handleUploadChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setMediaError("请上传图片文件。");
      return;
    }

    setMediaUploading(true);
    setMediaError("");
    setMediaMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/media", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "上传失败。");
      }

      const payload = (await response.json()) as { asset?: MediaAsset };
      if (payload.asset) {
        setMediaItems((items) => [payload.asset as MediaAsset, ...items.filter((item) => item.filename !== payload.asset?.filename)]);
        setMediaMessage(`已上传 ${file.name}。`);
      }
    } catch (cause) {
      setMediaError(cause instanceof Error ? cause.message : "上传失败。");
    } finally {
      setMediaUploading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(endpoint, {
        method: mode === "create" ? "POST" : "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug,
          title,
          description,
          date,
          updated: updated || undefined,
          authorName: authorName || undefined,
          authorEmail: authorEmail || undefined,
          tags: tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
          category,
          cover: cover || undefined,
          featured,
          draft,
          content,
        }),
      });

      const payload = (await response.json().catch(() => null)) as { error?: string; slug?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "保存失败。");
      }

      const nextSlug = payload?.slug ?? slug;
      setMessage("已保存。");
      router.refresh();

      if (mode === "create" || nextSlug !== initialValues.slug) {
        router.replace(`/admin/posts/${nextSlug}`);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "保存失败。");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="admin-post-editor" onSubmit={handleSubmit}>
      <div className="admin-post-layout">
        <div className="admin-post-main">
          <div className="admin-post-grid">
            <label className="auth-field">
              <span>Slug</span>
              <input value={slug} onChange={(event) => setSlug(event.target.value)} required />
            </label>
            <label className="auth-field">
              <span>标题</span>
              <input value={title} onChange={(event) => setTitle(event.target.value)} required />
            </label>
            <label className="auth-field">
              <span>描述</span>
              <input value={description} onChange={(event) => setDescription(event.target.value)} required />
            </label>
            <label className="auth-field">
              <span>日期</span>
              <input value={date} onChange={(event) => setDate(event.target.value)} required type="date" />
            </label>
            <label className="auth-field">
              <span>更新日期</span>
              <input value={updated} onChange={(event) => setUpdated(event.target.value)} type="date" />
            </label>
            <label className="auth-field">
              <span>作者名</span>
              <input value={authorName} onChange={(event) => setAuthorName(event.target.value)} />
            </label>
            <label className="auth-field">
              <span>作者邮箱</span>
              <input value={authorEmail} onChange={(event) => setAuthorEmail(event.target.value)} />
            </label>
            <label className="auth-field">
              <span>分类</span>
              <input value={category} onChange={(event) => setCategory(event.target.value)} required />
            </label>
            <label className="auth-field">
              <span>标签</span>
              <input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="intro, voyage" />
            </label>
            <label className="auth-field">
              <span>封面图片</span>
              <input value={cover} onChange={(event) => setCover(event.target.value)} placeholder="/uploads/example.jpg" />
            </label>
          </div>

          <div className="admin-toggle-row">
            <label className="admin-toggle">
              <input type="checkbox" checked={featured} onChange={(event) => setFeatured(event.target.checked)} />
              <span>置顶</span>
            </label>
            <label className="admin-toggle">
              <input type="checkbox" checked={draft} onChange={(event) => setDraft(event.target.checked)} />
              <span>草稿</span>
            </label>
          </div>

          <p className="admin-editor-hint">未勾选草稿时会直接公开发布，勾选后会先保存为草稿。</p>

          <div className="admin-editor-toolbar" aria-label="文章编辑工具栏">
            {toolbarRules.map((rule) => (
              <button key={rule.label} type="button" className="admin-editor-tool" onClick={() => applyInsertion(rule.insert)}>
                {rule.label}
              </button>
            ))}
          </div>

          <label className="auth-field admin-content-field">
            <span>正文</span>
            <textarea ref={textareaRef} value={content} onChange={(event) => setContent(event.target.value)} rows={16} required />
          </label>

          <p className="admin-editor-hint">图片可以直接插入 Markdown 链接，也可以先上传到媒体库再点“插入正文”。</p>

          {error ? (
            <p className="auth-error" role="alert">
              {error}
            </p>
          ) : null}
          {message ? <p className="auth-success">{message}</p> : null}

          <div className="auth-actions">
            <button className="auth-submit" type="submit" disabled={saving}>
              {saving ? "保存中..." : draft ? "保存草稿" : mode === "create" ? "发布文章" : "保存并发布"}
            </button>
            <button className="auth-secondary-link" type="button" onClick={() => router.push("/admin")}>
              返回后台
            </button>
          </div>
        </div>

        <aside className="admin-post-sidebar">
          {cover ? (
            <figure className="admin-cover-preview">
              <span>封面预览</span>
              <img src={cover} alt={title || "封面预览"} />
              <button type="button" className="admin-media-action" onClick={() => setCover("")}>
                清除封面
              </button>
            </figure>
          ) : (
            <div className="admin-cover-preview admin-cover-preview-empty">
              <span>封面预览</span>
              <p>选择封面后会在这里显示。</p>
            </div>
          )}

          <section className="admin-media-panel" aria-label="媒体库">
            <div className="admin-media-header">
              <div>
                <h3>媒体库</h3>
                <p>上传图片后可以直接插入正文，或者一键设为封面。</p>
              </div>
              <label className="admin-media-upload">
                <span>{mediaUploading ? "上传中..." : "选择图片上传"}</span>
                <input type="file" accept="image/*" onChange={handleUploadChange} disabled={mediaUploading} />
              </label>
            </div>

            {mediaError ? (
              <p className="auth-error" role="alert">
                {mediaError}
              </p>
            ) : null}
            {mediaMessage ? <p className="auth-success">{mediaMessage}</p> : null}

            {mediaLoading ? (
              <p className="admin-editor-hint">正在读取媒体库...</p>
            ) : mediaItems.length ? (
              <div className="admin-media-grid">
                {mediaItems.map((asset) => (
                  <article key={asset.filename} className={`admin-media-card${cover === asset.url ? " is-selected" : ""}`}>
                    <img src={asset.url} alt={asset.filename} className="admin-media-thumb" />
                    <div className="admin-media-meta">
                      <strong>{asset.filename}</strong>
                      <span>{asset.type || "image"}</span>
                    </div>
                    <div className="admin-media-actions">
                      <button type="button" className="admin-media-action" onClick={() => insertMediaAsset(asset)}>
                        插入正文
                      </button>
                      <button type="button" className="admin-media-action" onClick={() => setCoverFromAsset(asset)}>
                        设为封面
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="admin-editor-hint">媒体库还是空的，先上传一张图片吧。</p>
            )}
          </section>
        </aside>
      </div>
    </form>
  );
}
