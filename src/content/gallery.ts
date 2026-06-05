export type GalleryItem = {
  title: string;
  description: string;
  date: string;
  image: string;
  tags: string[];
};

export const galleryItems: GalleryItem[] = [
  {
    title: "Morning Sky",
    description: "A soft sky study for the first voyage.moe visual direction.",
    date: "2026-06-05",
    image: "/hero-sky.png",
    tags: ["sky", "mood"],
  },
  {
    title: "Quiet Interface",
    description: "A saved design mood for clear writing and calm navigation.",
    date: "2026-06-06",
    image: "/hero-sky.png",
    tags: ["design", "interface"],
  },
];
