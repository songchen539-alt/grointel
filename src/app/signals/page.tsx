"use client";

import { useState } from "react";
import SignalCard from "@/components/SignalCard";
import { getAllCompanies } from "@/lib/companyKnowledgeGraph";
import { Search, SlidersHorizontal } from "lucide-react";

export default function SignalsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const all = getAllCompanies(); const filtered = all.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.industry.toLowerCase().includes(search.toLowerCase());
    if (filter === "all") return matchSearch;
    return matchSearch && c.stage.toLowerCase() === filter.toLowerCase();
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Growth Signals</h1>
          <p className="mt-1 text-sm text-gray-500">
            {getAllCompanies().length} companies detected with growth signals
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
          <input
            type="text"
            placeholder="Search companies or sectors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-600 outline-none transition-all focus:border-blue-500/50"
          />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-gray-600" />
          {["all", "high", "medium", "low"].map((p) => (
            <button
              key={p}
              onClick={() => setFilter(p)}
              className={`rounded-lg border px-3 py-1.5 text-xs capitalize transition-all ${
                filter === p
                  ? "border-blue-500/40 bg-blue-500/10 text-blue-300"
                  : "border-white/5 text-gray-500 hover:text-white"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {filtered.map((company) => (
          <SignalCard key={company.id} company={company} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-24 text-center text-sm text-gray-500">No companies match your filters.</div>
      )}
    </div>
  );
}


