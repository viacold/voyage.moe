const futureEntries = [
  {
    label: "Profile",
    title: "traveler profile",
    description: "A quiet place for who I am, what I make, and where to find me.",
  },
  {
    label: "Notes",
    title: "soft logbook",
    description: "Small observations, dev notes, and gentle records from the road.",
  },
  {
    label: "Gallery",
    title: "sky archive",
    description: "Images, moods, screenshots, and collected fragments of light.",
  },
  {
    label: "Links",
    title: "signal ports",
    description: "Social links, projects, and doorways to future corners.",
  },
];

export default function App() {
  return (
    <main className="site-shell" id="top">
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />
      <div className="skyline" aria-hidden="true" />

      <header className="site-header" aria-label="Main navigation">
        <a className="brand" href="#top" aria-label="voyage.moe home">
          voyage.moe
        </a>
        <nav className="nav-links">
          <a href="#profile">Profile</a>
          <a href="#notes">Notes</a>
          <a href="#links">Links</a>
        </nav>
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <p className="eyebrow">clear skies, soft signals</p>
        <h1 id="hero-title">voyage.moe</h1>
        <p className="hero-copy">
          A quiet little harbor for future notes, pictures, projects, and the
          gentle weather between worlds.
        </p>
        <div className="hero-actions" aria-label="Primary links">
          <a className="primary-link" href="#future">
            See the map
          </a>
          <a className="secondary-link" href="mailto:hello@voyage.moe">
            hello@voyage.moe
          </a>
        </div>
      </section>

      <section className="future-panel" id="future" aria-label="Future sections">
        {futureEntries.map((entry) => (
          <article className="future-card" id={entry.label.toLowerCase()} key={entry.label}>
            <p>{entry.label}</p>
            <h2>{entry.title}</h2>
            <span>{entry.description}</span>
          </article>
        ))}
      </section>

      <footer className="site-footer">
        <span>currently drifting into shape</span>
        <span>v0.1</span>
      </footer>
    </main>
  );
}
