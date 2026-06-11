import fs from "node:fs";
import path from "node:path";
import DatabaseConstructor from "better-sqlite3";

const DEFAULT_DB_PATH = path.join(process.cwd(), "data", "voyage.db");

type VoyageDatabase = ReturnType<typeof DatabaseConstructor>;

let dbPathOverride: string | null = null;
let db: VoyageDatabase | null = null;
let openedPath: string | null = null;

function getDbPath() {
  return dbPathOverride ?? process.env.VOYAGE_DB_PATH ?? DEFAULT_DB_PATH;
}

export function getVoyageDbPath() {
  return getDbPath();
}

function ensureParentDirectory(filePath: string) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function initializeSchema(database: VoyageDatabase) {
  database.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      passwordHash TEXT NOT NULL,
      role TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS posts (
      slug TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      date TEXT NOT NULL,
      updated TEXT,
      authorName TEXT,
      authorEmail TEXT,
      tagsJson TEXT NOT NULL,
      category TEXT NOT NULL,
      cover TEXT,
      featured INTEGER NOT NULL DEFAULT 0,
      draft INTEGER NOT NULL DEFAULT 0,
      content TEXT NOT NULL,
      html TEXT NOT NULL,
      excerpt TEXT NOT NULL,
      readingMinutes INTEGER NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS posts_date_index ON posts(date DESC, slug DESC);
    CREATE INDEX IF NOT EXISTS posts_category_index ON posts(category);
    CREATE INDEX IF NOT EXISTS posts_draft_index ON posts(draft);

    CREATE TABLE IF NOT EXISTS post_revisions (
      revisionId TEXT PRIMARY KEY,
      slug TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      date TEXT NOT NULL,
      updated TEXT,
      authorName TEXT,
      authorEmail TEXT,
      tagsJson TEXT NOT NULL,
      category TEXT NOT NULL,
      cover TEXT,
      featured INTEGER NOT NULL DEFAULT 0,
      draft INTEGER NOT NULL DEFAULT 0,
      content TEXT NOT NULL,
      html TEXT NOT NULL,
      excerpt TEXT NOT NULL,
      readingMinutes INTEGER NOT NULL,
      FOREIGN KEY (slug) REFERENCES posts(slug) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS post_revisions_slug_index ON post_revisions(slug, revisionId DESC);

    CREATE TABLE IF NOT EXISTS media_assets (
      filename TEXT PRIMARY KEY,
      url TEXT NOT NULL,
      size INTEGER NOT NULL,
      type TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS media_assets_updated_at_index ON media_assets(updatedAt DESC, filename DESC);
  `);
}

export function setVoyageDbPathForTest(nextPath: string | null) {
  dbPathOverride = nextPath;

  if (db) {
    db.close();
    db = null;
    openedPath = null;
  }
}

export function getVoyageDatabase() {
  const nextPath = getDbPath();

  if (!db || openedPath !== nextPath) {
    if (db) {
      db.close();
    }

    ensureParentDirectory(nextPath);
    db = new DatabaseConstructor(nextPath);
    initializeSchema(db);
    openedPath = nextPath;
  }

  return db;
}

export function getMetaValue(key: string) {
  const row = getVoyageDatabase().prepare("SELECT value FROM meta WHERE key = ?").get(key) as { value?: string } | undefined;
  return row?.value ?? null;
}

export function setMetaValue(key: string, value: string) {
  getVoyageDatabase()
    .prepare(
      `
        INSERT INTO meta (key, value)
        VALUES (?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
      `,
    )
    .run(key, value);
}

export function deleteMetaValue(key: string) {
  getVoyageDatabase().prepare("DELETE FROM meta WHERE key = ?").run(key);
}
