"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CompanyCard from "@/components/CompanyCard";
import { getAllCompanies } from "@/lib/companyKnowledgeGraph";
import { generateSignalFeed } from "@/signals/SignalEngine";
import { SignalCard } from "@/signals/SignalCard";
import { ArrowRight, TrendingUp, BarChart3, Search, Globe, Target, FileText, Rocket, Activity } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      router.push(`/analyze?url=${encodeURIComponent(url.trim())}`);
    }
  };

  const featuredSignals = getAllCompanies().slice(0, 6);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.08)_0%,transparent_60%)]" />
        <div className="mx-auto max-w-5xl px-6 py-24 text-center md:py-32">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-sm text-gray-400">
            <Rocket className="h-3.5 w-3.5 text-blue-400" />
            AI-Powered Growth Intelligence
          </div>
          <h1 className="mt-6 text-5xl font-bold tracking-tight text-white md:text-6xl">
            Find Your Next<br />Growth Opportunity
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-gray-400">
            GroIntel analyzes company signals, market timing, and growth channels to help ambitious
            companies enter the right markets faster.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSubmit} className="mx-auto mt-10 flex max-w-xl gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
              <input
                type="text"
                placeholder="Enter your company website"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-10 pr-4 text-sm text-white placeholder-gray-600 outline-none transition-all focus:border-blue-500/50 focus:bg-white/[0.06]"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-medium text-white transition-all hover:from-blue-500 hover:to-purple-500"
            >
              Get Free Growth Analysis
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
          <p className="mt-4 text-sm text-gray-500">
            Get a 30-second MRI of your company\x27s growth potential.
          </p>

          <div className="mt-8 flex items-center justify-center gap-6 text-xs text-gray-600">
            <span className="flex items-center gap-1">Try: opengradient.com</span>
            <span className="hidden md:inline">|</span>
            <span className="flex items-center gap-1 hidden md:inline-flex">monad.xyz</span>
            <span className="hidden md:inline">|</span>
            <span className="flex items-center gap-1 hidden md:inline-flex">phantom.app</span>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-b border-white/5 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center text-2xl font-bold text-white">How It Works</h2>
          <p className="mt-2 text-center text-sm text-gray-500">Four steps to your custom growth intelligence report</p>
          <div className="mt-12 grid gap-6 md:grid-cols-4">
            {[
              { icon: Search, step: "1", title: "Enter your website", desc: "Start by entering your company URL. It only takes 5 seconds." },
              { icon: BarChart3, step: "2", title: "AI analyzes signals", desc: "GroIntel scans growth signals, market timing, and competitive landscape." },
              { icon: Target, step: "3", title: "Match markets & channels", desc: "We match your company with the right markets, channels, and growth nodes." },
              { icon: FileText, step: "4", title: "Receive action plan", desc: "You get a custom 30-day growth action plan with specific next steps." },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/10">
                  <item.icon className="h-6 w-6 text-blue-400" />
                </div>
                <div className="mt-2">
                  <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-white/[0.06] text-[11px] font-medium text-gray-400">0{item.step}</span>
                </div>
                <h3 className="mt-3 font-semibold text-white">{item.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-white/5 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <Search className="h-5 w-5 text-blue-400" />
              </div>
              <h3 className="mt-4 font-semibold text-white">Signal Detection</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                Identify growth signals across thousands of companies in real-time.
              </p>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                <BarChart3 className="h-5 w-5 text-purple-400" />
              </div>
              <h3 className="mt-4 font-semibold text-white">Channel Matching</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                Match companies with the most effective growth channels for their sector.
              </p>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
              </div>
              <h3 className="mt-4 font-semibold text-white">Action Plans</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                Get a structured 30-day action plan with specific growth nodes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Credibility */}
      <section className="border-b border-white/5 py-16">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/[0.03] px-4 py-1.5 text-sm text-gray-500">
            <Globe className="h-3.5 w-3.5" />
            Built for ambitious companies
          </div>
          <h2 className="mt-4 text-xl font-bold text-white">
            Built for AI, Web3, SaaS, fintech, and global startups.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-gray-500">
            Whether you&apos;re scaling a developer tool, launching a DeFi protocol, or expanding an AI platform
            into new markets 鈥?GroIntel identifies your fastest path to growth.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {["AI / ML", "Web3 / Crypto", "SaaS", "Fintech", "Developer Tools", "E-Commerce", "DeFi", "Infrastructure"].map((tag) => (
              <span key={tag} className="rounded-full border border-white/5 bg-white/[0.03] px-4 py-2 text-xs text-gray-400">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Growth Signals */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Today&apos;s Growth Signals</h2>
              <p className="mt-1 text-sm text-gray-500">High-potential companies showing strong growth indicators</p>
            </div>
            <Link href="/signals" className="hidden items-center gap-1 text-sm text-gray-400 transition-colors hover:text-white md:flex">
              View all signals <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {featuredSignals.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
          <div className="mt-6 text-center md:hidden">
            <Link href="/signals" className="inline-flex items-center gap-1 text-sm text-gray-400 transition-colors hover:text-white">
              View all signals <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}




