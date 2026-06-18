import Link from "next/link";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { AlertTriangle, ArrowLeft, Building2, Globe, Target, DollarSign, Calendar, Clock, User, CheckCircle, XCircle, Hourglass, ExternalLink, ChevronDown, MessageSquare } from "lucide-react";

export const dynamic = "force-dynamic";

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
    <span className={"text-xs font-medium px-2.5 py-1 rounded " + (colors[status] || "bg-gray-500/10 text-gray-400")}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

function TimelineItem({ icon, label, date, active, last }: { icon: React.ReactNode; label: string; date?: string; active: boolean; last?: boolean }) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={"flex h-7 w-7 items-center justify-center rounded-full " + (active ? "bg-blue-500/20 text-blue-400" : "bg-gray-800 text-gray-600")}>
          {icon}
        </div>
        {!last && <div className="w-px flex-1 bg-white/[0.06] mt-1" />}
      </div>
      <div className={"pb-6 " + (active ? "" : "opacity-50")}>
        <p className={"text-xs " + (active ? "text-white" : "text-gray-500")}>{label}</p>
        {date && <p className="text-[10px] text-gray-600">{date}</p>}
      </div>
    </div>
  );
}

interface TimelineEvent {
  label: string;
  date?: string;
  key: string;
}

function buildTimeline(match: any, quote: any | null, need: any | null, channelId: string): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  if (need?.created_at) events.push({ label: "Need Created", date: new Date(need.created_at).toLocaleDateString(), key: "need_created" });
  if (match.created_at) events.push({ label: "Matched", date: new Date(match.created_at).toLocaleDateString(), key: "matched" });
  if (quote?.created_at) events.push({ label: "Quote Created", date: new Date(quote.created_at).toLocaleDateString(), key: "quote_created" });
  
  const statusOrder = ["proposed_to_channel", "channel_interested", "quoted", "proposed_to_company", "company_interested", "intro_made", "won", "lost"];
  const statusLabels: Record<string, string> = {
    proposed_to_channel: "Shared with Channel",
    channel_interested: "Channel Interested",
    quoted: "Quote Submitted",
    proposed_to_company: "Shared with Company",
    company_interested: "Company Accepted",
    intro_made: "Introduction Made",
    won: "Won",
    lost: "Lost",
  };

  for (const s of statusOrder) {
    const idx = statusOrder.indexOf(match.status);
    if (statusOrder.indexOf(s) <= idx) {
      events.push({ label: statusLabels[s], date: match.updated_at ? new Date(match.updated_at).toLocaleDateString() : undefined, key: s });
    }
  }

  return events;
}

