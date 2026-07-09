"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, BrainCircuit, Building2, Loader2, Network, Sparkles, UserCheck } from "lucide-react";

type IdentityResult = {
  success: boolean;
  error?: string;
  side?: "company" | "kol";
  normalizedIdentity?: string;
  classification?: { confidence: number; reason: string };
  profile?: Record<string, any>;
  missingQuestions?: string[];
  recommendedCompanyProfiles?: Array<{
    company: string;
    sector: string;
    growthNeed: string;
    usefulWhen?: string[];
    evidence: string;
    fitScore?: number;
    fitReason?: string;
    suggestedCollaboration?: string;
    keyMetric?: string;
  }>;
  web3KOLSupplyInsight?: {
    enabled: boolean;
    provider: string;
    model?: string;
    positioning: string;
    bestCompanyNeed: string;
    proofToShow: string;
    outreachAngle: string;
    avoid: string;
    missingEvidence: string[];
  } | null;
  web3Decision?: {
    confidence: number;
    recommendedSupply: string[];
    recommendedPartnerProfiles: string[];
    recommendedConcretePartners?: Array<{ id: string; name: string; supplyType: string; fitScore: number; suggestedFormat: string; keyMetric: string }>;
    measurementPlan: string[];
    qualificationQuestions: string[];
  } | null;
  web3CollaborationBrief?: {
    briefTitle: string;
    objective: string;
    partnerBriefs: Array<{
      partnerId: string;
      partnerName: string;
      supplyType: string;
      fitScore: number;
      collaborationAngle: string;
      suggestedDeliverables: string[];
      outreachMessage: string;
      successMetrics: string[];
      riskControls: string[];
    }>;
    campaignPlan: Array<{ phase: string; action: string; output: string }>;
    nextActionChecklist: string[];
  } | null;
  web3AIGrowthInsight?: {
    enabled: boolean;
    provider: string;
    model?: string;
    growthState: string;
    opportunity: string;
    risk: string;
    recommendedMove: string;
  } | null;
  nextActions?: string[];
  routeHint?: string;
};

