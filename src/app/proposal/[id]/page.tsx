"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

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
  return <pre className="text-xs text-gray-400 bg-white/[0.03] rounded p-3 overflow-x-auto">{JSON.stringify(data, null, 2)}</pre>;
}

export default function PublicProposalPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string | null>(null);
  const [proposal, setProposal] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { params.then(p => setId(p.id)); }, [params]);

  useEffect(() => {
    if (!id) return;
    fetch("/api/proposals/" + id)
      .then(r => r.json())
      .then(d => { setProposal(d.proposal || null); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
    </div>
  );

  if (!proposal) return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-lg font-medium mb-2">Proposal Not Found</h2>
        <p className="text-sm text-gray-500">This proposal may have been removed or the link is invalid.</p>
        <Link href="/" className="text-sm text-blue-400 hover:text-blue-300 mt-4 inline-block">Back to Home</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-300 mb-6">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to GroIntel
        </Link>

        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/[0.02] px-3 py-1 text-xs text-gray-500 mb-3">
            Growth Proposal
          </div>
          <h1 className="text-3xl font-bold mb-4">{proposal.title}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="text-gray-500">Business: <span className="text-white font-medium">{proposal.business?.display_name || "?"}</span></span>
            <span className="text-gray-500">Partner: <span className="text-white font-medium">{proposal.capability?.display_name || "?"}</span></span>
            {proposal.confidence_score > 0 && (
              <span className={"px-2 py-0.5 rounded-full text-xs " + (proposal.confidence_score >= 70 ? "bg-green-900/30 text-green-400" : proposal.confidence_score >= 50 ? "bg-yellow-900/30 text-yellow-400" : "bg-red-900/30 text-red-400")}>
                {proposal.confidence_score}% AI Confidence
              </span>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {proposal.goal && <Section title="Goal"><p className="text-base">{proposal.goal}</p></Section>}

          {proposal.constraints && (
            <Section title="Constraints">
              <JsonBlock data={proposal.constraints} />
            </Section>
          )}

          {proposal.strategy && (
            <Section title="Strategy">
              <JsonBlock data={proposal.strategy} />
            </Section>
          )}

          {proposal.capability_stack && (
            <Section title="Capability Stack">
              <div className="flex flex-wrap gap-2">
                {(proposal.capability_stack as string[]).map((c: string, i: number) => (
                  <span key={i} className="rounded-full bg-white/5 px-3 py-1 text-xs text-gray-300">{c.replace(/_/g, " ")}</span>
                ))}
              </div>
            </Section>
          )}

          {proposal.execution_plan && (
            <Section title="Execution Plan">
              <JsonBlock data={proposal.execution_plan} />
            </Section>
          )}

          {proposal.expected_outcome && (
            <Section title="Expected Outcome">
              <p className="text-base">{proposal.expected_outcome}</p>
            </Section>
          )}

          {proposal.budget_min && (
            <Section title="Budget">
              <p className="text-lg font-medium">${(+proposal.budget_min/1000).toFixed(0)}k - ${(+proposal.budget_max/1000).toFixed(0)}k {proposal.currency}</p>
              {proposal.timeline && <p className="text-sm text-gray-500 mt-1">Timeline: {proposal.timeline}</p>}
            </Section>
          )}

          {proposal.reasoning && (
            <Section title="AI Reasoning">
              <JsonBlock data={proposal.reasoning} />
            </Section>
          )}
        </div>

        <div className="mt-8 border-t border-white/5 pt-6 text-center">
          <p className="text-xs text-gray-600">
            Generated by GroIntel Capability Intelligence Engine | Proposal ID: {proposal.id?.slice(0, 12)}...
          </p>
        </div>
      </div>
    </div>
  );
}
