"use client";

import { useMemo, useState } from "react";
import type { SearchEntry } from "@/lib/search";
import { searchEntries } from "@/lib/search-filter";

export function SearchPanel({ entries }: { entries: SearchEntry[] }) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchEntries(entries, query), [entries, query]);

  return (
    <section className="search-panel" aria-labelledby="search-title">
      <div className="section-heading">
        <p className="eyebrow">Search</p>
        <h2 id="search-title">Find notes and signals</h2>
      </div>
      <label className="search-box">
        <span className="sr-only">Search</span>
        <input
          aria-label="Search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      <div className="search-results" aria-live="polite">
        {results.map((entry) => (
          <a className="search-result" href={entry.href} key={`${entry.section}-${entry.slug}`}>
            <span>{entry.section}</span>
            <strong>{entry.title}</strong>
            <p>{entry.description}</p>
          </a>
        ))}
      </div>
    </section>
  );
}
