"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, Building2, Globe, Target, DollarSign, Calendar, Clock, CheckCircle, XCircle, Loader2, MessageSquare, Check, Info } from "lucide-react";

export const dynamic = "force-dynamic";

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    draft: "bg-gray-500/10 text-gray-400",
    proposed_to_channel: "bg-blue-500/10 text-blue-300",
    quoted: "bg-amber-500/10 text-amber-300",
    proposed_to_company: "bg-indigo-500/10 text-indigo-300",
    company_interested: "bg-cyan-500/10 text-cyan-300",
    intro_made: "bg-emerald-500/10 text-emerald-300",
    intro_scheduled: "bg-teal-500/10 text-teal-300",
    channel_accepted: "bg-green-500/10 text-green-300",
    channel_declined: "bg-red-500/10 text-red-300",
    channel_requested_more_info: "bg-orange-500/10 text-orange-300",
    won: "bg-green-500/10 text-green-300",
    lost: "bg-red-500/10 text-red-300",
  };
  const labels: Record<string, string> = {
    channel_accepted: "Accepted", channel_declined: "Declined",
    channel_requested_more_info: "More Info Requested", intro_scheduled: "Intro Scheduled",
  };
  return (
    <span className={"text-xs font-medium px-2.5 py-1 rounded " + (colors[status] || "bg-gray-500/10 text-gray-400")}>
      {labels[status] || status.replace(/_/g, " ")}
    </span>
  );
}

function ActionBtn({ label, icon, color, onClick, disabled }: { label: string; icon: React.ReactNode; color: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={"inline-flex items-center gap-1.5 rounded-lg " + color + " px-4 py-2 text-xs font-medium text-white disabled:opacity-50 transition-all"}>
      {icon} {label}
    </button>
  );
}

