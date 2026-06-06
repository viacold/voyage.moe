import { updateItems } from "@/content/updates";

export const metadata = { title: "Updates" };

export default function UpdatesPage() {
  return (
    <>
      <header className="page-heading">
        <p className="eyebrow">Updates</p>
        <h1>Recent Changes</h1>
        <p>Small release notes for the public site.</p>
      </header>
      <div className="update-list">
        {updateItems.map((item) => (
          <article className="update-item" key={item.title}>
            <time dateTime={item.date}>{item.date}</time>
            <strong>{item.title}</strong>
            <p>{item.body}</p>
          </article>
        ))}
      </div>
    </>
  );
}
