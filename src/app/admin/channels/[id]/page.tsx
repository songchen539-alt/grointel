"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, Loader2 } from "lucide-react";
import AdminNav from "@/components/admin/AdminNav";

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
    </div>
  );
}
