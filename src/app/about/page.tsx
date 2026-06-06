import Link from "next/link";
import { site } from "@/content/site";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <article className="article-shell">
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
        <section className="about-section" aria-labelledby="version-updates-heading">
          <h2 id="version-updates-heading">Version &amp; updates</h2>
          <p>
            voyage.moe is being iterated as a long-term home for writing, projects, and future community features.
            Major site changes are summarized in <Link href="/updates">Updates</Link>, while downloadable tagged
            releases remain available on the <Link href="/versions">Versions</Link> page.
          </p>
        </section>
      </div>
    </article>
  );
}
