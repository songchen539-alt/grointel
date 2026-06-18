"use client";

import { useState, useEffect } from "react";
import { Send, Check, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { submitLead } from "@/lib/supabase";

function readParams() {
  if (typeof window === "undefined") return { source: "", reportId: "" };
  const params = new URLSearchParams(window.location.search);
  return {
    source: params.get("source") || "",
    reportId: params.get("reportId") || "",
  };
}

export default function ContactPage() {
  useEffect(() => { document.title = "Book a Growth MRI Review - GroIntel"; }, []);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { source, reportId } = readParams();

    const form = e.currentTarget;
    const data = new FormData(form);

    const name = data.get("name") as string;
    const email = data.get("email") as string;
    const website = data.get("website") as string;
    const message = data.get("message") as string;

    const targetMarket = source
      ? "Contact Form - " + source + " - " + (reportId || "")
      : (data.get("market") as string) || "";

    const result = await submitLead({
      name,
      email,
      companyWebsite: website,
      targetMarket,
      growthGoal: data.get("goal") as string,
      budgetRange: data.get("budget") as string,
      message,
    });

    setLoading(false);

    if (result.success) {
      try {
        fetch("/api/reports/event", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reportId: reportId || "unknown",
            eventType: "contact_submitted",
            metadata: { source, reportId: reportId || "unknown", email, companyWebsite: website, timestamp: new Date().toISOString() }
          }),
        });
      } catch {}
      setSubmitted(true);
    } else {
      setError(result.error || "Something went wrong. Please try again.");
    }
  };

  const { source, reportId } = typeof window === "undefined" ? { source: "", reportId: "" } : readParams();

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
          <Check className="h-8 w-8 text-emerald-400" />
        </div>
        <h2 className="mt-6 text-2xl font-bold text-white">Thank You</h2>
        <p className="mt-3 text-sm leading-relaxed text-gray-400">
          Our team will review your company and contact you shortly.
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
      <h1 className="text-3xl font-bold text-white">Book a Growth MRI Review</h1>
      <p className="mt-2 text-sm text-gray-500">
        Share your company details and our team will review your growth signals, risks, opportunities, and next best actions.
      </p>

      {reportId && (
        <div className="mt-4 rounded-xl border border-blue-500/10 bg-blue-500/[0.03] px-4 py-2.5 text-xs text-blue-300">
          Company MRI Report: {reportId}
        </div>
      )}

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
          <label className="block text-sm font-medium text-gray-400">Message</label>
          <textarea
            name="message"
            rows={3}
            className="mt-1.5 w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition-all focus:border-blue-500/50"
            placeholder="Tell us what you want to understand - growth readiness, market expansion, competitor pressure, hiring momentum, or sales opportunities."
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
              Book Review
            </>
          )}
        </button>
      </form>
    </div>
  );
}

