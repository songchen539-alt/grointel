"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { generateReport } from "@/lib/intelligence/reportGenerator";
import { saveReport } from "@/lib/reportStore";
import type { CompanyMRI } from "@/lib/intelligence/types";
import {
  Search, Loader2, BrainCircuit, Building2, TrendingUp, Shield,
  Target, Globe, ArrowRight, Check, Activity, Users,
} from "lucide-react";

export default function AnalyzePage() {
  const router = useRouter();
  const [inputUrl, setInputUrl] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<CompanyMRI | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const u = params.get("url") || "";
      if (u) {
        setInputUrl(u);
        setResult(generateReport(u));
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const validateUrl = (url: string): boolean => {
    if (!url.trim()) { setError("Please enter a company website"); return false; }
    const domain = url.replace(/https?:\/\//, "").replace(/\/.*$/, "").trim();
    if (!domain.includes(".") || domain.length < 3) { setError("Please enter a valid domain (e.g., stripe.com)"); return false; }
    setError(""); return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const url = inputUrl.trim();
    if (!validateUrl(url)) return;
    setAnalyzing(true);
    setResult(null);
    setTimeout(() => {
      setAnalyzing(false);
      setResult(generateReport(url));
      window.history.pushState({}, "", `/analyze?url=${encodeURIComponent(url)}`);
    }, 800);
  };

  const handleViewFullReport = () => {
    if (!result) return;
    const id = saveReport(result.website);
    router.push('/report/view?id=' + id);
  };

  const showResult = result && !analyzing;
  const showEmpty = !result && !analyzing;

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

      {showResult && (
        <div className="mx-auto max-w-5xl px-6 py-10">
          <section className="mb-10">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
              <div className="flex flex-col items-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-blue-500/30 bg-blue-500/[0.06]">
                  <span className="text-3xl font-bold text-blue-400">{result.overallScore}</span>
                </div>
                <span className="mt-1 text-xs text-gray-500">Overall Score</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{result.companyName}</h2>
                <p className="text-sm text-gray-500">{result.industry} - {result.stage}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { name: "Growth Score", score: result.growthScore },
                { name: "Market Readiness", score: result.marketReadiness },
                { name: "Technology Health", score: result.technologyHealth },
                { name: "Expansion Readiness", score: result.expansionReadiness },
              ].map((s) => (
                <div key={s.name} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase tracking-wider text-gray-500">{s.name}</span>
                    <span className={`text-sm font-bold ${s.score >= 75 ? "text-emerald-400" : s.score >= 55 ? "text-amber-400" : "text-rose-400"}`}>{s.score}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 mb-10">
            <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/[0.03] p-5">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white mt-1">Top Opportunity</h3>
              {result.growthOpportunities[0] && <p className="text-sm text-gray-300 mt-1">{result.growthOpportunities[0].title}</p>}
            </div>
            <div className="rounded-xl border border-rose-500/10 bg-rose-500/[0.03] p-5">
              <Shield className="h-4 w-4 text-rose-400" />
              <h3 className="text-sm font-semibold text-white mt-1">Top Risk</h3>
              {result.keyRisks[0] && <p className="text-sm text-gray-300 mt-1">{result.keyRisks[0].title}</p>}
            </div>
          </section>

          <div className="text-center">
            <button onClick={handleViewFullReport}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3.5 text-sm font-medium text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:from-blue-500 hover:to-purple-500 transition-all">
              <Globe className="h-4 w-4" />
              Generate Full Report
            </button>
          </div>
        </div>
      )}

      {showEmpty && (
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
