"use client";

import { useState, useEffect, Suspense } from "react";

export const dynamic = "force-dynamic";
import { useSearchParams } from "next/navigation";
import { Send, Check, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export default function GrowthOptionsPage() {
  return <Suspense fallback={<div className="mx-auto max-w-2xl px-6 py-16" />}><GrowthOptionsForm /></Suspense>;
}

function GrowthOptionsForm() {
  useEffect(() => { document.title = "Request Growth Solutions - GroIntel"; }, []);
  const searchParams = useSearchParams();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const reportId = searchParams?.get("reportId") || "";
  const websiteParam = searchParams?.get("website") || "";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const data = new FormData(form);

    const payload: Record<string, unknown> = {
      companyName: data.get("companyName"),
      website: data.get("website"),
      workEmail: data.get("workEmail"),
      contactName: data.get("contactName") || "",
      reportId: data.get("reportId") || "",
      growthGoal: data.get("growthGoal"),
      targetMarket: data.get("targetMarket") || "",
      targetCustomer: data.get("targetCustomer") || "",
      currentChallenge: data.get("currentChallenge"),
      budgetMin: data.get("budgetMin") ? Number(data.get("budgetMin")) : null,
      budgetMax: data.get("budgetMax") ? Number(data.get("budgetMax")) : null,
      currency: data.get("currency") || "USD",
      timeline: data.get("timeline") || "",
      preferredChannels: data.get("preferredChannels") || "",
      notes: data.get("notes") || "",
    };

    try {
      const res = await fetch("/api/growth-needs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (result.success) {
        setSubmitted(true);
      } else {
        setError(result.error || "Failed to submit.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
          <Check className="h-8 w-8 text-emerald-400" />
        </div>
        <h2 className="mt-6 text-2xl font-bold text-white">Thank You</h2>
        <p className="mt-3 text-sm leading-relaxed text-gray-400">
          GroIntel will review your growth needs and prepare curated growth solution options.
        </p>
        <Link href="/" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-medium text-white">
          Back to Home
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-bold text-white">Request Growth Solutions</h1>
      <p className="mt-2 text-sm text-gray-500">
        Share your growth goals, target market, budget, and current challenges.
        GroIntel will review your Company MRI and match you with curated growth solution options.
      </p>

      {reportId && (
        <div className="mt-4 rounded-xl border border-blue-500/10 bg-blue-500/[0.03] px-4 py-2.5 text-xs text-blue-300">
          Company MRI Report: {reportId}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-400">Company Name *</label>
            <input name="companyName" type="text" required
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/50"
              placeholder="Your company" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400">Company Website *</label>
            <input name="website" type="text" required defaultValue={websiteParam}
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/50"
              placeholder="https://example.com" />
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-400">Work Email *</label>
            <input name="workEmail" type="email" required
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/50"
              placeholder="you@company.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400">Contact Name</label>
            <input name="contactName" type="text"
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/50"
              placeholder="Your full name" />
          </div>
        </div>

        <input type="hidden" name="reportId" value={reportId} />

        <div>
          <label className="block text-sm font-medium text-gray-400">Growth Goal *</label>
          <input name="growthGoal" type="text" required
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/50"
            placeholder="e.g. Expand into Southeast Asia, grow user base 3x, enter enterprise market" />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-400">Target Market</label>
            <input name="targetMarket" type="text"
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/50"
              placeholder="e.g. North America, SEA, Europe" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400">Target Customer</label>
            <input name="targetCustomer" type="text"
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/50"
              placeholder="e.g. Enterprise, SMB, Developers" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400">Current Challenge *</label>
          <textarea name="currentChallenge" rows={3} required
            className="mt-1.5 w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/50"
            placeholder="What is blocking your growth right now?" />
        </div>

        <div className="grid gap-5 md:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-gray-400">Budget Min</label>
            <input name="budgetMin" type="number"
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400">Budget Max</label>
            <input name="budgetMax" type="number"
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400">Currency</label>
            <select name="currency"
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-black px-4 py-2.5 text-sm text-gray-300 outline-none focus:border-blue-500/50">
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="SGD">SGD</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400">Timeline</label>
            <input name="timeline" type="text"
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/50"
              placeholder="e.g. 3 months, Q3 2026" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400">Preferred Channel Types</label>
          <textarea name="preferredChannels" rows={2}
            className="mt-1.5 w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/50"
            placeholder="e.g. SEO, paid ads, content marketing, PR, partnerships, community building" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400">Notes</label>
          <textarea name="notes" rows={2}
            className="mt-1.5 w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/50" />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button type="submit" disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-medium text-white disabled:opacity-50">
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</> : <><Send className="h-4 w-4" /> Submit Growth Request</>}
        </button>
      </form>
    </div>
  );
}
