export default function Loading() {
  return (
    <section className="loading-shell" aria-busy="true" aria-label="Loading content">
      <div className="page-heading">
        <div className="loading-lines">
          <div className="loading-line short" />
          <div className="loading-line medium" />
          <div className="loading-line" />
        </div>
      </div>

      <div className="post-feed">
        <div className="loading-card" />
        <div className="loading-card" />
        <div className="loading-card" />
      </div>
    </section>
  );
}
