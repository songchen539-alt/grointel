import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BrainCircuit,
  Building2,
  CircleDot,
  Database,
  Fingerprint,
  Network,
  Search,
  Sparkles,
  Target,
  UserCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "GroIntel | Company and KOL Growth Matching Intelligence",
  description:
    "GroIntel understands companies and KOLs from one identity signal, asks only the missing questions, and matches both sides for growth.",
};

const identityInputs = [
  "company website",
  "creator profile",
  "LinkedIn page",
  "YouTube channel",
  "personal site",
  "one-line description",
];

const flow = [
  {
    title: "Resolve identity",
    desc: "Turn a website, profile URL, or name into a structured company or capability entity.",
    icon: Fingerprint,
  },
  {
    title: "Read public reality",
    desc: "Collect signals, evidence, audience clues, market context, and capability proof.",
    icon: Search,
  },
  {
    title: "Ask what matters",
    desc: "Only request missing information that will improve diagnosis or matching confidence.",
    icon: BrainCircuit,
  },
  {
    title: "Match both sides",
    desc: "Recommend KOLs to companies and recommend companies to KOLs with reasons and risks.",
    icon: Network,
  },
];

const engineLayers = [
  "Business Intelligence",
  "Capability Intelligence",
  "Knowledge Completion",
  "Evidence Memory",
  "Profile Matching",
  "Reality Runtime",
];

export default function HomePage() {
  return (
    <div>
      <section className="border-b border-white/5">
        <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl gap-12 px-6 py-16 md:grid-cols-[1.05fr_0.95fr] md:items-center md:py-20">
          <div>
            <p className="text-sm text-gray-500">Growth Intelligence Network</p>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-white md:text-6xl">
              One identity signal. A full growth understanding.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-gray-400 md:text-lg">
              GroIntel learns companies and KOLs from a simple website or profile, fills the missing context through smart follow-up questions, then matches both sides with evidence-backed growth recommendations.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/web3-growth"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-400 px-5 py-3 text-sm font-medium text-black transition-colors hover:bg-sky-300"
              >
                Run Web3 growth decision
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/business-intelligence"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium text-white transition-colors hover:border-white/20 hover:bg-white/[0.06]"
              >
                I am a company
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/capability-intelligence"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium text-white transition-colors hover:border-white/20 hover:bg-white/[0.06]"
              >
                I am a KOL / partner
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {identityInputs.map((input) => (
                <span key={input} className="rounded-full border border-white/5 bg-white/[0.02] px-3 py-1.5 text-xs text-gray-500">
                  {input}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.025] p-5">
            <div className="grid gap-4">
              <div className="rounded-lg border border-blue-500/15 bg-blue-500/[0.06] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-blue-300/70">Company profile</p>
                    <h2 className="mt-2 text-xl font-semibold text-white">What growth does this company need?</h2>
                  </div>
                  <Building2 className="h-6 w-6 text-blue-300" />
                </div>
                <div className="mt-5 space-y-3 text-sm text-gray-300">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span>Growth goal</span>
                    <span className="text-blue-200">qualified demand</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span>Missing context</span>
                    <span className="text-amber-200">budget, ICP</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Next action</span>
                    <span className="text-green-200">match partners</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <div className="h-px bg-white/10" />
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div className="h-px bg-white/10" />
              </div>

              <div className="rounded-lg border border-purple-500/15 bg-purple-500/[0.06] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-purple-300/70">KOL / partner profile</p>
                    <h2 className="mt-2 text-xl font-semibold text-white">Who can actually move this growth?</h2>
                  </div>
                  <UserCheck className="h-6 w-6 text-purple-300" />
                </div>
                <div className="mt-5 space-y-3 text-sm text-gray-300">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span>Audience fit</span>
                    <span className="text-purple-200">B2B SaaS</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span>Proof strength</span>
                    <span className="text-green-200">case evidence</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Best match</span>
                    <span className="text-purple-200">product education</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/5 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl">
            <p className="text-sm text-gray-500">The product loop</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">GroIntel does the heavy lifting before the user fills a form.</h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-4">
            {flow.map((item, index) => (
              <div key={item.title} className="rounded-lg border border-white/5 bg-white/[0.02] p-5">
                <div className="flex items-center justify-between">
                  <item.icon className="h-5 w-5 text-gray-300" />
                  <span className="text-xs text-gray-600">0{index + 1}</span>
                </div>
                <h3 className="mt-5 text-base font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/5 py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-[0.9fr_1.1fr] md:items-start">
          <div>
            <p className="text-sm text-gray-500">Our own growth brain</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
              Not a GPT wrapper. A specialist engine for growth matching.
            </h2>
            <p className="mt-5 text-sm leading-7 text-gray-400">
              General models can reason, but GroIntel owns the growth-specific memory, evidence, question policy, matching dimensions, and outcome feedback loop.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {engineLayers.map((layer) => (
              <div key={layer} className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-4 py-4">
                <CircleDot className="h-4 w-4 text-blue-300" />
                <span className="text-sm text-gray-300">{layer}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto grid max-w-6xl gap-4 px-6 md:grid-cols-3">
          <div className="rounded-lg border border-white/5 bg-white/[0.02] p-6">
            <Database className="h-5 w-5 text-blue-300" />
            <h3 className="mt-4 text-lg font-semibold text-white">Company Passport</h3>
            <p className="mt-2 text-sm leading-6 text-gray-500">Business model, market, goals, constraints, growth stack, risks, and missing knowledge.</p>
          </div>
          <div className="rounded-lg border border-white/5 bg-white/[0.02] p-6">
            <UserCheck className="h-5 w-5 text-purple-300" />
            <h3 className="mt-4 text-lg font-semibold text-white">KOL Passport</h3>
            <p className="mt-2 text-sm leading-6 text-gray-500">Capabilities, audience, proof, pricing, availability, collaboration fit, and limits.</p>
          </div>
          <div className="rounded-lg border border-white/5 bg-white/[0.02] p-6">
            <Target className="h-5 w-5 text-green-300" />
            <h3 className="mt-4 text-lg font-semibold text-white">Growth Match</h3>
            <p className="mt-2 text-sm leading-6 text-gray-500">Score, explanation, missing fields, collaboration format, risk, and next action.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
