import { ContentCard } from "@/components/ContentCard";
import { friendItems } from "@/content/friends";

export const metadata = { title: "Friends" };

export default function FriendsPage() {
  return (
    <>
      <header className="page-heading">
        <p className="eyebrow">Friends</p>
        <h1>Ports And Links</h1>
        <p>Useful places and future friend links.</p>
      </header>
      <div className="card-grid">
        {friendItems.map((item) => (
          <ContentCard title={item.name} description={item.description} href={item.url} key={item.name} />
        ))}
      </div>
    </>
  );
}
