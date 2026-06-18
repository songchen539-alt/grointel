import Link from "next/link";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { AlertTriangle, ArrowLeft, Clock, ExternalLink, User, Building2, Globe, Target, DollarSign, Calendar, CheckCircle, XCircle, Hourglass, Loader2 } from "lucide-react";
import AdminNav from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";

interface Match {
  id: string;
  company_growth_need_id: string;
  channel_id: string;
  service_id: string;
  match_score: number;
  recommended_solution_type: string;
  match_reason: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Quote {
  id: string;
  match_id: string;
  quote_title: string;
  quote_amount: number;
  currency: string;
  timeline: string;
  deliverables: string;
  expected_growth_outcome: string;
  success_metrics: string;
  proposal_message: string;
  status: string;
}

interface CompanyNeed {
  id: string;
  company_name: string;
  website: string;
  growth_goal: string;
  target_market: string;
  target_customer: string;
  current_challenge: string;
  budget_min: number;
  budget_max: number;
  currency: string;
  timeline: string;
  status: string;
}

interface Service {
  id: string;
  service_name: string;
  service_type: string;
  starting_price: number;
  max_price: number;
  currency: string;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

async function sbFetch(path: string) {
  const res = await fetch(supabaseUrl + path, {
    headers: { "apikey": serviceKey, "Authorization": "Bearer " + serviceKey, "Content-Type": "application/json" },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

async function fetchChannelData(channelId: string) {
  // Fetch all matches for this channel
  const allMatches = await sbFetch("/rest/v1/growth_matches?select=*&channel_id=eq." + encodeURIComponent(channelId) + "&order=created_at.desc");
  if (!allMatches) return null;
  const matches: Match[] = allMatches;

  // Fetch related data
  const needIds = [...new Set(matches.map((m) => m.company_growth_need_id).filter(Boolean))];
  const quoteMatchIds = matches.map((m) => m.id);
  
  // Fetch needs
  const needs: CompanyNeed[] = [];
  for (const nid of needIds) {
    const data = await sbFetch("/rest/v1/company_growth_needs?select=*&id=eq." + encodeURIComponent(nid));
    if (data && data.length > 0) needs.push(data[0]);
  }

  // Fetch quotes for these matches
  const allQuotes = await sbFetch("/rest/v1/growth_quotes?select=*&channel_id=eq." + encodeURIComponent(channelId) + "&order=created_at.desc");
  const quotes: Quote[] = allQuotes || [];

  // Fetch services
  const allServices = await sbFetch("/rest/v1/channel_services?select=*&channel_id=eq." + encodeURIComponent(channelId));
  const services: Service[] = allServices || [];

  return { matches, needs, quotes, services };
}

function needForMatch(match: Match, needs: CompanyNeed[]): CompanyNeed | undefined {
  return needs.find((n) => n.id === match.company_growth_need_id);
}

function quoteForMatch(match: Match, quotes: Quote[]): Quote | undefined {
  return quotes.find((q) => q.match_id === match.id);
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    draft: "bg-gray-500/10 text-gray-400",
    proposed_to_channel: "bg-blue-500/10 text-blue-300",
    channel_interested: "bg-purple-500/10 text-purple-300",
    quoted: "bg-amber-500/10 text-amber-300",
    proposed_to_company: "bg-indigo-500/10 text-indigo-300",
    company_interested: "bg-cyan-500/10 text-cyan-300",
    intro_made: "bg-emerald-500/10 text-emerald-300",
    won: "bg-green-500/10 text-green-300",
    lost: "bg-red-500/10 text-red-300",
  };
  return (
    <span className={"text-[10px] font-medium px-2 py-0.5 rounded " + (colors[status] || "bg-gray-500/10 text-gray-400")}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

export default async function ChannelPage({ searchParams }: { searchParams: Promise<{ channelId?: string }> }) {
  const { channelId } = await searchParams;

  if (!channelId) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <AlertTriangle className="mx-auto h-10 w-10 text-gray-600" />
        <h1 className="mt-4 text-lg font-semibold text-white">Channel Access</h1>
        <p className="mt-2 text-sm text-gray-500">No channel ID provided. Use the link shared by GroIntel.</p>
      </div>
    );
  }

  // Fetch channel info
  const channelData = await sbFetch("/rest/v1/growth_channels?select=channel_name,id&id=eq." + encodeURIComponent(channelId));
  const channel = channelData?.[0];
  if (!channel) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <AlertTriangle className="mx-auto h-10 w-10 text-gray-600" />
        <h1 className="mt-4 text-lg font-semibold text-white">Channel Not Found</h1>
        <p className="mt-2 text-sm text-gray-500">Invalid channel ID.</p>
      </div>
    );
  }

  const data = await fetchChannelData(channelId);
  if (!data) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-24 text-center">
        <AlertTriangle className="mx-auto h-10 w-10 text-amber-500" />
        <p className="mt-3 text-sm text-gray-400">Could not load channel data.</p>
      </div>
    );
  }

