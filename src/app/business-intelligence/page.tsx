"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Building2, Loader2, Search, Target, UserCheck } from "lucide-react";

const examples = ["stripe.com", "openai.com", "clay.com", "perplexity.ai"];

const outcomes = [
  "Company identity and business model",
  "Growth goals, risks, and constraints",
  "Missing questions that improve precision",
  "Recommended KOLs and growth partners",
];

export default function BusinessIntelligencePage() {
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!website.trim()) return;
    setLoading(true);
    setError("");

    try {
      const r = await fetch("/api/business-intelligence/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ website: website.trim() }),
      });
      const d = await r.json();
      if (d.success && d.knowledgeProfile) {
        router.push("/business-intelligence/" + d.knowledgeProfile.id);
      } else {
        setError(d.error || "Failed to create profile");
        setLoading(false);
      }
    } catch {
      setError("Network error");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-[0.95fr_1.05fr] md:items-center md:py-24">
        <div>
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-500/10">
            <Building2 className="h-5 w-5 text-blue-300" />
          </div>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight md:text-5xl">
            Let GroIntel understand your company first.
          </h1>
          <p className="mt-5 text-base leading-7 text-gray-400">
            Enter a website or company identity. GroIntel builds the first business passport, finds what it still needs to know, then recommends KOLs and growth partners that can actually move the company forward.
          </p>

          <form onSubmit={handleSubmit} className="mt-8">
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="Company website, e.g. stripe.com"
                className="min-h-12 flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-4 text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-blue-300/40"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !website.trim()}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-white px-5 text-sm font-medium text-black transition-colors hover:bg-gray-200 disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Build Passport"}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </div>
            {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
          </form>

          <div className="mt-6 flex flex-wrap gap-2">
            {examples.map((example) => (
              <button
                key={example}
                onClick={() => setWebsite(example)}
                className="rounded-full border border-white/5 bg-white/[0.02] px-3 py-1.5 text-xs text-gray-500 transition-colors hover:border-white/10 hover:text-white"
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-lg border border-white/10 bg-white/[0.025] p-6">
            <div className="flex items-center gap-3">
              <Search className="h-5 w-5 text-blue-300" />
              <h2 className="text-lg font-semibold">What GroIntel creates</h2>
            </div>
            <div className="mt-6 grid gap-3">
              {outcomes.map((outcome, index) => (
                <div key={outcome} className="flex items-center gap-3 rounded-lg border border-white/5 bg-black/30 px-4 py-3">
                  <span className="text-xs text-gray-600">0{index + 1}</span>
                  <span className="text-sm text-gray-300">{outcome}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-blue-500/15 bg-blue-500/[0.06] p-5">
              <Target className="h-5 w-5 text-blue-300" />
              <h3 className="mt-4 text-sm font-semibold text-white">Growth diagnosis</h3>
              <p className="mt-2 text-sm leading-6 text-gray-500">Goals, market, constraints, trust gaps, and next actions.</p>
            </div>
            <div className="rounded-lg border border-purple-500/15 bg-purple-500/[0.06] p-5">
              <UserCheck className="h-5 w-5 text-purple-300" />
              <h3 className="mt-4 text-sm font-semibold text-white">Partner matching</h3>
              <p className="mt-2 text-sm leading-6 text-gray-500">KOLs, creators, agencies, communities, and channel partners.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

