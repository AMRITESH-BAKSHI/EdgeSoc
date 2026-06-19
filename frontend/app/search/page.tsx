"use client";

import { useState } from "react";

export default function SearchPage() {

  const [query, setQuery] = useState("");

  async function handleSearch(
    e: React.FormEvent
  ) {

    e.preventDefault();

    await fetch(
      "/api/search",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          query
        })
      }
    );

    alert("Search Logged");
  }

  return (
    <main className="p-10">

      <h1 className="text-3xl font-bold mb-6">
        Search
      </h1>

      <form
        onSubmit={handleSearch}
        className="flex gap-4"
      >

        <input
          type="text"
          placeholder="Search..."
          value={query}
          onChange={(e) =>
            setQuery(e.target.value)
          }
          className="border p-2 flex-1"
        />

        <button
          className="border px-4"
        >
          Search
        </button>

      </form>

    </main>
  );
}