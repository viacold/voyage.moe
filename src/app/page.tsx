import { ContentCard } from "@/components/ContentCard";
import { PortalSection } from "@/components/PortalSection";
import { SearchPanel } from "@/components/SearchPanel";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { friendItems } from "@/content/friends";
import { galleryItems } from "@/content/gallery";
import { projectItems } from "@/content/projects";
import { releaseItems } from "@/content/releases";
import { updateItems } from "@/content/updates";
import { getFeaturedPost, getPublishedPosts } from "@/lib/content";
import { createSearchIndex } from "@/lib/search";
import { PluginSlot } from "@/plugins/PluginSlot";

export default async function HomePage() {
  const [featured, posts, searchEntries] = await Promise.all([
    getFeaturedPost(),
    getPublishedPosts(),
    createSearchIndex(),
  ]);
  const latestRelease = releaseItems[0];

  return (
    <>
      <SiteHeader />
      <main className="site-main">
        <section className="hero-panel" aria-labelledby="home-title">
          <p className="eyebrow">clear routes, quiet notes</p>
          <h1 id="home-title">voyage.moe</h1>
          <p>A calm content portal for writing, project notes, image fragments, updates, and future community features.</p>
        </section>

        <PluginSlot slot="home.sidebar">
          <PortalSection eyebrow="Version" title="Latest Release">
            <ContentCard
              eyebrow={latestRelease.version}
              title={latestRelease.title}
              description={latestRelease.notes[0]}
              href="/versions"
              date={latestRelease.date}
              tags={[latestRelease.tag]}
            />
          </PortalSection>
        </PluginSlot>

        {featured ? (
          <PortalSection eyebrow="Featured" title="Start Here">
            <ContentCard
              eyebrow={featured.category}
              title={featured.title}
              description={featured.description}
              href={`/blog/${featured.slug}`}
              date={featured.date}
              tags={featured.tags}
            />
          </PortalSection>
        ) : null}

        <PortalSection eyebrow="Blog" title="Latest Notes">
          <div className="card-grid">
            {posts.slice(0, 4).map((post) => (
              <ContentCard
                eyebrow={post.category}
                title={post.title}
                description={post.description}
                href={`/blog/${post.slug}`}
                date={post.date}
                tags={post.tags}
                key={post.slug}
              />
            ))}
          </div>
        </PortalSection>

        <PortalSection eyebrow="Gallery" title="Image Signals">
          <div className="card-grid">
            {galleryItems.slice(0, 2).map((item) => (
              <ContentCard
                title={item.title}
                description={item.description}
                href="/gallery"
                date={item.date}
                tags={item.tags}
                key={item.title}
              />
            ))}
          </div>
        </PortalSection>

        <PortalSection eyebrow="Projects" title="Build Log">
          <div className="card-grid">
            {projectItems.slice(0, 2).map((item) => (
              <ContentCard title={item.title} description={item.description} href="/projects" tags={item.tags} key={item.title} />
            ))}
          </div>
        </PortalSection>

        <PortalSection eyebrow="Updates" title="Recent Changes">
          <div className="update-list">
            {updateItems.slice(0, 3).map((item) => (
              <article className="update-item" key={item.title}>
                <time dateTime={item.date}>{item.date}</time>
                <strong>{item.title}</strong>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </PortalSection>

        <SearchPanel entries={searchEntries} />

        <PortalSection eyebrow="Friends" title="Ports And Links">
          <div className="card-grid">
            {friendItems.slice(0, 2).map((item) => (
              <ContentCard title={item.name} description={item.description} href={item.url} key={item.name} />
            ))}
          </div>
        </PortalSection>
      </main>
      <SiteFooter />
    </>
  );
}
