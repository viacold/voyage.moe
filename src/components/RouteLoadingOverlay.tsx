"use client";

import { useRouteTransition } from "./RouteTransitionProvider";

export function RouteLoadingOverlay() {
  const { isTransitioning } = useRouteTransition();

  if (!isTransitioning) {
    return null;
  }

  return (
    <div className="route-loading-overlay" aria-hidden="true">
      <section className="loading-shell route-loading-shell">
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
    </div>
  );
}
