import { ContentCard } from "@/components/ContentCard";
import { PortalSection } from "@/components/PortalSection";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getPublishedPosts } from "@/lib/content";

export default async function HomePage() {
  const posts = await getPublishedPosts();

  return (
    <>
      <SiteHeader />
      <main className="site-main">
        <PortalSection
          eyebrow="Blog"
          title="Published Articles"
          description="Only published articles appear here."
        >
          <div className="card-grid">
            {posts.map((post) => (
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
      </main>
      <SiteFooter />
    </>
  );
}
