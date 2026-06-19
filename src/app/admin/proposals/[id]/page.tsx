"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import AdminNav from "@/components/admin/AdminNav";

const STATUSES = ["draft", "under_review", "revised", "accepted", "rejected"];

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-gray-800 text-gray-400",
  under_review: "bg-yellow-900/30 text-yellow-400",
  revised: "bg-blue-900/30 text-blue-400",
  accepted: "bg-green-900/30 text-green-400",
  rejected: "bg-red-900/30 text-red-400",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-white/5 bg-white/[0.02] p-5">
      <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">{title}</h3>
      <div className="text-sm text-gray-300 leading-relaxed">{children}</div>
    </div>
  );
}

function JsonBlock({ data }: { data: any }) {
  if (!data) return <span className="text-gray-600">None</span>;
  return <pre className="text-xs text-gray-400 bg-white/[0.03] rounded p-3 overflow-x-auto max-h-60">{JSON.stringify(data, null, 2)}</pre>;
}

export default function AdminProposalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string | null>(null);
  const [proposal, setProposal] = useState<any>(null);
  const [versions, setVersions] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingVersion, setSavingVersion] = useState(false);
  const [versionMsg, setVersionMsg] = useState("");
  const [newComment, setNewComment] = useState("");

  useEffect(() => { params.then(p => setId(p.id)); }, [params]);

  const loadData = () => {
    if (!id) return;
    Promise.all([
      fetch("/api/proposals/" + id).then(r => r.json()),
      fetch("/api/proposals/" + id + "/comments").then(r => r.json()),
    ]).then(([pData, cData]) => {
      setProposal(pData.proposal || null);
      setComments(cData.comments || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, [id]);

  // Load versions separately
  useEffect(() => {
    if (!id) return;
    fetch("/api/proposals/" + id + "/versions")
      .then(r => r.json())
      .then(d => setVersions(d.versions || []))
      .catch(() => {});
  }, [id]);

  const changeStatus = async (status: string) => {
    if (!id || !proposal) return;
    const r = await fetch("/api/proposals/" + id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const d = await r.json();
    if (d.success) setProposal({ ...proposal, status });
  };

  const saveVersion = async () => {
    if (!id || !proposal) return;
    setSavingVersion(true);
    setVersionMsg("");
    const snapshot = { ...proposal };
    delete snapshot.business;
    delete snapshot.capability;
    delete snapshot.created_at;
    delete snapshot.updated_at;

    const r = await fetch("/api/proposals/" + id + "/versions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        snapshot,
        change_summary: "Manual snapshot from admin",
        created_by: "admin",
        version: (versions.length || 0) + 1,
      }),
    });
    const d = await r.json();
    setSavingVersion(false);
    if (d.success) {
      setVersions([...(d.version ? [d.version] : []), ...versions]);
      setVersionMsg("Version saved!");
      setTimeout(() => setVersionMsg(""), 3000);
    } else {
      setVersionMsg("Failed: " + (d.error || "unknown"));
    }
  };

  const addComment = async () => {
    if (!newComment.trim() || !id) return;
    const r = await fetch("/api/proposals/" + id + "/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comment: newComment, author_name: "Admin", author_type: "human" }),
    });
    const d = await r.json();
    if (d.success) {
      setComments([...comments, d.comment]);
      setNewComment("");
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-black text-white">
      <AdminNav />
      <div className="mx-auto max-w-4xl px-6 py-8 flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
      </div>
    </div>
  );

  if (!proposal) return (
    <div className="min-h-screen bg-black text-white">
      <AdminNav />
      <div className="mx-auto max-w-4xl px-6 py-8">
        <p className="text-gray-500">Proposal not found</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <AdminNav />
      <div className="mx-auto max-w-4xl px-6 py-8">
        <Link href="/admin/proposals" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-300 mb-6">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Proposals
        </Link>

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">{proposal.title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="text-gray-500">Version: <span className="text-gray-300">{proposal.version || 1}</span></span>
              {proposal.budget_min && <span className="text-gray-500">Budget: ${(+proposal.budget_min/1000).toFixed(0)}k - ${(+proposal.budget_max/1000).toFixed(0)}k {proposal.currency}</span>}
              {proposal.timeline && <span className="text-gray-500">Timeline: {proposal.timeline}</span>}
              {proposal.confidence_score > 0 && (
                <span className="text-gray-500">Confidence: <span className={"font-medium " + (proposal.confidence_score >= 80 ? "text-green-400" : proposal.confidence_score >= 60 ? "text-yellow-400" : "text-red-400")}>{proposal.confidence_score}%</span></span>
              )}
            </div>
          </div>
        </div>

        {/* Status Selector */}
        <div className="rounded-lg border border-white/5 bg-white/[0.02] p-5 mb-4">
          <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">Status</h3>
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => changeStatus(s)}
                className={"px-3 py-1.5 rounded-lg text-xs font-medium transition-colors " + (
                  proposal.status === s
                    ? (STATUS_STYLES[s] || "bg-white/10 text-white") + " ring-1 ring-white/20"
                    : "bg-white/[0.03] text-gray-500 hover:text-gray-300 hover:bg-white/[0.06]"
                )}
              >
                {s.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Section title="Proposal Overview">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Business:</span> <span className="text-white">{proposal.business?.display_name || "?"}</span> ({proposal.business?.entity_type || "?"})</div>
              <div><span className="text-gray-500">Capability Partner:</span> <span className="text-white">{proposal.capability?.display_name || "?"}</span> ({proposal.capability?.entity_type || "?"})</div>
              <div><span className="text-gray-500">Created:</span> {proposal.created_at ? new Date(proposal.created_at).toLocaleDateString() : "?"}</div>
              <div><span className="text-gray-500">Updated:</span> {proposal.updated_at ? new Date(proposal.updated_at).toLocaleDateString() : "?"}</div>
            </div>
          </Section>

          {proposal.goal && <Section title="Goal"><p>{proposal.goal}</p></Section>}
          {proposal.constraints && <Section title="Constraints"><JsonBlock data={proposal.constraints} /></Section>}
          {proposal.strategy && <Section title="Strategy"><JsonBlock data={proposal.strategy} /></Section>}
          {proposal.capability_stack && <Section title="Capability Stack"><JsonBlock data={proposal.capability_stack} /></Section>}
          {proposal.execution_plan && <Section title="Execution Plan"><JsonBlock data={proposal.execution_plan} /></Section>}
          {proposal.expected_outcome && <Section title="Expected Outcome"><p>{proposal.expected_outcome}</p></Section>}
          {proposal.reasoning && <Section title="AI Reasoning"><JsonBlock data={proposal.reasoning} /></Section>}

          {/* Version History */}
          <div className="rounded-lg border border-white/5 bg-white/[0.02] p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Version History ({versions.length})</h3>
              <div className="flex items-center gap-3">
                {versionMsg && <span className="text-xs text-green-400">{versionMsg}</span>}
                <button onClick={saveVersion} disabled={savingVersion} className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/15 transition-colors disabled:opacity-50">
                  <Save className="h-3 w-3" /> {savingVersion ? "Saving..." : "Save Current Version"}
                </button>
              </div>
            </div>
            {versions.length === 0 ? (
              <p className="text-xs text-gray-600">No version history yet.</p>
            ) : (
              <div className="space-y-2">
                {versions.map((v: any) => (
                  <div key={v.id} className="border border-white/5 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-white">v{v.version}</span>
                      <span className="text-xs text-gray-600">{v.created_by || "system"} | {v.created_at ? new Date(v.created_at).toLocaleString() : ""}</span>
                    </div>
                    {v.change_summary && <p className="text-xs text-gray-500 mb-1">{v.change_summary}</p>}
                    {v.snapshot && (
                      <details className="text-xs">
                        <summary className="text-gray-600 cursor-pointer hover:text-gray-400">Show snapshot</summary>
                        <pre className="mt-2 text-gray-500 bg-white/[0.02] rounded p-2 overflow-x-auto max-h-40">{JSON.stringify(v.snapshot, null, 2).slice(0, 500)}</pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Comments */}
          <div className="rounded-lg border border-white/5 bg-white/[0.02] p-5">
            <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">Comments ({comments.length})</h3>
            <div className="space-y-3 mb-4">
              {comments.length === 0 && <p className="text-xs text-gray-600">No comments yet</p>}
              {comments.map((c: any) => (
                <div key={c.id} className="border-b border-white/5 pb-3 last:border-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-gray-300">{c.author_name || "Anonymous"}</span>
                    <span className="text-xs text-gray-600">{c.author_type}</span>
                    <span className="text-xs text-gray-600">{c.created_at ? new Date(c.created_at).toLocaleString() : ""}</span>
                  </div>
                  <p className="text-sm text-gray-400">{c.comment}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Add a comment..." className="flex-1 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/10" onKeyDown={(e) => e.key === "Enter" && addComment()} />
              <button onClick={addComment} className="rounded-lg bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/15 transition-colors">Send</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
