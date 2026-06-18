import { cookies } from "next/headers";
import Link from "next/link";
import { AlertTriangle, Database, BarChart3, Users, Eye, MousePointerClick, Activity, TrendingUp, UserPlus, Target, FileText, Mail, Globe } from "lucide-react";
import AdminNav from "@/components/admin/AdminNav";
import { adminQuery, adminQueryCount } from "@/lib/admin/supabaseQueries";

export const dynamic = "force-dynamic";

async function ensureAuthorized() {
  const store = await cookies();
  const session = store.get("grointel_admin_session");
  if (session?.value !== "true") {
    return false;
  }
  return true;
}

interface Lead {
  id: string;
  name: string;
  email: string;
  company_website: string;
  target_market: string;
  created_at?: string;
}

interface ReportEvent {
  report_id: string;
  event_type: string;
}

interface Prospect {
  id: string;
  company_name: string;
  report_id: string;
  status: string;
  created_at: string;
}

async function safeCount(table: string): Promise<number> {
  try {
    const c = await adminQueryCount(table);
    return c ?? 0;
  } catch {
    return 0;
  }
}

async function safeQuery<T>(table: string, select: string, opts?: Record<string, unknown>): Promise<T[] | null> {
  try {
    return await adminQuery<T>(table, select, opts || {});
  } catch {
    return null;
  }
}

