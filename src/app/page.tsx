"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Search } from "lucide-react";
import {
  companyScores, liveSignals, growthRecommendations,
  pipelineSteps, graphCategories, whyGroIntelPillars,
  enterpriseFeatures, footerLinks,
} from "@/lib/intelligenceEngine";

// ========== UTILITY ==========

function ScoreRingFull({ score, size = 72, label, detail }: { score: number; size?: number; label?: string; detail?: string }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const off = circ - (score / 100) * circ;
  const c = score >= 80 ? "stroke-emerald-400" : score >= 60 ? "stroke-amber-400" : "stroke-rose-400";
  const t = score >= 80 ? "text-emerald-400" : score >= 60 ? "text-amber-400" : "text-rose-400";
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox="0 0 64 64" className="-rotate-90">
        <circle cx={32} cy={32} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={4} />
        <circle cx={32} cy={32} r={r} fill="none" className={c} strokeWidth={4}
          strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round" />
      </svg>
      <span className={`-mt-11 text-xl font-bold ${t}`}>{score}</span>
      {label && <span className="mt-0.5 text-[10px] text-gray-500 font-medium uppercase tracking-wider">{label}</span>}
      {detail && <span className="text-[9px] text-gray-600 mt-0.5 max-w-[80px] text-center leading-tight">{detail}</span>}
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
      <span className="text-[10px] uppercase tracking-widest text-gray-500">{label}</span>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-gray-500">{sub}</p>}
    </div>
  );
}

function Badge({ text, color = "gray" }: { text: string; color?: string }) {
  const colors: Record<string, string> = {
    emerald: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    blue: "bg-blue-500/10 text-blue-300 border-blue-500/30",
    amber: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    gray: "bg-white/[0.04] text-gray-400 border-white/10",
    rose: "bg-rose-500/10 text-rose-300 border-rose-500/30",
  };
  return <span className={`border rounded-md px-2 py-0.5 text-[10px] font-medium ${colors[color] || colors.gray}`}>{text}</span>;
}

// ========== MAIN ==========

