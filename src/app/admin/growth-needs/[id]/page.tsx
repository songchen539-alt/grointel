"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, Loader2 } from "lucide-react";
import AdminNav from "@/components/admin/AdminNav";

export default function GrowthNeedDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [need, setNeed] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/growth-needs/" + id)
      .then((r) => r.json())
      .then((d) => { if (d.success) setNeed(d.need); })
      .finally(() => setLoading(false));
  }, [id]);

  async function updateStatus(status: string) {
    setSaving(true);
    await fetch("/api/admin/growth-needs/" + id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, updated_at: new Date().toISOString() }),
    });
    const r = await (await fetch("/api/admin/growth-needs/" + id)).json();
    if (r.success) setNeed(r.need);
    setSaving(false);
  }

  if (loading) return <div className="mx-auto max-w-4xl px-6 py-24 text-center"><Loader2 className="mx-auto h-8 w-8 text-gray-500 animate-spin" /></div>;

  if (!need) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-10">
        <AdminNav />
        <div className="text-center py-16"><AlertTriangle className="mx-auto h-10 w-10 text-gray-600" /><p className="mt-2 text-sm text-gray-500">Not found</p></div>
      </div>
    );
  }

  const fields = [
    { label: "Company", value: need.company_name },
    { label: "Website", value: need.website },
    { label: "Contact", value: need.contact_name },
    { label: "Email", value: need.contact_email },
    { label: "Growth Goal", value: need.growth_goal },
    { label: "Target Market", value: need.target_market },
    { label: "Target Customer", value: need.target_customer },
    { label: "Current Challenge", value: need.current_challenge },
    { label: "Budget", value: need.budget_min || need.budget_max ? `${need.budget_min || "?"} - ${need.budget_max || "?"} ${need.currency || "USD"}` : "-" },
    { label: "Timeline", value: need.timeline },
    { label: "Preferred Channels", value: need.preferred_channels ? (Array.isArray(need.preferred_channels) ? need.preferred_channels.join(", ") : need.preferred_channels) : "-" },
    { label: "Notes", value: need.notes },
    { label: "Report ID", value: need.report_id },
    { label: "Source", value: need.source },
    { label: "Created", value: need.created_at ? new Date(need.created_at).toLocaleString() : "-" },
  ];

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <AdminNav />
      <Link href="/admin/growth-needs" className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 mb-6">
        <ArrowLeft className="h-3 w-3" /> Back to Growth Needs
      </Link>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <h2 className="text-sm font-bold text-white mb-4">Growth Need Details</h2>
          <div className="space-y-2.5 text-xs">
            {fields.map((f) => (
              <div key={f.label}>
                <p className="text-[10px] text-gray-500 uppercase">{f.label}</p>
                <p className="text-white">{f.value || "-"}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <h2 className="text-sm font-bold text-white mb-4">Status</h2>
          <p className="text-xs text-gray-500 mb-2">Current: <span className="text-blue-300 font-medium">{need.status}</span></p>
          <div className="flex flex-wrap gap-2">
            {["new", "reviewed", "matched", "quoted", "in_progress", "won", "lost"].map((s) => (
              <button key={s} onClick={() => updateStatus(s)} disabled={saving || need.status === s}
                className={`text-[10px] px-3 py-1 rounded-lg border transition-all ${need.status === s ? "bg-blue-500/10 border-blue-500/30 text-blue-300" : "border-white/10 text-gray-500 hover:text-white"}`}>
                {s}
              </button>
            ))}
          </div>
          {saving && <p className="text-xs text-gray-500 mt-2">Saving...</p>}
        </div>
      </div>
    </div>
  );
}
