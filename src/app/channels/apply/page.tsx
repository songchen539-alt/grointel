"use client";

import { useState, useEffect } from "react";
import { Send, Check, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

export default function ChannelsApplyPage() {
  useEffect(() => { document.title = "Apply as a Growth Channel - GroIntel"; }, []);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const data = new FormData(form);

    const payload: Record<string, unknown> = {
      channelName: data.get("channelName"),
      website: data.get("website"),
      contactName: data.get("contactName") || "",
      workEmail: data.get("workEmail"),
      category: data.get("category"),
      region: data.get("region") || "",
      serviceTypes: data.get("serviceTypes"),
      targetIndustries: data.get("targetIndustries") || "",
      targetClientStage: data.get("targetClientStage") || "",
      pricingModel: data.get("pricingModel") || "",
      minBudget: data.get("minBudget") ? Number(data.get("minBudget")) : null,
      maxBudget: data.get("maxBudget") ? Number(data.get("maxBudget")) : null,
      currency: data.get("currency") || "USD",
      growthOutcomes: data.get("growthOutcomes"),
      caseStudies: data.get("caseStudies") || "",
      proofLinks: data.get("proofLinks") || "",
      notes: data.get("notes") || "",
    };

    try {
      const res = await fetch("/api/growth-channels", {
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
        <Check className="mx-auto h-10 w-10 text-emerald-400" />
        <h2 className="mt-4 text-2xl font-bold text-white">Application Received</h2>
        <p className="mt-3 text-sm text-gray-400">
          Thank you. GroIntel will review your channel profile before matching you with relevant company demand.
        </p>
        <Link href="/" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-medium text-white">
          Back to Home <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-bold text-white">Apply as a Growth Channel</h1>
      <p className="mt-2 text-sm text-gray-500">
        Join GroIntel&apos;s curated growth solution network. Share your services, pricing range, target industries, regions, and growth outcomes you can help companies achieve.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-400">Channel Name *</label>
            <input name="channelName" type="text" required
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400">Website *</label>
            <input name="website" type="text" required
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/50" />
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-400">Work Email *</label>
            <input name="workEmail" type="email" required
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400">Contact Name</label>
            <input name="contactName" type="text"
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/50" />
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-400">Category *</label>
            <select name="category" required
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-black px-4 py-2.5 text-sm text-gray-300 outline-none focus:border-blue-500/50">
              <option value="">Select category</option>
              <option value="agency">Agency</option>
              <option value="community">Community</option>
              <option value="media">Media / PR</option>
              <option value="consultant">Consultant</option>
              <option value="vc">VC / Investor</option>
              <option value="accelerator">Accelerator</option>
              <option value="sales_agent">Sales Agent</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400">Region</label>
            <input name="region" type="text"
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/50" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400">Service Types *</label>
          <textarea name="serviceTypes" rows={2} required
            className="mt-1.5 w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/50"
            placeholder="e.g. SEO, content marketing, paid ads, PR, community building, partnerships, sales" />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-400">Target Industries</label>
            <input name="targetIndustries" type="text"
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400">Target Client Stage</label>
            <input name="targetClientStage" type="text"
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/50" />
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-gray-400">Pricing Model</label>
            <input name="pricingModel" type="text"
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400">Min Budget</label>
            <input name="minBudget" type="number"
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400">Max Budget</label>
            <input name="maxBudget" type="number"
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
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400">Growth Outcomes *</label>
          <textarea name="growthOutcomes" rows={3} required
            className="mt-1.5 w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/50"
            placeholder="What growth results can you help companies achieve?" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400">Case Studies</label>
          <textarea name="caseStudies" rows={2}
            className="mt-1.5 w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/50" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400">Proof Links</label>
          <textarea name="proofLinks" rows={2}
            className="mt-1.5 w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/50" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400">Notes</label>
          <textarea name="notes" rows={2}
            className="mt-1.5 w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/50" />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button type="submit" disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-medium text-white disabled:opacity-50">
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</> : <><Send className="h-4 w-4" /> Submit Application</>}
        </button>
      </form>
    </div>
  );
}
