import Link from "next/link";

type ContentCardProps = {
  eyebrow?: string;
  title: string;
  description: string;
  href: string;
  date?: string;
  tags?: string[];
};

function CardLink({ href, children }: Readonly<{ href: string; children: React.ReactNode }>) {
  if (/^https?:\/\//.test(href)) {
    return <a href={href}>{children}</a>;
  }

  return <Link href={href}>{children}</Link>;
}

export function ContentCard({ eyebrow, title, description, href, date, tags = [] }: ContentCardProps) {
  return (
    <article className="content-card">
      <div className="card-meta">
        {eyebrow ? <span>{eyebrow}</span> : null}
        {date ? <time dateTime={date}>{date}</time> : null}
      </div>
      <h3>
        <CardLink href={href}>{title}</CardLink>
      </h3>
      <p>{description}</p>
      {tags.length ? (
        <ul className="tag-list" aria-label={`${title} tags`}>
          {tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
