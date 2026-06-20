"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Building2, Loader2, Network, ShieldCheck, UserCheck } from "lucide-react";

const examples = [
  "https://youtube.com/@channel",
  "https://linkedin.com/company/agency",
  "https://github.com/dev",
  "https://substack.com/@writer",
];

const outcomes = [
  "Capability and audience passport",
  "Proof, strengths, limits, and pricing signals",
  "Missing questions that improve match quality",
  "Recommended companies and collaboration routes",
];

export default function CapabilityIntelligencePage() {
  const [profileUrl, setProfileUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileUrl.trim()) return;
    setLoading(true);
    setError("");

    try {
      const r = await fetch("/api/capability-intelligence/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileUrl: profileUrl.trim() }),
      });
      const d = await r.json();
      if (d.success && d.knowledgeProfile) {
        router.push("/capability-intelligence/" + d.knowledgeProfile.id);
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
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-purple-500/10">
            <UserCheck className="h-5 w-5 text-purple-300" />
          </div>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight md:text-5xl">
            Let GroIntel understand what you can actually grow.
          </h1>
          <p className="mt-5 text-base leading-7 text-gray-400">
            Paste a public profile, channel, portfolio, or website. GroIntel builds your capability passport, identifies what proof is missing, and matches you with companies whose growth needs fit your audience and strengths.
          </p>

          <form onSubmit={handleSubmit} className="mt-8">
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={profileUrl}
                onChange={(e) => setProfileUrl(e.target.value)}
                placeholder="Profile URL, e.g. YouTube, LinkedIn, Substack"
                className="min-h-12 flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-4 text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-purple-300/40"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !profileUrl.trim()}
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
                onClick={() => setProfileUrl(example)}
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
              <Network className="h-5 w-5 text-purple-300" />
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
            <div className="rounded-lg border border-purple-500/15 bg-purple-500/[0.06] p-5">
              <ShieldCheck className="h-5 w-5 text-purple-300" />
              <h3 className="mt-4 text-sm font-semibold text-white">Capability proof</h3>
              <p className="mt-2 text-sm leading-6 text-gray-500">Audience, authority, execution, case evidence, pricing, and availability.</p>
            </div>
            <div className="rounded-lg border border-blue-500/15 bg-blue-500/[0.06] p-5">
              <Building2 className="h-5 w-5 text-blue-300" />
              <h3 className="mt-4 text-sm font-semibold text-white">Company opportunities</h3>
              <p className="mt-2 text-sm leading-6 text-gray-500">Companies whose goals, market, and constraints match your strengths.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

