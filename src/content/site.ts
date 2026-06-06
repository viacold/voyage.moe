export const site = {
  name: "voyage.moe",
  url: "https://voyage.moe",
  description: "A clear and quiet content portal for notes, projects, images, and links.",
  email: "hello@voyage.moe",
};

export const primaryNavigationItems = [
  { label: "Blog", href: "/blog" },
  { label: "Projects", href: "/projects" },
  { label: "Gallery", href: "/gallery" },
  { label: "About", href: "/about" },
];

export const secondaryNavigationItems = [
  { label: "Archive", href: "/archive" },
  { label: "Friends", href: "/friends" },
  { label: "Updates", href: "/updates" },
];

export const themeOptions = [
  { id: "clear", label: "Clear", description: "spacious editorial clarity" },
  { id: "voyage", label: "Voyage", description: "soft sky and travel mood" },
  { id: "night", label: "Night", description: "calm long-form reading" },
  { id: "archive", label: "Archive", description: "dense notebook browsing" },
] as const;

export type ThemeId = (typeof themeOptions)[number]["id"];
