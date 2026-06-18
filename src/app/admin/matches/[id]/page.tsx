"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, Loader2, ExternalLink, Plus } from "lucide-react";
import AdminNav from "@/components/admin/AdminNav";

const STATUSES = ["draft", "proposed_to_channel", "channel_interested", "quoted", "proposed_to_company", "company_interested", "intro_made", "won", "lost"];

function MatchQuotesSection({ matchId }: { matchId: string }) {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [qloading, setQloading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/quotes").then((r) => r.json()).then((d) => {
      if (d.success) setQuotes((d.quotes || []).filter((q: any) => q.match_id === matchId));
      setQloading(false);
    });
  }, [matchId]);

  return (
    <div className="mt-6 rounded-xl border border-white/5 bg-white/[0.02] p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-white">Quotes for This Match ({quotes.length})</h2>
        <Link href={"/admin/quotes/new?matchId=" + matchId} className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"><Plus className="h-3 w-3" /> Create Quote</Link>
      </div>
      {qloading ? (<p className="text-xs text-gray-500">Loading...</p>
      ) : quotes.length === 0 ? (<p className="text-xs text-gray-500">No quotes yet.</p>
      ) : (
        <div className="space-y-2">
          {quotes.map((q: any) => (
            <div key={q.id} className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2">
              <div>
                <p className="text-xs text-white">{q.quote_title}</p>
                <p className="text-[10px] text-gray-500">{q.currency || "USD"} {q.quote_amount ?? "-"} | {q.timeline || "No timeline"}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300">{q.status}</span>
                <Link href={"/admin/quotes/" + q.id} className="text-[10px] text-blue-400"><ExternalLink className="h-3 w-3" /></Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MatchDetailPage() {

  const params = useParams();
  const id = params.id as string;
  const [match, setMatch] = useState<any>(null);
  const [need, setNeed] = useState<any>(null);
  const [channel, setChannel] = useState<any>(null);
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [notes, setNotes] = useState("");

  const loadAll = async () => {
    const mr = await (await fetch("/api/admin/matches/" + id)).json();
    if (!mr.success) { setLoading(false); return; }
    const m = mr.match;
    setMatch(m);
    setNotes(m.admin_notes || "");

    if (m.company_growth_need_id) {
      const nr = await (await fetch("/api/admin/growth-needs/" + m.company_growth_need_id)).json();
      if (nr.success) setNeed(nr.need);
    }
    if (m.channel_id) {
      const cr = await (await fetch("/api/admin/growth-channels/" + m.channel_id)).json();
      if (cr.success) setChannel(cr.channel);
    }
    if (m.service_id) {
      // Fetch service if needed
    }
    setLoading(false);
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadAll(); }, []);

  async function updateField(key: string, value: any) {
    setSaving(key);
    await fetch("/api/admin/matches/" + id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: value, updated_at: new Date().toISOString() }),
    });
    await loadAll();
    setSaving("");
  }

  async function saveNotes() {
    await updateField("admin_notes", notes);
  }

  if (loading) return <div className="mx-auto max-w-5xl px-6 py-24 text-center"><Loader2 className="mx-auto h-8 w-8 text-gray-500 animate-spin" /></div>;
  if (!match) return <div className="mx-auto max-w-5xl px-6 py-10"><AdminNav /><div className="text-center py-16"><AlertTriangle className="mx-auto h-10 w-10 text-gray-600" /><p className="mt-2 text-sm text-gray-500">Not found</p></div></div>;

  const budgetStr = need
    ? `${need.currency || "USD"} ${need.budget_min || "?"} - ${need.budget_max || "?"}`
    : "-";
  const channelBudget = channel
    ? `${channel.currency || "USD"} ${channel.min_budget || "?"} - ${channel.max_budget || "?"}`
    : "-";

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <AdminNav />
      <Link href="/admin/matches" className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 mb-6"><ArrowLeft className="h-3 w-3" /> Back</Link>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Company Need */}
        {need && (
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
            <h2 className="text-sm font-bold text-white mb-3">Company Need</h2>
            <div className="space-y-1.5 text-xs">
              <p><span className="text-gray-500">Company:</span> <span className="text-white">{need.company_name}</span></p>
              <p><span className="text-gray-500">Website:</span> <span className="text-gray-400">{need.website}</span></p>
              <p><span className="text-gray-500">Goal:</span> <span className="text-gray-300">{need.growth_goal}</span></p>
              <p><span className="text-gray-500">Market:</span> <span className="text-gray-400">{need.target_market || "-"}</span></p>
              <p><span className="text-gray-500">Challenge:</span> <span className="text-gray-400">{need.current_challenge}</span></p>
              <p><span className="text-gray-500">Budget:</span> <span className="text-gray-400">{budgetStr}</span></p>
              <p><span className="text-gray-500">Timeline:</span> <span className="text-gray-400">{need.timeline || "-"}</span></p>
            </div>
          </div>
        )}

        {/* Growth Channel */}
        {channel && (
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
            <h2 className="text-sm font-bold text-white mb-3">Growth Channel</h2>
            <div className="space-y-1.5 text-xs">
              <p><span className="text-gray-500">Channel:</span> <span className="text-white">{channel.channel_name}</span></p>
              <p><span className="text-gray-500">Website:</span> <span className="text-gray-400">{channel.website}</span></p>
              <p><span className="text-gray-500">Category:</span> <span className="text-gray-400">{channel.category}</span></p>
              <p><span className="text-gray-500">Region:</span> <span className="text-gray-400">{channel.region || "Global"}</span></p>
              <p><span className="text-gray-500">Services:</span> <span className="text-gray-400">{channel.service_types?.join(", ") || "-"}</span></p>
              <p><span className="text-gray-500">Pricing:</span> <span className="text-gray-400">{channel.pricing_model || "-"}</span></p>
              <p><span className="text-gray-500">Budget Range:</span> <span className="text-gray-400">{channelBudget}</span></p>
              <p><span className="text-gray-500">Outcomes:</span> <span className="text-gray-400">{channel.growth_outcomes?.slice(0, 100)}</span></p>
            </div>
          </div>
        )}
      </div>

      {/* Match Details */}
      <div className="mt-6 rounded-xl border border-white/5 bg-white/[0.02] p-5">
        <h2 className="text-sm font-bold text-white mb-3">Match</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2 text-xs">
            <p><span className="text-gray-500">Score:</span> <span className="text-blue-400 font-bold">{match.match_score ?? "-"}</span></p>
            <p><span className="text-gray-500">Solution:</span> <span className="text-white">{match.recommended_solution_type || "-"}</span></p>
            <p><span className="text-gray-500">Reason:</span> <span className="text-gray-400">{match.match_reason}</span></p>
            <p><span className="text-gray-500">Created:</span> <span className="text-gray-500">{match.created_at ? new Date(match.created_at).toLocaleString() : "-"}</span></p>
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-2">Status:</p>
            <div className="flex flex-wrap gap-1.5">
              {STATUSES.map((s) => (
                <button key={s} onClick={() => updateField("status", s)} disabled={saving === "status" || match.status === s}
                  className={`text-[10px] px-2.5 py-1 rounded-lg border transition-all ${match.status === s ? "bg-blue-500/10 border-blue-500/30 text-blue-300" : "border-white/10 text-gray-500 hover:text-white"}`}>{s}</button>
              ))}
              {saving === "status" && <Loader2 className="h-3 w-3 text-gray-500 animate-spin" />}
            </div>
          </div>
        </div>

        <div className="mt-4 grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Score:</p>
            <input type="number" min={0} max={100} value={match.match_score ?? 70} onChange={(e) => updateField("match_score", parseInt(e.target.value))}
              className="w-24 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white outline-none" />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Notes:</p>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
              className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white outline-none resize-none" />
            <button onClick={saveNotes} disabled={saving === "admin_notes"}
              className="mt-1 text-[10px] text-blue-400 hover:text-blue-300">{saving === "admin_notes" ? "Saving..." : "Save Notes"}</button>
          </div>
        </div>
      </div>

      <MatchQuotesSection matchId={id} />

    </div>
  );
}
