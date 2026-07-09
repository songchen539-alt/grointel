"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, HelpCircle, Loader2, Network, ShieldAlert, Sparkles, Target } from "lucide-react";

type DecisionResponse = {
  success: boolean;
  error?: string;
  demand?: Record<string, string>;
  memory?: { configured: boolean; eventCount: number; error: string | null };
  aiInsight?: {
    enabled: boolean;
    provider: string;
    model?: string;
    fallbackUsed: boolean;
    growthState: string;
    opportunity: string;
    risk: string;
    recommendedMove: string;
    missingEvidence: string[];
    operatorNote: string;
  };
  decision?: {
    recommendedSupply: string[];
    recommendedPartnerProfiles: string[];
    recommendedConcretePartners: Array<{
      id: string;
      name: string;
      identity: string;
      supplyType: string;
      audience: string[];
      capabilities: string[];
      fitScore: number;
      fitReason: string;
      suggestedFormat: string;
      keyMetric: string;
      primaryRisk: string;
      source?: string;
      tags?: string[];
      matchSignals?: string[];
    }>;
    collaborationPatterns: string[];
    avoidPatterns: string[];
    risks: string[];
    measurementPlan: string[];
    qualificationQuestions: string[];
    nextActions: string[];
    confidence: number;
    matchedEvents: Array<{
      id: string;
      project: string;
      partner: string;
      outcome: string;
      relevance: number;
      observedResult: string;
      reusablePattern: string;
      evidenceUrls?: string[];
    }>;
  };
};

type CollaborationBriefResponse = {
  success: boolean;
  error?: string;
  aiInsight?: {
    enabled: boolean;
    provider: string;
    model?: string;
    fallbackUsed: boolean;
    growthState: string;
    opportunity: string;
    risk: string;
    recommendedMove: string;
    missingEvidence: string[];
    operatorNote: string;
  };
  brief?: {
    briefTitle: string;
    objective: string;
    targetAudience: string;
    positioning: string;
    partnerShortlist: string[];
    partnerBriefs: Array<{
      partnerId: string;
      partnerName: string;
      partnerIdentity: string;
      supplyType: string;
      fitScore: number;
      whyThisPartner: string;
      collaborationAngle: string;
      suggestedDeliverables: string[];
      outreachMessage: string;
      successMetrics: string[];
      riskControls: string[];
      qualificationQuestions: string[];
    }>;
    campaignPlan: Array<{ phase: string; action: string; output: string }>;
    trackingPlan: string[];
    doNotDo: string[];
    nextActionChecklist: string[];
  };
};

