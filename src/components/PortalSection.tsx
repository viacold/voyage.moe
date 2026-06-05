export function PortalSection({
  eyebrow,
  title,
  description,
  children,
}: Readonly<{
  eyebrow: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}>) {
  return (
    <section className="portal-section" aria-labelledby={`${eyebrow.toLowerCase()}-section-title`}>
      <div className="section-heading">
        <p className="eyebrow">{eyebrow}</p>
        <h2 id={`${eyebrow.toLowerCase()}-section-title`}>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      {children}
    </section>
  );
}
