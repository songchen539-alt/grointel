"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect, Suspense } from "react";
export const dynamic = "force-dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, Loader2, Check } from "lucide-react";
import AdminNav from "@/components/admin/AdminNav";

const SOLUTION_TYPES = [
  "LinkedIn Outbound", "B2B Lead Generation", "APAC Market Entry", "PR / Media Exposure",
  "Newsletter Sponsorship", "Web3 Ecosystem Launch", "RevOps Consulting", "Partnership Introduction",
  "SEO / Content Growth", "Paid Ads", "Community Growth", "Sales Agency",
];

export default function CreateMatchPage() {
  return <Suspense fallback={<div className="p-8" />}><CreateMatchForm /></Suspense>;
}

function CreateMatchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [needs, setNeeds] = useState<any[]>([]);
  const [channels, setChannels] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    companyGrowthNeedId: searchParams?.get("growthNeedId") || "",
    channelId: searchParams?.get("channelId") || "",
    serviceId: "",
    matchScore: "70",
    recommendedSolutionType: "",
    matchReason: "",
    adminNotes: "",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/growth-needs").then((r) => r.json()),
      fetch("/api/admin/growth-channels").then((r) => r.json()),
    ]).then(([nd, cd]) => {
      if (nd.success) setNeeds(nd.needs || []);
      if (cd.success) setChannels(cd.channels || []);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (form.channelId) {
      fetch("/api/admin/channels/" + form.channelId + "/services")
        .then((r) => r.json())
        .then((d) => { if (d.success) setServices(d.services || []); })
        .catch(() => {});
    }
  }, [form.channelId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => router.push("/admin/matches/" + data.match.id), 1000);
      }
    } catch {}
    setSubmitting(false);
  }

  if (loading) return <div className="mx-auto max-w-4xl px-6 py-24 text-center"><Loader2 className="mx-auto h-8 w-8 text-gray-500 animate-spin" /></div>;

  if (success) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-24 text-center">
        <Check className="mx-auto h-10 w-10 text-emerald-400" />
        <p className="mt-3 text-sm text-white">Match created! Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <AdminNav />
      <Link href="/admin/matches" className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 mb-6"><ArrowLeft className="h-3 w-3" /> Back</Link>
      <h1 className="text-xl font-bold text-white mb-6">Create Match</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-400">Company Growth Need *</label>
          <select value={form.companyGrowthNeedId} onChange={(e) => setForm({ ...form, companyGrowthNeedId: e.target.value })} required
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-black px-4 py-2.5 text-sm text-gray-300 outline-none">
            <option value="">Select need</option>
            {needs.map((n: any) => (
              <option key={n.id} value={n.id}>{n.company_name} - {n.growth_goal?.slice(0, 60)} ({n.currency || "USD"} {n.budget_min || "?"}-{n.budget_max || "?"})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400">Growth Channel *</label>
          <select value={form.channelId} onChange={(e) => setForm({ ...form, channelId: e.target.value })} required
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-black px-4 py-2.5 text-sm text-gray-300 outline-none">
            <option value="">Select channel</option>
            {channels.map((c: any) => (
              <option key={c.id} value={c.id}>{c.channel_name} - {c.category} ({c.region || "Global"})</option>
            ))}
          </select>
        </div>

        {services.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-400">Channel Service (optional)</label>
            <select value={form.serviceId} onChange={(e) => setForm({ ...form, serviceId: e.target.value })}
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-black px-4 py-2.5 text-sm text-gray-300 outline-none">
              <option value="">No specific service</option>
              {services.map((s: any) => (
                <option key={s.id} value={s.id}>{s.service_name} ({s.service_type})</option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400">Match Score (0-100)</label>
            <input type="number" min={0} max={100} value={form.matchScore} onChange={(e) => setForm({ ...form, matchScore: e.target.value })}
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400">Solution Type *</label>
            <select value={form.recommendedSolutionType} onChange={(e) => setForm({ ...form, recommendedSolutionType: e.target.value })} required
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-black px-4 py-2.5 text-sm text-gray-300 outline-none">
              <option value="">Select type</option>
              {SOLUTION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400">Match Reason *</label>
          <textarea value={form.matchReason} onChange={(e) => setForm({ ...form, matchReason: e.target.value })} rows={3} required
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none resize-none"
            placeholder="Why is this channel a good fit for this company's growth need?" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400">Admin Notes</label>
          <textarea value={form.adminNotes} onChange={(e) => setForm({ ...form, adminNotes: e.target.value })} rows={2}
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none resize-none" />
        </div>

        <button type="submit" disabled={submitting}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-medium text-white disabled:opacity-50">
          {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating...</> : "Create Match"}
        </button>
      </form>
    </div>
  );
}
