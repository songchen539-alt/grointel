"use client";

import { useState } from "react";
import { Send, Check, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { submitLead } from "@/lib/supabase";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const data = new FormData(form);

    const result = await submitLead({
      name: data.get("name") as string,
      email: data.get("email") as string,
      companyWebsite: data.get("website") as string,
      targetMarket: data.get("market") as string,
      growthGoal: data.get("goal") as string,
      budgetRange: data.get("budget") as string,
      message: data.get("message") as string,
    });

    setLoading(false);

    if (result.success) {
      setSubmitted(true);
    } else {
      setError(result.error || "Something went wrong. Please try again.");
    }
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
          <Check className="h-8 w-8 text-emerald-400" />
        </div>
        <h2 className="mt-6 text-2xl font-bold text-white">Request Received</h2>
        <p className="mt-3 text-sm leading-relaxed text-gray-400">
          Your growth analysis request has been received. We&apos;ll review your company
          and get back within 24 hours.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-medium text-white transition-all hover:from-blue-500 hover:to-purple-500"
        >
          Back to Home
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-bold text-white">Request Your Free Growth Analysis</h1>
      <p className="mt-2 text-sm text-gray-500">
        Get a custom growth intelligence report tailored to your company.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-400">Name *</label>
            <input
              name="name"
              type="text"
              required
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition-all focus:border-blue-500/50"
              placeholder="Your full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400">Work email *</label>
            <input
              name="email"
              type="email"
              required
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition-all focus:border-blue-500/50"
              placeholder="you@company.com"
            />
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-400">Company website *</label>
            <input
              name="website"
              type="text"
              required
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition-all focus:border-blue-500/50"
              placeholder="https://yourcompany.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400">Target market</label>
            <select
              name="market"
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-black px-4 py-2.5 text-sm text-gray-300 outline-none transition-all focus:border-blue-500/50"
            >
              <option value="">Select a region</option>
              <option value="North America">North America</option>
              <option value="Southeast Asia">Southeast Asia</option>
              <option value="Europe">Europe</option>
              <option value="Middle East">Middle East</option>
              <option value="Japan / East Asia">Japan / East Asia</option>
              <option value="Latin America">Latin America</option>
              <option value="Global / Multi-region">Global / Multi-region</option>
            </select>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-400">Growth goal *</label>
            <select
              name="goal"
              required
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-black px-4 py-2.5 text-sm text-gray-300 outline-none transition-all focus:border-blue-500/50"
            >
              <option value="">Select main goal</option>
              <option value="User acquisition">User acquisition</option>
              <option value="Market expansion">Market expansion</option>
              <option value="Community growth">Community growth</option>
              <option value="Revenue growth">Revenue growth</option>
              <option value="Brand awareness">Brand awareness</option>
              <option value="Partner / ecosystem development">Partner / ecosystem development</option>
              <option value="Investor / fundraising traction">Investor / fundraising traction</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400">Budget range</label>
            <select
              name="budget"
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-black px-4 py-2.5 text-sm text-gray-300 outline-none transition-all focus:border-blue-500/50"
            >
              <option value="">Select budget</option>
              <option value="Under $5k/month">Under $5k / month</option>
              <option value="$5k - $20k/month">$5k - $20k / month</option>
              <option value="$20k - $50k/month">$20k - $50k / month</option>
              <option value="$50k - $100k/month">$50k - $100k / month</option>
              <option value="$100k+/month">$100k+ / month</option>
              <option value="Not yet determined">Not yet determined</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400">Message</label>
          <textarea
            name="message"
            rows={3}
            className="mt-1.5 w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition-all focus:border-blue-500/50"
            placeholder="Tell us about your growth challenges and goals..."
          />
        </div>

        {error && (
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 text-sm text-rose-300">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-medium text-white transition-all hover:from-blue-500 hover:to-purple-500 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Request Analysis
            </>
          )}
        </button>
      </form>
    </div>
  );
}
