import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { site } from "@/content/site";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="site-main article-shell">
        <article>
          <header className="article-header">
            <p className="eyebrow">About</p>
            <h1>{site.name}</h1>
            <p>{site.description}</p>
          </header>
          <div className="article-body">
            <p>
              voyage.moe is becoming a long-term web home for notes, projects, image fragments, links, and future
              community features.
            </p>
            <p>
              Phase 1 keeps the site static and reliable while preparing clean paths for admin tools, accounts, comments,
              and richer publishing workflows.
            </p>
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
