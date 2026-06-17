"use client";

import { useState, useMemo } from "react";
import { SignalFeed, SignalBadge } from "@/signals/SignalCard";
import { generateSignalFeed } from "@/signals/SignalEngine";
import { SignalType, SIGNAL_TYPE_CONFIG } from "@/signals/SignalTypes";
import { Search, SlidersHorizontal, Activity } from "lucide-react";

const allTypes = Object.keys(SIGNAL_TYPE_CONFIG) as SignalType[];

export default function FeedPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<SignalType | "all">("all");
  const signals = useMemo(() => generateSignalFeed(50), []);

  const filtered = signals.filter((s) => {
    const matchSearch = s.companyName.toLowerCase().includes(search.toLowerCase()) ||
      s.summary.toLowerCase().includes(search.toLowerCase());
    if (typeFilter === "all") return matchSearch;
    return matchSearch && s.type === typeFilter;
  });

  const highCount = signals.filter((s) => s.priority === "High").length;

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
          <Activity className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Signals Feed</h1>
          <p className="text-sm text-gray-500">
            {signals.length} signals today — {highCount} high priority
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center mb-6">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
          <input
            type="text"
            placeholder="Search companies or signals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/50"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <SlidersHorizontal className="h-4 w-4 text-gray-600 shrink-0" />
          <button
            onClick={() => setTypeFilter("all")}
            className={`rounded-lg border px-3 py-1.5 text-xs whitespace-nowrap transition-all ${
              typeFilter === "all"
                ? "border-blue-500/40 bg-blue-500/10 text-blue-300"
                : "border-white/5 text-gray-500 hover:text-white"
            }`}
          >
            All
          </button>
          {allTypes.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`rounded-lg border px-3 py-1.5 text-xs whitespace-nowrap transition-all ${
                typeFilter === t
                  ? "border-blue-500/40 bg-blue-500/10 text-blue-300"
                  : "border-white/5 text-gray-500 hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      <SignalFeed signals={filtered} />
    </div>
  );
}
