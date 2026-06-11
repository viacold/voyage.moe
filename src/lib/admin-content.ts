import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import type { BlogPost } from "./content";
import { getAllPosts, getPostBySlugIncludingDrafts, setBlogDirectoryForTest as setContentBlogDirectoryForTest } from "./content";
import { getVoyageDatabase, setMetaValue, getMetaValue } from "./voyage-db";

let blogDirectory = path.join(process.cwd(), "content", "blog");

export type EditableBlogPost = BlogPost;

export type SaveBlogPostInput = {
  slug: string;
  title: string;
  description: string;
  date: string;
  updated?: string;
  authorName?: string;
  authorEmail?: string;
  tags: string[];
  category: string;
  cover?: string;
  featured: boolean;
  draft: boolean;
  content: string;
};

export type BlogPostRevision = EditableBlogPost & {
  revisionId: string;
  createdAt: string;
};

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function frontmatterLines(input: SaveBlogPostInput) {
  const lines = [
    "---",
    `title: ${JSON.stringify(input.title)}`,
    `description: ${JSON.stringify(input.description)}`,
    `date: ${JSON.stringify(input.date)}`,
  ];

  if (input.updated) {
    lines.push(`updated: ${JSON.stringify(input.updated)}`);
  }

  if (input.authorName) {
    lines.push(`authorName: ${JSON.stringify(input.authorName)}`);
  }

  if (input.authorEmail) {
    lines.push(`authorEmail: ${JSON.stringify(input.authorEmail)}`);
  }

  lines.push("tags:");
  for (const tag of input.tags) {
    lines.push(`  - ${tag}`);
  }
  lines.push(`category: ${JSON.stringify(input.category)}`);
  if (input.cover) {
    lines.push(`cover: ${JSON.stringify(input.cover)}`);
  }
  lines.push(`featured: ${input.featured ? "true" : "false"}`);
  lines.push(`draft: ${input.draft ? "true" : "false"}`);
  lines.push("---");
  lines.push("");
  lines.push(input.content.trimEnd());
  lines.push("");

  return lines.join("\n");
}

function markdownToRevisionRaw(revision: BlogPostRevision) {
  return frontmatterLines({
    slug: revision.slug,
    title: revision.title,
    description: revision.description,
    date: revision.date,
    updated: revision.updated,
    authorName: revision.authorName,
    authorEmail: revision.authorEmail,
    tags: revision.tags,
    category: revision.category,
    cover: revision.cover,
    featured: revision.featured,
    draft: revision.draft,
    content: revision.content,
  });
}

function revisionDirectory(slug: string) {
  return path.join(blogDirectory, ".revisions", slug);
}

function parseRevisionId(value?: string) {
  const normalized = typeof value === "string" ? value.trim() : "";
  return normalized || null;
}

function revisionRowToPost(row: Record<string, unknown>): BlogPostRevision {
  return {
    revisionId: String(row.revisionId),
    createdAt: String(row.createdAt),
    slug: String(row.slug),
    title: String(row.title),
    description: String(row.description),
    date: String(row.date),
    updated: typeof row.updated === "string" && row.updated ? row.updated : undefined,
    authorName: typeof row.authorName === "string" && row.authorName ? row.authorName : undefined,
    authorEmail: typeof row.authorEmail === "string" && row.authorEmail ? row.authorEmail : undefined,
    tags: JSON.parse(String(row.tagsJson)) as string[],
    category: String(row.category),
    cover: typeof row.cover === "string" && row.cover ? row.cover : undefined,
    featured: row.featured === 1,
    draft: row.draft === 1,
    content: String(row.content),
    html: String(row.html),
    excerpt: String(row.excerpt),
    readingMinutes: Number(row.readingMinutes) || 1,
  };
}

export function setBlogDirectoryForTest(directory: string) {
  blogDirectory = directory;
  setContentBlogDirectoryForTest(directory);
}

export function buildSlugFromTitle(title: string) {
  const slug = normalizeSlug(title);
  return slug || `post-${Date.now()}`;
}

