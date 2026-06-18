"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, Building2, Globe, Tag, Mail, User, FileText, Copy, Check, RefreshCw, ExternalLink, Loader2 } from "lucide-react";

interface Prospect {
  id: string;
  company_name: string;
  website: string;
  domain: string;
  category: string;
  target_person_name: string;
  target_person_title: string;
  target_person_email: string;
  target_person_linkedin: string;
  priority: string;
  status: string;
  source: string;
  report_id: string;
  outbound_message: string;
  notes: string;
  last_action_at: string;
  created_at: string;
  updated_at: string;
}

const statusOptions = [
  "new", "report_generated", "contacted", "opened", "clicked_cta",
  "replied", "booked", "closed_won", "closed_lost",
];

export default function ProspectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [prospect, setProspect] = useState<Prospect | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [generatingReport, setGeneratingReport] = useState(false);
  const [generatingMessage, setGeneratingMessage] = useState(false);
  const [reportError, setReportError] = useState("");
  const [messageError, setMessageError] = useState("");
  const [copied, setCopied] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [notes, setNotes] = useState("");

  const loadProspect = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/prospects/" + id);
      const data = await res.json();
      if (data.success) {
        setProspect(data.prospect);
        setNotes(data.prospect.notes || "");
      } else {
        setError(data.error || "Not found");
      }
    } catch {
      setError("Failed to load");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadProspect(); }, [loadProspect]);

  async function handleGenerateReport() {
    setGeneratingReport(true);
    setReportError("");
    try {
      const res = await fetch(`/api/admin/prospects/${id}/generate-report`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        await loadProspect();
      } else {
        setReportError(data.error || "Failed");
      }
    } catch {
      setReportError("Network error");
    }
    setGeneratingReport(false);
  }

  async function handleGenerateMessage() {
    setGeneratingMessage(true);
    setMessageError("");
    try {
      const res = await fetch(`/api/admin/prospects/${id}/generate-message`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        await loadProspect();
      } else {
        setMessageError(data.error || "Failed");
      }
    } catch {
      setMessageError("Network error");
    }
    setGeneratingMessage(false);
  }

  async function handleStatusChange(newStatus: string) {
    setSavingStatus(true);
    try {
      await fetch("/api/admin/prospects/" + id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, last_action_at: new Date().toISOString() }),
      });
      await loadProspect();
    } catch {}
    setSavingStatus(false);
  }

  async function handleSaveNotes() {
    setSavingNotes(true);
    try {
      await fetch("/api/admin/prospects/" + id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      await loadProspect();
    } catch {}
    setSavingNotes(false);
  }

  async function handleCopy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  if (loading) {
    return <div className="mx-auto max-w-4xl px-6 py-24 text-center"><Loader2 className="mx-auto h-8 w-8 text-gray-500 animate-spin" /></div>;
  }

  if (error || !prospect) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <AlertTriangle className="mx-auto h-10 w-10 text-gray-600" />
        <h1 className="mt-4 text-lg font-semibold text-white">Prospect Not Found</h1>
        <Link href="/admin/prospects" className="mt-6 inline-flex items-center gap-1 text-xs text-blue-400"><ArrowLeft className="h-3 w-3" /> Back</Link>
      </div>
    );
  }

  const outboundUrl = prospect.report_id
    ? `https://grointel.vercel.app/report/view?id=${prospect.report_id}&prospectId=${prospect.id}`
    : null;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <Link href="/admin/prospects" className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 mb-6">
        <ArrowLeft className="h-3 w-3" /> Back to Prospects
      </Link>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Company Info */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Building2 className="h-4 w-4 text-blue-400" /> Company</h2>
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center gap-2"><Building2 className="h-3.5 w-3.5 text-gray-600 shrink-0" /><span className="text-white">{prospect.company_name}</span></div>
            <div className="flex items-center gap-2"><Globe className="h-3.5 w-3.5 text-gray-600 shrink-0" /><span className="text-gray-400">{prospect.website}</span></div>
            <div className="flex items-center gap-2"><Tag className="h-3.5 w-3.5 text-gray-600 shrink-0" /><span className="text-gray-400">{prospect.domain || "-"}</span></div>
            <div className="flex items-center gap-2"><Globe className="h-3.5 w-3.5 text-gray-600 shrink-0" /><span className="text-gray-400">{prospect.category || "-"}</span></div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Priority:</span>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${prospect.priority === "A" ? "bg-rose-500/10 text-rose-300" : prospect.priority === "B" ? "bg-amber-500/10 text-amber-300" : "bg-gray-500/10 text-gray-400"}`}>{prospect.priority}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Status:</span>
              <select value={prospect.status} onChange={(e) => handleStatusChange(e.target.value)} disabled={savingStatus}
                className="text-[10px] bg-black border border-white/10 rounded px-2 py-0.5 text-gray-300 outline-none">
                {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              {savingStatus && <Loader2 className="h-3 w-3 text-gray-500 animate-spin" />}
            </div>
          </div>
        </div>

        {/* Target Person */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><User className="h-4 w-4 text-purple-400" /> Target Person</h2>
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center gap-2"><User className="h-3.5 w-3.5 text-gray-600 shrink-0" /><span className="text-white">{prospect.target_person_name || "-"}</span></div>
            <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-gray-600 shrink-0" /><span className="text-gray-400">{prospect.target_person_title || "-"}</span></div>
            <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-gray-600 shrink-0" /><span className="text-blue-400">{prospect.target_person_email || "-"}</span></div>
            <div className="flex items-center gap-2"><ExternalLink className="h-3.5 w-3.5 text-gray-600 shrink-0" /><span className="text-gray-400">{prospect.target_person_linkedin || "-"}</span></div>
          </div>
        </div>

        {/* Report */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><FileText className="h-4 w-4 text-emerald-400" /> Report</h2>
          {prospect.report_id ? (
            <div className="space-y-2.5 text-xs">
              <p className="text-gray-500">Report: <span className="text-blue-400 font-mono">{prospect.report_id}</span></p>
              {outboundUrl && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-[10px] truncate">{outboundUrl}</span>
                  <button onClick={() => handleCopy(outboundUrl)} className="text-gray-500 hover:text-gray-300 shrink-0">
                    {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
              )}
              <div className="flex gap-2 mt-2">
                <Link href={"/report/view?id=" + prospect.report_id} className="text-[10px] text-blue-400 hover:text-blue-300">View Report</Link>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-500 mb-2">No report generated yet.</p>
          )}
          <button onClick={handleGenerateReport} disabled={generatingReport}
            className="mt-3 inline-flex items-center gap-1 text-xs text-gray-400 hover:text-white disabled:opacity-50">
            {generatingReport ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
            {generatingReport ? "Generating..." : "Generate / Refresh MRI"}
          </button>
          {reportError && <p className="mt-1 text-[10px] text-red-400">{reportError}</p>}
        </div>

        {/* Outbound Message */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Mail className="h-4 w-4 text-amber-400" /> Outbound</h2>
          {prospect.outbound_message ? (
            <div>
              <pre className="text-[10px] text-gray-400 whitespace-pre-wrap max-h-40 overflow-y-auto">{prospect.outbound_message}</pre>
              <button onClick={() => handleCopy(prospect.outbound_message)} className="mt-2 inline-flex items-center gap-1 text-[10px] text-gray-500 hover:text-gray-300">
                {copied ? <><Check className="h-3 w-3 text-emerald-400" /> Copied</> : <><Copy className="h-3 w-3" /> Copy Message</>}
              </button>
            </div>
          ) : (
            <p className="text-xs text-gray-500">No message generated yet.</p>
          )}
          <button onClick={handleGenerateMessage} disabled={generatingMessage}
            className="mt-3 inline-flex items-center gap-1 text-xs text-gray-400 hover:text-white disabled:opacity-50">
            {generatingMessage ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
            {generatingMessage ? "Generating..." : (prospect.outbound_message ? "Regenerate Message" : "Generate Message")}
          </button>
          {messageError && <p className="mt-1 text-[10px] text-red-400">{messageError}</p>}
        </div>
      </div>

      {/* Notes */}
      <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.02] p-5">
        <h2 className="text-sm font-bold text-white mb-3">Notes</h2>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
          className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs text-white placeholder-gray-600 outline-none focus:border-blue-500/50 resize-none" />
        <div className="flex items-center justify-between mt-2">
          <button onClick={handleSaveNotes} disabled={savingNotes}
            className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 disabled:opacity-50">
            {savingNotes ? "Saving..." : "Save Notes"}
          </button>
          <div className="text-[10px] text-gray-600">
            {prospect.created_at && <span>Created: {new Date(prospect.created_at).toLocaleString()}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