  const { matches, needs, quotes, services } = data;

  // Metrics
  const openCount = matches.filter((m) => ["draft", "proposed_to_channel"].includes(m.status)).length;
  const waitingIntro = matches.filter((m) => ["quoted", "proposed_to_company", "company_interested"].includes(m.status)).length;
  const working = matches.filter((m) => m.status === "intro_made").length;
  const won = matches.filter((m) => m.status === "won").length;
  const lost = matches.filter((m) => m.status === "lost").length;

  const metrics = [
    { label: "Open Opportunities", value: openCount, icon: Hourglass, color: "text-blue-400", bg: "bg-blue-500/[0.06]" },
    { label: "Waiting Intro", value: waitingIntro, icon: Clock, color: "text-amber-400", bg: "bg-amber-500/[0.06]" },
    { label: "Working", value: working, icon: Loader2, color: "text-purple-400", bg: "bg-purple-500/[0.06]" },
    { label: "Won", value: won, icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/[0.06]" },
    { label: "Lost", value: lost, icon: XCircle, color: "text-red-400", bg: "bg-red-500/[0.06]" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-white">{channel.channel_name}</h1>
        <p className="text-xs text-gray-500 mt-1">Growth Partner Dashboard</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
        {metrics.map((m) => (
          <div key={m.label} className={"rounded-xl border border-white/5 " + m.bg + " p-4"}>
            <div className="flex items-center gap-2 mb-2">
              <m.icon className={"h-4 w-4 " + m.color} />
              <span className="text-[10px] uppercase tracking-wider text-gray-500">{m.label}</span>
            </div>
            <p className={"text-2xl font-bold " + m.color}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <RecentActivitySection matches={matches} needs={needs} />

      {/* My Opportunities */}
      <section>
        <h2 className="text-sm font-semibold text-white mb-4">My Opportunities</h2>
        {matches.length === 0 ? (
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-8 text-center">
            <Target className="mx-auto h-8 w-8 text-gray-600" />
            <p className="mt-2 text-sm text-gray-500">No opportunities yet. GroIntel will match you when relevant company needs come in.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {matches.map((match) => {
              const need = needForMatch(match, needs);
              const quote = quoteForMatch(match, quotes);
              const budget = need ? `${need.currency || "USD"} ${need.budget_min || "?"} - ${need.budget_max || "?"}` : "";
              return (
                <Link key={match.id} href={"/channel/opportunity/" + match.id + "?channelId=" + channelId}
                  className="rounded-xl border border-white/5 bg-white/[0.02] p-5 hover:border-white/10 transition-all block">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-semibold text-white">{need?.company_name || "Unknown Company"}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{need?.growth_goal?.slice(0, 80) || "Growth opportunity"}</p>
                    </div>
                    <StatusBadge status={match.status} />
                  </div>
                  <div className="flex flex-wrap gap-3 text-[10px] text-gray-500">
                    {need?.target_market && <span className="flex items-center gap-1"><Globe className="h-3 w-3" />{need.target_market}</span>}
                    {need?.target_customer && <span className="flex items-center gap-1"><User className="h-3 w-3" />{need.target_customer}</span>}
                    {budget && <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />{budget}</span>}
                    {match.recommended_solution_type && <span className="flex items-center gap-1"><Target className="h-3 w-3" />{match.recommended_solution_type}</span>}
                  </div>
                  {quote && <p className="mt-2 text-[10px] text-blue-400">{quote.quote_title}</p>}
                  <div className="mt-2 text-[10px] text-gray-600">
                    Created: {new Date(match.created_at).toLocaleDateString()}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function RecentActivitySection({ matches, needs }: { matches: Match[]; needs: CompanyNeed[] }) {
  // Create timeline from match statuses
  const recent = matches.slice(0, 10);
  if (recent.length === 0) return null;

  return (
    <section className="mb-10">
      <h2 className="text-sm font-semibold text-white mb-4">Recent Activity</h2>
      <div className="space-y-2">
        {recent.map((match) => {
          const need = needs.find((n) => n.id === match.company_growth_need_id);
          return (
            <Link key={match.id} href={"/channel/opportunity/" + match.id + "?channelId=" + match.channel_id}
              className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 hover:bg-white/[0.04] transition-colors">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 shrink-0">
                <Activity className="h-4 w-4 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white truncate">{need?.company_name || "Company"}</p>
                <p className="text-[10px] text-gray-500">Status updated to {match.status.replace(/_/g, " ")}</p>
              </div>
              <StatusBadge status={match.status} />
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function Activity(props: any) { return null; }
