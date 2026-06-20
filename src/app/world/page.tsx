import { Activity, Database, Globe2, Radar, Signal, Sparkles, Target, Wifi } from "lucide-react";
import { getGroIntelWorldRuntime } from "@/lib/grointel/worldRuntime";

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

export default async function WorldPage() {
  const world = await getGroIntelWorldRuntime().observeTargets(3);
  const { score, topGaps, topPriorities, progress, targets, observations, signals, evidence, connectorHealth } = world;
  const observedTargetIds = new Set(observations.map((observation) => observation.target.id));

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
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-5xl">The Living World</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-400">
                GroIntel is observing companies and KOLs, collecting evidence, extracting growth signals, and turning missing context into priorities.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-right">
              <div className="rounded-lg border border-white/5 bg-white/[0.03] px-4 py-3">
                <div className="text-xs text-gray-500">World Ticks</div>
                <div className="mt-1 text-2xl font-semibold">{world.tickCount}</div>
              </div>
              <div className="rounded-lg border border-white/5 bg-white/[0.03] px-4 py-3">
                <div className="text-xs text-gray-500">Evidence</div>
                <div className="mt-1 text-2xl font-semibold">{evidence.length}</div>
              </div>
              <div className="rounded-lg border border-white/5 bg-white/[0.03] px-4 py-3">
                <div className="text-xs text-gray-500">Signals</div>
                <div className="mt-1 text-2xl font-semibold">{signals.length}</div>
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

        <section className="mt-6 grid gap-4 lg:grid-cols-[1fr_1.25fr]">
          <div className="rounded-lg border border-white/5 bg-white/[0.03] p-5">
            <div className="mb-4 flex items-center gap-2">
              <Globe2 className="h-4 w-4 text-sky-300" />
              <h2 className="text-sm font-semibold text-white">Observed Entities</h2>
            </div>
            <div className="grid gap-2">
              {targets.map((target) => (
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
                {topGaps.map((gap: any, index: number) => (
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
                {topPriorities.map((priority: any, index: number) => (
                  <div key={`${priority.priority}-${index}`} className="rounded-lg border border-white/5 bg-black/30 p-3">
                    <p className="text-sm text-gray-200">{priority.priority}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
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
                    {health.state || "unknown"} · {Math.round(health.success_rate || 0)}% · {Math.round(health.latency_ms || 0)}ms
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
