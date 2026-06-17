import type { CompanyMRIReport } from "@/types/company";
import Link from "next/link";
import { Building2, BarChart3, TrendingUp, Shield, Target, Calendar, BrainCircuit, ArrowLeft, AlertTriangle, Globe, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

function ScoreBar({ name, score }: { name: string; score: number }) {
  const color = score >= 75 ? "bg-emerald-500" : score >= 55 ? "bg-amber-500" : "bg-rose-500";
  return (
    <div className="flex items-center gap-3">
      <span className="w-32 text-xs text-gray-500 shrink-0">{name}</span>
      <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className={`w-8 text-right text-xs font-bold ${score >= 75 ? "text-emerald-400" : score >= 55 ? "text-amber-400" : "text-rose-400"}`}>{score}</span>
    </div>
  );
}

function getDemoReport(id: string): CompanyMRIReport | null {
  const demos: Record<string, CompanyMRIReport> = {
    "stripe-demo": {
      companySnapshot: { company: "Stripe", industry: "Financial Technology", businessModel: "B2B/B2C Payments", headquarters: "San Francisco, CA", estimatedStage: "Growth Stage", fundingStage: "Growth ($50M+)", employeeSize: "500+", targetCustomer: "Online Businesses", productDescription: "Online payment processing platform", summary: "Stripe is in its mature growth stage within Financial Technology." },
      growthScores: [
        { name: "Market Awareness", score: 94, detail: "Strong market presence" },
        { name: "SEO Visibility", score: 88, detail: "Excellent organic presence" },
        { name: "Community Strength", score: 72, detail: "Active developer community" },
        { name: "Founder Branding", score: 85, detail: "Founders are well-known" },
        { name: "Hiring Momentum", score: 78, detail: "Steady hiring across depts" },
        { name: "Developer Ecosystem", score: 92, detail: "Best-in-class developer platform" },
        { name: "Global Expansion", score: 80, detail: "Present in 45+ countries" },
        { name: "Product Momentum", score: 90, detail: "Regular product launches" },
      ],
      overallGrowthScore: 85,
      benchmark: { yourScore: 85, industryAverage: 72, top10: 92, bottom20: 55, dimensions: [] },
      topOpportunities: [
        { title: "Expand in Southeast Asia", description: "SEA digital payments growing 25% CAGR. Early mover advantage available.", confidence: 82, expectedImpact: "High", difficulty: "Medium", estimatedTime: "3-4 months" },
        { title: "Deepen Enterprise Suite", description: "Enterprise revenue represents 60% of opportunity but only 30% of current revenue.", confidence: 85, expectedImpact: "High", difficulty: "Hard", estimatedTime: "6-8 months" },
        { title: "Embedded Finance API Expansion", description: "Embedded finance market projected to reach $185B by 2028.", confidence: 78, expectedImpact: "High", difficulty: "Medium", estimatedTime: "4-6 months" },
        { title: "Developer Advocacy Program", description: "Developer communities drive 3x higher retention for platform businesses.", confidence: 75, expectedImpact: "Medium", difficulty: "Easy", estimatedTime: "1-2 months" },
        { title: "Strategic Acquisitions", description: "Acquire complementary fintech tools to expand platform moat.", confidence: 68, expectedImpact: "High", difficulty: "Hard", estimatedTime: "6-12 months" },
      ],
      topRisks: [
        { title: "Intense Competition", description: "PayPal, Adyen, Square, and local players competing aggressively.", severity: "High", recommendation: "Accelerate platform differentiation and expand moat through integrations." },
        { title: "Regulatory Pressure", description: "Global payment regulations becoming more complex and fragmented.", severity: "Medium", recommendation: "Invest in compliance automation and regulatory partnerships." },
        { title: "Margin Compression", description: "Increasing competition driving down payment processing margins.", severity: "Medium", recommendation: "Focus on value-added services with higher margins." },
      ],
      recommendedChannels: [
        { name: "Developer Communities", category: "Developer", priority: "Critical", reason: "Core acquisition channel for developer-first product", estimatedROI: "Very High" },
        { name: "Enterprise Sales", category: "Enterprise", priority: "Critical", reason: "Enterprise deals represent largest revenue opportunity", estimatedROI: "Very High" },
        { name: "Technical Blog / SEO", category: "Content", priority: "High", reason: "Long-term organic acquisition through developer content", estimatedROI: "High" },
        { name: "Industry Conferences", category: "Events", priority: "Medium", reason: "Enterprise decision-maker presence and networking", estimatedROI: "Medium" },
        { name: "Podcast Appearances", category: "Podcast", priority: "Medium", reason: "Founder storytelling and thought leadership", estimatedROI: "Medium" },
      ],
      similarCompanies: [],
      thirtyDayPlan: [
        { week: 1, goals: ["Assess SEA market opportunity", "Identify top enterprise prospects"], actions: ["Research top 5 SEA markets for payment expansion", "Identify 20 enterprise prospects for pilot program", "Set up tracking for key pipeline metrics"], expectedResult: "Clear SEA market entry strategy and enterprise prospect list" },
        { week: 2, goals: ["Launch developer content push", "Begin enterprise outreach"], actions: ["Publish 2 technical blog posts on platform capabilities", "Reach out to 10 enterprise prospects with personalized demos", "Record podcast appearance for developer relations"], expectedResult: "Initial enterprise meetings booked and developer content published" },
        { week: 3, goals: ["Scale partnerships", "Optimize conversion"], actions: ["Finalize 2 enterprise pilot agreements", "Launch partner program for integration ecosystem", "Analyze developer funnel metrics"], expectedResult: "First enterprise pilot agreements signed" },
        { week: 4, goals: ["Measure and plan Q3"], actions: ["Analyze all channel performance and CAC", "Identify top 3 channels for budget allocation", "Generate Q3 growth plan with specific targets"], expectedResult: "Data-driven Q3 growth plan with channel mix optimization" },
      ],
      summary: { biggestOpportunity: "Leverage strong developer ecosystem to expand into embedded finance and SEA markets.", biggestWeakness: "Margin compression from increasing competition requires value-added service focus.", oneThing: "Launch a structured SEA market entry program targeting 3 priority countries this quarter." },
    },
  };

  return demos[id] || null;
}

export default function ReportPage({ params }: { params: { id: string } }) {
  const report = getDemoReport(params.id);

  if (!report) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-gray-600" />
        <h1 className="mt-4 text-2xl font-bold text-white">Report Not Found</h1>
        <p className="mt-2 text-sm text-gray-500">The report you are looking for does not exist or has been removed.</p>
        <Link href="/analyze" className="mt-6 inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300">
          <ArrowLeft className="h-4 w-4" /> Return to Analyze
        </Link>
      </div>
    );
  }

  const { companySnapshot, growthScores, overallGrowthScore, topOpportunities, topRisks, recommendedChannels, thirtyDayPlan } = report;
  const scoreMap: Record<string, number> = {};
  growthScores.forEach((s) => { scoreMap[s.name] = s.score; });

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <Link href="/analyze" className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 mb-8"><ArrowLeft className="h-3.5 w-3.5" /> Back to Analyze</Link>
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-10">
        <div className="flex flex-col items-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-blue-500/30 bg-blue-500/[0.06]">
            <span className="text-3xl font-bold text-blue-400">{overallGrowthScore}</span>
          </div>
          <span className="mt-1 text-xs text-gray-500">Overall Score</span>
        </div>
        <div>
          <div className="flex items-center gap-2"><Building2 className="h-5 w-5 text-blue-400" /><h1 className="text-2xl font-bold text-white">{companySnapshot.company}</h1></div>
          <p className="text-sm text-gray-500 mt-1">{companySnapshot.industry}</p>
        </div>
      </div>
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4"><BarChart3 className="h-4 w-4 text-purple-400" /><h2 className="text-sm font-semibold text-white">Growth Health Scores</h2></div>
        <div className="space-y-2.5">{growthScores.map((s) => (<ScoreBar key={s.name} name={s.name} score={s.score} />))}</div>
      </section>
      <section className="grid gap-4 md:grid-cols-2 mb-10">
        <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/[0.03] p-5">
          <div className="flex items-center gap-2 mb-2"><TrendingUp className="h-4 w-4 text-emerald-400" /><h3 className="text-sm font-semibold text-white">Top Opportunity</h3></div>
          {topOpportunities[0] && <><p className="text-sm font-medium text-white">{topOpportunities[0].title}</p><p className="text-xs text-gray-500 mt-1">{topOpportunities[0].description}</p></>}
        </div>
        <div className="rounded-xl border border-rose-500/10 bg-rose-500/[0.03] p-5">
          <div className="flex items-center gap-2 mb-2"><Shield className="h-4 w-4 text-rose-400" /><h3 className="text-sm font-semibold text-white">Top Risk</h3></div>
          {topRisks[0] && <><p className="text-sm font-medium text-white">{topRisks[0].title}</p><p className="text-xs text-gray-500 mt-1">{topRisks[0].description}</p></>}
        </div>
      </section>
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4"><TrendingUp className="h-4 w-4 text-emerald-400" /><h2 className="text-sm font-semibold text-white">Growth Opportunities</h2></div>
        <div className="grid gap-2">{topOpportunities.slice(0,4).map((o,i) => (<div key={i} className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3"><span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/10 text-[10px] font-bold text-emerald-400 shrink-0">{i+1}</span><div><p className="text-sm font-medium text-white">{o.title}</p><p className="text-xs text-gray-500 mt-0.5">{o.description}</p></div></div>))}</div>
      </section>
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4"><Shield className="h-4 w-4 text-rose-400" /><h2 className="text-sm font-semibold text-white">Key Risks</h2></div>
        <div className="grid gap-2">{topRisks.map((r,i) => (<div key={i} className="flex items-start gap-3 rounded-xl border border-rose-500/10 bg-rose-500/[0.03] p-3"><AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" /><div><p className="text-sm font-medium text-white">{r.title}</p><p className="text-xs text-gray-500 mt-0.5">{r.description}</p></div></div>))}</div>
      </section>
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4"><Target className="h-4 w-4 text-blue-400" /><h2 className="text-sm font-semibold text-white">Market Recommendations</h2></div>
        <div className="grid gap-2">{recommendedChannels.slice(0,5).map((ch,i) => (<div key={i} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3"><Globe className="h-4 w-4 text-gray-400 shrink-0" /><div className="flex-1"><p className="text-sm font-medium text-white">{ch.name}</p><p className="text-xs text-gray-500">{ch.reason}</p></div><span className={`text-[10px] border rounded px-1.5 py-0.5 font-medium shrink-0 ${ch.priority==="Critical"?"border-rose-500/30 text-rose-300":ch.priority==="High"?"border-amber-500/30 text-amber-300":"border-gray-500/30 text-gray-400"}`}>{ch.priority}</span></div>))}</div>
      </section>
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4"><Calendar className="h-4 w-4 text-amber-400" /><h2 className="text-sm font-semibold text-white">Action Plan</h2></div>
        <div className="grid gap-4 md:grid-cols-2">{thirtyDayPlan.map((w) => (<div key={w.week} className="rounded-xl border border-white/5 bg-white/[0.02] p-4"><span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Week {w.week}</span><ul className="mt-2 space-y-1">{w.actions.slice(0,2).map((a,j) => (<li key={j} className="flex items-start gap-1.5 text-xs text-gray-400"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-blue-500/50" />{a}</li>))}</ul></div>))}</div>
      </section>
      <section className="text-center rounded-xl border border-white/5 bg-white/[0.02] p-8">
        <BrainCircuit className="mx-auto h-8 w-8 text-blue-400" />
        <h3 className="mt-3 text-lg font-semibold text-white">Get the full intelligence report delivered</h3>
        <p className="mt-1 text-sm text-gray-500">Request a custom analysis with specific recommendations for your team.</p>
        <Link href="/contact" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-medium text-white hover:from-blue-500 hover:to-purple-500">Request Full Analysis <ArrowRight className="h-4 w-4" /></Link>
      </section>
    </div>
  );
}
 