export default function ChannelOpportunityPage() {
  const params = useParams();
  const sp = useSearchParams();
  const matchId = params.matchId as string;
  const channelId = sp?.get("channelId") || "";

  const [match, setMatch] = useState<any>(null);
  const [need, setNeed] = useState<any>(null);
  const [quote, setQuote] = useState<any>(null);
  const [service, setService] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [acting, setActing] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  // Modal
  const [modal, setModal] = useState<{ show: boolean; type: string }>({ show: false, type: "" });
  const [note, setNote] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");

  const load = async () => {
    if (!channelId) { setLoading(false); return; }
    try {
      const [mRes, eRes, qRes, svcRes] = await Promise.all([
        fetch("/api/admin/matches/" + matchId),
        fetch("/api/admin/matches/" + matchId + "/events"),
        fetch("/api/admin/quotes"),
        fetch("/api/admin/channels/" + channelId + "/services"),
      ]);
      const mData = await mRes.json();
      if (!mData.success) { setError("Not found"); setLoading(false); return; }
      setMatch(mData.match);

      // Fetch need
      if (mData.match.company_growth_need_id) {
        const nr = await (await fetch("/api/admin/growth-needs/" + mData.match.company_growth_need_id)).json();
        if (nr.success) setNeed(nr.need);
      }

      // Fetch quote
      const qData = await qRes.json();
      if (qData.success) {
        const qt = (qData.quotes || []).find((q: any) => q.match_id === matchId);
        if (qt) setQuote(qt);
      }

      // Fetch service
      const svcData = await svcRes.json();
      if (svcData.success) {
        const s = (svcData.services || []).find((s: any) => s.id === mData.match.service_id);
        if (s) setService(s);
      }

      // Fetch events
      const eData = await eRes.json();
      if (eData.success) setEvents(eData.events || []);
    } catch { setError("Failed to load"); }
    setLoading(false);
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [matchId]);

  async function doAction(action: string) {
    setActing(action);
    setMsg("");
    try {
      const body: any = { channelId };
      if (note) body.note = note;
      if (scheduledAt) body.scheduledAt = scheduledAt;
      const res = await fetch("/api/channel/opportunities/" + matchId + "/" + action, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setMsg("Done!");
        setModal({ show: false, type: "" });
        setNote(""); setScheduledAt("");
        await load();
      } else {
        setError(data.error || "Failed");
      }
    } catch { setError("Network error"); }
    setActing(null);
  }

  if (!channelId) return <div className="mx-auto max-w-lg px-6 py-24 text-center"><AlertTriangle className="mx-auto h-10 w-10 text-gray-600" /><h1 className="mt-4 text-lg font-semibold text-white">Access Denied</h1></div>;
  if (loading) return <div className="mx-auto max-w-4xl px-6 py-24 text-center"><Loader2 className="mx-auto h-8 w-8 text-gray-500 animate-spin" /></div>;
  if (error && !match) return <div className="mx-auto max-w-4xl px-6 py-24 text-center"><AlertTriangle className="mx-auto h-10 w-10 text-gray-600" /><p className="text-sm text-gray-500">{error}</p></div>;

  const timelineEvents = [];

  // Event type labels
  const evtLabels: Record<string, string> = {
    channel_accepted_opportunity: "Accepted Opportunity",
    channel_declined_opportunity: "Declined Opportunity",
    channel_requested_more_info: "Requested More Information",
    channel_scheduled_intro: "Scheduled Introduction",
    channel_left_note: "Left Internal Note",
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <Link href={"/channel?channelId=" + channelId} className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 mb-6">
        <ArrowLeft className="h-3 w-3" /> Back
      </Link>

      {msg && <div className="mb-4 rounded-xl border border-emerald-500/10 bg-emerald-500/[0.03] p-3 text-xs text-emerald-300">{msg}</div>}
      {error && <div className="mb-4 rounded-xl border border-red-500/10 bg-red-500/[0.03] p-3 text-xs text-red-300">{error}</div>}

      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-xl font-bold text-white">{need?.company_name || "Company"}</h1>
        <StatusBadge status={match?.status || ""} />
      </div>
      <p className="text-sm text-gray-400 mb-6">{need?.growth_goal || ""}</p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Company Profile */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <h2 className="text-sm font-bold text-white mb-3"><Building2 className="h-4 w-4 inline text-blue-400 mr-2" />Company Profile</h2>
          <div className="space-y-2 text-xs">
            <div><span className="text-gray-500">Website:</span> <span className="text-blue-400">{need?.website || "-"}</span></div>
            <div><span className="text-gray-500">Industry:</span> <span className="text-gray-300">{need?.target_market || "-"}</span></div>
            <div><span className="text-gray-500">Goal:</span> <span className="text-gray-300">{need?.growth_goal || "-"}</span></div>
            <div><span className="text-gray-500">Problem:</span> <span className="text-gray-300">{need?.current_challenge || "-"}</span></div>
            {need?.timeline && <div><span className="text-gray-500">Timeline:</span> <span className="text-gray-300">{need.timeline}</span></div>}
            <div><span className="text-gray-500">Budget:</span> <span className="text-gray-300">{need?.currency || "USD"} {need?.budget_min || "?"} - {need?.budget_max || "?"}</span></div>
          </div>
        </div>

        {/* Quote */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <h2 className="text-sm font-bold text-white mb-3"><DollarSign className="h-4 w-4 inline text-emerald-400 mr-2" />Quote</h2>
          {quote ? (
            <div className="space-y-2 text-xs">
              <p className="text-white font-medium">{quote.quote_title}</p>
              <p><span className="text-gray-500">Amount:</span> <span className="text-emerald-400 font-bold">{quote.currency} {quote.quote_amount?.toLocaleString() ?? "-"}</span></p>
              <p><span className="text-gray-500">Timeline:</span> <span className="text-gray-300">{quote.timeline || "-"}</span></p>
              <p><span className="text-gray-500">Deliverables:</span> <span className="text-gray-300">{quote.deliverables || "-"}</span></p>
              <p><span className="text-gray-500">Outcome:</span> <span className="text-gray-300">{quote.expected_growth_outcome || "-"}</span></p>
            </div>
          ) : <p className="text-xs text-gray-500">No quote yet.</p>}
        </div>
      </div>

      {/* Service */}
      {service && (
        <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <h2 className="text-sm font-bold text-white mb-2"><Target className="h-4 w-4 inline text-purple-400 mr-2" />Service</h2>
          <p className="text-xs text-gray-300">{service.service_name} - {service.service_type}</p>
        </div>
      )}

      {/* Actions */}
      <div className="mt-6 rounded-xl border border-white/5 bg-white/[0.02] p-5">
        <h2 className="text-sm font-bold text-white mb-4">Actions</h2>
        <div className="flex flex-wrap gap-2">
          <ActionBtn label="Accept" icon={<CheckCircle className="h-3.5 w-3.5" />} color="bg-gradient-to-r from-green-600 to-emerald-600" onClick={() => setModal({ show: true, type: "accept" })} />
          <ActionBtn label="Decline" icon={<XCircle className="h-3.5 w-3.5" />} color="bg-gradient-to-r from-red-600 to-rose-600" onClick={() => setModal({ show: true, type: "decline" })} />
          <ActionBtn label="Need More Info" icon={<Info className="h-3.5 w-3.5" />} color="bg-gradient-to-r from-amber-600 to-orange-600" onClick={() => setModal({ show: true, type: "more-info" })} />
          <ActionBtn label="Schedule Intro" icon={<Calendar className="h-3.5 w-3.5" />} color="bg-gradient-to-r from-blue-600 to-indigo-600" onClick={() => setModal({ show: true, type: "schedule-intro" })} />
          <ActionBtn label="Leave Note" icon={<MessageSquare className="h-3.5 w-3.5" />} color="bg-gradient-to-r from-gray-600 to-slate-600" onClick={() => setModal({ show: true, type: "notes" })} />
        </div>
      </div>

      {/* Timeline */}
      <div className="mt-6 rounded-xl border border-white/5 bg-white/[0.02] p-5">
        <h2 className="text-sm font-bold text-white mb-4"><Clock className="h-4 w-4 inline text-blue-400 mr-2" />Timeline</h2>
        {events.length === 0 && !need?.created_at ? (
          <p className="text-xs text-gray-500">No events yet.</p>
        ) : (
          <div className="space-y-0">
            {need?.created_at && (
              <TimelineItem icon={<CheckCircle className="h-3 w-3" />} label="Need Created" date={new Date(need.created_at).toLocaleDateString()} first />
            )}
            {match?.created_at && (
              <TimelineItem icon={<CheckCircle className="h-3 w-3" />} label="Matched" date={new Date(match.created_at).toLocaleDateString()} />
            )}
            {quote?.created_at && (
              <TimelineItem icon={<CheckCircle className="h-3 w-3" />} label="Quote Created" date={new Date(quote.created_at).toLocaleDateString()} />
            )}
            {events.map((evt: any, i: number) => (
              <TimelineItem
                key={evt.id} icon={<CheckCircle className="h-3 w-3" />}
                label={evtLabels[evt.event_type] || evt.event_type.replace(/_/g, " ")}
                date={evt.created_at ? new Date(evt.created_at).toLocaleString() : undefined}
                note={evt.note}
                last={i === events.length - 1}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setModal({ show: false, type: "" })}>
          <div className="w-full max-w-md rounded-xl border border-white/10 bg-black p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-white mb-4">
              {modal.type === "accept" ? "Accept Opportunity" :
               modal.type === "decline" ? "Decline Opportunity" :
               modal.type === "more-info" ? "Request More Information" :
               modal.type === "schedule-intro" ? "Schedule Introduction" :
               modal.type === "notes" ? "Leave Internal Note" : ""}
            </h3>
            {modal.type === "schedule-intro" && (
              <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white mb-3 outline-none" />
            )}
            {(modal.type === "decline" || modal.type === "more-info" || modal.type === "schedule-intro" || modal.type === "notes") && (
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3}
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none resize-none"
                placeholder={modal.type === "decline" ? "Optional reason..." : modal.type === "notes" ? "Your note..." : "Your message..."} />
            )}
            <div className="flex gap-2 mt-4">
              <button onClick={() => doAction(modal.type)} disabled={acting !== null}
                className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-xs font-medium text-white disabled:opacity-50">
                {acting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                Confirm
              </button>
              <button onClick={() => setModal({ show: false, type: "" })} className="text-xs text-gray-500 hover:text-gray-300 px-3">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TimelineItem({ icon, label, date, note, first, last }: { icon: React.ReactNode; label: string; date?: string; note?: string; first?: boolean; last?: boolean }) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">{icon}</div>
        {!last && <div className="w-px flex-1 bg-white/[0.06]" />}
      </div>
      <div className="pb-4">
        <p className="text-xs text-white">{label}</p>
        {date && <p className="text-[10px] text-gray-600">{date}</p>}
        {note && <p className="text-[10px] text-gray-500 italic mt-0.5">{note}</p>}
      </div>
    </div>
  );
}
