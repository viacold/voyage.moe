import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://voyage.moe"),
  title: {
    default: "voyage.moe",
    template: "%s | voyage.moe",
  },
  description: "A clear and quiet content portal for notes, projects, images, and links.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
