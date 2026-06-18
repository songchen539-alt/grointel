import Link from "next/link";
import LeadForm from "@/components/LeadForm";
import ReportViewClient from "@/components/ReportViewClient";
import { getReport } from "@/lib/reportStore";
import { loadReportFromSupabase } from "@/lib/intelligence/supabaseLoader";
import { convertToReportFormat } from "@/lib/intelligence/supabaseAdapter";
import { Building2, BarChart3, TrendingUp, Shield, ArrowLeft, AlertTriangle, Globe, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

function ScoreBar({ name, score }: { name: string; score: number }) {
  const color = score >= 75 ? "bg-emerald-500" : score >= 55 ? "bg-amber-500" : "bg-rose-500";
  return (
    <div className="flex items-center gap-3">
      <span className="w-32 text-xs text-gray-500 shrink-0">{name}</span>
      <div className="flex-1 h-2 rounded-full bg-white/[0.06]">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className={`w-8 text-right text-xs font-bold ${score >= 75 ? "text-emerald-400" : score >= 55 ? "text-amber-400" : "text-rose-400"}`}>{score}</span>
    </div>
  );
}

export default async function ReportViewPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id: reportId } = await searchParams;

  if (!reportId) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-gray-600" />
        <h1 className="mt-4 text-2xl font-bold text-white">Report Not Found</h1>
        <p className="mt-2 text-sm text-gray-500">No report ID provided.</p>
        <Link href="/analyze" className="mt-6 inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"><ArrowLeft className="h-4 w-4" /> Return to Analyze</Link>
      </div>
    );
  }

  let r;
  let dataSource = "local";

  try {
    const mri = await loadReportFromSupabase(reportId);
    if (mri) {
      r = convertToReportFormat(mri);
      dataSource = "supabase";
    }
  } catch {
    // Fallback to local
  }

  if (!r) {
    r = getReport(reportId);
  }

  if (!r) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-gray-600" />
        <h1 className="mt-4 text-2xl font-bold text-white">Report Not Found</h1>
        <p className="mt-2 text-sm text-gray-500">The report does not exist.</p>
        <Link href="/analyze" className="mt-6 inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"><ArrowLeft className="h-4 w-4" /> Return to Analyze</Link>
      </div>
    );
  }

  const { companySnapshot, growthScores, overallGrowthScore, topOpportunities, topRisks, thirtyDayPlan } = r;
  const companyName = companySnapshot.company;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <Link href="/analyze" className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 mb-8"><ArrowLeft className="h-3.5 w-3.5" /> Back to Analyze</Link>

      <div className="my-10 flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="flex flex-col items-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-blue-500/30 bg-blue-500/[0.06]">
            <span className="text-3xl font-bold text-blue-400">{overallGrowthScore}</span>
          </div>
          <span className="mt-1 text-xs text-gray-500">Overall Company Score</span>
        </div>
        <div>
          <Building2 className="h-5 w-5 text-blue-400" />
          <h1 className="text-2xl font-bold text-white">{companySnapshot.company}</h1>
          <p className="text-sm text-gray-500">{companySnapshot.industry} {dataSource === "supabase" ? "- (from database)" : ""}</p>
        </div>
      </div>

      <section className="mb-10">
        <BarChart3 className="h-4 w-4 text-purple-400" /><h2 className="text-sm font-semibold text-white ml-1">Company MRI</h2>
        <div className="space-y-2.5 mt-4">{growthScores.map((s) => (<ScoreBar key={s.name} name={s.name} score={s.score} />))}</div>
      </section>
      <section className="grid gap-4 md:grid-cols-2 mb-10">
        <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/[0.03] p-5">
          <TrendingUp className="h-4 w-4 text-emerald-400" /><h3 className="text-sm font-semibold text-white mt-1">Top Opportunity</h3>
          {topOpportunities[0] && <p className="text-sm text-gray-300 mt-2">{topOpportunities[0].title}</p>}
        </div>
        <div className="rounded-xl border border-rose-500/10 bg-rose-500/[0.03] p-5">
          <Shield className="h-4 w-4 text-rose-400" /><h3 className="text-sm font-semibold text-white mt-1">Top Risk</h3>
          {topRisks[0] && <p className="text-sm text-gray-300 mt-2">{topRisks[0].title}</p>}
        </div>
      </section>
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-white">Growth Opportunities</h2>
        <div className="grid gap-2 mt-4">{topOpportunities.slice(0,4).map((o,i) => (<div key={i} className="flex items-start gap-3 bg-white/[0.02] border border-white/5 rounded-xl p-3"><span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/10 text-[10px] font-bold text-emerald-400 shrink-0">{i+1}</span><div><p className="text-sm font-medium text-white">{o.title}</p><p className="text-xs text-gray-500 mt-0.5">{o.description}</p></div></div>))}</div>
      </section>
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-white">Key Risks</h2>
        <div className="grid gap-2 mt-4">{topRisks.map((r,i) => (<div key={i} className="flex items-start gap-3 bg-rose-500/[0.03] border border-rose-500/10 rounded-xl p-3"><AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" /><div><p className="text-sm font-medium text-white">{r.title}</p><p className="text-xs text-gray-500 mt-0.5">{r.description}</p></div></div>))}</div>
      </section>
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-white">Next 30 Days Action Plan</h2>
        <div className="grid gap-4 md:grid-cols-2 mt-4">{thirtyDayPlan.map((w) => (<div key={w.week} className="bg-white/[0.02] border border-white/5 rounded-xl p-4"><span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Week {w.week}</span><ul className="mt-2 space-y-1">{w.actions.slice(0,2).map((a,j) => (<li key={j} className="flex items-start gap-1.5 text-xs text-gray-400"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-blue-500/50" />{a}</li>))}</ul></div>))}</div>
      </section>

      {/* Lead Capture CTA */}
      <div className="mb-8">
        <LeadForm reportId={reportId} companyName={companyName} />
      </div>

      {/* Growth MRI Review CTA + tracking */}
      <ReportViewClient reportId={reportId} companyName={companyName} />

      <div className="mt-8 text-center">
        <Link href="/analyze" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-300 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Analyze Another Company
        </Link>
      </div>
    </div>
  );
}
