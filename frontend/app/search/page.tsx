"use client";

import { useState } from "react";

interface SearchResult {
  alert_id: string | number;
  source_ip: string;
  attack_type: string;
  severity: string;
}

interface SearchResponse {
  results?: SearchResult[];
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();

    if (!query.trim()) return;

    setLoading(true);

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      const data: SearchResponse = await response.json();

      setResults(data.results || []);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen bg-[#0d1117] text-[#e6edf3] font-sans overflow-hidden">

      {/* Sidebar Navigation */}
      <aside className="w-56 bg-[#161b22] border-r border-[#30363d] flex flex-col p-4 shrink-0">

        <div className="mb-8">
          <h1 className="text-lg font-bold text-white tracking-tight">
            EdgeSOC
          </h1>
        </div>

        <nav className="space-y-1">

          <button
            onClick={() => (window.location.href = "/")}
            className="w-full text-left px-3 py-2 text-xs font-medium rounded-md text-[#8b949e] hover:bg-[#21262d] hover:text-[#e6edf3] transition"
          >
            📊 Dashboard
          </button>

          <button
            onClick={() => (window.location.href = "/alerts")}
            className="w-full text-left px-3 py-2 text-xs font-medium rounded-md text-[#8b949e] hover:bg-[#21262d] hover:text-[#e6edf3] transition"
          >
            🚨 Alerts
          </button>

          <button
            onClick={() => (window.location.href = "/reports")}
            className="w-full text-left px-3 py-2 text-xs font-medium rounded-md text-[#8b949e] hover:bg-[#21262d] hover:text-[#e6edf3] transition"
          >
            📄 Reports
          </button>

          <button
            className="w-full text-left px-3 py-2 text-xs font-medium rounded-md bg-[#21262d] text-[#e6edf3] transition"
          >
            🔍 Search / IOC
          </button>

        </nav>
      </aside>

      {/* Main Content Workspace */}
      <main className="flex-1 flex flex-col p-6 space-y-6 overflow-y-auto">

        <div>
          <h1 className="text-lg font-bold text-white uppercase tracking-wider">
            IOC Search & Lookup
          </h1>

          <p className="text-xs text-[#8b949e] mt-0.5">
            Cross-reference active malicious telemetry metrics via NextAPI
          </p>
        </div>

        {/* Search Form */}
        <form
          onSubmit={handleSearch}
          className="flex gap-4 w-full max-w-2xl"
        >
          <input
            type="text"
            placeholder="Search by Source IP, Alert ID, or Vector Signature..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-[#161b22] border border-[#30363d] rounded-md py-2 px-4 text-xs outline-none focus:border-[#58a6ff] text-white transition font-mono"
          />

          <button
            type="submit"
            className="bg-[#58a6ff] hover:bg-[#79b8ff] text-[#000] text-xs font-medium px-5 py-2 rounded-md transition font-semibold"
          >
            Search
          </button>
        </form>

        {/* Dynamic Telemetry Results Interface */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-md max-w-2xl overflow-hidden">

          {loading ? (
            <div className="text-center py-12 text-xs text-[#8b949e]">
              Querying database indexes via internal endpoint...
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12 text-xs text-[#8b949e]">
              {query
                ? "No indicators found matching your lookup token."
                : "Enter a search parameter to query indexed security nodes."}
            </div>
          ) : (
            <div className="divide-y divide-[#30363d]">

              {results.map((alert) => (
                <div
                  key={alert.alert_id}
                  className="p-4 hover:bg-[#21262d] transition flex justify-between items-center text-xs"
                >

                  <div>
                    <div className="font-mono text-[#58a6ff] font-bold">
                      #{alert.alert_id}
                    </div>

                    <div className="text-[#8b949e] mt-1 font-mono">
                      Source Endpoint: {alert.source_ip}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">

                    <span className="capitalize font-medium text-white">
                      {alert.attack_type.replace("_", " ")}
                    </span>

                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        alert.severity === "high"
                          ? "bg-[rgba(248,81,73,0.15)] text-[#f85149]"
                          : "bg-[rgba(210,153,34,0.15)] text-[#d29922]"
                      }`}
                    >
                      {alert.severity}
                    </span>

                  </div>

                </div>
              ))}

            </div>
          )}

        </div>

      </main>
    </div>
  );
}