async function ensureRevisionSeeded() {
  if (getMetaValue("revisions_seeded") === "true") {
    return;
  }

  const db = getVoyageDatabase();
  const count = db.prepare("SELECT COUNT(*) AS count FROM post_revisions").get() as { count?: number } | undefined;

  if ((count?.count ?? 0) === 0) {
    try {
      const directory = path.join(blogDirectory, ".revisions");
      const slugs = await fs.readdir(directory);
      const insert = db.prepare(`
        INSERT OR REPLACE INTO post_revisions (
          revisionId,
          slug,
          createdAt,
          title,
          description,
          date,
          updated,
          authorName,
          authorEmail,
          tagsJson,
          category,
          cover,
          featured,
          draft,
          content,
          html,
          excerpt,
          readingMinutes
        ) VALUES (
          @revisionId,
          @slug,
          @createdAt,
          @title,
          @description,
          @date,
          @updated,
          @authorName,
          @authorEmail,
          @tagsJson,
          @category,
          @cover,
          @featured,
          @draft,
          @content,
          @html,
          @excerpt,
          @readingMinutes
        )
      `);

      const files: Array<Promise<void>> = [];
      for (const slug of slugs) {
        const revisionFiles = await fs.readdir(path.join(directory, slug));
        for (const filename of revisionFiles.filter((item) => /\.mdx?$/.test(item))) {
          files.push(
            (async () => {
              const revisionId = filename.replace(/\.mdx?$/, "");
              const raw = await fs.readFile(path.join(directory, slug, filename), "utf8");
              const parsed = matter(raw);
              const content = parsed.content;
              insert.run({
                revisionId,
                slug,
                createdAt: new Date(Number(revisionId)).toISOString(),
                title: typeof parsed.data.title === "string" ? parsed.data.title : slug,
                description: typeof parsed.data.description === "string" ? parsed.data.description : "",
                date: typeof parsed.data.date === "string" ? parsed.data.date : "",
                updated: typeof parsed.data.updated === "string" ? parsed.data.updated : undefined,
                authorName: typeof parsed.data.authorName === "string" ? parsed.data.authorName : undefined,
                authorEmail: typeof parsed.data.authorEmail === "string" ? parsed.data.authorEmail : undefined,
                tagsJson: JSON.stringify(
                  Array.isArray(parsed.data.tags)
                    ? parsed.data.tags.filter((item): item is string => typeof item === "string")
                    : [],
                ),
                category: typeof parsed.data.category === "string" ? parsed.data.category : "notes",
                cover: typeof parsed.data.cover === "string" ? parsed.data.cover : undefined,
                featured: parsed.data.featured === true ? 1 : 0,
                draft: parsed.data.draft === true ? 1 : 0,
                content,
                html: "",
                excerpt: "",
                readingMinutes: 0,
              });
            })(),
          );
        }
      }

      await Promise.all(files);
    } catch {
      // No legacy revision archive yet.
    }
  }

  setMetaValue("revisions_seeded", "true");
}

function currentRevisionRow(post: BlogPost, revisionId: string, createdAt: string): BlogPostRevision {
  return {
    revisionId,
    createdAt,
    slug: post.slug,
    title: post.title,
    description: post.description,
    date: post.date,
    updated: post.updated,
    authorName: post.authorName,
    authorEmail: post.authorEmail,
    tags: post.tags,
    category: post.category,
    cover: post.cover,
    featured: post.featured,
    draft: post.draft,
    content: post.content,
    html: post.html,
    excerpt: post.excerpt,
    readingMinutes: post.readingMinutes,
  };
}

async function writeMarkdownMirror(slug: string, raw: string) {
  await fs.mkdir(blogDirectory, { recursive: true });
  await fs.writeFile(path.join(blogDirectory, `${slug}.md`), raw, "utf8");
}

async function writeRevisionMirror(revision: BlogPostRevision) {
  const directory = revisionDirectory(revision.slug);
  await fs.mkdir(directory, { recursive: true });
  await fs.writeFile(path.join(directory, `${revision.revisionId}.md`), markdownToRevisionRaw(revision), "utf8");
}

export async function listEditableBlogPosts() {
  return getAllPosts();
}

export async function getEditableBlogPost(slug: string) {
  return getPostBySlugIncludingDrafts(slug);
}

export async function listEditableBlogPostRevisions(slug: string) {
  await ensureRevisionSeeded();
  const rows = getVoyageDatabase()
    .prepare(
      `
        SELECT *
        FROM post_revisions
        WHERE slug = ?
        ORDER BY revisionId DESC
      `,
    )
    .all(slug) as Record<string, unknown>[];

  return rows.map(revisionRowToPost);
}

