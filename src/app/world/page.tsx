import { Activity, Building2, CheckCircle2, Database, Globe2, Network, Radar, Signal, Sparkles, Target, UserCheck, Wifi } from "lucide-react";
import { getGroIntelWorldRuntime } from "@/lib/grointel/worldRuntime";
import { loadWorldMemorySummary } from "@/lib/grointel/worldMemory";
import { getExpandedSupplyProfiles } from "@/lib/grointel/web3Decision";
import { getGroIntelLifeStatus } from "@/lib/grointel/lifeStatus";
import { getAIGatewayStatus } from "@/lib/ai/gateway/status";

export const dynamic = "force-dynamic";

function formatTime(value: string | null) {
  if (!value) return "Waiting for first observation";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function metricTone(value: number) {
  if (value >= 70) return "text-emerald-300";
  if (value >= 40) return "text-amber-300";
  return "text-sky-300";
}

type RealityGapView = {
  description: string;
  severity?: string;
};

type RealityPriorityView = {
  priority: string;
};

export default async function WorldPage() {
  const world = await getGroIntelWorldRuntime().observeTargets(3);
  const memory = await loadWorldMemorySummary(8);
  const life = getGroIntelLifeStatus();
  const ai = await getAIGatewayStatus();
  const supplyProfiles = getExpandedSupplyProfiles();
  const { score, topGaps, topPriorities, progress, targets, observations, signals, evidence, connectorHealth } = world;
  const observedTargetIds = new Set(observations.map((observation) => observation.target.id));
  const agentReach = connectorHealth.find((connector) => connector.id === "connector.agent_reach");
  const agentReachHealth = agentReach?.health as { state?: string; success_rate?: number; latency_ms?: number; last_error?: string | null } | undefined;
  const usingLegacyMemory = Boolean(memory.error?.toLowerCase().includes("legacy"));
  const demandTargets = targets.filter((target) => target.kind === "company");
  const supplyTargets = targets.filter((target) => target.kind !== "company");
  const observedDemandCount = demandTargets.filter((target) => observedTargetIds.has(target.id)).length;
  const observedSupplyCount = supplyTargets.filter((target) => observedTargetIds.has(target.id)).length;
  const readinessChecks = [
    { label: "Real AI", pass: ai.mode === "real_ai_active" },
    { label: "Company demand", pass: world.discovery.web3DemandCount >= 40 },
    { label: "KOL supply", pass: world.discovery.web3SupplyCount >= 30 },
    { label: "Reality loop", pass: world.tickCount > 0 || Boolean(memory.latestRun) },
    { label: "L2 memory", pass: memory.entityMemories.length > 0 },
    { label: "L3 memory", pass: memory.decisionMemories.length > 0 },
    { label: "L4 memory", pass: memory.evolutionMemories.length > 0 },
    { label: "Growth events", pass: memory.growthEvents.length > 0 },
  ];
  const readinessScore = Math.round((readinessChecks.filter((check) => check.pass).length / readinessChecks.length) * 100);
  const readinessStatus = readinessScore === 100 ? "Ready" : readinessScore >= 75 ? "Degraded" : "Blocked";

  const metrics = [
    { label: "Reality Coverage", value: score.reality_coverage, icon: Globe2 },
    { label: "Knowledge Quality", value: score.knowledge_quality, icon: Database },
    { label: "Decision Accuracy", value: score.decision_accuracy, icon: Target },
    { label: "Business Outcomes", value: score.business_outcomes, icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <section className="border-b border-white/5">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.06] px-3 py-1 text-xs text-emerald-200">
                <Wifi className="h-3.5 w-3.5" />
                Connected to public reality
              </div>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-5xl">The Web3 Living World</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-400">
                GroIntel is starting with Web3: observing projects, KOLs, communities, and historical growth collaborations so every future match is grounded in what actually worked, failed, or created risk.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-right md:grid-cols-4">
              <div className="rounded-lg border border-white/5 bg-white/[0.03] px-4 py-3">
                <div className="text-xs text-gray-500">World Ticks</div>
                <div className="mt-1 text-2xl font-semibold">{world.tickCount}</div>
              </div>
              <div className="rounded-lg border border-white/5 bg-white/[0.03] px-4 py-3">
                <div className="text-xs text-gray-500">Demand</div>
                <div className="mt-1 text-2xl font-semibold">{demandTargets.length}</div>
              </div>
              <div className="rounded-lg border border-white/5 bg-white/[0.03] px-4 py-3">
                <div className="text-xs text-gray-500">Supply</div>
                <div className="mt-1 text-2xl font-semibold">{supplyTargets.length}</div>
              </div>
              <div className="rounded-lg border border-white/5 bg-white/[0.03] px-4 py-3">
                <div className="text-xs text-gray-500">Web3 Pool</div>
                <div className="mt-1 text-2xl font-semibold">{world.discovery.web3TargetCount}</div>
              </div>
            </div>
          </div>
          <div className="mt-6 rounded-lg border border-emerald-400/10 bg-emerald-400/[0.04] p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  <p className="text-xs text-emerald-200">Delivery Readiness</p>
                </div>
                <p className="mt-2 text-sm leading-6 text-gray-300">
                  {readinessStatus}: company identity to Web3 KOL matching is connected through real AI, discovery, world memory, and growth-event evidence.
                </p>
              </div>
              <div className="flex flex-col gap-3 lg:min-w-[34rem]">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-3xl font-semibold text-emerald-100">{readinessScore}%</span>
                  <a href="/api/grointel/delivery-readiness" className="rounded-lg border border-emerald-400/20 px-3 py-2 text-xs font-medium text-emerald-200 transition-colors hover:bg-emerald-400/10">
                    Open readiness API
                  </a>
                </div>
                <div className="grid gap-2 sm:grid-cols-4">
                  {readinessChecks.map((check) => (
                    <div key={check.label} className="rounded-md bg-black/30 px-2.5 py-2 text-xs">
                      <span className={check.pass ? "text-emerald-200" : "text-amber-200"}>{check.pass ? "pass" : "watch"}</span>
                      <span className="ml-2 text-gray-400">{check.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 rounded-lg border border-white/5 bg-white/[0.03] p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs text-gray-500">Persistent Memory</p>
                <p className="mt-1 text-sm text-gray-300">
                  {memory.configured
                    ? memory.latestRun
                      ? usingLegacyMemory
                        ? `Legacy memory active: ${formatTime(memory.latestRun.created_at)}`
                        : `Last saved run: ${formatTime(memory.latestRun.created_at)}`
                      : "Memory tables are connected, waiting for first saved run"
                    : "Supabase memory is not configured in this environment"}
                </p>
              </div>
              <div className="flex gap-2 text-xs">
                <span className="rounded-md bg-white/[0.05] px-2.5 py-1 text-gray-300">L1 {memory.recentEvidence.length + memory.recentSignals.length}</span>
                <span className="rounded-md bg-white/[0.05] px-2.5 py-1 text-gray-300">L2 {memory.entityMemories.length}</span>
                <span className="rounded-md bg-white/[0.05] px-2.5 py-1 text-gray-300">L3 {memory.decisionMemories.length}</span>
                <span className="rounded-md bg-white/[0.05] px-2.5 py-1 text-gray-300">L4 {memory.evolutionMemories.length}</span>
              </div>
            </div>
            {memory.error && usingLegacyMemory && (
              <p className="mt-3 text-xs text-emerald-300">
                Primary four-layer memory tables are pending. GroIntel is reading and writing legacy world memory now; run <span className="font-mono">supabase/migrations/013_world_memory.sql</span> to enable the preferred long-term schema.
              </p>
            )}
            {memory.error && !usingLegacyMemory && (
              <p className="mt-3 text-xs text-amber-300">
                {memory.error} Run <span className="font-mono">supabase/migrations/013_world_memory.sql</span> to enable long-term memory.
              </p>
            )}
          </div>
          <div className="mt-4 rounded-lg border border-emerald-400/10 bg-emerald-400/[0.04] p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs text-emerald-200">GroIntel Life Pulse</p>
                <p className="mt-1 text-sm leading-6 text-gray-300">
                  Alive in {life.mode.replaceAll("_", " ")} mode. {life.cronDescription}; next scheduled heartbeat: {formatTime(life.nextScheduledHeartbeatAt)}.
                </p>
                <p className="mt-2 text-xs leading-5 text-gray-500">{life.platformLimit}</p>
              </div>
              <div className="grid gap-2 text-xs sm:grid-cols-3 lg:min-w-[28rem]">
                <div className="rounded-lg bg-black/30 p-3">
                  <p className="text-gray-500">Cron</p>
                  <p className="mt-1 font-mono text-emerald-100">{life.cronSchedule}</p>
                </div>
                <div className="rounded-lg bg-black/30 p-3">
                  <p className="text-gray-500">Manual tick</p>
                  <p className="mt-1 text-emerald-100">{life.manualTickAvailable ? "available" : "off"}</p>
                </div>
                <div className="rounded-lg bg-black/30 p-3">
                  <p className="text-gray-500">Loop</p>
                  <p className="mt-1 text-emerald-100">{life.realityLoop.length} steps</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 rounded-lg border border-violet-400/10 bg-violet-400/[0.04] p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs text-violet-200">Web3 Discovery Registry</p>
                <p className="mt-1 text-sm leading-6 text-gray-300">
                  Auto-expanded target pool: {world.discovery.web3DemandCount} growth-demand companies and {world.discovery.web3SupplyCount} KOL/media/research supply entities.
                </p>
                <p className="mt-2 text-xs leading-5 text-gray-500">
                  Catalog size: {world.discovery.discoveryCatalogCount}. Last expanded: {formatTime(world.discovery.lastExpandedAt)}.
                </p>
              </div>
              <a href="/api/grointel/web3-discovery" className="w-fit rounded-lg border border-violet-400/20 px-3 py-2 text-xs font-medium text-violet-200 transition-colors hover:bg-violet-400/10">
                Open discovery API
              </a>
            </div>
          </div>
          <div className="mt-4 rounded-lg border border-sky-400/10 bg-sky-400/[0.04] p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs text-sky-200">AI Gateway</p>
                <p className="mt-1 text-sm leading-6 text-gray-300">
                  Mode: {ai.mode.replaceAll("_", " ")}. Chat: {ai.active.chat}; JSON: {ai.active.json}; fallback: {ai.active.fallback}.
                </p>
                <p className="mt-2 text-xs leading-5 text-gray-500">{ai.guidance}</p>
              </div>
              <div className="grid gap-2 text-xs sm:grid-cols-3 lg:min-w-[28rem]">
                <div className="rounded-lg bg-black/30 p-3">
                  <p className="text-gray-500">OpenAI</p>
                  <p className="mt-1 text-sky-100">{ai.configured.openai ? "configured" : "missing key"}</p>
                </div>
                <div className="rounded-lg bg-black/30 p-3">
                  <p className="text-gray-500">DeepSeek</p>
                  <p className="mt-1 text-sky-100">{ai.configured.deepseek ? "configured" : "missing key"}</p>
                </div>
                <div className="rounded-lg bg-black/30 p-3">
                  <p className="text-gray-500">Providers</p>
                  <p className="mt-1 text-sky-100">{ai.providers.length} checked</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <section className="grid gap-4 lg:grid-cols-[1.2fr_2fr]">
          <div className="rounded-lg border border-white/5 bg-white/[0.03] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Overall Intelligence Index</p>
                <div className={`mt-3 text-6xl font-semibold ${metricTone(score.overall)}`}>{score.overall}</div>
              </div>
              <Radar className="h-12 w-12 text-sky-300" />
            </div>
            <p className="mt-5 text-sm text-gray-500">Last observed: {formatTime(world.lastObservedAt)}</p>
            <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border border-white/5 bg-black/30 p-3 text-gray-400">
                New reality covered <span className="block pt-1 text-lg font-semibold text-white">{progress.reality_covered_new}</span>
              </div>
              <div className="rounded-lg border border-white/5 bg-black/30 p-3 text-gray-400">
                Gaps discovered <span className="block pt-1 text-lg font-semibold text-white">{progress.gaps_discovered}</span>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <div key={metric.label} className="rounded-lg border border-white/5 bg-white/[0.03] p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">{metric.label}</p>
                    <Icon className="h-4 w-4 text-gray-500" />
                  </div>
                  <div className={`mt-4 text-3xl font-semibold ${metricTone(metric.value)}`}>{metric.value}%</div>
                  <div className="mt-4 h-1.5 rounded-full bg-white/[0.06]">
                    <div className="h-full rounded-full bg-sky-300" style={{ width: `${metric.value}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_1.15fr_1.35fr]">
          <div className="rounded-lg border border-sky-400/10 bg-sky-400/[0.035] p-5">
            <div className="mb-4 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-sky-300" />
                <h2 className="text-sm font-semibold text-white">Demand World</h2>
              </div>
              <span className="rounded-full bg-sky-400/10 px-2 py-1 text-xs text-sky-200">{observedDemandCount}/{demandTargets.length} observed</span>
            </div>
            <div className="grid gap-2">
              {demandTargets.map((target) => (
                <div key={target.id} className="flex items-center justify-between rounded-lg border border-white/5 bg-black/30 px-3 py-3">
                  <div>
                    <p className="text-sm font-medium text-white">{target.name}</p>
                    <p className="mt-0.5 text-xs text-gray-500">{target.identity}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs ${observedTargetIds.has(target.id) ? "bg-emerald-400/10 text-emerald-200" : "bg-white/[0.04] text-gray-500"}`}>
                    company
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-violet-400/10 bg-violet-400/[0.035] p-5">
            <div className="mb-4 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-violet-300" />
                <h2 className="text-sm font-semibold text-white">Supply World</h2>
              </div>
              <span className="rounded-full bg-violet-400/10 px-2 py-1 text-xs text-violet-200">{observedSupplyCount}/{supplyTargets.length} observed</span>
            </div>
            <div className="grid gap-2">
              {supplyTargets.map((target) => (
                <div key={target.id} className="flex items-center justify-between rounded-lg border border-white/5 bg-black/30 px-3 py-3">
                  <div>
                    <p className="text-sm font-medium text-white">{target.name}</p>
                    <p className="mt-0.5 text-xs text-gray-500">{target.identity}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs ${observedTargetIds.has(target.id) ? "bg-emerald-400/10 text-emerald-200" : "bg-white/[0.04] text-gray-500"}`}>
                    {target.kind}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-white/5 bg-white/[0.03] p-5">
            <div className="mb-4 flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-300" />
              <h2 className="text-sm font-semibold text-white">Recent Observations</h2>
            </div>
            <div className="space-y-3">
              {observations.slice(0, 6).map((observation) => (
                <div key={observation.id} className="rounded-lg border border-white/5 bg-black/30 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-white">{observation.target.name}</p>
                      <p className="mt-1 text-xs text-gray-500">{formatTime(observation.observed_at)}</p>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <span className="rounded-md bg-sky-400/10 px-2 py-1 text-sky-200">{observation.signal_count} signals</span>
                      <span className="rounded-md bg-emerald-400/10 px-2 py-1 text-emerald-200">{observation.evidence_count} evidence</span>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-gray-500">
                    Connectors: {observation.connectors_used.length ? observation.connectors_used.join(", ") : "no verified connector output"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-violet-400/10 bg-violet-400/[0.035] p-5">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">Web3 Growth Supply Memory</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500">
                These are the KOL, media, research, community, and trust-side growth suppliers GroIntel can understand and match against company demand.
              </p>
            </div>
            <a href="/identity" className="text-xs text-violet-300 hover:text-violet-200">Add a KOL identity</a>
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {supplyProfiles.map((profile) => (
              <div key={profile.id} className="rounded-lg border border-white/5 bg-black/30 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-violet-400/10 px-2.5 py-1 text-xs text-violet-200">{profile.supplyType}</span>
                  <span className="text-xs text-gray-500">{profile.identity}</span>
                </div>
                <p className="mt-3 text-sm font-medium text-white">{profile.name}</p>
                <p className="mt-2 text-xs leading-5 text-gray-500">{profile.audience.slice(0, 3).join(" / ")}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {profile.bestFor.slice(0, 3).map((item) => (
                    <span key={item} className="rounded-md border border-white/5 bg-white/[0.03] px-2 py-1 text-xs text-gray-300">{item}</span>
                  ))}
                </div>
                <p className="mt-3 text-xs leading-5 text-amber-200">Risk: {profile.risks[0]}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-lg border border-white/5 bg-white/[0.03] p-5 lg:col-span-2">
            <div className="mb-4 flex items-center gap-2">
              <Signal className="h-4 w-4 text-amber-300" />
              <h2 className="text-sm font-semibold text-white">Live Growth Signals</h2>
            </div>
            <div className="grid gap-2">
              {signals.slice(0, 10).map((signal) => (
                <div key={signal.id} className="rounded-lg border border-white/5 bg-black/30 p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-white/[0.05] px-2 py-1 text-xs text-gray-400">{signal.category}</span>
                    <span className="text-xs text-gray-600">{signal.entity}</span>
                    <span className="ml-auto text-xs text-gray-500">{signal.confidence}% confidence</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-200">{signal.summary}</p>
                </div>
              ))}
              {signals.length === 0 && <p className="text-sm text-gray-500">No signals observed yet.</p>}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-white/5 bg-white/[0.03] p-5">
              <h2 className="text-sm font-semibold text-white">Reality Gaps</h2>
              <div className="mt-4 space-y-2">
                {(topGaps as RealityGapView[]).map((gap, index) => (
                  <div key={`${gap.description}-${index}`} className="rounded-lg border border-white/5 bg-black/30 p-3">
                    <p className="text-sm text-gray-200">{gap.description}</p>
                    <p className="mt-1 text-xs text-gray-600">{gap.severity || "unknown"} severity</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-white/5 bg-white/[0.03] p-5">
              <h2 className="text-sm font-semibold text-white">Next Priorities</h2>
              <div className="mt-4 space-y-2">
                {(topPriorities as RealityPriorityView[]).map((priority, index) => (
                  <div key={`${priority.priority}-${index}`} className="rounded-lg border border-white/5 bg-black/30 p-3">
                    <p className="text-sm text-gray-200">{priority.priority}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-white/5 bg-white/[0.03] p-5">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">Web3 Growth Event Memory</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500">
                These are the first historical collaboration memories GroIntel uses to learn why company/KOL growth events succeed, fail, or create risk.
              </p>
            </div>
            <a href="/api/grointel/growth-events" className="text-xs text-sky-300 hover:text-sky-200">Open event API</a>
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {memory.growthEvents.slice(0, 6).map((event) => {
              const outcome = String(event.outcome || "mixed");
              const outcomeClass = outcome === "success"
                ? "bg-emerald-400/10 text-emerald-200"
                : outcome === "failure"
                  ? "bg-red-400/10 text-red-200"
                  : outcome === "risk"
                    ? "bg-amber-400/10 text-amber-200"
                    : "bg-sky-400/10 text-sky-200";
              return (
                <div key={String(event.id)} className="rounded-lg border border-white/5 bg-black/30 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-xs ${outcomeClass}`}>{outcome}</span>
                    <span className="text-xs text-gray-500">{event.chain_or_sector || event.chainOrSector || "Web3"}</span>
                    <span className="ml-auto text-xs text-gray-600">{event.event_date || event.eventDate}</span>
                  </div>
                  <p className="mt-3 text-sm font-medium text-white">
                    {event.project} x {event.partner}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-gray-400">{event.observed_result || event.observedResult}</p>
                  <p className="mt-3 text-xs leading-5 text-gray-500">{event.reusable_pattern || event.reusablePattern}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-emerald-400/10 bg-emerald-400/[0.04] p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2">
                <Network className="h-4 w-4 text-emerald-300" />
                <h2 className="text-sm font-semibold text-white">Agent Reach Social Source Mesh</h2>
              </div>
              <p className="mt-3 text-sm leading-6 text-gray-400">
                GroIntel can route public reality checks through Agent Reach when upstream tools are installed, using Exa and local source paths for Reddit, Twitter/X, YouTube, Bilibili, XiaoHongShu, LinkedIn, and GitHub. The doctor shows which channels are currently reachable.
              </p>
              <a href="/agent-reach" className="mt-4 inline-flex rounded-md border border-emerald-400/20 px-3 py-2 text-xs font-medium text-emerald-200 transition-colors hover:bg-emerald-400/10">
                Open source doctor
              </a>
            </div>
            <div className="grid min-w-64 grid-cols-3 gap-2 text-xs">
              <div className="rounded-lg border border-white/5 bg-black/30 p-3">
                <p className="text-gray-500">State</p>
                <p className="mt-2 font-medium text-emerald-200">{agentReachHealth?.state || "pending"}</p>
              </div>
              <div className="rounded-lg border border-white/5 bg-black/30 p-3">
                <p className="text-gray-500">Sources</p>
                <p className="mt-2 font-medium text-white">7</p>
              </div>
              <div className="rounded-lg border border-white/5 bg-black/30 p-3">
                <p className="text-gray-500">Latency</p>
                <p className="mt-2 font-medium text-white">{Math.round(agentReachHealth?.latency_ms || 0)}ms</p>
              </div>
            </div>
          </div>
          <div className="mt-4 grid gap-2 md:grid-cols-4 lg:grid-cols-7">
            {["Reddit", "Twitter/X", "YouTube", "Bilibili", "XiaoHongShu", "LinkedIn", "GitHub"].map((source) => (
              <div key={source} className="rounded-lg border border-white/5 bg-black/30 px-3 py-2 text-xs text-gray-300">
                {source}
              </div>
            ))}
          </div>
          {agentReachHealth?.last_error && <p className="mt-3 text-xs text-amber-300">{agentReachHealth.last_error}</p>}
        </section>

        <section className="mt-6 rounded-lg border border-white/5 bg-white/[0.03] p-5">
          <h2 className="text-sm font-semibold text-white">Connector Health</h2>
          <div className="mt-4 grid gap-2 md:grid-cols-2 lg:grid-cols-5">
            {connectorHealth.map((connector) => {
              const health = connector.health as { state?: string; success_rate?: number; latency_ms?: number };
              return (
                <div key={connector.id} className="rounded-lg border border-white/5 bg-black/30 p-3">
                  <p className="text-sm font-medium text-white">{connector.name}</p>
                  <p className="mt-1 text-xs text-gray-500">{connector.type}</p>
                  <p className="mt-3 text-xs text-gray-400">
                    {health.state || "unknown"} / {Math.round(health.success_rate || 0)}% / {Math.round(health.latency_ms || 0)}ms
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
