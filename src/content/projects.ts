export type ProjectItem = {
  title: string;
  description: string;
  status: "planning" | "building" | "live";
  url?: string;
  repo?: string;
  tags: string[];
};

export const projectItems: ProjectItem[] = [
  {
    title: "voyage.moe",
    description: "The long-term home for writing, images, links, and future community features.",
    status: "building",
    url: "https://voyage.moe",
    repo: "https://github.com/viacold/voyage.moe",
    tags: ["website", "nextjs"],
  },
  {
    title: "Content Portal System",
    description: "A static-first foundation that can later grow into an admin-managed product.",
    status: "planning",
    tags: ["architecture", "cms"],
  },
];
