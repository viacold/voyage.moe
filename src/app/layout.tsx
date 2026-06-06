import type { Metadata } from "next";
import { AppReady } from "@/components/AppReady";
import { RouteLoadingOverlay } from "@/components/RouteLoadingOverlay";
import { RouteTransitionProvider } from "@/components/RouteTransitionProvider";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeScript } from "@/components/ThemeScript";
import { site } from "@/content/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.name,
    template: `%s | ${site.name}`,
  },
  description: site.description,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <RouteTransitionProvider>
          <ThemeProvider>
            <AppReady />
            <SiteHeader />
            <main className="site-main">
              {children}
              <RouteLoadingOverlay />
            </main>
            <SiteFooter />
          </ThemeProvider>
        </RouteTransitionProvider>
      </body>
    </html>
  );
}
