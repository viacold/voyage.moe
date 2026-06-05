export type ReleaseItem = {
  version: string;
  date: string;
  title: string;
  notes: string[];
  tag: string;
  downloads: {
    zip: string;
    tar: string;
  };
};

const repoArchiveBase = "https://github.com/viacold/voyage.moe/archive/refs/tags";

export const releaseItems: ReleaseItem[] = [
  {
    version: "v0.2.0",
    date: "2026-06-06",
    title: "Next.js content portal foundation",
    notes: [
      "Adds Markdown blog content, archive pages, search, RSS, and version records.",
      "Adds static plugin extension scaffolding for future installable features.",
      "Keeps Markdown and typed content files inside every downloadable source version.",
    ],
    tag: "v0.2.0",
    downloads: {
      zip: `${repoArchiveBase}/v0.2.0.zip`,
      tar: `${repoArchiveBase}/v0.2.0.tar.gz`,
    },
  },
  {
    version: "v0.1.0",
    date: "2026-06-05",
    title: "Initial voyage.moe landing page",
    notes: [
      "Created the first public voyage.moe landing page.",
      "Published the site through GitHub-backed Vercel deployment.",
      "Included the generated sky visual and early project documentation.",
    ],
    tag: "v0.1.0",
    downloads: {
      zip: `${repoArchiveBase}/v0.1.0.zip`,
      tar: `${repoArchiveBase}/v0.1.0.tar.gz`,
    },
  },
];