export default function Web3GrowthPage() {
  const [loading, setLoading] = useState(false);
  const [briefLoading, setBriefLoading] = useState(false);
  const [savingEvent, setSavingEvent] = useState(false);
  const [error, setError] = useState("");
  const [briefError, setBriefError] = useState("");
  const [eventMessage, setEventMessage] = useState("");
  const [result, setResult] = useState<DecisionResponse | null>(null);
  const [briefResult, setBriefResult] = useState<CollaborationBriefResponse | null>(null);
  const [form, setForm] = useState({
    projectName: "Example Web3 Project",
    website: "",
    sector: "Ethereum L2 / DeFi / SocialFi",
    stage: "Growth stage",
    growthGoal: "Acquire real users through KOL and community partnerships",
    targetAudience: "crypto-native users and builders",
    riskTolerance: "medium",
  });
  const [eventForm, setEventForm] = useState({
    project: "",
    projectIdentity: "",
    partner: "",
    partnerIdentity: "",
    partnerType: "kol",
    chainOrSector: "Web3",
    outcome: "success",
    growthGoal: "",
    collaborationFormat: "",
    observedResult: "",
    reusablePattern: "",
    risks: "",
    evidenceUrls: "",
    bestForStages: "",
    measurableSignals: "",
    supplyProfile: "",
  });

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/grointel/web3-decision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.error || "Decision failed");
      setResult(json);
      setBriefResult(null);
      setBriefError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Decision failed");
    } finally {
      setLoading(false);
    }
  }

  async function generateBrief() {
    setBriefLoading(true);
    setBriefError("");
    try {
      const response = await fetch("/api/grointel/web3-collaboration-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, partnerLimit: 5 }),
      });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.error || "Brief failed");
      setBriefResult(json);
    } catch (err) {
      setBriefError(err instanceof Error ? err.message : "Brief failed");
    } finally {
      setBriefLoading(false);
    }
  }

  async function saveEvent(event: React.FormEvent) {
    event.preventDefault();
    setSavingEvent(true);
    setEventMessage("");
    try {
      const payload = {
        ...eventForm,
        risks: eventForm.risks.split("\n").map((item) => item.trim()).filter(Boolean),
        evidenceUrls: eventForm.evidenceUrls.split("\n").map((item) => item.trim()).filter(Boolean),
        bestForStages: eventForm.bestForStages.split("\n").map((item) => item.trim()).filter(Boolean),
        measurableSignals: eventForm.measurableSignals.split("\n").map((item) => item.trim()).filter(Boolean),
        supplyProfile: eventForm.supplyProfile,
        whyItWorkedOrFailed: [eventForm.reusablePattern].filter(Boolean),
      };
      const response = await fetch("/api/grointel/growth-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.error || "Save failed");
      setEventMessage(json.saved ? "Growth event saved into memory." : `Event accepted, memory not saved yet: ${json.error || "storage not ready"}`);
    } catch (err) {
      setEventMessage(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSavingEvent(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <section className="border-b border-white/5">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/[0.06] px-3 py-1 text-xs text-sky-200">
            <Network className="h-3.5 w-3.5" />
            Demand {"->"} Intelligence {"->"} Decision {"->"} Action
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">Web3 Growth Decision</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-400">
            Enter a Web3 project demand. GroIntel compares it with historical company/KOL growth events and recommends the supply side most likely to create real growth.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[0.9fr_1.4fr]">
        <div className="space-y-4">
          <form onSubmit={submit} className="space-y-4 rounded-lg border border-white/5 bg-white/[0.03] p-5">
            {[
              ["projectName", "Project"],
              ["website", "Website"],
              ["sector", "Sector"],
              ["stage", "Stage"],
              ["growthGoal", "Growth Goal"],
              ["targetAudience", "Target Audience"],
            ].map(([key, label]) => (
              <label key={key} className="block">
                <span className="text-xs text-gray-500">{label}</span>
                <input
                  value={form[key as keyof typeof form]}
                  onChange={(event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))}
                  className="mt-1.5 w-full rounded-lg border border-white/10 bg-black px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-sky-400/40"
                />
              </label>
            ))}
            <label className="block">
              <span className="text-xs text-gray-500">Risk Tolerance</span>
              <select
                value={form.riskTolerance}
                onChange={(event) => setForm((prev) => ({ ...prev, riskTolerance: event.target.value }))}
                className="mt-1.5 w-full rounded-lg border border-white/10 bg-black px-3 py-2.5 text-sm text-white outline-none focus:border-sky-400/40"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
            {error && <p className="text-sm text-red-300">{error}</p>}
            <button className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-sky-500 px-4 py-3 text-sm font-medium text-black transition-colors hover:bg-sky-400 disabled:opacity-60" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              Generate Decision
            </button>
          </form>

          <form onSubmit={saveEvent} className="space-y-3 rounded-lg border border-white/5 bg-white/[0.03] p-5">
            <h2 className="text-sm font-semibold">Add Growth Event Memory</h2>
            {[
              ["project", "Project"],
              ["partner", "KOL / Partner"],
              ["growthGoal", "Growth Goal"],
              ["collaborationFormat", "Collaboration Format"],
              ["observedResult", "Observed Result"],
              ["reusablePattern", "Why it worked / failed"],
              ["supplyProfile", "Supply Profile"],
            ].map(([key, label]) => (
              <label key={key} className="block">
                <span className="text-xs text-gray-500">{label}</span>
                <input
                  value={eventForm[key as keyof typeof eventForm]}
                  onChange={(event) => setEventForm((prev) => ({ ...prev, [key]: event.target.value }))}
                  className="mt-1.5 w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-sky-400/40"
                />
              </label>
            ))}
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs text-gray-500">Outcome</span>
                <select value={eventForm.outcome} onChange={(event) => setEventForm((prev) => ({ ...prev, outcome: event.target.value }))} className="mt-1.5 w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none">
                  <option value="success">success</option>
                  <option value="failure">failure</option>
                  <option value="mixed">mixed</option>
                  <option value="risk">risk</option>
                </select>
              </label>
              <label className="block">
                <span className="text-xs text-gray-500">Partner Type</span>
                <select value={eventForm.partnerType} onChange={(event) => setEventForm((prev) => ({ ...prev, partnerType: event.target.value }))} className="mt-1.5 w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none">
                  <option value="kol">kol</option>
                  <option value="community">community</option>
                  <option value="media">media</option>
                  <option value="platform">platform</option>
                  <option value="celebrity">celebrity</option>
                </select>
              </label>
            </div>
            <label className="block">
              <span className="text-xs text-gray-500">Evidence URLs, one per line</span>
              <textarea value={eventForm.evidenceUrls} onChange={(event) => setEventForm((prev) => ({ ...prev, evidenceUrls: event.target.value }))} className="mt-1.5 min-h-20 w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-sky-400/40" />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs text-gray-500">Best stages, one per line</span>
                <textarea value={eventForm.bestForStages} onChange={(event) => setEventForm((prev) => ({ ...prev, bestForStages: event.target.value }))} className="mt-1.5 min-h-20 w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-sky-400/40" />
              </label>
              <label className="block">
                <span className="text-xs text-gray-500">Measurable signals, one per line</span>
                <textarea value={eventForm.measurableSignals} onChange={(event) => setEventForm((prev) => ({ ...prev, measurableSignals: event.target.value }))} className="mt-1.5 min-h-20 w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-sky-400/40" />
              </label>
            </div>
            {eventMessage && <p className="text-xs text-amber-200">{eventMessage}</p>}
            <button className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-sm text-white transition-colors hover:bg-white/[0.05] disabled:opacity-60" disabled={savingEvent}>
              {savingEvent ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Save Event Memory
            </button>
          </form>
        </div>

        <section className="space-y-4">
          {!result?.decision && (
            <div className="rounded-lg border border-white/5 bg-white/[0.03] p-8 text-center">
              <Target className="mx-auto h-8 w-8 text-gray-600" />
              <p className="mt-3 text-sm text-gray-500">Decision output will appear here.</p>
            </div>
          )}

          {result?.decision && (
            <>
              <div className="rounded-lg border border-white/5 bg-white/[0.03] p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-sky-300" />
                    <h2 className="text-sm font-semibold">Recommended Growth Supply</h2>
                  </div>
                  <span className="rounded-full bg-sky-400/10 px-2.5 py-1 text-xs text-sky-200">{result.decision.confidence}% confidence</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {result.decision.recommendedSupply.map((item) => (
                    <span key={item} className="rounded-lg border border-white/5 bg-black/30 px-3 py-2 text-sm text-gray-200">{item}</span>
                  ))}
                </div>
                <div className="mt-5 grid gap-2">
                  {result.decision.recommendedPartnerProfiles.map((item) => (
                    <div key={item} className="rounded-lg border border-sky-400/10 bg-sky-400/[0.04] px-3 py-2 text-sm text-sky-100">
                      {item}
                    </div>
                  ))}
                </div>
                {result.aiInsight && (
                  <div className="mt-5 rounded-lg border border-sky-400/10 bg-black/30 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-sky-400/10 px-2.5 py-1 text-xs text-sky-100">
                        AI {result.aiInsight.enabled ? "active" : "fallback"}
                      </span>
                      <span className="text-xs text-gray-500">{result.aiInsight.provider}{result.aiInsight.model ? ` / ${result.aiInsight.model}` : ""}</span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-gray-200">{result.aiInsight.growthState}</p>
                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                      <p className="rounded-md bg-white/[0.03] p-3 text-xs leading-5 text-gray-300"><span className="text-emerald-100">Opportunity:</span> {result.aiInsight.opportunity}</p>
                      <p className="rounded-md bg-white/[0.03] p-3 text-xs leading-5 text-gray-300"><span className="text-amber-100">Risk:</span> {result.aiInsight.risk}</p>
                      <p className="rounded-md bg-white/[0.03] p-3 text-xs leading-5 text-gray-300"><span className="text-sky-100">Move:</span> {result.aiInsight.recommendedMove}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-violet-400/10 bg-violet-400/[0.04] p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Network className="h-4 w-4 text-violet-300" />
                    <h2 className="text-sm font-semibold">Concrete Web3 KOL / Supply Matches</h2>
                  </div>
                  <span className="rounded-full bg-violet-400/10 px-2.5 py-1 text-xs text-violet-200">from Supply World</span>
                </div>
                <div className="mt-4 grid gap-3 lg:grid-cols-2">
                  {result.decision.recommendedConcretePartners.map((partner) => (
                    <div key={partner.id} className="rounded-lg border border-white/5 bg-black/30 p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-violet-400/10 px-2.5 py-1 text-xs text-violet-200">{partner.supplyType}</span>
                        <span className="text-xs text-gray-500">{partner.fitScore}% fit</span>
                        {partner.source && <span className="text-xs text-gray-600">{partner.source}</span>}
                      </div>
                      <p className="mt-3 text-sm font-medium text-white">{partner.name}</p>
                      <p className="mt-1 text-xs text-gray-500">{partner.identity}</p>
                      <p className="mt-3 text-sm leading-6 text-gray-300">{partner.fitReason}</p>
                      {partner.matchSignals && partner.matchSignals.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {partner.matchSignals.map((signal) => (
                            <span key={signal} className="rounded-md border border-violet-400/10 bg-violet-400/[0.04] px-2 py-1 text-xs text-violet-100">{signal}</span>
                          ))}
                        </div>
                      )}
                      <div className="mt-3 grid gap-2 text-xs text-gray-400">
                        <p><span className="text-gray-500">Format:</span> {partner.suggestedFormat}</p>
                        <p><span className="text-gray-500">Metric:</span> {partner.keyMetric}</p>
                        <p><span className="text-amber-200">Risk:</span> {partner.primaryRisk}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-emerald-400/10 bg-emerald-400/[0.04] p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                      <h2 className="text-sm font-semibold">Collaboration Execution Brief</h2>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-emerald-50/70">
                      Turn the shortlist into outreach, deliverables, tracking, and pilot execution.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={generateBrief}
                    disabled={briefLoading}
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-400 px-4 py-2.5 text-sm font-medium text-black transition-colors hover:bg-emerald-300 disabled:opacity-60"
                  >
                    {briefLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                    Generate Brief
                  </button>
                </div>
                {briefError && <p className="mt-3 text-sm text-red-200">{briefError}</p>}
                {briefResult?.brief && (
                  <div className="mt-5 space-y-4">
                    {briefResult.aiInsight && (
                      <div className="rounded-lg border border-emerald-400/10 bg-black/30 p-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs text-emerald-100">
                            AI {briefResult.aiInsight.enabled ? "active" : "fallback"}
                          </span>
                          <span className="text-xs text-gray-500">{briefResult.aiInsight.provider}{briefResult.aiInsight.model ? ` / ${briefResult.aiInsight.model}` : ""}</span>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-gray-200">{briefResult.aiInsight.growthState}</p>
                        <div className="mt-3 grid gap-3 md:grid-cols-3">
                          <p className="rounded-md bg-white/[0.03] p-3 text-xs leading-5 text-gray-300"><span className="text-emerald-100">Opportunity:</span> {briefResult.aiInsight.opportunity}</p>
                          <p className="rounded-md bg-white/[0.03] p-3 text-xs leading-5 text-gray-300"><span className="text-amber-100">Risk:</span> {briefResult.aiInsight.risk}</p>
                          <p className="rounded-md bg-white/[0.03] p-3 text-xs leading-5 text-gray-300"><span className="text-sky-100">Move:</span> {briefResult.aiInsight.recommendedMove}</p>
                        </div>
                      </div>
                    )}
                    <div className="rounded-lg border border-white/5 bg-black/30 p-4">
                      <p className="text-sm font-semibold">{briefResult.brief.briefTitle}</p>
                      <p className="mt-2 text-sm leading-6 text-gray-300">{briefResult.brief.objective}</p>
                      <p className="mt-2 text-sm leading-6 text-gray-400">{briefResult.brief.positioning}</p>
                    </div>
                    <div className="grid gap-3 lg:grid-cols-2">
                      {briefResult.brief.partnerBriefs.map((partner) => (
                        <div key={partner.partnerId} className="rounded-lg border border-white/5 bg-black/30 p-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs text-emerald-100">{partner.supplyType}</span>
                            <span className="text-xs text-gray-500">{partner.fitScore}% fit</span>
                          </div>
                          <p className="mt-3 text-sm font-medium">{partner.partnerName}</p>
                          <p className="mt-1 text-xs text-gray-500">{partner.partnerIdentity}</p>
                          <p className="mt-3 text-sm leading-6 text-gray-300">{partner.collaborationAngle}</p>
                          <div className="mt-3 space-y-2">
                            {partner.suggestedDeliverables.slice(0, 3).map((item) => (
                              <p key={item} className="rounded-md border border-white/5 bg-white/[0.03] px-3 py-2 text-xs leading-5 text-gray-300">{item}</p>
                            ))}
                          </div>
                          <div className="mt-3 rounded-md border border-emerald-400/10 bg-emerald-400/[0.04] p-3">
                            <p className="text-xs text-emerald-100">Outreach</p>
                            <p className="mt-2 text-xs leading-5 text-gray-300">{partner.outreachMessage}</p>
                          </div>
                          <div className="mt-3 grid gap-2 text-xs text-gray-400">
                            <p><span className="text-gray-500">Metrics:</span> {partner.successMetrics.join(", ")}</p>
                            <p><span className="text-amber-200">Controls:</span> {partner.riskControls.join(", ")}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="grid gap-4 lg:grid-cols-2">
                      <div className="rounded-lg border border-white/5 bg-black/30 p-4">
                        <h3 className="text-sm font-semibold">Campaign Plan</h3>
                        <div className="mt-3 space-y-2">
                          {briefResult.brief.campaignPlan.map((phase) => (
                            <div key={phase.phase} className="rounded-md bg-white/[0.03] p-3">
                              <p className="text-xs font-medium text-emerald-100">{phase.phase}</p>
                              <p className="mt-1 text-xs leading-5 text-gray-300">{phase.action}</p>
                              <p className="mt-1 text-xs text-gray-500">Output: {phase.output}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-lg border border-white/5 bg-black/30 p-4">
                        <h3 className="text-sm font-semibold">Next Checklist</h3>
                        <div className="mt-3 space-y-2">
                          {briefResult.brief.nextActionChecklist.map((item, index) => (
                            <p key={item} className="rounded-md bg-white/[0.03] p-3 text-xs leading-5 text-gray-300">{index + 1}. {item}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-lg border border-white/5 bg-white/[0.03] p-5">
                  <h2 className="text-sm font-semibold">Patterns To Use</h2>
                  <div className="mt-3 space-y-2">
                    {result.decision.collaborationPatterns.map((item) => (
                      <p key={item} className="rounded-lg bg-black/30 p-3 text-sm leading-6 text-gray-300">{item}</p>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg border border-white/5 bg-white/[0.03] p-5">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-amber-300" />
                    <h2 className="text-sm font-semibold">Risks / Avoid</h2>
                  </div>
                  <div className="mt-3 space-y-2">
                    {[...result.decision.avoidPatterns, ...result.decision.risks].slice(0, 8).map((item) => (
                      <p key={item} className="rounded-lg bg-black/30 p-3 text-sm leading-6 text-gray-400">{item}</p>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-lg border border-white/5 bg-white/[0.03] p-5">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                    <h2 className="text-sm font-semibold">Measurement Plan</h2>
                  </div>
                  <div className="mt-3 grid gap-2">
                    {result.decision.measurementPlan.map((item) => (
                      <div key={item} className="rounded-lg border border-emerald-400/10 bg-emerald-400/[0.04] px-3 py-2 text-sm text-emerald-50">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg border border-white/5 bg-white/[0.03] p-5">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-violet-300" />
                    <h2 className="text-sm font-semibold">Qualification Questions</h2>
                  </div>
                  <div className="mt-3 space-y-2">
                    {result.decision.qualificationQuestions.map((item, index) => (
                      <p key={item} className="rounded-lg bg-black/30 p-3 text-sm leading-6 text-gray-300">{index + 1}. {item}</p>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-white/5 bg-white/[0.03] p-5">
                <h2 className="text-sm font-semibold">Historical Evidence</h2>
                <div className="mt-4 grid gap-3">
                  {result.decision.matchedEvents.map((event) => (
                    <div key={event.id} className="rounded-lg border border-white/5 bg-black/30 p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-white/[0.05] px-2 py-1 text-xs text-gray-300">{event.outcome}</span>
                        <span className="text-xs text-gray-500">{event.relevance}% relevance</span>
                      </div>
                      <p className="mt-2 text-sm font-medium">{event.project} x {event.partner}</p>
                      <p className="mt-2 text-sm leading-6 text-gray-400">{event.observedResult}</p>
                      {event.evidenceUrls && event.evidenceUrls.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {event.evidenceUrls.slice(0, 3).map((url) => (
                            <a key={url} href={url} target="_blank" rel="noreferrer" className="rounded-md border border-white/5 px-2 py-1 text-xs text-sky-300 hover:bg-white/[0.04]">
                              source
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-white/5 bg-white/[0.03] p-5">
                <h2 className="text-sm font-semibold">Next Actions</h2>
                <div className="mt-3 space-y-2">
                  {result.decision.nextActions.map((item, index) => (
                    <p key={item} className="rounded-lg bg-black/30 p-3 text-sm leading-6 text-gray-300">{index + 1}. {item}</p>
                  ))}
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