export default async function AdminDashboardPage() {
  const auth = await ensureAuthorized();
  if (!auth) {
    return (
      <div className="mx-auto max-w-sm px-6 py-24 text-center">
        <AlertTriangle className="mx-auto h-10 w-10 text-amber-500" />
        <h1 className="mt-4 text-lg font-semibold text-white">Access Denied</h1>
        <p className="mt-2 text-xs text-gray-500">Please sign in to access the dashboard.</p>
        <Link href="/admin/leads" className="mt-6 inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300">Go to Login</Link>
      </div>
    );
  }

  const [reportsCount, leadsCount, events, recentLeads, prospects, allProspects, growthNeedsCount, growthChannelsCount, channelServicesCount, matchesCount] = await Promise.all([
    safeCount("company_mri_reports"),
    safeCount("leads"),
    safeQuery<ReportEvent>("report_events", "event_type,report_id", { limit: 10000 }),
    safeQuery<Lead>("leads", "id,name,email,company_website,target_market,created_at", { order: "created_at.desc", limit: 5 }),
    safeQuery<Prospect>("prospects", "id,company_name,report_id,status", { limit: 10000 }),
    safeQuery<Prospect>("prospects", "id,company_name,status,created_at", { order: "created_at.desc", limit: 5 }),
    safeCount("company_growth_needs"),
    safeCount("growth_channels"),
    safeCount("channel_services"),
    safeCount("growth_matches"),
  ]);

  let reportViews = 0;
  let ctaClicks = 0;
  let generatedEvents = 0;
  if (events) {
    reportViews = events.filter((e) => e.event_type === "report_viewed").length;
    ctaClicks = events.filter((e) => e.event_type === "cta_clicked").length;
    generatedEvents = events.filter((e) => e.event_type === "generated").length;
  }

  const totalReports = reportsCount;
  const totalLeads = leadsCount;
  const totalGrowthNeeds = growthNeedsCount ?? 0;
  const totalGrowthChannels = growthChannelsCount ?? 0;
  const totalChannelServices = channelServicesCount ?? 0;
  const totalMatches = matchesCount ?? 0;
  const conversionRate = totalReports > 0
    ? ((totalLeads / totalReports) * 100).toFixed(1) + "%"
    : "0.0%";

  // Prospect KPIs
  const totalProspects = prospects ? prospects.length : 0;
  const aPriorityProspects = 0; // Can't query by priority without count endpoint, fetch all and filter
  const reportsGenerated = prospects ? prospects.filter((p) => p.report_id).length : 0;
  const openedProspects = prospects ? prospects.filter((p) => p.status === "opened").length : 0;
  const ctaClickedProspects = prospects ? prospects.filter((p) => p.status === "clicked_cta").length : 0;
  const repliedProspects = prospects ? prospects.filter((p) => p.status === "replied").length : 0;

  const kpis = [
    { label: "Total Reports", value: totalReports, icon: Database, color: "text-blue-400", bg: "bg-blue-500/[0.06]" },
    { label: "Total Leads", value: totalLeads, icon: Users, color: "text-emerald-400", bg: "bg-emerald-500/[0.06]" },
    { label: "Total Prospects", value: totalProspects, icon: UserPlus, color: "text-indigo-400", bg: "bg-indigo-500/[0.06]" },
    { label: "Reports Generated", value: reportsGenerated, icon: FileText, color: "text-cyan-400", bg: "bg-cyan-500/[0.06]" },
    { label: "Opened", value: openedProspects, icon: Eye, color: "text-purple-400", bg: "bg-purple-500/[0.06]" },
    { label: "CTA Clicked", value: ctaClickedProspects, icon: MousePointerClick, color: "text-amber-400", bg: "bg-amber-500/[0.06]" },
    { label: "Replied", value: repliedProspects, icon: Mail, color: "text-emerald-400", bg: "bg-emerald-500/[0.06]" },
    { label: "Lead Conv. Rate", value: conversionRate, icon: TrendingUp, color: "text-rose-400", bg: "bg-rose-500/[0.06]" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <AdminNav />

      <div className="mb-8">
        <h1 className="text-xl font-bold text-white">GroIntel Admin Dashboard</h1>
        <p className="text-xs text-gray-500 mt-1">Lead intelligence, report performance, and growth signals.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {kpis.map((kpi) => (
          <div key={kpi.label} className={`rounded-xl border border-white/5 ${kpi.bg} p-4`}>
            <div className="flex items-center gap-2 mb-2">
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              <span className="text-[10px] uppercase tracking-wider text-gray-500">{kpi.label}</span>
            </div>
            <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Marketplace KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
        {[
          { label: "Growth Needs", value: totalGrowthNeeds, icon: BarChart3, color: "text-cyan-400", bg: "bg-cyan-500/[0.06]" },
          { label: "Growth Channels", value: totalGrowthChannels, icon: Globe, color: "text-indigo-400", bg: "bg-indigo-500/[0.06]" },
          { label: "Channel Services", value: totalChannelServices, icon: Target, color: "text-teal-400", bg: "bg-teal-500/[0.06]" },
          { label: "Total Matches", value: totalMatches, icon: Activity, color: "text-orange-400", bg: "bg-orange-500/[0.06]" },
          { label: "Lead Conv. Rate", value: conversionRate, icon: TrendingUp, color: "text-rose-400", bg: "bg-rose-500/[0.06]" },
        ].map((kpi) => (
          <div key={kpi.label} className={"rounded-xl border border-white/5 " + kpi.bg + " p-4"}>
            <div className="flex items-center gap-2 mb-2">
              <kpi.icon className={"h-4 w-4 " + kpi.color} />
              <span className="text-[10px] uppercase tracking-wider text-gray-500">{kpi.label}</span>
            </div>
            <p className={"text-2xl font-bold " + kpi.color}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Recent + Prospects + Events */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Recent Prospects */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <h2 className="text-sm font-semibold text-white mb-3">Recent Prospects</h2>
          {allProspects && allProspects.length > 0 ? (
            <div className="space-y-2">
              {allProspects.slice(0, 5).map((p) => (
                <Link
                  key={p.id}
                  href={"/admin/prospects/" + p.id}
                  className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2 hover:bg-white/[0.04] transition-colors"
                >
                  <div>
                    <p className="text-xs text-white">{p.company_name}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      p.status === "new" ? "bg-blue-500/10 text-blue-300" :
                      p.status === "report_generated" ? "bg-purple-500/10 text-purple-300" :
                      p.status === "opened" ? "bg-cyan-500/10 text-cyan-300" :
                      p.status === "clicked_cta" ? "bg-indigo-500/10 text-indigo-300" :
                      p.status === "replied" ? "bg-emerald-500/10 text-emerald-300" :
                      "bg-gray-500/10 text-gray-400"
                    }`}>{p.status}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500">No prospects yet.</p>
          )}
        </div>

        {/* Recent Leads */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <h2 className="text-sm font-semibold text-white mb-3">Recent Leads</h2>
          {recentLeads && recentLeads.length > 0 ? (
            <div className="space-y-2">
              {recentLeads.map((lead) => (
                <Link
                  key={lead.id}
                  href={"/admin/leads/" + lead.id}
                  className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2 hover:bg-white/[0.04] transition-colors"
                >
                  <div>
                    <p className="text-xs text-white">{lead.name || lead.email}</p>
                    <p className="text-[10px] text-gray-500">{lead.email}</p>
                  </div>
                  <span className="text-[10px] text-gray-600">{lead.created_at ? new Date(lead.created_at).toLocaleDateString() : ""}</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500">No leads yet.</p>
          )}
        </div>

        {/* Recent Events */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <h2 className="text-sm font-semibold text-white mb-3">Recent Events</h2>
          {events && events.length > 0 ? (
            <div className="space-y-1.5">
              {events.slice(0, 10).map((evt, i) => (
                <Link
                  key={i}
                  href={"/admin/events?reportId=" + evt.report_id}
                  className="flex items-center gap-2 rounded-lg bg-white/[0.02] px-3 py-1.5 hover:bg-white/[0.04] transition-colors"
                >
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                    evt.event_type === "generated" ? "bg-blue-500/10 text-blue-300" :
                    evt.event_type === "report_viewed" ? "bg-purple-500/10 text-purple-300" :
                    evt.event_type === "cta_clicked" ? "bg-amber-500/10 text-amber-300" :
                    evt.event_type === "contact_submitted" ? "bg-emerald-500/10 text-emerald-300" :
                    "bg-gray-500/10 text-gray-400"
                  }`}>{evt.event_type}</span>
                  <span className="text-[10px] text-gray-500 truncate">{evt.report_id}</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500">No events yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
