import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { releaseItems } from "@/content/releases";

export const metadata = {
  title: "Versions",
  description: "Download previous voyage.moe source versions.",
};

export default function VersionsPage() {
  return (
    <>
      <SiteHeader />
      <main className="site-main page-stack">
        <header className="page-heading">
          <p className="eyebrow">Versions</p>
          <h1>Release Downloads</h1>
          <p>Every listed version is backed by a GitHub tag and includes Markdown content files in the source archive.</p>
        </header>
        <div className="release-list">
          {releaseItems.map((release) => (
            <article className="release-card" key={release.version}>
              <div className="card-meta">
                <strong>{release.version}</strong>
                <time dateTime={release.date}>{release.date}</time>
              </div>
              <h2>{release.title}</h2>
              <ul>
                {release.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
              <div className="download-links" aria-label={`${release.version} downloads`}>
                <a href={`https://github.com/viacold/voyage.moe/releases/tag/${release.tag}`}>GitHub Release</a>
                <a href={release.downloads.zip}>Source ZIP</a>
                <a href={release.downloads.tar}>Source TAR.GZ</a>
              </div>
            </article>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
