"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, BrainCircuit, Building2, Loader2, Network, Sparkles, UserCheck } from "lucide-react";

type IdentityResult = {
  success: boolean;
  error?: string;
  side?: "company" | "kol";
  normalizedIdentity?: string;
  classification?: { confidence: number; reason: string };
  profile?: Record<string, any>;
  missingQuestions?: string[];
  recommendedCompanyProfiles?: Array<{ company: string; sector: string; growthNeed: string; evidence: string }>;
  web3Decision?: {
    confidence: number;
    recommendedSupply: string[];
    recommendedPartnerProfiles: string[];
    measurementPlan: string[];
    qualificationQuestions: string[];
  } | null;
  nextActions?: string[];
  routeHint?: string;
};

export default function IdentityPage() {
  const [identity, setIdentity] = useState("arbitrum.io");
  const [side, setSide] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IdentityResult | null>(null);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/grointel/identity-intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identity, side: side || undefined }),
      });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.error || "Identity intake failed");
      setResult(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Identity intake failed");
    } finally {
      setLoading(false);
    }
  }

  const isCompany = result?.side === "company";
  const IdentityIcon = isCompany ? Building2 : UserCheck;

  return (
    <div className="min-h-screen bg-black text-white">
      <section className="border-b border-white/5">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/[0.06] px-3 py-1 text-xs text-violet-200">
            <BrainCircuit className="h-3.5 w-3.5" />
            Identity {"->"} Understanding {"->"} Missing Context {"->"} Match
          </div>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight md:text-5xl">Start With One Identity Signal</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-400">
            Paste a company website, creator profile, X account, YouTube channel, LinkedIn page, or one-line description. GroIntel decides what kind of subject it is and starts the right growth understanding path.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[0.9fr_1.5fr]">
        <form onSubmit={submit} className="h-fit rounded-lg border border-white/5 bg-white/[0.03] p-5">
          <label className="block">
            <span className="text-xs text-gray-500">Identity signal</span>
            <textarea
              value={identity}
              onChange={(event) => setIdentity(event.target.value)}
              className="mt-1.5 min-h-28 w-full rounded-lg border border-white/10 bg-black px-3 py-3 text-sm text-white outline-none transition-colors focus:border-violet-400/40"
              placeholder="website, profile URL, handle, or one-line description"
            />
          </label>
          <label className="mt-4 block">
            <span className="text-xs text-gray-500">Optional side hint</span>
            <select
              value={side}
              onChange={(event) => setSide(event.target.value)}
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-black px-3 py-2.5 text-sm text-white outline-none focus:border-violet-400/40"
            >
              <option value="">Auto-detect</option>
              <option value="company">Company</option>
              <option value="kol">KOL / partner</option>
            </select>
          </label>
          {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
          <button className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-violet-400 px-4 py-3 text-sm font-medium text-black transition-colors hover:bg-violet-300 disabled:opacity-60" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Understand Identity
          </button>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-gray-500">
            {["arbitrum.io", "x.com/cobie", "youtube.com/@mkbhd", "A Web3 DeFi launch"].map((sample) => (
              <button key={sample} type="button" onClick={() => setIdentity(sample)} className="rounded-lg border border-white/5 bg-black/30 px-3 py-2 text-left transition-colors hover:bg-white/[0.04]">
                {sample}
              </button>
            ))}
          </div>
        </form>

        <section className="space-y-4">
          {!result && (
            <div className="rounded-lg border border-white/5 bg-white/[0.03] p-8 text-center">
              <Network className="mx-auto h-8 w-8 text-gray-600" />
              <p className="mt-3 text-sm text-gray-500">The first understanding pass will appear here.</p>
            </div>
          )}

          {result?.profile && (
            <>
              <div className="rounded-lg border border-white/5 bg-white/[0.03] p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <IdentityIcon className="h-4 w-4 text-violet-300" />
                      <h2 className="text-sm font-semibold">{isCompany ? "Company Understanding" : "KOL / Partner Understanding"}</h2>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">{result.normalizedIdentity}</p>
                  </div>
                  <span className="w-fit rounded-full bg-violet-400/10 px-2.5 py-1 text-xs text-violet-200">
                    {result.classification?.confidence}% classification
                  </span>
                </div>
                <p className="mt-4 text-sm leading-6 text-gray-300">{String(result.profile.summary || "")}</p>
                <p className="mt-3 text-xs text-gray-500">{result.classification?.reason}</p>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-lg border border-white/5 bg-white/[0.03] p-5">
                  <h2 className="text-sm font-semibold">Missing Questions</h2>
                  <div className="mt-3 space-y-2">
                    {(result.missingQuestions || []).map((item, index) => (
                      <p key={item} className="rounded-lg bg-black/30 p-3 text-sm leading-6 text-gray-300">{index + 1}. {item}</p>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg border border-white/5 bg-white/[0.03] p-5">
                  <h2 className="text-sm font-semibold">Next Actions</h2>
                  <div className="mt-3 space-y-2">
                    {(result.nextActions || []).slice(0, 5).map((item, index) => (
                      <p key={item} className="rounded-lg bg-black/30 p-3 text-sm leading-6 text-gray-300">{index + 1}. {item}</p>
                    ))}
                  </div>
                </div>
              </div>

              {result.web3Decision && (
                <div className="rounded-lg border border-sky-400/10 bg-sky-400/[0.04] p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-sm font-semibold">Web3 Growth Decision Attached</h2>
                    <span className="rounded-full bg-sky-400/10 px-2.5 py-1 text-xs text-sky-200">{result.web3Decision.confidence}% confidence</span>
                  </div>
                  <div className="mt-4 grid gap-3 lg:grid-cols-3">
                    <div>
                      <p className="text-xs text-gray-500">Supply</p>
                      <div className="mt-2 space-y-2">
                        {result.web3Decision.recommendedSupply.slice(0, 4).map((item) => <p key={item} className="text-sm text-sky-100">{item}</p>)}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Partner Profiles</p>
                      <div className="mt-2 space-y-2">
                        {result.web3Decision.recommendedPartnerProfiles.slice(0, 4).map((item) => <p key={item} className="text-sm text-sky-100">{item}</p>)}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Measurement</p>
                      <div className="mt-2 space-y-2">
                        {result.web3Decision.measurementPlan.slice(0, 4).map((item) => <p key={item} className="text-sm text-sky-100">{item}</p>)}
                      </div>
                    </div>
                  </div>
                  <Link href="/web3-growth" className="mt-5 inline-flex items-center gap-2 rounded-lg border border-sky-400/20 px-3 py-2 text-xs font-medium text-sky-200 transition-colors hover:bg-sky-400/10">
                    Open full Web3 decision
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}

              {result.recommendedCompanyProfiles && result.recommendedCompanyProfiles.length > 0 && (
                <div className="rounded-lg border border-emerald-400/10 bg-emerald-400/[0.04] p-5">
                  <h2 className="text-sm font-semibold">Companies This KOL Could Help</h2>
                  <div className="mt-4 grid gap-3 lg:grid-cols-2">
                    {result.recommendedCompanyProfiles.map((item) => (
                      <div key={`${item.company}-${item.sector}`} className="rounded-lg border border-white/5 bg-black/30 p-4">
                        <p className="text-sm font-medium text-white">{item.company}</p>
                        <p className="mt-1 text-xs text-gray-500">{item.sector}</p>
                        <p className="mt-3 text-sm leading-6 text-gray-300">{item.evidence}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
