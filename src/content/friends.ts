export type FriendItem = {
  name: string;
  description: string;
  url: string;
  avatar?: string;
};

export const friendItems: FriendItem[] = [
  {
    name: "Open Web",
    description: "A reminder that small personal sites can still feel alive.",
    url: "https://developer.mozilla.org/",
  },
  {
    name: "Vercel",
    description: "The deployment home for voyage.moe.",
    url: "https://vercel.com/",
  },
];
