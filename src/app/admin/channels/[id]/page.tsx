"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, Loader2, ExternalLink, Plus } from "lucide-react";
import AdminNav from "@/components/admin/AdminNav";

function ChannelServicesSection({ channelId }: { channelId: string }) {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ serviceName: "", serviceType: "", problemSolved: "", growthOutcome: "", deliverables: "", timeline: "", pricingModel: "", startingPrice: "", maxPrice: "", currency: "USD", targetRegion: "", targetIndustry: "", successMetrics: "", caseStudy: "" });
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    fetch("/api/admin/channels/" + channelId + "/services")
      .then((r) => r.json())
      .then((d) => { if (d.success) setServices(d.services || []); })
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [channelId]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await fetch("/api/admin/channels/" + channelId + "/services", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSubmitting(false);
    setShowForm(false);
    setForm({ serviceName: "", serviceType: "", problemSolved: "", growthOutcome: "", deliverables: "", timeline: "", pricingModel: "", startingPrice: "", maxPrice: "", currency: "USD", targetRegion: "", targetIndustry: "", successMetrics: "", caseStudy: "" });
    load();
  }

  return (
    <div className="mt-6 rounded-xl border border-white/5 bg-white/[0.02] p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-white">Channel Services / Solutions ({services.length})</h2>
        <button onClick={() => setShowForm(!showForm)} className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"><Plus className="h-3 w-3" /> Add Service</button>
      </div>
      {showForm && (
        <form onSubmit={handleAdd} className="mb-4 space-y-3 rounded-lg border border-white/10 p-4">
          <div className="grid md:grid-cols-2 gap-3">
            <input placeholder="Service Name *" value={form.serviceName} onChange={(e) => setForm({...form, serviceName: e.target.value})} required
              className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white outline-none" />
            <input placeholder="Service Type *" value={form.serviceType} onChange={(e) => setForm({...form, serviceType: e.target.value})} required
              className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white outline-none" />
          </div>
          <input placeholder="Problem Solved *" value={form.problemSolved} onChange={(e) => setForm({...form, problemSolved: e.target.value})} required
            className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white outline-none" />
          <input placeholder="Growth Outcome *" value={form.growthOutcome} onChange={(e) => setForm({...form, growthOutcome: e.target.value})} required
            className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white outline-none" />
          <div className="grid md:grid-cols-3 gap-3">
            <input placeholder="Pricing Model" value={form.pricingModel} onChange={(e) => setForm({...form, pricingModel: e.target.value})}
              className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white outline-none" />
            <input placeholder="Starting Price" type="number" value={form.startingPrice} onChange={(e) => setForm({...form, startingPrice: e.target.value})}
              className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white outline-none" />
            <input placeholder="Max Price" type="number" value={form.maxPrice} onChange={(e) => setForm({...form, maxPrice: e.target.value})}
              className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white outline-none" />
          </div>
          <button type="submit" disabled={submitting}
            className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-xs font-medium text-white disabled:opacity-50">
            {submitting ? "Saving..." : "Save Service"}
          </button>
        </form>
      )}
      {loading ? (<p className="text-xs text-gray-500">Loading...</p>
      ) : services.length === 0 ? (<p className="text-xs text-gray-500">No services added yet.</p>
      ) : (
        <div className="space-y-2">
          {services.map((s: any) => (
            <div key={s.id} className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2">
              <div>
                <p className="text-xs text-white">{s.service_name}</p>
                <p className="text-[10px] text-gray-500">{s.service_type} - {s.currency} {s.starting_price || "?"} - {s.max_price || "?"}</p>
              </div>
              <span className={"text-[10px] px-1.5 py-0.5 rounded " + (s.status === "active" ? "bg-emerald-500/10 text-emerald-300" : "bg-gray-500/10 text-gray-400")}>{s.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ChannelMatchesSection({ channelId }: { channelId: string }) {
  const [matches, setMatches] = useState<any[]>([]);
  const [needs, setNeeds] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/matches").then((r) => r.json()),
      fetch("/api/admin/growth-needs").then((r) => r.json()),
    ]).then(([mr, nr]) => {
      if (mr.success) {
        setMatches((mr.matches || []).filter((m: any) => m.channel_id === channelId));
      }
      if (nr.success) {
        const ndMap: Record<string, any> = {};
        (nr.needs || []).forEach((n: any) => { ndMap[n.id] = n; });
        setNeeds(ndMap);
      }
      setLoading(false);
    });
  }, [channelId]);

  return (
    <div className="mt-6 rounded-xl border border-white/5 bg-white/[0.02] p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-white">Matched Company Needs ({matches.length})</h2>
        <Link href={"/admin/matches/new?channelId=" + channelId} className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300">
          <Plus className="h-3 w-3" /> Create Match
        </Link>
      </div>
      {loading ? (<p className="text-xs text-gray-500">Loading...</p>
      ) : matches.length === 0 ? (<p className="text-xs text-gray-500">No matches yet.</p>
      ) : (
        <div className="space-y-2">
          {matches.map((m: any) => {
            const nd = needs[m.company_growth_need_id];
            return (
              <div key={m.id} className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2">
                <div>
                  <p className="text-xs text-white">{nd?.company_name || m.company_growth_need_id?.slice(0, 8)}</p>
                  <p className="text-[10px] text-gray-500">{nd?.growth_goal?.slice(0, 60)}</p>
                </div>
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="text-gray-500">{m.recommended_solution_type}</span>
                  <span className="text-blue-400">{m.match_score}</span>
                  <Link href={"/admin/matches/" + m.id} className="text-blue-400"><ExternalLink className="h-3 w-3" /></Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ChannelDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [channel, setChannel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/growth-channels/" + id)
      .then((r) => r.json())
      .then((d) => { if (d.success) setChannel(d.channel); })
      .finally(() => setLoading(false));
  }, [id]);

  async function updateField(key: string, value: string) {
    setSaving(true);
    await fetch("/api/admin/growth-channels/" + id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: value, updated_at: new Date().toISOString() }),
    });
    const r = await (await fetch("/api/admin/growth-channels/" + id)).json();
    if (r.success) setChannel(r.channel);
    setSaving(false);
  }

  if (loading) return <div className="mx-auto max-w-4xl px-6 py-24 text-center"><Loader2 className="mx-auto h-8 w-8 text-gray-500 animate-spin" /></div>;

  if (!channel) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-10">
        <AdminNav />
        <div className="text-center py-16"><AlertTriangle className="mx-auto h-10 w-10 text-gray-600" /><p className="mt-2 text-sm text-gray-500">Not found</p></div>
      </div>
    );
  }

  const fields = [
    { label: "Channel Name", value: channel.channel_name },
    { label: "Website", value: channel.website },
    { label: "Domain", value: channel.domain },
    { label: "Category", value: channel.category },
    { label: "Region", value: channel.region },
    { label: "Service Types", value: channel.service_types ? (Array.isArray(channel.service_types) ? channel.service_types.join(", ") : channel.service_types) : "-" },
    { label: "Target Industries", value: channel.target_industries ? (Array.isArray(channel.target_industries) ? channel.target_industries.join(", ") : channel.target_industries) : "-" },
    { label: "Target Client Stage", value: channel.target_client_stage ? (Array.isArray(channel.target_client_stage) ? channel.target_client_stage.join(", ") : channel.target_client_stage) : "-" },
    { label: "Pricing Model", value: channel.pricing_model },
    { label: "Budget Range", value: channel.min_budget || channel.max_budget ? `${channel.min_budget || "?"} - ${channel.max_budget || "?"} ${channel.currency || "USD"}` : "-" },
    { label: "Growth Outcomes", value: channel.growth_outcomes },
    { label: "Case Studies", value: channel.case_studies },
    { label: "Proof Links", value: channel.proof_links ? (Array.isArray(channel.proof_links) ? channel.proof_links.join(", ") : channel.proof_links) : "-" },
    { label: "Contact Name", value: channel.contact_name },
    { label: "Contact Email", value: channel.contact_email },
    { label: "Claim Status", value: channel.claim_status },
    { label: "Notes", value: channel.notes },
    { label: "Source", value: channel.source },
    { label: "Created", value: channel.created_at ? new Date(channel.created_at).toLocaleString() : "-" },
  ];

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <AdminNav />
      <Link href="/admin/channels" className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 mb-6">
        <ArrowLeft className="h-3 w-3" /> Back to Channels
      </Link>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <h2 className="text-sm font-bold text-white mb-4">Channel Details</h2>
          <div className="space-y-2.5 text-xs">
            {fields.map((f) => (
              <div key={f.label}>
                <p className="text-[10px] text-gray-500 uppercase">{f.label}</p>
                <p className="text-white">{f.value || "-"}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
            <h2 className="text-sm font-bold text-white mb-4">Verification Status</h2>
            <div className="flex flex-wrap gap-2">
              {["pending", "verified", "rejected"].map((s) => (
                <button key={s} onClick={() => updateField("verification_status", s)} disabled={saving || channel.verification_status === s}
                  className={`text-[10px] px-3 py-1 rounded-lg border transition-all ${channel.verification_status === s ? "bg-blue-500/10 border-blue-500/30 text-blue-300" : "border-white/10 text-gray-500 hover:text-white"}`}>{s}</button>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
            <h2 className="text-sm font-bold text-white mb-4">Status</h2>
            <div className="flex flex-wrap gap-2">
              {["new", "active", "paused", "closed"].map((s) => (
                <button key={s} onClick={() => updateField("status", s)} disabled={saving || channel.status === s}
                  className={`text-[10px] px-3 py-1 rounded-lg border transition-all ${channel.status === s ? "bg-blue-500/10 border-blue-500/30 text-blue-300" : "border-white/10 text-gray-500 hover:text-white"}`}>{s}</button>
              ))}
            </div>
          </div>
          {saving && <p className="text-xs text-gray-500">Saving...</p>}
        </div>
      </div>

      <ChannelServicesSection channelId={id} />
      <ChannelMatchesSection channelId={id} />

    </div>
  );
}
