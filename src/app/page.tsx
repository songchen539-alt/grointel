"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight, Search, Activity, TrendingUp, Shield, Users,
  Globe, Target, ChevronRight, Zap, BarChart3, Database,
  Cpu, Network, LineChart, Sparkles, Building2,
} from "lucide-react";
import {
  companyScores, liveSignals, growthRecommendations, pipelineSteps,
  graphNodes, whyGroIntelPillars, enterpriseFeatures,
} from "@/lib/intelligenceEngine";

// ========== Sub-components ==========

function ScoreRing({ score, size = 64, label }: { score: number; size?: number; label?: string }) {
  const r = 24;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? "stroke-emerald-400 text-emerald-400" : score >= 60 ? "stroke-amber-400 text-amber-400" : "stroke-rose-400 text-rose-400";
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox="0 0 56 56" className="-rotate-90">
        <circle cx={28} cy={28} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={4} />
        <circle cx={28} cy={28} r={r} fill="none" className={color.split(" ")[0]} strokeWidth={4}
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <span className={`-mt-10 text-base font-bold ${color.split(" ")[1]}`}>{score}</span>
      {label && <span className="mt-0.5 text-[10px] text-gray-500 text-center leading-tight">{label}</span>}
    </div>
  );
}

function GraphCircle({ label, x, y }: { label: string; x: number; y: number }) {
  return (
    <div className="absolute flex flex-col items-center" style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)" }}>
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06] border border-white/10 text-[10px] font-medium text-gray-300">
        {label.slice(0, 3)}
      </div>
      <span className="mt-1 text-[9px] text-gray-500 whitespace-nowrap">{label}</span>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [hoveredPipeline, setHoveredPipeline] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      router.push(`/analyze?url=${encodeURIComponent(url.trim())}`);
    }
  };

  const overallScore = companyScores.find(s => s.name === "Overall Company Score")?.score || 83;

  return (
    <div>
      {/* ======== HERO ======== */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.08)_0%,transparent_60%)]" />
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-sm text-gray-400 mb-6">
              <Cpu className="h-3.5 w-3.5 text-blue-400" />
              The Operating System for Company Intelligence
            </div>
            <h1 className="text-5xl font-bold tracking-tight text-white md:text-7xl leading-[1.05]">
              The Operating System<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                for Company Intelligence
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-gray-400">
              Analyze any company. Understand its strengths, weaknesses, opportunities and risks.
              Make smarter growth decisions powered by AI.
            </p>

            {/* CTA Form */}
            <form onSubmit={handleSubmit} className="mt-8 flex max-w-lg gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
                <input
                  type="text" placeholder="Enter company website..."
                  value={url} onChange={(e) => setUrl(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3.5 pl-10 pr-4 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/50 focus:bg-white/[0.06]"
                />
              </div>
              <button type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3.5 text-sm font-medium text-white hover:from-blue-500 hover:to-purple-500 transition-all">
                Analyze Company <ArrowRight className="h-4 w-4" />
              </button>
            </form>
            <div className="flex items-center gap-2 mt-4">
              <a href="/analyze?url=opengradient.com" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
                View Example MRI →
              </a>
            </div>
            <p className="mt-6 text-xs text-gray-600">Trusted by founders, operators, investors and growth teams.</p>
          </div>
        </div>
      </section>

      {/* ======== COMPANY MRI DASHBOARD ======== */}
      <section className="border-b border-white/5 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex items-center gap-2 mb-8">
            <BarChart3 className="h-5 w-5 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Company MRI</h2>
            <span className="text-xs text-gray-500">Executive Intelligence Dashboard</span>
          </div>

          {/* Overall Score */}
          <div className="flex items-center gap-6 mb-10 p-6 rounded-xl border border-white/5 bg-white/[0.02]">
            <ScoreRing score={overallScore} size={80} label="Overall" />
            <div>
              <p className="text-2xl font-bold text-white">{overallScore}/100</p>
              <p className="text-sm text-gray-400">Company Intelligence Score</p>
              <p className="text-xs text-emerald-400 mt-1">↑ 4 points from last month</p>
            </div>
          </div>

          {/* Score Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {companyScores.filter(s => s.name !== "Overall Company Score").map((s) => {
              const trendIcon = s.trend === "up" ? "↑" : s.trend === "down" ? "↓" : "→";
              const trendColor = s.trend === "up" ? "text-emerald-400" : s.trend === "down" ? "text-rose-400" : "text-gray-500";
              return (
                <div key={s.name} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] uppercase tracking-wider text-gray-500">{s.name}</span>
                    <span className={`text-[10px] ${trendColor}`}>{trendIcon}</span>
                  </div>
                  <ScoreRing score={s.score} size={56} />
                  <span className={`mt-1.5 inline-block text-[10px] px-1.5 py-0.5 rounded ${
                    s.status === "excellent" ? "bg-emerald-500/10 text-emerald-300" :
                    s.status === "good" ? "bg-blue-500/10 text-blue-300" :
                    s.status === "average" ? "bg-amber-500/10 text-amber-300" :
                    "bg-rose-500/10 text-rose-300"
                  }`}>{s.status}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ======== INTELLIGENCE PIPELINE ======== */}
      <section className="border-b border-white/5 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/[0.03] px-4 py-1.5 text-sm text-gray-500 mb-4">
              <Database className="h-3.5 w-3.5" />
              Intelligence Pipeline
            </div>
            <h2 className="text-2xl font-bold text-white">From Website to Intelligence</h2>
            <p className="mt-2 text-sm text-gray-500">Eight stages of automated company analysis</p>
          </div>
          <div className="grid gap-2">
            {pipelineSteps.map((step, i) => {
              const icons = [Search, Database, Activity, Network, Cpu, LineChart, BarChart3, Target];
              const Icon = icons[i];
              return (
                <div key={step.name}
                  onMouseEnter={() => setHoveredPipeline(i)}
                  onMouseLeave={() => setHoveredPipeline(null)}
                  className={`flex items-center gap-4 rounded-xl border p-4 transition-all ${
                    hoveredPipeline === i
                      ? "border-blue-500/30 bg-white/[0.04]"
                      : "border-white/5 bg-white/[0.02]"
                  }`}>
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg transition-all ${
                    hoveredPipeline === i ? "bg-blue-500/20" : "bg-white/[0.04]"
                  }`}>
                    <Icon className={`h-4 w-4 ${hoveredPipeline === i ? "text-blue-400" : "text-gray-500"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-gray-600">0{i + 1}</span>
                      <span className="text-sm font-medium text-white">{step.name}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
                  </div>
                  {i < pipelineSteps.length - 1 && (
                    <ChevronRight className={`h-4 w-4 shrink-0 transition-all ${
                      hoveredPipeline === i ? "text-blue-400" : "text-gray-700"
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ======== COMPANY GRAPH ======== */}
      <section className="border-b border-white/5 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/[0.03] px-4 py-1.5 text-sm text-gray-500 mb-4">
              <Network className="h-3.5 w-3.5" />
              Knowledge Graph
            </div>
            <h2 className="text-2xl font-bold text-white">Company Graph</h2>
            <p className="mt-2 text-sm text-gray-500">Every company is a node in a living intelligence network</p>
          </div>
          <div className="relative h-[360px] rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
            {/* Center node */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg shadow-blue-500/20">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <span className="block text-center text-xs font-medium text-white mt-2">Company</span>
            </div>
            {/* Graph nodes positioned around center */}
            <GraphCircle label="Founders" x={15} y={25} />
            <GraphCircle label="Employees" x={85} y={25} />
            <GraphCircle label="Investors" x={10} y={55} />
            <GraphCircle label="Competitors" x={90} y={55} />
            <GraphCircle label="Customers" x={20} y={82} />
            <GraphCircle label="Partners" x={80} y={82} />
            <GraphCircle label="Markets" x={50} y={12} />
            <GraphCircle label="Technology" x={50} y={88} />
            {/* Connection lines via SVG */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.15 }}>
              <line x1="50%" y1="50%" x2="15%" y2="25%" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
              <line x1="50%" y1="50%" x2="85%" y2="25%" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
              <line x1="50%" y1="50%" x2="10%" y2="55%" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
              <line x1="50%" y1="50%" x2="90%" y2="55%" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
              <line x1="50%" y1="50%" x2="20%" y2="82%" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
              <line x1="50%" y1="50%" x2="80%" y2="82%" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
              <line x1="50%" y1="50%" x2="50%" y2="12%" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
              <line x1="50%" y1="50%" x2="50%" y2="88%" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
            </svg>
          </div>
        </div>
      </section>

      {/* ======== LIVE SIGNAL INTELLIGENCE ======== */}
      <section className="border-b border-white/5 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex items-center gap-2 mb-8">
            <Activity className="h-5 w-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">Live Signal Intelligence</h2>
            <span className="text-xs text-gray-500">Real-time company signals detected in the last 24 hours</span>
          </div>
          <div className="grid gap-3">
            {liveSignals.map((s, i) => (
              <div key={i} className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4 hover:border-white/10 transition-all">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.04] text-lg">
                  {s.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-md bg-white/[0.04] px-2 py-0.5 text-[11px] text-gray-400">{s.type}</span>
                    <span className="text-sm font-medium text-white">{s.company}</span>
                    <span className="text-[10px] text-gray-600">{s.time}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{s.whyItMatters}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-gray-500">{s.confidence}%</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                    s.impact === "High" ? "bg-amber-500/15 text-amber-300" :
                    "bg-gray-500/15 text-gray-400"
                  }`}>{s.impact}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <a href="/feed" className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300">
              View all signals <ArrowRight className="h-3 w-3" />
            </a>
          </div>
        </div>
      </section>

      {/* ======== GROWTH INTELLIGENCE ======== */}
      <section className="border-b border-white/5 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex items-center gap-2 mb-8">
            <Target className="h-5 w-5 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Growth Intelligence</h2>
            <span className="text-xs text-gray-500">AI-powered recommendations for your company</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {growthRecommendations.map((r, i) => {
              const confColor = r.confidence === "High" ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30" :
                r.confidence === "Medium" ? "bg-amber-500/10 text-amber-300 border-amber-500/30" :
                "bg-gray-500/10 text-gray-300 border-gray-500/30";
              return (
                <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-5 hover:border-white/10 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[10px] border rounded-md px-2 py-0.5 font-medium ${confColor}`}>{r.confidence} Confidence</span>
                    <span className="text-[10px] text-gray-600">{r.timeline}</span>
                  </div>
                  <h3 className="font-semibold text-white">{r.title}</h3>
                  <p className="text-xs text-gray-500 mt-1.5">{r.reason}</p>
                  <div className="flex items-center gap-3 mt-3 text-[11px] text-gray-500">
                    <span>ROI: {r.expectedROI}</span>
                    {r.marketSize && <span>Market: {r.marketSize}</span>}
                    <span>Impact: {r.expectedImpact}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ======== WHY GROINTEL ======== */}
      <section className="border-b border-white/5 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-white">Why GroIntel</h2>
            <p className="mt-2 text-sm text-gray-500">Four intelligence capabilities. One platform.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {whyGroIntelPillars.map((pillar) => (
              <div key={pillar.title} className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-semibold text-white text-lg">{pillar.title}</h3>
                  <span className="text-2xl font-bold text-blue-400">{pillar.metric}</span>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">{pillar.description}</p>
                <p className="text-xs text-gray-600 mt-2">{pillar.metricLabel}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======== ENTERPRISE READY ======== */}
      <section className="border-b border-white/5 py-16">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/[0.03] px-4 py-1.5 text-sm text-gray-500 mb-4">
            <Shield className="h-3.5 w-3.5" />
            Enterprise Ready
          </div>
          <h2 className="text-xl font-bold text-white">Built for Companies That Move Fast</h2>
          <p className="mt-2 text-sm text-gray-500">Enterprise security. Global intelligence. Real-time insights.</p>
          <div className="flex flex-wrap justify-center gap-2 mt-8">
            {enterpriseFeatures.map((f) => (
              <span key={f} className="rounded-full border border-white/5 bg-white/[0.03] px-4 py-2 text-xs text-gray-400">
                {f}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ======== FOOTER ======== */}
      <footer className="border-t border-white/5 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-8 md:grid-cols-5">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                  <span className="text-[10px] font-bold text-white">GI</span>
                </div>
                <span className="font-semibold text-white">GroIntel</span>
              </div>
              <p className="mt-3 text-sm text-gray-500 max-w-xs leading-relaxed">
                The Operating System for Company Intelligence.
                Analyze. Discover. Grow.
              </p>
            </div>
            {/* Links */}
            {[
              { title: "Platform", links: ["Company MRI", "Signal Intelligence", "API", "Documentation"] },
              { title: "Company", links: ["Enterprise", "Roadmap", "Status", "Contact"] },
              { title: "Legal", links: ["Privacy", "Terms", "Security"] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-xs font-medium text-white mb-3 uppercase tracking-wider">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}><a href="#" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">{link}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 pt-6 border-t border-white/5 text-xs text-gray-600">
            &copy; {new Date().getFullYear()} GroIntel. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
