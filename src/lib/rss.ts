import { site } from "@/content/site";
import type { BlogPost } from "./content";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function buildRssXml(posts: BlogPost[]) {
  const items = posts
    .map((post) => {
      const link = `${site.url}/blog/${post.slug}`;

      return [
        "<item>",
        `<title>${escapeXml(post.title)}</title>`,
        `<description>${escapeXml(post.description)}</description>`,
        `<link>${escapeXml(link)}</link>`,
        `<guid>${escapeXml(link)}</guid>`,
        `<pubDate>${new Date(`${post.date}T00:00:00.000Z`).toUTCString()}</pubDate>`,
        "</item>",
      ].join("");
    })
    .join("");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0">',
    "<channel>",
    `<title>${escapeXml(site.name)}</title>`,
    `<description>${escapeXml(site.description)}</description>`,
    `<link>${escapeXml(site.url)}</link>`,
    items,
    "</channel>",
    "</rss>",
  ].join("");
}
