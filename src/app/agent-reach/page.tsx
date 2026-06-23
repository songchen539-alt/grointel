import { CheckCircle2, LockKeyhole, Network, ShieldCheck, Wrench, XCircle } from "lucide-react";
import { AgentReachConnector } from "../../../apps/grointel/reality/connectors/agent_reach_connector";

export const dynamic = "force-dynamic";

function stateClass(state: string) {
  if (state === "ok") return "border-emerald-400/20 bg-emerald-400/[0.06] text-emerald-200";
  if (state === "needs_auth" || state === "degraded") return "border-amber-400/20 bg-amber-400/[0.06] text-amber-200";
  return "border-red-400/20 bg-red-400/[0.06] text-red-200";
}

function StateIcon({ state }: { state: string }) {
  if (state === "ok") return <CheckCircle2 className="h-4 w-4" />;
  if (state === "needs_auth" || state === "degraded") return <Wrench className="h-4 w-4" />;
  return <XCircle className="h-4 w-4" />;
}

export default async function AgentReachPage() {
  const connector = new AgentReachConnector();
  const status = await connector.status();

  return (
    <div className="min-h-screen bg-black text-white">
      <section className="border-b border-white/5">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.06] px-3 py-1 text-xs text-emerald-200">
                <Network className="h-3.5 w-3.5" />
                Agent Reach information channel
              </div>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">Global Source Doctor</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-400">
                GroIntel routes each source through a primary path, fallback path, and last-resort semantic search. Cookies stay in local browser/session tools; GroIntel only receives normalized evidence.
              </p>
            </div>
            <div className={`rounded-lg border px-4 py-3 text-sm ${stateClass(status.ready ? "ok" : "degraded")}`}>
              <div className="flex items-center gap-2">
                <StateIcon state={status.ready ? "ok" : "degraded"} />
                {status.ready ? "Core installer reachable" : "Core installer needs attention"}
              </div>
              <p className="mt-1 text-xs opacity-80">{status.checkedAt ? `Checked ${new Date(status.checkedAt).toLocaleString()}` : "Not checked yet"}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-white/5 bg-white/[0.03] p-5">
            <div className="flex items-center gap-2 text-emerald-200">
              <ShieldCheck className="h-4 w-4" />
              <h2 className="text-sm font-semibold">Privacy Boundary</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-gray-400">Cookies are read only by local upstream tools such as OpenCLI, twitter-cli, rdt-cli, or local MCP servers. They are not uploaded to GroIntel.</p>
          </div>
          <div className="rounded-lg border border-white/5 bg-white/[0.03] p-5">
            <div className="flex items-center gap-2 text-sky-200">
              <Network className="h-4 w-4" />
              <h2 className="text-sm font-semibold">Automatic Routing</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-gray-400">If the primary source path fails, GroIntel tries the fallback path and then Exa domain search before giving up.</p>
          </div>
          <div className="rounded-lg border border-white/5 bg-white/[0.03] p-5">
            <div className="flex items-center gap-2 text-amber-200">
              <LockKeyhole className="h-4 w-4" />
              <h2 className="text-sm font-semibold">User-Ready Surface</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-gray-400">Users interact with GroIntel. Agent Reach remains the free, open information channel behind the scenes.</p>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-white/5 bg-white/[0.03] p-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-sm font-semibold">Source Routes</h2>
            <span className="text-xs text-gray-500">{status.channels.length} sources have at least one working path</span>
          </div>
          <div className="mt-4 overflow-hidden rounded-lg border border-white/5">
            <div className="grid grid-cols-[1fr_1fr_1.5fr_1fr] bg-white/[0.04] px-4 py-3 text-xs text-gray-500">
              <span>Source</span>
              <span>State</span>
              <span>Active / fallback routes</span>
              <span>Privacy</span>
            </div>
            {status.doctor.map((platform) => (
              <div key={platform.id} className="border-t border-white/5 px-4 py-4">
                <div className="grid gap-3 lg:grid-cols-[1fr_1fr_1.5fr_1fr] lg:items-start">
                  <div>
                    <p className="text-sm font-medium">{platform.label}</p>
                    <p className="mt-1 text-xs text-gray-500">active route: {platform.activeRoute || "none"}</p>
                  </div>
                  <div>
                    <span className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs ${stateClass(platform.state)}`}>
                      <StateIcon state={platform.state} />
                      {platform.state}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {platform.routes.map((route) => (
                      <div key={route.id} className="rounded-md bg-black/30 px-3 py-2">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="text-gray-300">{route.label}</span>
                          <span className={`rounded-full border px-2 py-0.5 ${stateClass(route.state)}`}>{route.state}</span>
                          <span className="text-gray-600">{route.tier}</span>
                        </div>
                        {route.state !== "ok" && <p className="mt-1 truncate text-xs text-gray-600">{route.detail}</p>}
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2 text-xs text-gray-400">
                    {platform.routes.map((route) => (
                      <div key={`${route.id}-privacy`} className="rounded-md bg-black/30 px-3 py-2">
                        {route.privacy.replace("_", " ")}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
