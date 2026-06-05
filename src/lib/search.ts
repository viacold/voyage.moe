import { friendItems } from "@/content/friends";
import { projectItems } from "@/content/projects";
import { releaseItems } from "@/content/releases";
import { updateItems } from "@/content/updates";
import { getPublishedPosts } from "./content";

export type SearchEntry = {
  title: string;
  description: string;
  href: string;
  section: "blog" | "project" | "update" | "friend" | "release";
  slug: string;
  date?: string;
  tags: string[];
  text: string;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/\.js/g, "js")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function searchableText(parts: Array<string | string[] | undefined>) {
  return parts.flat().filter(Boolean).join(" ").toLowerCase();
}

export async function createSearchIndex(): Promise<SearchEntry[]> {
  const posts = await getPublishedPosts();

  return [
    ...posts.map((post) => ({
      title: post.title,
      description: post.description,
      href: `/blog/${post.slug}`,
      section: "blog" as const,
      slug: post.slug,
      date: post.date,
      tags: post.tags,
      text: searchableText([post.title, post.description, post.tags, post.category, post.excerpt]),
    })),
    ...projectItems.map((project) => ({
      title: project.title,
      description: project.description,
      href: project.url ?? "/projects",
      section: "project" as const,
      slug: slugify(project.title),
      tags: project.tags,
      text: searchableText([project.title, project.description, project.tags, project.status]),
    })),
    ...updateItems.map((update) => ({
      title: update.title,
      description: update.body,
      href: "/updates",
      section: "update" as const,
      slug: slugify(update.title),
      date: update.date,
      tags: [update.type],
      text: searchableText([update.title, update.body, update.type]),
    })),
    ...releaseItems.map((release) => ({
      title: release.title,
      description: release.notes.join(" "),
      href: "/versions",
      section: "release" as const,
      slug: slugify(release.version),
      date: release.date,
      tags: [release.version, release.tag],
      text: searchableText([release.version, release.title, release.notes, release.tag]),
    })),
    ...friendItems.map((friend) => ({
      title: friend.name,
      description: friend.description,
      href: friend.url,
      section: "friend" as const,
      slug: slugify(friend.name),
      tags: [],
      text: searchableText([friend.name, friend.description, friend.url]),
    })),
  ];
}
