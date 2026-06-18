"use client";
/* eslint-disable react-hooks/exhaustive-deps */

import { useState, useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Users, ExternalLink, Plus, Copy, Check, RefreshCw, Loader2 } from "lucide-react";

interface Prospect {
  id: string;
  company_name: string;
  website: string;
  domain: string;
  category: string;
  target_person_name: string;
  target_person_title: string;
  priority: string;
  status: string;
  report_id: string;
  outbound_message: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  new: "bg-blue-500/10 text-blue-300",
  report_generated: "bg-purple-500/10 text-purple-300",
  contacted: "bg-amber-500/10 text-amber-300",
  opened: "bg-cyan-500/10 text-cyan-300",
  clicked_cta: "bg-indigo-500/10 text-indigo-300",
  replied: "bg-emerald-500/10 text-emerald-300",
  booked: "bg-green-500/10 text-green-300",
  closed_won: "bg-emerald-500/10 text-emerald-300",
  closed_lost: "bg-red-500/10 text-red-300",
};

const priorityColors: Record<string, string> = {
  A: "bg-rose-500/10 text-rose-300",
  B: "bg-amber-500/10 text-amber-300",
  C: "bg-gray-500/10 text-gray-400",
};

export default function AdminProspectsPage() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    companyName: "",
    website: "",
    category: "",
    targetPersonName: "",
    targetPersonTitle: "",
    targetPersonEmail: "",
    targetPersonLinkedin: "",
    priority: "B",
    notes: "",
  });
  const [formSubmitting, setFormSubmitting] = useState(false);

  const loadProspects = () => {
    fetch("/api/admin/prospects")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setProspects(data.prospects || []);
        } else {
          setError(data.error || "Failed to load");
        }
      })
      .catch(() => {
        setError("Failed to load prospects. Table may not exist yet.");
      })
      .finally(() => { setLoading(false); });
  };

  useEffect(() => { loadProspects(); }, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // eslint-disable-next-line react-hooks/exhaustive-deps

  async function handleGenerateMRI(prospectId: string) {
    setGenerating(prospectId);
    try {
      const res = await fetch(`/api/admin/prospects/${prospectId}/generate-report`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        await loadProspects();
      }
    } catch {}
    setGenerating(null);
  }

  async function handleCopy(url: string, id: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      const res = await fetch("/api/admin/prospects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        setFormData({ companyName: "", website: "", category: "", targetPersonName: "", targetPersonTitle: "", targetPersonEmail: "", targetPersonLinkedin: "", priority: "B", notes: "" });
        await loadProspects();
      }
    } catch {}
    setFormSubmitting(false);
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-24 text-center">
        <Loader2 className="mx-auto h-8 w-8 text-gray-500 animate-spin" />
      </div>
    );
  }

  if (error && prospects.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-24 text-center">
        <AlertTriangle className="mx-auto h-10 w-10 text-amber-500" />
        <h1 className="mt-4 text-lg font-semibold text-white">Prospects Not Available</h1>
        <p className="mt-2 text-xs text-gray-500">Prospects table is not ready. Please run the Phase 5 SQL migration.</p>
        <pre className="mt-4 mx-auto max-w-lg text-left text-[10px] text-gray-600 bg-white/[0.02] rounded-xl p-4 overflow-x-auto">
{`create table if not exists prospects (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  website text not null,
  domain text,
  category text,
  target_person_name text,
  target_person_title text,
  target_person_email text,
  target_person_linkedin text,
  priority text default 'B',
  status text default 'new',
  source text default 'manual',
  report_id text,
  outbound_message text,
  notes text,
  last_action_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table prospects enable row level security;`}
        </pre>
        <button onClick={loadProspects} className="mt-4 text-xs text-blue-400 hover:text-blue-300">Retry</button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Outbound Prospects</h1>
          <p className="text-xs text-gray-500 mt-1">Track target companies, MRI reports, outbound messages, and follow-up status.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-xs font-medium text-white hover:from-blue-500 hover:to-purple-500 transition-all"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Prospect
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-xl border border-white/5 bg-white/[0.02] p-5 mb-6 space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <input type="text" placeholder="Company Name *" value={formData.companyName} required
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs text-white placeholder-gray-600 outline-none focus:border-blue-500/50" />
            <input type="text" placeholder="Website *" value={formData.website} required
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs text-white placeholder-gray-600 outline-none focus:border-blue-500/50" />
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            <input type="text" placeholder="Category" value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs text-white placeholder-gray-600 outline-none focus:border-blue-500/50" />
            <input type="text" placeholder="Person Name" value={formData.targetPersonName}
              onChange={(e) => setFormData({ ...formData, targetPersonName: e.target.value })}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs text-white placeholder-gray-600 outline-none focus:border-blue-500/50" />
            <input type="text" placeholder="Person Title" value={formData.targetPersonTitle}
              onChange={(e) => setFormData({ ...formData, targetPersonTitle: e.target.value })}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs text-white placeholder-gray-600 outline-none focus:border-blue-500/50" />
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            <input type="email" placeholder="Person Email" value={formData.targetPersonEmail}
              onChange={(e) => setFormData({ ...formData, targetPersonEmail: e.target.value })}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs text-white placeholder-gray-600 outline-none focus:border-blue-500/50" />
            <input type="text" placeholder="Person LinkedIn URL" value={formData.targetPersonLinkedin}
              onChange={(e) => setFormData({ ...formData, targetPersonLinkedin: e.target.value })}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs text-white placeholder-gray-600 outline-none focus:border-blue-500/50" />
            <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="rounded-xl border border-white/10 bg-black px-4 py-2.5 text-xs text-gray-300 outline-none focus:border-blue-500/50">
              <option value="A">Priority A</option>
              <option value="B">Priority B</option>
              <option value="C">Priority C</option>
            </select>
          </div>
          <textarea placeholder="Notes" value={formData.notes} rows={2}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs text-white placeholder-gray-600 outline-none focus:border-blue-500/50 resize-none" />
          <div className="flex gap-2">
            <button type="submit" disabled={formSubmitting}
              className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-xs font-medium text-white disabled:opacity-50">
              {formSubmitting ? "Saving..." : "Save Prospect"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="text-xs text-gray-500 hover:text-gray-300 px-3">Cancel</button>
          </div>
        </form>
      )}

      {/* Table */}
      {prospects.length === 0 ? (
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-8 text-center">
          <Users className="mx-auto h-8 w-8 text-gray-600" />
          <p className="mt-2 text-sm text-gray-500">No prospects yet. Add your first one above.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/5 bg-white/[0.02]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {["Company", "Person", "Priority", "Status", "Report", "Created", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {prospects.map((p) => (
                <tr key={p.id} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <Link href={"/admin/prospects/" + p.id} className="text-xs font-medium text-white hover:text-blue-400">{p.company_name}</Link>
                    <p className="text-[10px] text-gray-600">{p.domain || p.website}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-gray-300">{p.target_person_name || "-"}</p>
                    <p className="text-[10px] text-gray-500">{p.target_person_title || ""}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${priorityColors[p.priority] || "bg-gray-500/10 text-gray-400"}`}>{p.priority}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${statusColors[p.status] || "bg-gray-500/10 text-gray-400"}`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    {p.report_id ? (
                      <Link href={"/report/view?id=" + p.report_id} className="text-[10px] font-mono text-blue-400 hover:text-blue-300">{p.report_id.slice(0, 15)}...</Link>
                    ) : (
                      <span className="text-[10px] text-gray-600">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[10px] text-gray-500">{p.created_at ? new Date(p.created_at).toLocaleDateString() : "-"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Link href={"/admin/prospects/" + p.id} className="text-[10px] text-blue-400 hover:text-blue-300">View</Link>
                      <button onClick={() => handleGenerateMRI(p.id)} disabled={generating === p.id}
                        className="text-[10px] text-gray-500 hover:text-gray-300 disabled:opacity-50">
                        {generating === p.id ? "..." : "Gen MRI"}
                      </button>
                      {p.report_id && (
                        <Link href={"/report/view?id=" + p.report_id + "&prospectId=" + p.id} className="text-[10px] text-gray-500 hover:text-gray-300">
                          <ExternalLink className="h-3 w-3 inline" /> Report
                        </Link>
                      )}
                      {p.outbound_message && (
                        <button onClick={() => handleCopy(p.outbound_message, p.id)} className="text-[10px] text-gray-500 hover:text-gray-300">
                          {copiedId === p.id ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