export async function saveBlogPost(input: SaveBlogPostInput) {
  const slug = normalizeSlug(input.slug);
  if (!slug) {
    throw new Error("璇疯緭鍏ユ湁鏁堢殑鏂囩珷 slug銆?");
  }

  const db = getVoyageDatabase();
  const existing = await getEditableBlogPost(slug);
  const createdAtRow = db.prepare("SELECT createdAt FROM posts WHERE slug = ?").get(slug) as { createdAt?: string } | undefined;
  const nextRaw = frontmatterLines(input);
  const now = new Date().toISOString();
  const createdAt = createdAtRow?.createdAt ?? now;
  const html = await (async () => {
    const { remark } = await import("remark");
    const { default: remarkHtml } = await import("remark-html");
    const processed = await remark().use(remarkHtml).process(input.content);
    return processed.toString();
  })();
  const excerpt = input.content
    .replace(/[`*_#>-]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
  const readingMinutes = Math.max(1, Math.ceil(input.content.trim().split(/\s+/).filter(Boolean).length / 220));

  if (existing) {
    const currentRevisionId = `${Date.now()}`;
    const currentRevision = currentRevisionRow(existing, currentRevisionId, now);

    if (
      currentRevision.title !== input.title ||
      currentRevision.description !== input.description ||
      currentRevision.date !== input.date ||
      currentRevision.updated !== input.updated ||
      currentRevision.authorName !== input.authorName ||
      currentRevision.authorEmail !== input.authorEmail ||
      JSON.stringify(currentRevision.tags) !== JSON.stringify(input.tags) ||
      currentRevision.category !== input.category ||
      currentRevision.cover !== input.cover ||
      currentRevision.featured !== input.featured ||
      currentRevision.draft !== input.draft ||
      currentRevision.content.trim() !== input.content.trim()
    ) {
      db.prepare(`
        INSERT INTO post_revisions (
          revisionId,
          slug,
          createdAt,
          title,
          description,
          date,
          updated,
          authorName,
          authorEmail,
          tagsJson,
          category,
          cover,
          featured,
          draft,
          content,
          html,
          excerpt,
          readingMinutes
        ) VALUES (
          @revisionId,
          @slug,
          @createdAt,
          @title,
          @description,
          @date,
          @updated,
          @authorName,
          @authorEmail,
          @tagsJson,
          @category,
          @cover,
          @featured,
          @draft,
          @content,
          @html,
          @excerpt,
          @readingMinutes
        )
      `).run({
        ...currentRevision,
        tagsJson: JSON.stringify(currentRevision.tags),
        featured: currentRevision.featured ? 1 : 0,
        draft: currentRevision.draft ? 1 : 0,
      });
      await writeRevisionMirror(currentRevision);
    }
  }

  db.prepare(`
    INSERT INTO posts (
      slug,
      title,
      description,
      date,
      updated,
      authorName,
      authorEmail,
      tagsJson,
      category,
      cover,
      featured,
      draft,
      content,
      html,
      excerpt,
      readingMinutes,
      createdAt,
      updatedAt
    ) VALUES (
      @slug,
      @title,
      @description,
      @date,
      @updated,
      @authorName,
      @authorEmail,
      @tagsJson,
      @category,
      @cover,
      @featured,
      @draft,
      @content,
      @html,
      @excerpt,
      @readingMinutes,
      @createdAt,
      @updatedAt
    )
    ON CONFLICT(slug) DO UPDATE SET
      title = excluded.title,
      description = excluded.description,
      date = excluded.date,
      updated = excluded.updated,
      authorName = excluded.authorName,
      authorEmail = excluded.authorEmail,
      tagsJson = excluded.tagsJson,
      category = excluded.category,
      cover = excluded.cover,
      featured = excluded.featured,
      draft = excluded.draft,
      content = excluded.content,
      html = excluded.html,
      excerpt = excluded.excerpt,
      readingMinutes = excluded.readingMinutes,
      updatedAt = excluded.updatedAt
  `).run({
    slug,
    title: input.title,
    description: input.description,
    date: input.date,
    updated: input.updated?.trim() || undefined,
    authorName: input.authorName?.trim() || undefined,
    authorEmail: input.authorEmail?.trim() || undefined,
    tagsJson: JSON.stringify(input.tags),
    category: input.category?.trim() || "notes",
    cover: input.cover?.trim() || undefined,
    featured: input.featured ? 1 : 0,
    draft: input.draft ? 1 : 0,
    content: input.content,
    html,
    excerpt,
    readingMinutes,
    createdAt,
    updatedAt: now,
  });

  await writeMarkdownMirror(slug, nextRaw);
  return { slug, filename: path.join(blogDirectory, `${slug}.md`) };
}

export async function deleteBlogPost(slug: string) {
  const normalized = normalizeSlug(slug);
  if (!normalized) {
    throw new Error("璇疯緭鍏ユ湁鏁堢殑鏂囩珷 slug銆?");
  }

  getVoyageDatabase().prepare("DELETE FROM posts WHERE slug = ?").run(normalized);
  getVoyageDatabase().prepare("DELETE FROM post_revisions WHERE slug = ?").run(normalized);
  await fs.unlink(path.join(blogDirectory, `${normalized}.md`));
  await fs.rm(revisionDirectory(normalized), { recursive: true, force: true });
}

export async function restoreBlogPostRevision(slug: string, revisionId: string) {
  const normalizedSlug = normalizeSlug(slug);
  const normalizedRevisionId = parseRevisionId(revisionId);

  if (!normalizedSlug || !normalizedRevisionId) {
    throw new Error("璇疯緭鍏ユ湁鏁堢殑鏂囩珷鐗堟湰銆?");
  }

  const db = getVoyageDatabase();
  const revisionRow = db
    .prepare("SELECT * FROM post_revisions WHERE slug = ? AND revisionId = ?")
    .get(normalizedSlug, normalizedRevisionId) as Record<string, unknown> | undefined;

  if (!revisionRow) {
    throw new Error("璇疯緭鍏ユ湁鏁堢殑鏂囩珷鐗堟湰銆?");
  }

  const current = await getEditableBlogPost(normalizedSlug);
  const nextRevision = revisionRowToPost(revisionRow);

  if (current) {
    const archiveRevision = currentRevisionRow(current, `${Date.now()}`, new Date().toISOString());
    db.prepare(`
      INSERT INTO post_revisions (
        revisionId,
        slug,
        createdAt,
        title,
        description,
        date,
        updated,
        authorName,
        authorEmail,
        tagsJson,
        category,
        cover,
        featured,
        draft,
        content,
        html,
        excerpt,
        readingMinutes
      ) VALUES (
        @revisionId,
        @slug,
        @createdAt,
        @title,
        @description,
        @date,
        @updated,
        @authorName,
        @authorEmail,
        @tagsJson,
        @category,
        @cover,
        @featured,
        @draft,
        @content,
        @html,
        @excerpt,
        @readingMinutes
      )
    `).run({
      ...archiveRevision,
      tagsJson: JSON.stringify(archiveRevision.tags),
      featured: archiveRevision.featured ? 1 : 0,
      draft: archiveRevision.draft ? 1 : 0,
    });
    await writeRevisionMirror(archiveRevision);
  }

  db.prepare(`
    INSERT INTO posts (
      slug,
      title,
      description,
      date,
      updated,
      authorName,
      authorEmail,
      tagsJson,
      category,
      cover,
      featured,
      draft,
      content,
      html,
      excerpt,
      readingMinutes,
      createdAt,
      updatedAt
    ) VALUES (
      @slug,
      @title,
      @description,
      @date,
      @updated,
      @authorName,
      @authorEmail,
      @tagsJson,
      @category,
      @cover,
      @featured,
      @draft,
      @content,
      @html,
      @excerpt,
      @readingMinutes,
      @createdAt,
      @updatedAt
    )
    ON CONFLICT(slug) DO UPDATE SET
      title = excluded.title,
      description = excluded.description,
      date = excluded.date,
      updated = excluded.updated,
      authorName = excluded.authorName,
      authorEmail = excluded.authorEmail,
      tagsJson = excluded.tagsJson,
      category = excluded.category,
      cover = excluded.cover,
      featured = excluded.featured,
      draft = excluded.draft,
      content = excluded.content,
      html = excluded.html,
      excerpt = excluded.excerpt,
      readingMinutes = excluded.readingMinutes,
      updatedAt = excluded.updatedAt
  `).run({
    slug: nextRevision.slug,
    title: nextRevision.title,
    description: nextRevision.description,
    date: nextRevision.date,
    updated: nextRevision.updated,
    authorName: nextRevision.authorName,
    authorEmail: nextRevision.authorEmail,
    tagsJson: JSON.stringify(nextRevision.tags),
    category: nextRevision.category,
    cover: nextRevision.cover,
    featured: nextRevision.featured ? 1 : 0,
    draft: nextRevision.draft ? 1 : 0,
    content: nextRevision.content,
    html: nextRevision.html,
    excerpt: nextRevision.excerpt,
    readingMinutes: nextRevision.readingMinutes,
    createdAt: nextRevision.createdAt,
    updatedAt: new Date().toISOString(),
  });

  await writeMarkdownMirror(
    nextRevision.slug,
    markdownToRevisionRaw({
      ...nextRevision,
      revisionId: normalizedRevisionId,
      createdAt: nextRevision.createdAt,
    }),
  );

  return { slug: normalizedSlug, revisionId: normalizedRevisionId };
}
