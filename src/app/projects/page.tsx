import { ContentCard } from "@/components/ContentCard";
import { projectItems } from "@/content/projects";

export const metadata = { title: "Projects" };

export default function ProjectsPage() {
  return (
    <>
      <header className="page-heading">
        <p className="eyebrow">Projects</p>
        <h1>Build Log</h1>
        <p>Current and planned work around voyage.moe.</p>
      </header>
      <div className="card-grid">
        {projectItems.map((item) => (
          <ContentCard
            title={item.title}
            description={`${item.status}: ${item.description}`}
            href={item.url ?? "/projects"}
            tags={item.tags}
            key={item.title}
          />
        ))}
      </div>
    </>
  );
}
