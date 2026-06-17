"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { generateCompanyMRIReport } from "@/lib/analysisEngine";
import { generateSignalFeed, getSignalsForCompany } from "@/signals/SignalEngine";
import { SignalCard } from "@/signals/SignalCard";
import type { CompanyMRIReport, Opportunity, Risk, GrowthChannel, WeekPlan, SimilarCompany } from "@/types/company";
import {
  Search, Loader2, Building2, BarChart3, TrendingUp, AlertTriangle, Target,
  ChevronRight, ArrowRight, Shield, Calendar, Award, BrainCircuit,
  Activity, Globe, Zap, Users, BookOpen, Radio, MessageCircle, Mail, 
  Code2, Video, Send, ExternalLink,
} from "lucide-react";

function ScoreCircle({ score, size = 72, label }: { score: number; size?: number; label?: string }) {
  const color = score >= 75 ? "text-emerald-400 stroke-emerald-400" : score >= 55 ? "text-amber-400 stroke-amber-400" : "text-rose-400 stroke-rose-400";
  const r = 26;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox="0 0 64 64" className="-rotate-90">
        <circle cx={32} cy={32} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={5} />
        <circle cx={32} cy={32} r={r} fill="none" className={color.split(" ")[1]} strokeWidth={5}
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <span className={`-mt-11 text-lg font-bold ${color.split(" ")[0]}`}>{score}</span>
      {label && <span className="mt-0.5 text-[10px] text-gray-500">{label}</span>}
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    Critical: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    High: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    Medium: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    Low: "bg-gray-500/15 text-gray-400 border-gray-500/30",
  };
  return <span className={`border rounded-md px-2 py-0.5 text-[11px] font-medium ${colors[priority] || "bg-gray-500/15 text-gray-400 border-gray-500/30"}`}>{priority}</span>;
}

function SectionTitle({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04]">
        <Icon className="h-4 w-4 text-blue-400" />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
    </div>
  );
}

function AnalyzeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const url = searchParams.get("url") || "";
  const [inputUrl, setInputUrl] = useState(url);
  const report: CompanyMRIReport | null = url ? generateCompanyMRIReport(url) : null;
  const allSignals = useMemo(() => generateSignalFeed(50), []);
  const companySignals = report ? getSignalsForCompany(report.companySnapshot.company, allSignals) : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUrl.trim()) {
      router.push(`/analyze?url=${encodeURIComponent(inputUrl.trim())}`);
    }
  };

  if (!report) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <form onSubmit={handleSubmit} className="flex gap-2 mb-12">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
            <input type="text" placeholder="Enter your company website"
              value={inputUrl} onChange={(e) => setInputUrl(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-10 pr-4 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/50" />
          </div>
          <button type="submit" className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-3 text-sm font-medium text-white hover:from-blue-500 hover:to-purple-500">
            Generate MRI
          </button>
        </form>
        <div className="py-24 text-center">
          <BrainCircuit className="mx-auto h-12 w-12 text-gray-700" />
          <h2 className="mt-4 text-xl font-semibold text-white">Company MRI Report</h2>
          <p className="mt-1 text-sm text-gray-500">Enter a URL to generate a full growth intelligence report.</p>
        </div>
      </div>
    );
  }

  const { companySnapshot, growthScores, overallGrowthScore, benchmark, topOpportunities, topRisks, recommendedChannels, similarCompanies, thirtyDayPlan, summary } = report;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      {/* Top search bar */}
      <form onSubmit={handleSubmit} className="mb-10 flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
          <input type="text" placeholder="Enter your company website"
            value={inputUrl} onChange={(e) => setInputUrl(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-10 pr-4 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/50" />
        </div>
        <button type="submit" className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-3 text-sm font-medium text-white hover:from-blue-500 hover:to-purple-500">
          Generate
        </button>
      </form>

      {/* 1. Company Snapshot */}
      <section className="mb-10">
        <SectionTitle icon={Building2} title="Company Snapshot" subtitle={companySnapshot.summary} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Company", value: companySnapshot.company },
            { label: "Industry", value: companySnapshot.industry },
            { label: "Business Model", value: companySnapshot.businessModel },
            { label: "Headquarters", value: companySnapshot.headquarters },
            { label: "Stage", value: companySnapshot.estimatedStage },
            { label: "Funding", value: companySnapshot.fundingStage },
            { label: "Employees", value: companySnapshot.employeeSize },
            { label: "Target", value: companySnapshot.targetCustomer },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5">
              <span className="text-[10px] uppercase tracking-widest text-gray-500">{item.label}</span>
              <p className="mt-1 text-sm font-medium text-white">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Growth Health Score */}
      <section className="mb-10">
        <SectionTitle icon={BarChart3} title="Growth Health Score" subtitle="8-dimension analysis" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {growthScores.map((d) => (
            <div key={d.name} className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center">
              <ScoreCircle score={d.score} size={64} />
              <p className="mt-2 text-xs font-medium text-gray-400">{d.name}</p>
              <p className="mt-0.5 text-[10px] text-gray-600 leading-tight">{d.detail}</p>
            </div>
          ))}
        </div>
        <div className="text-center p-4 rounded-xl border border-white/5 bg-white/[0.02]">
          <span className="text-sm text-gray-500">Overall Growth Score </span>
          <span className={`text-4xl font-bold ${overallGrowthScore >= 75 ? "text-emerald-400" : overallGrowthScore >= 55 ? "text-amber-400" : "text-rose-400"}`}>
            {overallGrowthScore}
          </span>
          <span className="text-sm text-gray-500"> / 100</span>
        </div>
      </section>

      {/* 3. Benchmark */}
      <section className="mb-10">
        <SectionTitle icon={Award} title="Growth Benchmark" subtitle="vs industry peers" />
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: "Your Score", value: benchmark.yourScore, color: "text-blue-400" },
            { label: "Top 10%", value: benchmark.top10, color: "text-emerald-400" },
            { label: "Industry Average", value: benchmark.industryAverage, color: "text-gray-400" },
            { label: "Bottom 20%", value: benchmark.bottom20, color: "text-rose-400" },
          ].map((b) => (
            <div key={b.label} className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center">
              <p className="text-xs text-gray-500">{b.label}</p>
              <p className={`text-2xl font-bold mt-1 ${b.color}`}>{b.value}</p>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {benchmark.dimensions.map((d) => {
            const pos = ((d.yourScore - (d.average - 10)) / Math.max(1, 40)) * 100;
            return (
              <div key={d.name} className="flex items-center gap-3">
                <span className="w-24 text-xs text-gray-500 shrink-0">{d.name}</span>
                <div className="flex-1 h-2 rounded-full bg-white/[0.06] relative overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${Math.min(100, Math.max(2, pos))}%`, background: "linear-gradient(90deg, rgba(59,130,246,0.5), rgba(139,92,246,0.7))" }} />
                </div>
                <span className="w-8 text-right text-xs font-medium text-white">{d.yourScore}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Top Opportunities */}
      <section className="mb-10">
        <SectionTitle icon={TrendingUp} title="Top Opportunities" subtitle="Highest-impact growth moves" />
        <div className="grid gap-2.5">
          {topOpportunities.map((o, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-4 hover:border-white/10">
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/10 text-xs font-bold text-emerald-400">{i + 1}</span>
                <div>
                  <p className="text-sm font-medium text-white">{o.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{o.description}</p>
                  <p className="text-[11px] text-gray-600 mt-0.5">Confidence: {o.confidence}% | Impact: {o.expectedImpact} | {o.estimatedTime}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-[11px] px-2 py-0.5 rounded-md border ${o.difficulty === "Easy" ? "border-emerald-500/30 text-emerald-300 bg-emerald-500/10" : o.difficulty === "Medium" ? "border-amber-500/30 text-amber-300 bg-amber-500/10" : "border-rose-500/30 text-rose-300 bg-rose-500/10"}`}>
                  {o.difficulty}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Top Risks */}
      <section className="mb-10">
        <SectionTitle icon={Shield} title="Top Risks" subtitle="Key areas to address" />
        <div className="grid gap-2.5">
          {topRisks.map((r, i) => (
            <div key={i} className="flex items-start gap-3 rounded-xl border border-rose-500/10 bg-rose-500/[0.03] p-4">
              <AlertTriangle className={`mt-0.5 h-4 w-4 shrink-0 ${r.severity === "High" ? "text-rose-400" : "text-amber-400"}`} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-white">{r.title}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-md border ${r.severity === "High" ? "border-rose-500/30 text-rose-300" : "border-amber-500/30 text-amber-300"}`}>{r.severity}</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{r.description}</p>
                <p className="text-xs text-blue-300/70 mt-1">Recommendation: {r.recommendation}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Recommended Channels */}
      <section className="mb-10">
        <SectionTitle icon={Target} title="Recommended Growth Channels" subtitle="Highest-ROI channels sorted by priority" />
        <div className="grid gap-2.5">
          {recommendedChannels.map((ch, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] text-gray-400">
                  {ch.category === "Developer" ? <Code2 className="h-4 w-4" /> :
                   ch.category === "Enterprise" ? <Building2 className="h-4 w-4" /> :
                   ch.category === "Community" ? <Users className="h-4 w-4" /> :
                   ch.category === "Content" ? <BookOpen className="h-4 w-4" /> :
                   ch.category === "Podcast" ? <Radio className="h-4 w-4" /> :
                   ch.category === "GitHub" ? <Code2 className="h-4 w-4" /> :
                   ch.category === "X" || ch.category === "LinkedIn" ? <MessageCircle className="h-4 w-4" /> :
                   ch.category === "Newsletter" ? <Mail className="h-4 w-4" /> :
                   <Globe className="h-4 w-4" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{ch.name}</p>
                  <p className="text-xs text-gray-500">{ch.reason}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <PriorityBadge priority={ch.priority} />
                <span className="text-[10px] text-gray-600">{ch.estimatedROI}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Similar Companies */}
      <section className="mb-10">
        <SectionTitle icon={Users} title="Similar Companies" subtitle="Benchmark against peers" />
        <div className="grid gap-3 md:grid-cols-2">
          {similarCompanies.map((sc, i) => (
            <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-white">{sc.name}</p>
                <ExternalLink className="h-3.5 w-3.5 text-gray-600" />
              </div>
              <p className="text-xs text-gray-500 mt-1">{sc.whySimilar}</p>
              <p className="text-xs text-blue-300/60 mt-1">Learn: {sc.whatToLearn}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Company Signals */}
      {companySignals.length > 0 && (
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-5">
          <Activity className="h-5 w-5 text-blue-400" />
          <h2 className="text-lg font-semibold text-white">Recent Signals</h2>
        </div>
        <div className="space-y-2.5">
          {companySignals.map((signal) => (
            <SignalCard key={signal.id} signal={signal} />
          ))}
        </div>
      </section>
      )}
      {/* 8. 30-Day Plan */}
      <section className="mb-10">
        <SectionTitle icon={Calendar} title="30-Day Growth Plan" subtitle="Week-by-week execution" />
        <div className="grid gap-4 md:grid-cols-2">
          {thirtyDayPlan.map((w) => (
            <div key={w.week} className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Week {w.week}</span>
              <div className="mt-3">
                <p className="text-xs font-medium text-white/80 mb-1">Goals</p>
                <ul className="space-y-1">
                  {w.goals.map((g, j) => <li key={j} className="flex items-start gap-1.5 text-xs text-gray-400"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-blue-500/50" />{g}</li>)}
                </ul>
              </div>
              <div className="mt-3">
                <p className="text-xs font-medium text-white/80 mb-1">Actions</p>
                <ul className="space-y-1">
                  {w.actions.map((a, j) => <li key={j} className="flex items-start gap-1.5 text-xs text-gray-400"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gray-600" />{a}</li>)}
                </ul>
              </div>
              <p className="mt-3 text-[11px] text-emerald-400/70">{w.expectedResult}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 9. MRI Summary */}
      <section className="mb-10 rounded-xl border border-blue-500/10 bg-gradient-to-br from-blue-500/[0.04] to-purple-500/[0.04] p-6">
        <SectionTitle icon={BrainCircuit} title="Growth MRI Summary" />
        <div className="space-y-3 text-sm">
          <p className="text-gray-300"><span className="font-medium text-emerald-400">Your biggest opportunity is </span>{summary.biggestOpportunity}</p>
          <p className="text-gray-300"><span className="font-medium text-rose-400">Your biggest weakness is </span>{summary.biggestWeakness}</p>
          <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/[0.05] p-4">
            <p className="text-xs font-medium text-amber-400">If you only do one thing this month:</p>
            <p className="mt-1 text-sm text-gray-200">{summary.oneThing}</p>
          </div>
        </div>
      </section>

      {/* 10. CTA */}
      <section className="text-center rounded-xl border border-white/5 bg-white/[0.02] p-8">
        <h3 className="text-lg font-semibold text-white">Want the full growth plan delivered to your inbox?</h3>
        <p className="mt-2 text-sm text-gray-500">Request a custom 30-day growth analysis with specific actionable recommendations for your team.</p>
        <a href="/contact" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-medium text-white hover:from-blue-500 hover:to-purple-500">
          Request Full Analysis <ArrowRight className="h-4 w-4" />
        </a>
      </section>
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense fallback={<div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-gray-500" /></div>}>
      <AnalyzeContent />
    </Suspense>
  );
}