export default async function ChannelOpportunityPage({ params, searchParams }: { params: Promise<{ matchId: string }>; searchParams: Promise<{ channelId?: string }> }) {
  const { matchId } = await params;
  const { channelId } = await searchParams;

  if (!channelId) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <AlertTriangle className="mx-auto h-10 w-10 text-gray-600" />
        <h1 className="mt-4 text-lg font-semibold text-white">Access Denied</h1>
        <p className="mt-2 text-sm text-gray-500">Channel ID required.</p>
      </div>
    );
  }

  // Fetch match
  const matchData = await sbFetch("/rest/v1/growth_matches?select=*&id=eq." + encodeURIComponent(matchId));
  const match = matchData?.[0];
  if (!match || match.channel_id !== channelId) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-24 text-center">
        <AlertTriangle className="mx-auto h-10 w-10 text-gray-600" />
        <h1 className="mt-4 text-lg font-semibold text-white">Opportunity Not Found</h1>
        <p className="mt-2 text-sm text-gray-500">This opportunity does not exist or is not assigned to your channel.</p>
      </div>
    );
  }

  // Fetch related data
  const [needData, quotesData, serviceData] = await Promise.all([
    sbFetch("/rest/v1/company_growth_needs?select=*&id=eq." + encodeURIComponent(match.company_growth_need_id)),
    sbFetch("/rest/v1/growth_quotes?select=*&match_id=eq." + encodeURIComponent(matchId)),
    match.service_id ? sbFetch("/rest/v1/channel_services?select=*&id=eq." + encodeURIComponent(match.service_id)) : null,
  ]);

  const need = needData?.[0];
  const quote = quotesData?.[0] || null;
  const service = serviceData?.[0] || null;

  const timeline = buildTimeline(match, quote, need, channelId);
  const currentIdx = timeline.filter((e) => e.key !== "lost").length - 1;

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <Link href={"/channel?channelId=" + channelId} className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 mb-6">
        <ArrowLeft className="h-3 w-3" /> Back to Dashboard
      </Link>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-xl font-bold text-white">{need?.company_name || "Company"}</h1>
          <StatusBadge status={match.status} />
        </div>
        <p className="text-sm text-gray-400">{need?.growth_goal || "Growth opportunity"}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Company Profile */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><Building2 className="h-4 w-4 text-blue-400" /> Company Profile</h2>
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center gap-2"><Globe className="h-3.5 w-3.5 text-gray-600" /><span className="text-blue-400">{need?.website || "-"}</span></div>
            <div className="flex items-center gap-2"><Target className="h-3.5 w-3.5 text-gray-600" /><span className="text-gray-400">Industry: {need?.target_market || "Unknown"}</span></div>
            <div className="flex items-center gap-2"><User className="h-3.5 w-3.5 text-gray-600" /><span className="text-gray-400">Customer: {need?.target_customer || "Unknown"}</span></div>
            <div><p className="text-gray-500 mt-1">Growth Need:</p><p className="text-gray-300">{need?.growth_goal || "-"}</p></div>
            <div><p className="text-gray-500 mt-1">Business Problem:</p><p className="text-gray-300">{need?.current_challenge || "-"}</p></div>
            {need?.timeline && <div className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5 text-gray-600" /><span className="text-gray-400">Timeline: {need.timeline}</span></div>}
          </div>
        </div>

        {/* Quote & Budget */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><DollarSign className="h-4 w-4 text-emerald-400" /> Quote &amp; Budget</h2>
          {quote ? (
            <div className="space-y-2.5 text-xs">
              <p className="text-white font-medium">{quote.quote_title}</p>
              <p><span className="text-gray-500">Amount:</span> <span className="text-emerald-400 font-bold">{quote.currency || "USD"} {quote.quote_amount?.toLocaleString() ?? "-"}</span></p>
              <p><span className="text-gray-500">Timeline:</span> <span className="text-gray-300">{quote.timeline || "-"}</span></p>
              <div><p className="text-gray-500">Deliverables:</p><p className="text-gray-300">{quote.deliverables || "-"}</p></div>
              <div><p className="text-gray-500">Expected Outcome:</p><p className="text-gray-300">{quote.expected_growth_outcome || "-"}</p></div>
              <div><p className="text-gray-500">Success Metrics:</p><p className="text-gray-300">{quote.success_metrics || "-"}</p></div>
            </div>
          ) : (
            <p className="text-xs text-gray-500">No quote submitted yet.</p>
          )}
          <p className="mt-3 text-xs text-gray-500">Company budget: {need?.currency || "USD"} {need?.budget_min || "?"} - {need?.budget_max || "?"}</p>
        </div>

        {/* Selected Service */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><Target className="h-4 w-4 text-purple-400" /> Selected Service</h2>
          {service ? (
            <div className="space-y-2 text-xs">
              <p className="text-white">{service.service_name}</p>
              <p><span className="text-gray-500">Type:</span> <span className="text-gray-300">{service.service_type}</span></p>
              <p><span className="text-gray-500">Solution:</span> <span className="text-gray-400">{match.recommended_solution_type}</span></p>
              <p><span className="text-gray-500">Price Range:</span> <span className="text-gray-300">{service.currency || "USD"} {service.starting_price || "?"} - {service.max_price || "?"}</span></p>
              <p className="mt-2"><span className="text-gray-500">Why matched:</span></p>
              <p className="text-gray-400">{match.match_reason}</p>
            </div>
          ) : (
            <p className="text-xs text-gray-500">No specific service selected.</p>
          )}
        </div>

        {/* Match Info */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><Clock className="h-4 w-4 text-amber-400" /> Match Details</h2>
          <div className="space-y-2 text-xs">
            <p><span className="text-gray-500">Match Score:</span> <span className="text-blue-400 font-bold">{match.match_score ?? "-"}</span></p>
            <p><span className="text-gray-500">Current Status:</span> <StatusBadge status={match.status} /></p>
            <p><span className="text-gray-500">Created:</span> <span className="text-gray-400">{match.created_at ? new Date(match.created_at).toLocaleString() : "-"}</span></p>
            <p><span className="text-gray-500">Last Updated:</span> <span className="text-gray-400">{match.updated_at ? new Date(match.updated_at).toLocaleString() : "-"}</span></p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <section className="mt-8">
        <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Clock className="h-4 w-4 text-blue-400" /> Timeline</h2>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          {timeline.map((evt, i) => (
            <TimelineItem
              key={evt.key}
              icon={evt.key === "won" ? <CheckCircle className="h-3.5 w-3.5" /> : evt.key === "lost" ? <XCircle className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
              label={evt.label}
              date={evt.date}
              active={i <= currentIdx}
              last={i === timeline.length - 1}
            />
          ))}
        </div>
      </section>

      {/* Channel Actions */}
      <section className="mt-6 rounded-xl border border-white/5 bg-white/[0.02] p-5">
        <h2 className="text-sm font-bold text-white mb-4">Actions</h2>
        <div className="flex flex-wrap gap-2">
          <button disabled className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-xs font-medium text-white opacity-50 cursor-not-allowed">
            <CheckCircle className="h-3.5 w-3.5" /> Accept Opportunity
          </button>
          <button disabled className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-4 py-2 text-xs text-gray-500 opacity-50 cursor-not-allowed">
            <XCircle className="h-3.5 w-3.5" /> Decline
          </button>
          <button disabled className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-4 py-2 text-xs text-gray-500 opacity-50 cursor-not-allowed">
            <MessageSquare className="h-3.5 w-3.5" /> Need More Info
          </button>
          <button disabled className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-4 py-2 text-xs text-gray-500 opacity-50 cursor-not-allowed">
            <Calendar className="h-3.5 w-3.5" /> Schedule Introduction
          </button>
          <button disabled className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-4 py-2 text-xs text-gray-500 opacity-50 cursor-not-allowed">
            <MessageSquare className="h-3.5 w-3.5" /> Leave Internal Note
          </button>
        </div>
        <p className="mt-3 text-[10px] text-gray-600">Actions are coming soon. GroIntel will coordinate introductions and next steps.</p>
      </section>
    </div>
  );
}
