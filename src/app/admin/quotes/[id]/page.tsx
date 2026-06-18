"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, Loader2, ExternalLink } from "lucide-react";
import AdminNav from "@/components/admin/AdminNav";

const STATUSES = ["draft", "submitted", "reviewed", "shared_with_company", "accepted", "rejected"];

export default function QuoteDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [quote, setQuote] = useState<any>(null);
  const [need, setNeed] = useState<any>(null);
  const [channel, setChannel] = useState<any>(null);
  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [msg, setMsg] = useState("");

  const load = async () => {
    const qr = await (await fetch("/api/admin/quotes/" + id)).json();
    if (!qr.success) { setLoading(false); return; }
    const q = qr.quote;
    setQuote(q);
    setMsg(q.proposal_message || "");

    if (q.match_id) {
      const mr = await (await fetch("/api/admin/matches/" + q.match_id)).json();
      if (mr.success) setMatch(mr.match);
    }
    if (q.company_growth_need_id) {
      const nr = await (await fetch("/api/admin/growth-needs/" + q.company_growth_need_id)).json();
      if (nr.success) setNeed(nr.need);
    }
    if (q.channel_id) {
      const cr = await (await fetch("/api/admin/growth-channels/" + q.channel_id)).json();
      if (cr.success) setChannel(cr.channel);
    }
    setLoading(false);
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, []);

  async function updateStatus(s: string) {
    setSaving("status");
    await fetch("/api/admin/quotes/" + id, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: s }),
    });
    await load();
    setSaving("");
  }

  async function saveMessage() {
    setSaving("msg");
    await fetch("/api/admin/quotes/" + id, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ proposal_message: msg }),
    });
    await load();
    setSaving("");
  }

  if (loading) return <div className="mx-auto max-w-5xl px-6 py-24 text-center"><Loader2 className="mx-auto h-8 w-8 text-gray-500 animate-spin" /></div>;
  if (!quote) return <div className="mx-auto max-w-5xl px-6 py-10"><AdminNav /><div className="text-center py-16"><AlertTriangle className="mx-auto h-10 w-10 text-gray-600" /><p className="mt-2 text-sm text-gray-500">Not found</p></div></div>;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <AdminNav />
      <Link href="/admin/quotes" className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 mb-6"><ArrowLeft className="h-3 w-3" /> Back</Link>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Quote */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <h2 className="text-sm font-bold text-white mb-3">{quote.quote_title}</h2>
          <div className="space-y-1.5 text-xs">
            <p><span className="text-gray-500">Amount:</span> <span className="text-white">{quote.currency || "USD"} {quote.quote_amount ?? "-"}</span></p>
            <p><span className="text-gray-500">Timeline:</span> <span className="text-gray-300">{quote.timeline || "-"}</span></p>
            <p><span className="text-gray-500">Status:</span> <span className={`text-[10px] px-2 py-0.5 rounded ${
              quote.status === "draft" ? "bg-gray-500/10 text-gray-400" :
              quote.status === "accepted" ? "bg-emerald-500/10 text-emerald-300" :
              quote.status === "rejected" ? "bg-red-500/10 text-red-300" :
              "bg-blue-500/10 text-blue-300"
            }`}>{quote.status}</span></p>
          </div>

          <div className="mt-4">
            <p className="text-xs text-gray-500 mb-2">Update Status:</p>
            {quote.status !== "shared_with_company" && quote.status !== "accepted" && (
              <button onClick={async () => { setSaving("share"); await fetch("/api/admin/quotes/" + id, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "shared_with_company" }) }); await load(); setSaving(""); }} disabled={saving === "share"}
                className="mt-2 inline-flex items-center gap-1 text-xs bg-gradient-to-r from-amber-600 to-orange-600 px-4 py-1.5 rounded-lg text-white disabled:opacity-50">
                {saving === "share" ? "Sharing..." : "Share With Company"}
              </button>
            )}
            {quote.status === "shared_with_company" || quote.status === "accepted" ? (
              <p className="mt-2 text-xs text-emerald-400">This quote is visible in the company curated options view.</p>
            ) : null}
            <div className="flex flex-wrap gap-1.5">
              {STATUSES.map((s) => (
                <button key={s} onClick={() => updateStatus(s)} disabled={saving === "status" || quote.status === s}
                  className={`text-[10px] px-2.5 py-1 rounded-lg border ${quote.status === s ? "bg-blue-500/10 border-blue-500/30 text-blue-300" : "border-white/10 text-gray-500 hover:text-white"}`}>{s}</button>
              ))}
              {saving === "status" && <Loader2 className="h-3 w-3 text-gray-500 animate-spin" />}
            </div>
          </div>

          <div className="mt-4">
            <p className="text-xs text-gray-500 mb-1">Deliverables:</p>
            <p className="text-xs text-gray-300 whitespace-pre-wrap">{quote.deliverables || "-"}</p>
          </div>
          <div className="mt-3">
            <p className="text-xs text-gray-500 mb-1">Expected Outcome:</p>
            <p className="text-xs text-gray-300">{quote.expected_growth_outcome || "-"}</p>
          </div>
          <div className="mt-3">
            <p className="text-xs text-gray-500 mb-1">Success Metrics:</p>
            <p className="text-xs text-gray-300">{quote.success_metrics || "-"}</p>
          </div>

          <div className="mt-4">
            <p className="text-xs text-gray-500 mb-1">Proposal Message:</p>
            <textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={6}
              className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white outline-none resize-none font-mono" />
            <button onClick={saveMessage} disabled={saving === "msg"}
              className="mt-1 text-[10px] text-blue-400 hover:text-blue-300">{saving === "msg" ? "Saving..." : "Save Message"}</button>
          </div>
        </div>

        {/* Company Need */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <h2 className="text-sm font-bold text-white mb-3">Company Need</h2>
          {need ? (
            <div className="space-y-1.5 text-xs">
              <p><span className="text-gray-500">Company:</span> <span className="text-white">{need.company_name}</span></p>
              <p><span className="text-gray-500">Website:</span> <span className="text-blue-400">{need.website}</span></p>
              <p><span className="text-gray-500">Goal:</span> <span className="text-gray-300">{need.growth_goal}</span></p>
              <p><span className="text-gray-500">Market:</span> <span className="text-gray-400">{need.target_market || "-"}</span></p>
              <p><span className="text-gray-500">Challenge:</span> <span className="text-gray-400">{need.current_challenge}</span></p>
              <p><span className="text-gray-500">Budget:</span> <span className="text-gray-400">{need.currency || "USD"} {need.budget_min || "?"} - {need.budget_max || "?"}</span></p>
              <Link href={"/admin/growth-needs/" + need.id} className="text-[10px] text-blue-400">View Need <ExternalLink className="h-3 w-3 inline" /></Link>
            </div>
          ) : <p className="text-xs text-gray-500">No data</p>}
        </div>

        {/* Channel + Match */}
        <div className="space-y-4">
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
            <h2 className="text-sm font-bold text-white mb-3">Growth Channel</h2>
            {channel ? (
              <div className="space-y-1.5 text-xs">
                <p><span className="text-gray-500">Channel:</span> <span className="text-white">{channel.channel_name}</span></p>
                <p><span className="text-gray-500">Category:</span> <span className="text-gray-400">{channel.category}</span></p>
                <p><span className="text-gray-500">Region:</span> <span className="text-gray-400">{channel.region || "Global"}</span></p>
                <p><span className="text-gray-500">Budget:</span> <span className="text-gray-400">{channel.currency} {channel.min_budget || "?"}-{channel.max_budget || "?"}</span></p>
                <Link href={"/admin/channels/" + channel.id} className="text-[10px] text-blue-400">View Channel <ExternalLink className="h-3 w-3 inline" /></Link>
              </div>
            ) : <p className="text-xs text-gray-500">No data</p>}
          </div>

          {match && (
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
              <h2 className="text-sm font-bold text-white mb-3">Match</h2>
              <div className="space-y-1.5 text-xs">
                <p><span className="text-gray-500">Solution:</span> <span className="text-white">{match.recommended_solution_type || "-"}</span></p>
                <p><span className="text-gray-500">Score:</span> <span className="text-blue-400 font-bold">{match.match_score ?? "-"}</span></p>
                <p><span className="text-gray-500">Reason:</span> <span className="text-gray-400">{match.match_reason}</span></p>
                <p><span className="text-gray-500">Status:</span> <span className="text-gray-300">{match.status}</span></p>
                <Link href={"/admin/matches/" + match.id} className="text-[10px] text-blue-400">View Match <ExternalLink className="h-3 w-3 inline" /></Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