export default function Home() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [pipeHover, setPipeHover] = useState<number | null>(null);
  const [graphHover, setGraphHover] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) router.push(`/analyze?url=${encodeURIComponent(url.trim())}`);
  };

  return (
    <div className="overflow-hidden">
      {/* ======== 1. HERO ======== */}
      <section className="relative min-h-screen flex items-center border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.06)_0%,transparent_60%)]" />
        <div className="mx-auto max-w-7xl px-8 py-32 w-full">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-sm text-gray-400 mb-8">
              <svg className="h-3.5 w-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              The Operating System for Company Intelligence
            </div>
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white leading-[0.95]">
              The Operating System<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400">
                for Company Intelligence
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg md:text-xl leading-relaxed text-gray-400">
              Analyze any company. Discover opportunities. Predict risks.
              Make better growth decisions with AI.
            </p>
            <form onSubmit={handleSubmit} className="mt-10 flex max-w-lg gap-3">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
                <input type="text" placeholder="Enter company website..."
                  value={url} onChange={(e) => setUrl(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-4 pl-11 pr-4 text-sm text-white placeholder-gray-600 outline-none transition-all focus:border-blue-500/50 focus:bg-white/[0.06] focus:ring-1 focus:ring-blue-500/20" />
              </div>
              <button type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-7 py-4 text-sm font-medium text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:from-blue-500 hover:to-purple-500 transition-all">
                Analyze Company <ArrowRight className="h-4 w-4" />
              </button>
            </form>
            <div className="flex items-center gap-6 mt-5">
              <a href="/analyze?url=opengradient.com" className="text-xs text-gray-500 hover:text-gray-300 transition-colors underline underline-offset-4">
                View Company MRI              </a>
            </div>
            <p className="mt-8 text-xs text-gray-600 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/60" />
              Trusted by founders, operators, investors and growth teams
            </p>
          </div>
        </div>
      </section>

      {/* ======== 2. COMPANY MRI ======== */}
      <section className="border-b border-white/5 py-28">
        <div className="mx-auto max-w-7xl px-8">
          <div className="max-w-2xl mb-14">
            <span className="text-xs font-mono text-blue-400">/company-mri</span>
            <h2 className="mt-3 text-3xl font-bold text-white">Company MRI</h2>
            <p className="mt-2 text-sm text-gray-500 leading-relaxed">An executive intelligence dashboard that scores every dimension of a company. Understand strengths, weaknesses, and momentum at a glance.</p>
          </div>

          {/* Overall + 7 dimension scores */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {companyScores.map((s) => {
              const isOverall = s.name === "Overall Score";
              return (
                <div key={s.name} className={`rounded-xl border ${isOverall ? "border-blue-500/20 bg-blue-500/[0.04]" : "border-white/5 bg-white/[0.02]"} p-5 text-center`}>
                  <ScoreRingFull score={s.score} size={isOverall ? 80 : 64} label={s.name} detail={s.detail} />
                  <div className="mt-3 flex items-center justify-center gap-1.5">
                    <span className={`text-[10px] font-medium ${s.trend === "up" ? "text-emerald-400" : s.trend === "down" ? "text-rose-400" : "text-gray-500"}`}>
                      {s.trend === "up" ? "^" : s.trend === "down" ? "v" : "-"} {s.trend}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      s.status === "excellent" ? "bg-emerald-500/10 text-emerald-300" :
                      s.status === "good" ? "bg-blue-500/10 text-blue-300" :
                      s.status === "average" ? "bg-amber-500/10 text-amber-300" :
                      "bg-rose-500/10 text-rose-300"
                    }`}>{s.status}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <StatCard label="Companies Analyzed" value="10,000+" sub="Across 50+ industries" />
            <StatCard label="Data Sources" value="50+" sub="Public and private" />
            <StatCard label="Avg. Analysis Time" value="30s" sub="From URL to report" />
            <StatCard label="Accuracy Rate" value="92%" sub="AI-verified" />
          </div>
        </div>
      </section>

      {/* ======== 3. INTELLIGENCE PIPELINE ======== */}
      <section className="border-b border-white/5 py-28">
        <div className="mx-auto max-w-6xl px-8">
          <div className="max-w-2xl mb-14">
            <span className="text-xs font-mono text-blue-400">/pipeline</span>
            <h2 className="mt-3 text-3xl font-bold text-white">Intelligence Pipeline</h2>
            <p className="mt-2 text-sm text-gray-500">From a single URL to deep company intelligence in six stages.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pipelineSteps.map((step, i) => {
              const icons = [Search, Search, Search, Search, Search, Search];
              const isHovered = pipeHover === i;
              return (
                <div key={step.name}
                  onMouseEnter={() => setPipeHover(i)}
                  onMouseLeave={() => setPipeHover(null)}
                  className={`group relative rounded-xl border p-6 transition-all duration-300 ${
                    isHovered ? "border-blue-500/30 bg-white/[0.04] shadow-lg shadow-blue-500/5" : "border-white/5 bg-white/[0.02]"
                  }`}>
                  {/* Connector line */}
                  {i < pipelineSteps.length - 1 && (
                    <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10">
                      <ArrowRight className={`h-4 w-4 transition-colors ${isHovered ? "text-blue-400" : "text-gray-700"}`} />
                    </div>
                  )}
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[10px] font-mono text-gray-600">{step.icon}</span>
                    <span className={`text-xs font-medium uppercase tracking-wider transition-colors ${isHovered ? "text-blue-300" : "text-gray-500"}`}>{step.name}</span>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">{step.description}</p>
                  {/* Bottom accent bar */}
                  <div className={`mt-4 h-0.5 w-8 rounded-full transition-all duration-300 ${isHovered ? "bg-blue-500 w-12" : "bg-white/[0.06]"}`} />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ======== 4. COMPANY GRAPH ======== */}
      <section className="border-b border-white/5 py-28">
        <div className="mx-auto max-w-7xl px-8">
          <div className="max-w-2xl mb-14">
            <span className="text-xs font-mono text-blue-400">/graph</span>
            <h2 className="mt-3 text-3xl font-bold text-white">Company Graph</h2>
            <p className="mt-2 text-sm text-gray-500">Every company is a living network of relationships. We map them all.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {graphCategories.map((cat) => {
              const isHovered = graphHover === cat.name;
              return (
                <div key={cat.name}
                  onMouseEnter={() => setGraphHover(cat.name)}
                  onMouseLeave={() => setGraphHover(null)}
                  className={`rounded-xl border p-4 transition-all duration-200 ${
                    isHovered ? "border-blue-500/30 bg-white/[0.04]" : "border-white/5 bg-white/[0.02]"
                  }`}>
                  <span className={`text-[10px] uppercase tracking-widest font-medium transition-colors ${isHovered ? "text-blue-300" : "text-gray-500"}`}>{cat.name}</span>
                  <div className="mt-3 space-y-1.5">
                    {cat.items.map((item) => (
                      <div key={item} className={`flex items-center gap-2 text-xs transition-colors ${isHovered ? "text-gray-300" : "text-gray-500"}`}>
                        <span className={`h-1 w-1 rounded-full transition-colors ${isHovered ? "bg-blue-400" : "bg-gray-600"}`} />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-8 text-xs text-gray-600 text-center">Companies. Founders. Investors. Competitors. Markets. Technologies. Signals. One graph.</p>
        </div>
      </section>

      {/* ======== 5. LIVE SIGNAL INTELLIGENCE ======== */}
      <section className="border-b border-white/5 py-28">
        <div className="mx-auto max-w-7xl px-8">
          <div className="flex items-end justify-between mb-14">
            <div className="max-w-2xl">
              <span className="text-xs font-mono text-emerald-400">/signals</span>
              <h2 className="mt-3 text-3xl font-bold text-white">Live Signal Intelligence</h2>
              <p className="mt-2 text-sm text-gray-500">Real-time company signals detected in the last 24 hours across 50+ sources.</p>
            </div>
            <a href="/feed" className="hidden md:flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors">
              View All <ArrowRight className="h-3 w-3" />
            </a>
          </div>
          <div className="grid gap-2">
            {liveSignals.map((s, i) => (
              <div key={i} className="flex items-center gap-5 rounded-xl border border-white/5 bg-white/[0.02] px-5 py-4 hover:border-white/10 hover:bg-white/[0.03] transition-all group">
                {/* Icon */}
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.04] text-base shrink-0">
                  {s.icon}
                </div>
                {/* Content */}
                <div className="flex-1 min-w-0 grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] items-center gap-x-6 gap-y-1">
                  <div className="flex items-center gap-2">
                    <Badge text={s.type} color={s.impact === "High" ? "amber" : "gray"} />
                    <span className="text-sm font-medium text-white truncate">{s.company}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{s.whyItMatters}</p>
                  <div className="flex items-center gap-3 justify-self-start lg:justify-self-end">
                    <span className="text-xs text-gray-500">{s.confidence}% confidence</span>
                    <span className="text-[10px] text-gray-600">{s.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center md:hidden">
            <a href="/feed" className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300">
              View All Signals <ArrowRight className="h-3 w-3" />
            </a>
          </div>
        </div>
      </section>

      {/* ======== 6. GROWTH INTELLIGENCE ======== */}
      <section className="border-b border-white/5 py-28">
        <div className="mx-auto max-w-7xl px-8">
          <div className="max-w-2xl mb-14">
            <span className="text-xs font-mono text-blue-400">/recommendations</span>
            <h2 className="mt-3 text-3xl font-bold text-white">Growth Intelligence</h2>
            <p className="mt-2 text-sm text-gray-500">AI-powered recommendations that tell companies exactly what to do next.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {growthRecommendations.map((r, i) => {
              const colorMap: Record<string, string> = { High: "emerald", Medium: "amber", Low: "gray" };
              return (
                <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-6 hover:border-white/10 hover:bg-white/[0.03] transition-all group">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <Badge text={r.priority + " Priority"} color={r.priority === "Critical" ? "rose" : r.priority === "High" ? "emerald" : "amber"} />
                      <h3 className="mt-2 text-lg font-semibold text-white">{r.title}</h3>
                    </div>
                    <Badge text={r.confidence + " Confidence"} color={colorMap[r.confidence] || "gray"} />
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">{r.reason}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-500 pt-4 border-t border-white/5">
                    <span className="flex items-center gap-1"><span className="text-emerald-400 font-medium">ROI</span> {r.expectedROI}</span>
                    {r.marketSize && <span className="flex items-center gap-1"><span className="text-blue-400 font-medium">Market</span> {r.marketSize}</span>}
                    <span className="flex items-center gap-1"><span className="text-amber-400 font-medium">Timeline</span> {r.timeline}</span>
                    <span className="flex items-center gap-1"><span className="text-purple-400 font-medium">Impact</span> {r.expectedImpact}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ======== 7. WHY GROINTEL ======== */}
      <section className="border-b border-white/5 py-28">
        <div className="mx-auto max-w-7xl px-8">
          <div className="max-w-2xl mb-14">
            <span className="text-xs font-mono text-blue-400">/why</span>
            <h2 className="mt-3 text-3xl font-bold text-white">Why GroIntel</h2>
            <p className="mt-2 text-sm text-gray-500">Four capabilities. One platform. Infinite intelligence.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {whyGroIntelPillars.map((p, i) => (
              <div key={p.title} className="rounded-xl border border-white/5 bg-white/[0.02] p-8 hover:border-white/10 transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{p.icon}</span>
                    <h3 className="text-xl font-bold text-white">{p.title}</h3>
                  </div>
                  <span className="text-2xl font-bold text-blue-400">{p.metric}</span>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">{p.description}</p>
                <p className="text-xs text-gray-600 mt-3">{p.metricLabel}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======== 8. ENTERPRISE READY ======== */}
      <section className="border-b border-white/5 py-20">
        <div className="mx-auto max-w-5xl px-8 text-center">
          <span className="text-xs font-mono text-blue-400">/enterprise</span>
          <h2 className="mt-3 text-2xl font-bold text-white">Enterprise Ready</h2>
          <p className="mt-2 text-sm text-gray-500">Built for companies that demand security, scale, and reliability.</p>
          <div className="flex flex-wrap justify-center gap-3 mt-10">
            {enterpriseFeatures.map((f) => (
              <div key={f} className="rounded-xl border border-white/5 bg-white/[0.02] px-5 py-3 text-sm text-gray-400 hover:border-white/10 hover:text-gray-200 transition-all">
                {f}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======== 9. FOOTER ======== */}
      <footer className="py-20">
        <div className="mx-auto max-w-7xl px-8">
          <div className="grid gap-10 md:grid-cols-4">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600">
                  <span className="text-xs font-bold text-white">GI</span>
                </div>
                <span className="font-semibold text-white">GroIntel</span>
              </div>
              <p className="mt-4 text-xs text-gray-500 leading-relaxed max-w-xs">
                The Operating System for Company Intelligence.
              </p>
            </div>
            {footerLinks.map((col) => (
              <div key={col.title}>
                <h4 className="text-xs font-medium text-white mb-4 uppercase tracking-wider">{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link}><a href="#" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">{link}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-16 pt-6 border-t border-white/5 text-xs text-gray-600">
            &copy; {new Date().getFullYear()} GroIntel. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}