export default function IdentityPage() {
  const router = useRouter();
  const [identity, setIdentity] = useState("arbitrum.io");
  const [side, setSide] = useState("");
  const [loading, setLoading] = useState(false);
  const [creatingPassport, setCreatingPassport] = useState(false);
  const [result, setResult] = useState<IdentityResult | null>(null);
  const [error, setError] = useState("");
  const [passportError, setPassportError] = useState("");

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
      setPassportError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Identity intake failed");
    } finally {
      setLoading(false);
    }
  }

  async function createPassport() {
    if (!result?.side || !result.normalizedIdentity) return;
    setCreatingPassport(true);
    setPassportError("");
    try {
      const endpoint = result.side === "company" ? "/api/business-intelligence/intake" : "/api/capability-intelligence/intake";
      const payload = result.side === "company"
        ? { website: result.normalizedIdentity }
        : { profileUrl: result.normalizedIdentity };
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await response.json();
      if (!response.ok || !json.success || !json.knowledgeProfile?.id) {
        throw new Error(json.error || "Could not build passport");
      }
      router.push(`${result.side === "company" ? "/business-intelligence" : "/capability-intelligence"}/${json.knowledgeProfile.id}`);
    } catch (err) {
      setPassportError(err instanceof Error ? err.message : "Could not build passport");
      setCreatingPassport(false);
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
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={createPassport}
                    disabled={creatingPassport}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black transition-colors hover:bg-gray-200 disabled:opacity-60"
                  >
                    {creatingPassport ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                    Build Full Passport
                  </button>
                  <Link
                    href={isCompany ? "/business-intelligence" : "/capability-intelligence"}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-sm text-white transition-colors hover:bg-white/[0.05]"
                  >
                    Open {isCompany ? "company" : "KOL"} workspace
                  </Link>
                </div>
                {passportError && <p className="mt-3 text-sm text-red-300">{passportError}</p>}
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
                      <p className="text-xs text-gray-500">Concrete Matches</p>
                      <div className="mt-2 space-y-2">
                        {(result.web3Decision.recommendedConcretePartners || []).slice(0, 4).map((item) => <p key={item.id} className="text-sm text-sky-100">{item.name} · {item.fitScore}%</p>)}
                      </div>
                    </div>
                  </div>
                  <Link href="/web3-growth" className="mt-5 inline-flex items-center gap-2 rounded-lg border border-sky-400/20 px-3 py-2 text-xs font-medium text-sky-200 transition-colors hover:bg-sky-400/10">
                    Open full Web3 decision
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}

              {result.web3CollaborationBrief && (
                <div className="rounded-lg border border-emerald-400/10 bg-emerald-400/[0.04] p-5">
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h2 className="text-sm font-semibold">KOL Collaboration Brief Attached</h2>
                      <p className="mt-2 text-sm leading-6 text-emerald-50/70">{result.web3CollaborationBrief.objective}</p>
                    </div>
                    <Link href="/web3-growth" className="inline-flex w-fit items-center gap-2 rounded-lg bg-emerald-400 px-3 py-2 text-xs font-medium text-black transition-colors hover:bg-emerald-300">
                      Expand Brief
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                  {result.web3AIGrowthInsight && (
                    <div className="mt-4 rounded-lg border border-emerald-400/10 bg-black/30 p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs text-emerald-100">
                          AI {result.web3AIGrowthInsight.enabled ? "active" : "fallback"}
                        </span>
                        <span className="text-xs text-gray-500">{result.web3AIGrowthInsight.provider}{result.web3AIGrowthInsight.model ? ` / ${result.web3AIGrowthInsight.model}` : ""}</span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-gray-200">{result.web3AIGrowthInsight.growthState}</p>
                      <p className="mt-2 text-sm leading-6 text-emerald-100">{result.web3AIGrowthInsight.recommendedMove}</p>
                    </div>
                  )}
                  <div className="mt-4 grid gap-3 lg:grid-cols-3">
                    {result.web3CollaborationBrief.partnerBriefs.slice(0, 3).map((partner) => (
                      <div key={partner.partnerId} className="rounded-lg border border-white/5 bg-black/30 p-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs text-emerald-100">{partner.supplyType}</span>
                          <span className="text-xs text-gray-500">{partner.fitScore}% fit</span>
                        </div>
                        <p className="mt-3 text-sm font-medium">{partner.partnerName}</p>
                        <p className="mt-2 text-sm leading-6 text-gray-300">{partner.collaborationAngle}</p>
                        <p className="mt-3 text-xs text-gray-500">First deliverable</p>
                        <p className="mt-1 text-sm leading-6 text-gray-300">{partner.suggestedDeliverables[0]}</p>
                        <p className="mt-3 text-xs text-gray-500">Metric</p>
                        <p className="mt-1 text-sm text-emerald-100">{partner.successMetrics[0]}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 rounded-lg border border-emerald-400/10 bg-black/30 p-4">
                    <p className="text-xs text-emerald-100">First action</p>
                    <p className="mt-2 text-sm leading-6 text-gray-300">{result.web3CollaborationBrief.nextActionChecklist[0]}</p>
                  </div>
                </div>
              )}

              {result.recommendedCompanyProfiles && result.recommendedCompanyProfiles.length > 0 && (
                <div className="rounded-lg border border-emerald-400/10 bg-emerald-400/[0.04] p-5">
                  <h2 className="text-sm font-semibold">Companies This KOL Could Help</h2>
                  {result.web3KOLSupplyInsight && (
                    <div className="mt-4 rounded-lg border border-emerald-400/10 bg-black/30 p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs text-emerald-100">
                          AI {result.web3KOLSupplyInsight.enabled ? "active" : "fallback"}
                        </span>
                        <span className="text-xs text-gray-500">{result.web3KOLSupplyInsight.provider}{result.web3KOLSupplyInsight.model ? ` / ${result.web3KOLSupplyInsight.model}` : ""}</span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-gray-200">{result.web3KOLSupplyInsight.positioning}</p>
                      <div className="mt-3 grid gap-3 md:grid-cols-3">
                        <p className="rounded-md bg-white/[0.03] p-3 text-xs leading-5 text-gray-300"><span className="text-emerald-100">Best need:</span> {result.web3KOLSupplyInsight.bestCompanyNeed}</p>
                        <p className="rounded-md bg-white/[0.03] p-3 text-xs leading-5 text-gray-300"><span className="text-sky-100">Proof:</span> {result.web3KOLSupplyInsight.proofToShow}</p>
                        <p className="rounded-md bg-white/[0.03] p-3 text-xs leading-5 text-gray-300"><span className="text-amber-100">Avoid:</span> {result.web3KOLSupplyInsight.avoid}</p>
                      </div>
                    </div>
                  )}
                  <div className="mt-4 grid gap-3 lg:grid-cols-2">
                    {result.recommendedCompanyProfiles.map((item) => (
                      <div key={`${item.company}-${item.sector}`} className="rounded-lg border border-white/5 bg-black/30 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-white">{item.company}</p>
                            <p className="mt-1 text-xs text-gray-500">{item.sector}</p>
                          </div>
                          {typeof item.fitScore === "number" && (
                            <span className="shrink-0 rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs text-emerald-200">{item.fitScore}% fit</span>
                          )}
                        </div>
                        <p className="mt-3 text-xs uppercase tracking-[0.18em] text-emerald-200/70">Growth need</p>
                        <p className="mt-1 text-sm leading-6 text-gray-300">{item.growthNeed}</p>
                        {item.fitReason && <p className="mt-3 text-sm leading-6 text-emerald-100">{item.fitReason}</p>}
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          <div className="rounded-lg bg-white/[0.03] p-3">
                            <p className="text-xs text-gray-500">Suggested collaboration</p>
                            <p className="mt-1 text-sm text-gray-200">{item.suggestedCollaboration || "growth collaboration"}</p>
                          </div>
                          <div className="rounded-lg bg-white/[0.03] p-3">
                            <p className="text-xs text-gray-500">Key metric</p>
                            <p className="mt-1 text-sm text-gray-200">{item.keyMetric || "qualified growth signal"}</p>
                          </div>
                        </div>
                        {item.usefulWhen && item.usefulWhen.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {item.usefulWhen.slice(0, 3).map((stage) => (
                              <span key={stage} className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-gray-400">{stage}</span>
                            ))}
                          </div>
                        )}
                        <p className="mt-3 text-xs leading-5 text-gray-500">{item.evidence}</p>
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
