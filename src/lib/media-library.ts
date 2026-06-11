import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { getMetaValue, getVoyageDatabase, setMetaValue } from "./voyage-db";

const DEFAULT_MEDIA_DIRECTORY = path.join(process.cwd(), "public", "uploads");

const EXTENSION_BY_MIME: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/gif": ".gif",
  "image/webp": ".webp",
  "image/avif": ".avif",
  "image/svg+xml": ".svg",
};

const ALLOWED_EXTENSIONS = new Set(Object.values(EXTENSION_BY_MIME));

let mediaDirectoryOverride: string | null = null;

export type MediaAsset = {
  filename: string;
  url: string;
  size: number;
  type: string;
  updatedAt: string;
};

function getMediaDirectory() {
  return mediaDirectoryOverride ?? process.env.VOYAGE_MEDIA_DIR ?? DEFAULT_MEDIA_DIRECTORY;
}

function normalizeBaseName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function inferExtension(filename: string, mimeType: string) {
  const extension = path.extname(filename).toLowerCase();
  if (ALLOWED_EXTENSIONS.has(extension)) {
    return extension;
  }

  return EXTENSION_BY_MIME[mimeType] ?? null;
}

function buildMediaFilename(filename: string, mimeType: string) {
  const baseName = normalizeBaseName(path.basename(filename, path.extname(filename))) || "image";
  const extension = inferExtension(filename, mimeType);

  if (!extension) {
    throw new Error("浠呮敮鎸?PNG銆丣PG銆丟IF銆乄EBP銆丄VIF 鍜?SVG 鍥剧墖銆?");
  }

  return `${Date.now()}-${randomUUID().slice(0, 8)}-${baseName}${extension}`;
}

function isAllowedMediaType(filename: string, mimeType: string) {
  const extension = inferExtension(filename, mimeType);
  return Boolean(extension);
}

async function ensureMediaDirectory() {
  await fs.mkdir(getMediaDirectory(), { recursive: true });
}

async function seedMediaFromFilesIfNeeded() {
  if (getMetaValue("media_seeded") === "true") {
    return;
  }

  const db = getVoyageDatabase();
  const count = db.prepare("SELECT COUNT(*) AS count FROM media_assets").get() as { count?: number } | undefined;

  if ((count?.count ?? 0) === 0) {
    await ensureMediaDirectory();
    const filenames = await fs.readdir(getMediaDirectory());
    const insert = db.prepare(`
      INSERT OR REPLACE INTO media_assets (
        filename,
        url,
        size,
        type,
        updatedAt
      ) VALUES (
        @filename,
        @url,
        @size,
        @type,
        @updatedAt
      )
    `);

    for (const filename of filenames) {
      if (!isAllowedMediaType(filename, "image/*")) {
        continue;
      }

      const fullPath = path.join(getMediaDirectory(), filename);
      const stat = await fs.stat(fullPath);
      insert.run({
        filename,
        url: getMediaUrl(filename),
        size: stat.size,
        type: path.extname(filename).toLowerCase(),
        updatedAt: stat.mtime.toISOString(),
      });
    }
  }

  setMetaValue("media_seeded", "true");
}

export function setMediaDirectoryForTest(nextDirectory: string | null) {
  mediaDirectoryOverride = nextDirectory;
}

export function getMediaUrl(filename: string) {
  return `/uploads/${encodeURIComponent(filename)}`;
}

export async function listMediaAssets() {
  await seedMediaFromFilesIfNeeded();
  const assets = getVoyageDatabase()
    .prepare("SELECT * FROM media_assets ORDER BY updatedAt DESC, filename DESC")
    .all() as Record<string, unknown>[];

  return assets.map((row) => ({
    filename: String(row.filename),
    url: String(row.url),
    size: Number(row.size),
    type: String(row.type),
    updatedAt: String(row.updatedAt),
  }));
}

export async function saveMediaAsset(file: File) {
  if (!isAllowedMediaType(file.name, file.type)) {
    throw new Error("浠呮敮鎸佸浘鐗囨枃浠朵笂浼犮€?");
  }

  await ensureMediaDirectory();
  const filename = buildMediaFilename(file.name, file.type);
  const fullPath = path.join(getMediaDirectory(), filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  const updatedAt = new Date().toISOString();

  await fs.writeFile(fullPath, buffer);
  getVoyageDatabase()
    .prepare(
      `
        INSERT INTO media_assets (
          filename,
          url,
          size,
          type,
          updatedAt
        ) VALUES (
          @filename,
          @url,
          @size,
          @type,
          @updatedAt
        )
        ON CONFLICT(filename) DO UPDATE SET
          url = excluded.url,
          size = excluded.size,
          type = excluded.type,
          updatedAt = excluded.updatedAt
      `,
    )
    .run({
      filename,
      url: getMediaUrl(filename),
      size: buffer.length,
      type: file.type || path.extname(filename).toLowerCase(),
      updatedAt,
    });

  return {
    filename,
    url: getMediaUrl(filename),
    size: buffer.length,
    type: file.type || path.extname(filename).toLowerCase(),
    updatedAt,
  } satisfies MediaAsset;
}

export async function deleteMediaAsset(filename: string) {
  await ensureMediaDirectory();
  const normalized = path.basename(filename.trim());

  if (!normalized || normalized !== filename.trim()) {
    throw new Error("鏃犳晥鐨勫獟浣撴枃浠跺悕銆?");
  }

  const fullPath = path.join(getMediaDirectory(), normalized);

  try {
    await fs.unlink(fullPath);
  } catch (cause) {
    if ((cause as NodeJS.ErrnoException).code === "ENOENT") {
      throw new Error("鍥剧墖涓嶅瓨鍦ㄣ€?");
    }

    throw cause;
  }

  getVoyageDatabase().prepare("DELETE FROM media_assets WHERE filename = ?").run(normalized);

  return { filename: normalized };
}
