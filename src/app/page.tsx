import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BarChart3, Shield, TrendingUp, Users, Globe, Activity, BrainCircuit, Search, Target, Eye, LineChart } from "lucide-react";

export const metadata: Metadata = {
  title: "GroIntel — AI Growth Intelligence for High-Growth Companies",
  description: "Generate AI Company MRI reports to understand growth readiness, market signals, competitor pressure, hiring momentum, and expansion opportunities.",
};

const sampleCompanies = [
  { name: "Stripe", website: "stripe.com", id: "stripe-com", desc: "Payments infrastructure and global financial technology platform." },
  { name: "OpenAI", website: "openai.com", id: "openai-com", desc: "Frontier AI research and product company." },
  { name: "Anthropic", website: "anthropic.com", id: "anthropic-com", desc: "AI safety and enterprise AI assistant company." },
  { name: "Perplexity", website: "perplexity.ai", id: "perplexity-ai", desc: "AI-native answer engine and research assistant." },
  { name: "Cursor", website: "cursor.com", id: "cursor-com", desc: "AI coding assistant and developer productivity platform." },
  { name: "Clay", website: "clay.com", id: "clay-com", desc: "AI-powered go-to-market data and workflow platform." },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="border-b border-white/5 py-24 md:py-32">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/[0.02] px-4 py-1.5 text-xs text-gray-500 mb-6">
            <BrainCircuit className="h-3.5 w-3.5 text-blue-400" />
            AI Growth Intelligence Platform
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight">
            AI Growth Intelligence for Companies Moving Fast
          </h1>
          <p className="mt-6 text-base md:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            GroIntel analyzes public company signals and turns them into a Company MRI —
            helping founders, CEOs, and growth teams understand growth readiness, risks,
            opportunities, and next best actions.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              href="/analyze"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3.5 text-sm font-medium text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:from-blue-500 hover:to-purple-500 transition-all"
            >
              Analyze Your Company
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/samples"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-8 py-3.5 text-sm font-medium text-gray-300 hover:text-white hover:border-white/20 transition-all"
            >
              View Sample Reports
            </Link>
          </div>
          <p className="mt-6 text-xs text-gray-600">
            Built for AI, SaaS, Web3, fintech, and high-growth companies.
          </p>
        </div>
      </section>

      {/* Problem */}
      <section className="border-b border-white/5 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center">Growth teams move fast. Signals are scattered.</h2>
          <div className="grid md:grid-cols-4 gap-4 mt-10">
            {[
              { title: "Market signals are fragmented", desc: "Data lives across news, social, job boards, and financial filings with no single view." },
              { title: "Competitor pressure changes quickly", desc: "New entrants, funding rounds, and product launches shift the landscape daily." },
              { title: "Hiring momentum is hard to interpret", desc: "Job postings and team changes signal strategy but are buried in noise." },
              { title: "Expansion decisions lack context", desc: "Entering new markets without signal intelligence increases risk." },
            ].map((p, i) => (
              <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 mb-3">
                  <span className="text-sm font-bold text-rose-400">{i + 1}</span>
                </div>
                <h3 className="text-sm font-semibold text-white">{p.title}</h3>
                <p className="mt-1 text-xs text-gray-500">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product */}
      <section className="border-b border-white/5 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center">GroIntel turns company signals into an AI Company MRI</h2>
          <div className="grid md:grid-cols-5 gap-4 mt-10">
            {[
              { name: "Growth Readiness Score", icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10", desc: "Overall growth trajectory based on signals across all dimensions." },
              { name: "Market Readiness", icon: Globe, color: "text-blue-400", bg: "bg-blue-500/10", desc: "How prepared the company is for market expansion and new segments." },
              { name: "Competition Risk", icon: Shield, color: "text-rose-400", bg: "bg-rose-500/10", desc: "Pressure from competitors, new entrants, and market dynamics." },
              { name: "Hiring Momentum", icon: Users, color: "text-purple-400", bg: "bg-purple-500/10", desc: "Velocity of team growth and talent acquisition signals." },
              { name: "Expansion Readiness", icon: Activity, color: "text-amber-400", bg: "bg-amber-500/10", desc: "Capability to scale into new geographies and verticals." },
            ].map((p, i) => (
              <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-5 text-center">
                <div className={`mx-auto flex h-10 w-10 items-center justify-center rounded-xl ${p.bg} mb-3`}>
                  <p.icon className={`h-5 w-5 ${p.color}`} />
                </div>
                <h3 className="text-sm font-semibold text-white">{p.name}</h3>
                <p className="mt-1 text-xs text-gray-500">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-b border-white/5 py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center">From website to Company MRI in seconds</h2>
          <div className="mt-10 space-y-4">
            {[
              { step: "1", label: "Enter a company website", icon: Search },
              { step: "2", label: "GroIntel analyzes public growth signals", icon: Activity },
              { step: "3", label: "Receive an AI Company MRI", icon: BrainCircuit },
              { step: "4", label: "Review risks, opportunities, and next actions", icon: Target },
              { step: "5", label: "Book a Growth MRI Review for deeper analysis", icon: Eye },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] px-5 py-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 shrink-0">
                  <s.icon className="h-4 w-4 text-blue-400" />
                </div>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-800 text-[10px] font-bold text-gray-400 shrink-0">{s.step}</span>
                <span className="text-sm text-gray-300">{s.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/analyze"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3.5 text-sm font-medium text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:from-blue-500 hover:to-purple-500 transition-all"
            >
              Start Free Analysis
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="border-b border-white/5 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center">Built for growth decisions</h2>
          <div className="grid md:grid-cols-5 gap-4 mt-10">
            {[
              { title: "Founder Review", desc: "Market expansion due diligence", icon: LineChart },
              { title: "Investor Screening", desc: "Company signal analysis for deals", icon: Eye },
              { title: "Sales Intel", desc: "Account intelligence for outreach", icon: Target },
              { title: "Competitor Tracking", desc: "Category and landscape analysis", icon: BarChart3 },
              { title: "Web3 / AI Signals", desc: "Growth signals for emerging tech", icon: Activity },
            ].map((u, i) => (
              <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-5 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 mb-3">
                  <u.icon className="h-5 w-5 text-blue-400" />
                </div>
                <h3 className="text-sm font-semibold text-white">{u.title}</h3>
                <p className="mt-1 text-xs text-gray-500">{u.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample Reports */}
      <section className="border-b border-white/5 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center">Explore sample Company MRI reports</h2>
          <div className="grid md:grid-cols-3 gap-4 mt-10">
            {sampleCompanies.map((c) => (
              <div key={c.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-5 hover:border-white/10 transition-all">
                <h3 className="text-sm font-semibold text-white">{c.name}</h3>
                <p className="mt-0.5 text-[10px] text-gray-600">{c.website}</p>
                <p className="mt-2 text-xs text-gray-500 line-clamp-2">{c.desc}</p>
                <Link
                  href={"/report/view?id=" + c.id}
                  className="mt-3 inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                >
                  View Report
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/samples"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-6 py-3 text-sm font-medium text-gray-300 hover:text-white hover:border-white/20 transition-all"
            >
              View All Sample Reports
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            Understand your company&apos;s growth signals before your next move.
          </h2>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              href="/analyze"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3.5 text-sm font-medium text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:from-blue-500 hover:to-purple-500 transition-all"
            >
              Analyze Your Company
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact?source=homepage_final_cta"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-8 py-3.5 text-sm font-medium text-gray-300 hover:text-white hover:border-white/20 transition-all"
            >
              Book a Growth MRI Review
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
