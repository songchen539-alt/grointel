"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search, Loader2, BrainCircuit, Building2, TrendingUp, Shield,
  Target, Globe, ArrowRight, Check, Activity, Users,
} from "lucide-react";

export default function AnalyzePage() {
  const router = useRouter();
  const [inputUrl, setInputUrl] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  const validateUrl = (url: string): boolean => {
    if (!url.trim()) { setError("Please enter a company website"); return false; }
    const domain = url.replace(/https?:\/\//, "").replace(/\/.*$/, "").trim();
    if (!domain.includes(".") || domain.length < 3) { setError("Please enter a valid domain (e.g., stripe.com)"); return false; }
    setError(""); return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = inputUrl.trim();
    if (!validateUrl(url)) return;
    setAnalyzing(true);
    setError("");

    try {
      const res = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ website: url }),
      });
      const data = await res.json();

      if (data.success && data.redirectUrl) {
        window.history.pushState({}, "", `/analyze?url=${encodeURIComponent(url)}`);
        router.push(data.redirectUrl);
      } else {
        setError(data.error || "Failed to generate report.");
        setAnalyzing(false);
      }
    } catch {
      setError("Network error. Please try again.");
      setAnalyzing(false);
    }
  };

  return (
    <div>
      <section className="border-b border-white/5 py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">Analyze Any Company</h1>
          <p className="mt-3 text-base text-gray-400 max-w-xl mx-auto">Enter a company website to generate a Company MRI with opportunities, risks, signals and growth recommendations.</p>
          <form onSubmit={handleSubmit} className="mt-8 flex max-w-lg mx-auto gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
              <input type="text" placeholder="Enter company website..." value={inputUrl}
                onChange={(e) => { setInputUrl(e.target.value); setError(""); }}
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3.5 pl-10 pr-4 text-sm text-white placeholder-gray-600 outline-none transition-all focus:border-blue-500/50 focus:bg-white/[0.06]" />
            </div>
            <button type="submit" disabled={analyzing}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3.5 text-sm font-medium text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:from-blue-500 hover:to-purple-500 transition-all disabled:opacity-50">
              {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              {analyzing ? "Analyzing..." : "Analyze Company"}
            </button>
          </form>
          {error && <p className="mt-3 text-sm text-rose-400">{error}</p>}
          <div className="mt-4 flex items-center justify-center gap-3 text-xs text-gray-600">
            <span>Try:</span>
            {["stripe.com", "opengradient.ai", "monad.xyz"].map((d) => (
              <button key={d} onClick={() => { setInputUrl(d); setError(""); }}
                className="text-gray-400 hover:text-white underline underline-offset-2 transition-colors">{d}</button>
            ))}
          </div>
        </div>
      </section>

      {analyzing && (
        <section className="py-16">
          <div className="mx-auto max-w-md px-6">
            <div className="space-y-5">
              {[
                { icon: Search, label: "Collecting website data", done: true },
                { icon: Activity, label: "Detecting growth signals", done: true },
                { icon: Users, label: "Building company graph", done: true },
                { icon: BrainCircuit, label: "Generating Company MRI", done: false },
                { icon: Target, label: "Creating recommendations", done: false },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${step.done ? "bg-emerald-500/15" : "bg-white/[0.04] animate-pulse"}`}>
                    {step.done ? <Check className="h-4 w-4 text-emerald-400" /> : <Loader2 className="h-4 w-4 text-gray-500 animate-spin" />}
                  </div>
                  <span className={`text-sm ${step.done ? "text-gray-400" : "text-gray-500"}`}>{step.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {!analyzing && !error && (
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-2xl px-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/5 bg-white/[0.03]">
              <BrainCircuit className="h-8 w-8 text-gray-600" />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-white">Company MRI Report</h2>
            <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">Enter any company website above to generate a comprehensive growth intelligence report.</p>
          </div>
        </section>
      )}
    </div>
  );
}
