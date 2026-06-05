export type UpdateItem = {
  date: string;
  title: string;
  body: string;
  type: "site" | "content" | "release";
};

export const updateItems: UpdateItem[] = [
  {
    date: "2026-06-05",
    title: "Next.js portal plan approved",
    body: "The site direction moved from a landing page into a long-term content portal.",
    type: "site",
  },
  {
    date: "2026-06-06",
    title: "Static content sections drafted",
    body: "Blog, archive, gallery, projects, friends, updates, about, search, and RSS are part of Phase 1.",
    type: "release",
  },
];
