"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Globe } from "lucide-react";

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
      if (d.success && d.profile) {
        router.push("/business-intelligence/" + d.profile.id);
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
      <div className="mx-auto max-w-2xl px-6 py-24 md:py-32 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/[0.02] px-4 py-1.5 text-xs text-gray-500 mb-6">
          <Globe className="h-3.5 w-3.5 text-blue-400" />
          Business Intelligence
        </div>

        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Let GroIntel understand your business
        </h1>
        <p className="text-gray-500 text-lg mb-10 max-w-lg mx-auto">
          Enter any company website. We will generate structured Business Intelligence including business model, market, growth stack, and more.
        </p>

        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <div className="flex gap-2">
            <input
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="e.g. stripe.com"
              className="flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/20"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !website.trim()}
              className="rounded-lg bg-white/10 px-6 py-3 text-sm text-white hover:bg-white/15 transition-colors disabled:opacity-50 font-medium"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continue"}
            </button>
          </div>
          {error && <p className="text-sm text-red-400 mt-3">{error}</p>}
        </form>

        <div className="mt-16 text-left">
          <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">Sample companies</h3>
          <div className="flex flex-wrap gap-2">
            {["stripe.com", "openai.com", "clay.com", "perplexity.ai"].map((s) => (
              <button
                key={s}
                onClick={() => { setWebsite(s); }}
                className="rounded-full border border-white/5 bg-white/[0.02] px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:border-white/10 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
