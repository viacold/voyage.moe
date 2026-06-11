import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

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
    throw new Error("仅支持 PNG、JPG、GIF、WEBP、AVIF 和 SVG 图片。");
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

export function setMediaDirectoryForTest(nextDirectory: string | null) {
  mediaDirectoryOverride = nextDirectory;
}

export function getMediaUrl(filename: string) {
  return `/uploads/${encodeURIComponent(filename)}`;
}

export async function listMediaAssets() {
  await ensureMediaDirectory();
  const filenames = await fs.readdir(getMediaDirectory());
  const assets = await Promise.all(
    filenames
      .filter((filename) => isAllowedMediaType(filename, "image/*"))
      .map(async (filename) => {
        const fullPath = path.join(getMediaDirectory(), filename);
        const stat = await fs.stat(fullPath);
        return {
          filename,
          url: getMediaUrl(filename),
          size: stat.size,
          type: path.extname(filename).toLowerCase(),
          updatedAt: stat.mtime.toISOString(),
        } satisfies MediaAsset;
      }),
  );

  return assets.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : a.updatedAt > b.updatedAt ? -1 : 0));
}

export async function saveMediaAsset(file: File) {
  if (!isAllowedMediaType(file.name, file.type)) {
    throw new Error("仅支持图片文件上传。");
  }

  await ensureMediaDirectory();
  const filename = buildMediaFilename(file.name, file.type);
  const fullPath = path.join(getMediaDirectory(), filename);
  const buffer = Buffer.from(await file.arrayBuffer());

  await fs.writeFile(fullPath, buffer);

  return {
    filename,
    url: getMediaUrl(filename),
    size: buffer.length,
    type: file.type || path.extname(filename).toLowerCase(),
    updatedAt: new Date().toISOString(),
  } satisfies MediaAsset;
}

export async function deleteMediaAsset(filename: string) {
  await ensureMediaDirectory();
  const normalized = path.basename(filename.trim());

  if (!normalized || normalized !== filename.trim()) {
    throw new Error("无效的媒体文件名。");
  }

  const fullPath = path.join(getMediaDirectory(), normalized);

  try {
    await fs.unlink(fullPath);
  } catch (cause) {
    if ((cause as NodeJS.ErrnoException).code === "ENOENT") {
      throw new Error("图片不存在。");
    }

    throw cause;
  }

  return { filename: normalized };
}
