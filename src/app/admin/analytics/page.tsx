/* eslint-disable @typescript-eslint/no-explicit-any */
import { cookies } from "next/headers";
import Link from "next/link";
import { AlertTriangle, Users, Target, DollarSign, CheckCircle, Eye, Clock, XCircle, Activity, TrendingUp, BarChart3, Globe, Building2, Award, Zap, ArrowUp, ArrowRight } from "lucide-react";
import AdminNav from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

async function sbGet(path: string) {
  try {
    const res = await fetch(supabaseUrl + path, {
      headers: { "apikey": serviceKey, "Authorization": "Bearer " + serviceKey, "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

async function ensureAdmin() {
  const store = await cookies();
  return store.get("grointel_admin_session")?.value === "true";
}

export default async function AdminAnalyticsPage() {
  if (!(await ensureAdmin())) {
    return (
      <div className="mx-auto max-w-sm px-6 py-24 text-center">
        <AlertTriangle className="mx-auto h-10 w-10 text-amber-500" />
        <h1 className="mt-4 text-lg font-semibold text-white">Access Denied</h1>
        <Link href="/admin/leads" className="mt-6 text-xs text-blue-400">Go to Login</Link>
      </div>
    );
  }

  // Fetch all data in parallel
  const [needs, matches, quotes, channels, events, channelEvents, services] = await Promise.all([
    sbGet("/rest/v1/company_growth_needs?select=*&order=created_at.desc"),
    sbGet("/rest/v1/growth_matches?select=*&order=created_at.desc"),
    sbGet("/rest/v1/growth_quotes?select=*&order=created_at.desc"),
    sbGet("/rest/v1/growth_channels?select=channel_name,id,category,region"),
    sbGet("/rest/v1/report_events?select=*&order=created_at.desc&limit=50"),
    sbGet("/rest/v1/channel_opportunity_events?select=*&order=created_at.desc&limit=50"),
    sbGet("/rest/v1/channel_services?select=id,channel_id,service_name,service_type,starting_price,max_price"),
  ]);

  const needsList = needs || [];
  const matchesList = matches || [];
  const quotesList = quotes || [];
  const channelsList = channels || [];
  const eventsList = events || [];
  const chEventsList = channelEvents || [];
  const servicesList = services || [];

  // === PART 1: KPI Cards ===
  const totalCompanies = new Set(needsList.map((n: any) => n.company_name)).size;
  const totalNeeds = needsList.length;
  const activeMatches = matchesList.filter((m: any) => !["won", "lost", "channel_declined"].includes(m.status)).length;
  const quotesSent = quotesList.length;
  const quotesAccepted = quotesList.filter((q: any) => q.status === "accepted").length;
  const introsRequested = eventsList.filter((e: any) => e.event_type === "growth_intro_requested").length;
  const completed = matchesList.filter((m: any) => ["won", "lost"].includes(m.status)).length;
  const openOpps = matchesList.filter((m: any) => m.status === "draft" || m.status === "proposed_to_channel").length;

  const kpis = [
    { label: "Companies", value: totalCompanies, icon: Building2, color: "text-blue-400", bg: "bg-blue-500/[0.06]" },
    { label: "Growth Needs", value: totalNeeds, icon: Users, color: "text-emerald-400", bg: "bg-emerald-500/[0.06]" },
    { label: "Active Matches", value: activeMatches, icon: Target, color: "text-purple-400", bg: "bg-purple-500/[0.06]" },
    { label: "Quotes Sent", value: quotesSent, icon: DollarSign, color: "text-cyan-400", bg: "bg-cyan-500/[0.06]" },
    { label: "Quotes Accepted", value: quotesAccepted, icon: CheckCircle, color: "text-teal-400", bg: "bg-teal-500/[0.06]" },
    { label: "Intros Requested", value: introsRequested, icon: Eye, color: "text-amber-400", bg: "bg-amber-500/[0.06]" },
    { label: "Completed", value: completed, icon: Activity, color: "text-indigo-400", bg: "bg-indigo-500/[0.06]" },
    { label: "Open Opps", value: openOpps, icon: Clock, color: "text-rose-400", bg: "bg-rose-500/[0.06]" },
  ];

  // === PART 2: Funnel ===
  interface FunnelItem { label: string; count: number; conversion?: string; dropoff?: string; }
const funnelSteps: FunnelItem[] = [
    { label: "Growth Need", count: totalNeeds },
    { label: "Matched", count: matchesList.length },
    { label: "Quote Created", count: quotesSent },
    { label: "Shared with Company", count: quotesList.filter((q: any) => ["shared_with_company", "accepted"].includes(q.status)).length },
    { label: "Viewed (Curated)", count: eventsList.filter((e: any) => e.event_type === "curated_options_viewed").length },
    { label: "Accepted", count: quotesAccepted },
    { label: "Intro Requested", count: introsRequested },
    { label: "Working", count: matchesList.filter((m: any) => ["intro_made", "intro_scheduled", "channel_accepted"].includes(m.status)).length },
    { label: "Won", count: matchesList.filter((m: any) => m.status === "won").length },
  ];

  for (let i = 0; i < funnelSteps.length; i++) {
    const prev = funnelSteps[i - 1]?.count || totalNeeds;
    const cur = funnelSteps[i].count;
    funnelSteps[i].conversion = prev > 0 ? ((cur / prev) * 100).toFixed(1) + "%" : "0%";
    funnelSteps[i].dropoff = prev > 0 ? (((prev - cur) / prev) * 100).toFixed(1) + "%" : "0%";
  }

  // === PART 3: Channel Performance ===
  const channelPerf = channelsList.map((ch: any) => {
    const chMatches = matchesList.filter((m: any) => m.channel_id === ch.id);
    const chAccepted = chMatches.filter((m: any) => m.status === "channel_accepted" || m.status === "won" || m.status === "intro_made" || m.status === "intro_scheduled").length;
    const chDeclined = chMatches.filter((m: any) => m.status === "channel_declined").length;
    const chWorking = chMatches.filter((m: any) => ["intro_made", "intro_scheduled", "channel_accepted"].includes(m.status)).length;
    const chWon = chMatches.filter((m: any) => m.status === "won").length;
    return { name: ch.channel_name, assigned: chMatches.length, accepted: chAccepted, declined: chDeclined, working: chWorking, won: chWon };
  });
  channelPerf.sort((a: any, b: any) => (b.assigned > 0 ? b.accepted / b.assigned : 0) - (a.assigned > 0 ? a.accepted / a.assigned : 0));

  // === PART 4: Service Performance ===
  const servicePerf = servicesList.map((sv: any) => {
    const svMatches = matchesList.filter((m: any) => m.service_id === sv.id);
    const svQuotes = quotesList.filter((q: any) => {
      const m = matchesList.find((m: any) => m.id === q.match_id);
      return m && m.service_id === sv.id;
    });
    const svWon = svMatches.filter((m: any) => m.status === "won").length;
    return { name: sv.service_name, channels: 1, matches: svMatches.length, quotes: svQuotes.length, won: svWon };
  });
  servicePerf.sort((a: any, b: any) => b.matches - a.matches);

  // === PART 7: Insights ===
  const bestChannel = channelPerf.length > 0 ? channelPerf.reduce((a: any, b: any) => a.accepted > b.accepted ? a : b) : null;
  const highestAccept = channelPerf.filter((c: any) => c.assigned > 0).sort((a: any, b: any) => (b.accepted / b.assigned) - (a.accepted / a.assigned))[0];
  const highestWin = channelPerf.filter((c: any) => c.assigned > 0).sort((a: any, b: any) => (b.won / b.assigned) - (a.won / a.assigned))[0];
  const largestOpp = needsList.length > 0 ? needsList.reduce((a: any, b: any) => (a.budget_max || 0) > (b.budget_max || 0) ? a : b) : null;

  // === PART 5: Activity feed ===
  const activityFeed: any[] = [];
  for (const e of eventsList) {
    const need = needsList.find((n: any) => n.id === e.report_id || n.report_id === e.report_id);
    activityFeed.push({ time: e.created_at, company: need?.company_name || "-", event: e.event_type, match: "", quote: "", status: "", source: "report_events" });
  }
  for (const e of chEventsList) {
    const match = matchesList.find((m: any) => m.id === e.match_id);
    const need = match ? needsList.find((n: any) => n.id === match.company_growth_need_id) : null;
    activityFeed.push({ time: e.created_at, company: need?.company_name || "-", event: e.event_type, match: e.match_id?.slice(0, 8), quote: "", status: "", source: "channel_events" });
  }
  activityFeed.sort((a: any, b: any) => new Date(b.time).getTime() - new Date(a.time).getTime());

  // === PART 6: Pipeline ===
  const pipelineColumns = ["draft", "proposed_to_channel", "quoted", "company_interested", "channel_accepted", "intro_made", "won", "lost"];
  const pipelineLabels: Record<string, string> = { draft: "New", proposed_to_channel: "Matched", quoted: "Quote Shared", company_interested: "Company Interested", channel_accepted: "Channel Accepted", intro_made: "Working", won: "Won", lost: "Lost" };
  const pipeline: Record<string, any[]> = {};
  for (const col of pipelineColumns) pipeline[col] = matchesList.filter((m: any) => m.status === col);

  // === PART 9: Simple charts (bar/dot representations) ===
  function Bar({ val, max, color }: { val: number; max: number; color: string }) {
    const pct = max > 0 ? (val / max) * 100 : 0;
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 rounded-full bg-white/[0.06]">
          <div className={"h-full rounded-full " + color} style={{ width: pct + "%" }} />
        </div>
        <span className="text-xs text-gray-500 w-8 text-right">{val}</span>
      </div>
    );
  }

  const maxFunnel = Math.max(...funnelSteps.map((s) => s.count), 1);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <AdminNav />
      <div className="mb-8">
        <h1 className="text-xl font-bold text-white">Marketplace Analytics</h1>
        <p className="text-xs text-gray-500 mt-1">Operational visibility across the entire growth marketplace.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {kpis.map((kpi) => (
          <div key={kpi.label} className={"rounded-xl border border-white/5 " + kpi.bg + " p-4"}>
            <div className="flex items-center gap-2 mb-1">
              <kpi.icon className={"h-4 w-4 " + kpi.color} />
              <span className="text-[10px] uppercase tracking-wider text-gray-500">{kpi.label}</span>
            </div>
            <p className={"text-2xl font-bold " + kpi.color}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Funnel */}
      <section className="mb-10">
        <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-blue-400" /> Marketplace Funnel</h2>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <div className="space-y-3">
            {funnelSteps.map((step, i) => (
              <div key={i} className="grid grid-cols-[180px_1fr_60px_60px] gap-3 items-center text-xs">
                <span className="text-gray-400">{step.label}</span>
                <div className="h-3 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full rounded-full bg-blue-500/50" style={{ width: (step.count / maxFunnel * 100) + "%" }} />
                </div>
                <span className="text-white font-medium">{step.count}</span>
                <span className="text-gray-600">{step.conversion}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Channel Performance */}
      <section className="mb-10">
        <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><BarChart3 className="h-4 w-4 text-purple-400" /> Channel Performance</h2>
        <div className="overflow-x-auto rounded-xl border border-white/5 bg-white/[0.02]">
          <table className="w-full text-left text-xs">
            <thead><tr className="border-b border-white/5">
              {["Channel", "Assigned", "Accepted", "Declined", "Working", "Won"].map((h) => (
                <th key={h} className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-500">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {channelPerf.slice(0, 20).map((ch: any, i: number) => (
                <tr key={i} className="border-b border-white/[0.02]">
                  <td className="px-4 py-3 text-white">{ch.name}</td>
                  <td className="px-4 py-3 text-gray-300">{ch.assigned}</td>
                  <td className="px-4 py-3 text-emerald-400">{ch.accepted}</td>
                  <td className="px-4 py-3 text-red-400">{ch.declined}</td>
                  <td className="px-4 py-3 text-blue-400">{ch.working}</td>
                  <td className="px-4 py-3 text-green-400">{ch.won}</td>
                </tr>
              ))}
              {channelPerf.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-500">No channel data yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Pipeline Kanban */}
      <section className="mb-10">
        <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Activity className="h-4 w-4 text-orange-400" /> Opportunity Pipeline</h2>
        <div className="overflow-x-auto">
          <div className="flex gap-3 min-w-max pb-2">
            {pipelineColumns.map((col) => (
              <div key={col} className="w-48 shrink-0 rounded-xl border border-white/5 bg-white/[0.02] p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">{pipelineLabels[col]}</span>
                  <span className="text-[10px] text-gray-600">{pipeline[col]?.length || 0}</span>
                </div>
                {(pipeline[col] || []).slice(0, 5).map((m: any) => {
                  const nd = needsList.find((n: any) => n.id === m.company_growth_need_id);
                  return (
                    <div key={m.id} className="rounded-lg bg-white/[0.03] px-2.5 py-2 mb-1.5 text-[10px]">
                      <p className="text-white font-medium truncate">{nd?.company_name || "?"}</p>
                      <p className="text-gray-500 truncate">{nd?.target_market || "?"} | {nd?.currency}{nd?.budget_min || "?"}</p>
                    </div>
                  );
                })}
                {(pipeline[col] || []).length > 5 && (
                  <p className="text-[10px] text-gray-600 text-center mt-1">+{(pipeline[col] || []).length - 5} more</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Performance */}
      <section className="mb-10">
        <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Zap className="h-4 w-4 text-emerald-400" /> Service Performance</h2>
        <div className="overflow-x-auto rounded-xl border border-white/5 bg-white/[0.02]">
          <table className="w-full text-left text-xs">
            <thead><tr className="border-b border-white/5">
              {["Service", "Matches", "Quotes", "Won", "Conv. Rate"].map((h) => (
                <th key={h} className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-500">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {servicePerf.slice(0, 20).map((sv: any, i: number) => (
                <tr key={i} className="border-b border-white/[0.02]">
                  <td className="px-4 py-3 text-white">{sv.name}</td>
                  <td className="px-4 py-3 text-gray-300">{sv.matches}</td>
                  <td className="px-4 py-3 text-amber-400">{sv.quotes}</td>
                  <td className="px-4 py-3 text-green-400">{sv.won}</td>
                  <td className="px-4 py-3 text-cyan-400">{sv.matches > 0 ? ((sv.won / sv.matches) * 100).toFixed(0) + "%" : "-"}</td>
                </tr>
              ))}
              {servicePerf.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-500">No service data yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Insights */}
      <section className="mb-10">
        <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Award className="h-4 w-4 text-amber-400" /> Admin Insights</h2>
        <div className="grid md:grid-cols-4 gap-3">
          <InsightCard label="Top Channel" value={highestAccept?.name || "-"} icon={Award} detail={"Acceptance: " + (highestAccept && highestAccept.assigned > 0 ? ((highestAccept.accepted / highestAccept.assigned) * 100).toFixed(0) + "%" : "N/A")} />
          <InsightCard label="Highest Win Rate" value={highestWin?.name || "-"} icon={TrendingUp} detail={highestWin && highestWin.assigned > 0 ? ((highestWin.won / highestWin.assigned) * 100).toFixed(0) + "% win rate" : "N/A"} />
          <InsightCard label="Largest Opp" value={largestOpp?.company_name || "-"} icon={DollarSign} detail={largestOpp ? largestOpp.currency + " " + (largestOpp.budget_max || "?") : "N/A"} />
          <InsightCard label="Total Channels" value={channelsList.length.toString()} icon={Globe} detail={channelsList.filter((c: any) => c.category === "agency").length + " agencies"} />
        </div>
      </section>

      {/* Activity Feed */}
      <section className="mb-10">
        <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Activity className="h-4 w-4 text-cyan-400" /> Recent Marketplace Activity</h2>
        <div className="overflow-x-auto rounded-xl border border-white/5 bg-white/[0.02]">
          <table className="w-full text-left text-xs">
            <thead><tr className="border-b border-white/5">
              {["Time", "Company", "Event", "Source"].map((h) => (
                <th key={h} className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-500">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {activityFeed.slice(0, 30).map((a: any, i: number) => (
                <tr key={i} className="border-b border-white/[0.02]">
                  <td className="px-4 py-3 text-gray-500 text-[10px]">{a.time ? new Date(a.time).toLocaleString() : "-"}</td>
                  <td className="px-4 py-3 text-white">{a.company}</td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300">{a.event}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{a.source}</td>
                </tr>
              ))}
              {activityFeed.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-500">No activity yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Simple Charts */}
      <section className="grid md:grid-cols-2 gap-6 mb-10">
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <h3 className="text-xs font-semibold text-white mb-3 flex items-center gap-2"><Globe className="h-3.5 w-3.5 text-indigo-400" /> Top Industries</h3>
          {Object.entries(groupBy(needsList, "target_market")).slice(0, 5).map(([industry, items]: [string, any]) => (
            <Bar key={industry} val={items.length} max={totalNeeds} color="bg-indigo-500" />
          ))}
          {needsList.length === 0 && <p className="text-xs text-gray-500">No data.</p>}
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <h3 className="text-xs font-semibold text-white mb-3 flex items-center gap-2"><Target className="h-3.5 w-3.5 text-emerald-400" /> Top Regions</h3>
          {Object.entries(groupBy(needsList, "target_market")).slice(0, 5).map(([region, items]: [string, any]) => (
            <Bar key={region} val={items.length} max={totalNeeds} color="bg-emerald-500" />
          ))}
          {needsList.length === 0 && <p className="text-xs text-gray-500">No data.</p>}
        </div>
      </section>
    </div>
  );
}

function InsightCard({ label, value, icon: Icon, detail }: { label: string; value: string; icon: any; detail: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
      <Icon className="h-4 w-4 text-amber-400 mb-2" />
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-semibold text-white mt-0.5">{value}</p>
      <p className="text-[10px] text-gray-600 mt-1">{detail}</p>
    </div>
  );
}

function groupBy(arr: any[], key: string): Record<string, any[]> {
  const result: Record<string, any[]> = {};
  for (const item of arr) {
    const k = item[key] || "Unknown";
    if (!result[k]) result[k] = [];
    result[k].push(item);
  }
  return result;
}
