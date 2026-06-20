"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2, ArrowLeft, Globe, BrainCircuit, TrendingUp, Shield, Target, BarChart3, Search } from "lucide-react";

function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-white/5 bg-white/[0.02] p-5">
      <h3 className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">{icon} {title}</h3>
      <div className="text-sm text-gray-300 leading-relaxed">{children}</div>
    </div>
  );
}

function ListBlock({ items }: { items: any[] }) {
  if (!items || items.length === 0) return <span className="text-gray-600">None identified</span>;
  return (
    <div className="space-y-2">
      {items.map((item: any, i: number) => (
        <div key={i} className="flex items-start gap-2 text-sm">
          <span className="text-gray-600 mt-1 shrink-0">-</span>
          {typeof item === "string" ? <span className="text-gray-300">{item}</span> : <pre className="text-xs text-gray-400 bg-white/[0.03] rounded p-2 overflow-x-auto w-full">{JSON.stringify(item, null, 2)}</pre>}
        </div>
      ))}
    </div>
  );
}

function JsonInline({ data }: { data: any }) {
  if (!data) return <span className="text-gray-600">None</span>;
  if (typeof data === "string") return <span className="text-white">{data}</span>;
  if (Array.isArray(data)) return <ListBlock items={data} />;
  return <pre className="text-xs text-gray-400 bg-white/[0.03] rounded p-3 overflow-x-auto">{JSON.stringify(data, null, 2)}</pre>;
}

function ConfidenceBadge({ name, score }: { name: string; score: number }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-gray-500">{name}</span>
      <div className="flex items-center gap-2">
        <div className="w-24 h-1.5 rounded-full bg-white/5 overflow-hidden">
          <div className={"h-full rounded-full " + (score >= 70 ? "bg-green-500" : score >= 50 ? "bg-yellow-500" : "bg-red-500")} style={{ width: Math.min(score, 100) + "%" }} />
        </div>
        <span className={"text-xs font-mono w-8 text-right " + (score >= 70 ? "text-green-400" : score >= 50 ? "text-yellow-400" : "text-red-400")}>{score}%</span>
      </div>
    </div>
  );
}

function MatchResults({ matches }: { matches: any[] }) {
  if (!matches || matches.length === 0) return null;
  return (
    <div className="mt-6 space-y-3">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <Target className="h-4 w-4 text-blue-400" /> Recommended KOLs / Growth Partners
      </h2>
      {matches.map((match) => (
        <div key={match.capabilityProfileId} className="rounded-lg border border-white/5 bg-white/[0.02] p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">{match.displayName}</h3>
              <p className="mt-1 text-xs text-gray-500">{match.recommendedSolutionType || "Growth collaboration"}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xl font-bold text-blue-400">{match.overallScore}</p>
                <p className="text-[10px] uppercase tracking-wider text-gray-600">match</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-300">{match.confidence}</p>
                <p className="text-[10px] uppercase tracking-wider text-gray-600">confidence</p>
              </div>
            </div>
          </div>
          {match.matchReason && <p className="mt-3 text-sm text-gray-400">{match.matchReason}</p>}
          {match.reasons?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {match.reasons.slice(0, 4).map((reason: any, i: number) => (
                <span key={i} className="rounded-full border border-white/5 bg-white/[0.03] px-2.5 py-1 text-[10px] text-gray-500">
                  {reason.category}: {reason.message}
                </span>
              ))}
            </div>
          )}
          {match.missingCapabilityFields?.length > 0 && (
            <p className="mt-3 text-xs text-amber-400">
              Needs more capability data: {match.missingCapabilityFields.join(", ")}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

export default function BusinessIntelligenceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [scanProfile, setScanProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [matchLoading, setMatchLoading] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);
  const [matchError, setMatchError] = useState("");

  useEffect(() => { params.then(p => setId(p.id)); }, [params]);

  useEffect(() => {
    if (!id) return;
    fetch("/api/business-intelligence/" + id)
      .then(r => r.json())
      .then(d => { setProfile(d.profile || null); setScanProfile(d.scanProfile || null); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-lg font-medium mb-2">Profile Not Found</h2>
        <p className="text-sm text-gray-500">This Business Intelligence profile does not exist.</p>
        <Link href="/business-intelligence" className="text-sm text-blue-400 hover:text-blue-300 mt-4 inline-block">Try another website</Link>
      </div>
    </div>
  );

  const scanConf = scanProfile?.confidence || {};
  const knowledgeConf = profile?.knowledge_confidence || {};

  const findMatches = async () => {
    if (!profile?.id) return;
    setMatchLoading(true);
    setMatchError("");
    try {
      const res = await fetch("/api/grointel/profile-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessProfileId: profile.id }),
      });
      const data = await res.json();
      if (data.success) {
        setMatches(data.candidates || []);
      } else {
        setMatchError(data.error || "Could not find matches");
      }
    } catch {
      setMatchError("Network error");
    }
    setMatchLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <Link href="/business-intelligence" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-300 mb-6">
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </Link>

        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/[0.02] px-3 py-1 text-xs text-gray-500 mb-3">
            <BrainCircuit className="h-3 w-3 text-blue-400" /> Business Intelligence
          </div>
          <h1 className="text-3xl font-bold mb-2">{profile.business_identity?.name || profile.website}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="text-gray-500">{profile.website}</span>
            <span className="text-gray-600">|</span>
            <span className="text-gray-500">{profile.business_identity?.industry || "?"}</span>
            {profile.business_identity?.region && <><span className="text-gray-600">|</span><span className="text-gray-500">{profile.business_identity.region}</span></>}
          </div>
        </div>

        <div className="space-y-6">
          {/* Section 1: Initial Public Scan */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-500" /> Initial Public Scan
            </h2>
            {scanProfile ? (
              <div className="space-y-4">
                <Section title="Business Identity" icon={<Shield className="h-3.5 w-3.5 text-blue-400" />}>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-gray-500">Name:</span> {scanProfile.company_name || "?"}</div>
                    <div><span className="text-gray-500">Website:</span> {scanProfile.website}</div>
                    <div><span className="text-gray-500">Industry:</span> {scanProfile.industry || "?"}</div>
                    <div><span className="text-gray-500">Region:</span> {scanProfile.region || "?"}{scanProfile.country ? " (" + scanProfile.country + ")" : ""}</div>
                  </div>
                </Section>
                {scanProfile.public_summary && <Section title="Summary"><p className="text-sm">{scanProfile.public_summary}</p></Section>}
                {scanProfile.detected_products?.length > 0 && <Section title="Detected Products"><JsonInline data={scanProfile.detected_products} /></Section>}
                {scanProfile.detected_markets?.length > 0 && <Section title="Detected Markets"><JsonInline data={scanProfile.detected_markets} /></Section>}
                {scanProfile.detected_growth_channels?.length > 0 && <Section title="Detected Growth Channels"><JsonInline data={scanProfile.detected_growth_channels} /></Section>}
                {scanProfile.sources?.length > 0 && (
                  <Section title="Sources">
                    <div className="space-y-1">
                      {scanProfile.sources.map((s: any, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <span className="text-gray-500">{s.type || "source"}</span>
                          {s.url && <span className="text-gray-600">{s.url}</span>}
                          {s.reliability && <span className={"px-1.5 py-0.5 rounded text-xs " + (s.reliability === "high" ? "bg-green-900/30 text-green-400" : "bg-yellow-900/30 text-yellow-400")}>{s.reliability}</span>}
                        </div>
                      ))}
                    </div>
                  </Section>
                )}
                <Section title="Scan Confidence">
                  {Object.keys(scanConf).length > 0 ? (
                    <div className="space-y-1">
                      {Object.entries(scanConf).map(([key, val]) => (
                        <ConfidenceBadge key={key} name={key.charAt(0).toUpperCase() + key.slice(1)} score={val as number} />
                      ))}
                    </div>
                  ) : <span className="text-gray-600">N/A</span>}
                </Section>
              </div>
            ) : (
              <p className="text-sm text-gray-600">No scan data available</p>
            )}
          </div>

          {/* Section 2: Business Knowledge */}
          <div className="border-t border-white/5 pt-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BrainCircuit className="h-4 w-4 text-gray-500" /> Business Knowledge
            </h2>
            <div className="space-y-4">
              <Section title="Identity" icon={<Shield className="h-3.5 w-3.5 text-blue-400" />}>
                <JsonInline data={profile.business_identity} />
              </Section>
              <Section title="Business Model" icon={<TrendingUp className="h-3.5 w-3.5 text-green-400" />}>
                <JsonInline data={profile.business_model} />
              </Section>
              <Section title="Market" icon={<BarChart3 className="h-3.5 w-3.5 text-purple-400" />}>
                <JsonInline data={profile.market} />
              </Section>
              <Section title="Growth Stack" icon={<Target className="h-3.5 w-3.5 text-yellow-400" />}>
                <JsonInline data={profile.growth_stack} />
              </Section>
              <Section title="Goals"><JsonInline data={profile.goals} /></Section>
              <Section title="Constraints"><JsonInline data={profile.constraints} /></Section>
              {profile.history?.length > 0 && <Section title="History"><JsonInline data={profile.history} /></Section>}

              <Section title="Knowledge Confidence">
                {Object.keys(knowledgeConf).length > 0 ? (
                  <div className="space-y-1">
                    {Object.entries(knowledgeConf).map(([key, val]) => (
                      <ConfidenceBadge key={key} name={key.charAt(0).toUpperCase() + key.slice(1)} score={val as number} />
                    ))}
                  </div>
                ) : <span className="text-gray-600">Insufficient data</span>}
              </Section>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="mt-8 rounded-lg border border-white/5 bg-white/[0.02] p-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href={profile ? "/business-intelligence/" + profile.id + "/complete" : "#"} className="rounded-lg bg-white/10 px-6 py-3 text-sm text-white hover:bg-white/15 transition-colors w-full sm:w-auto text-center">
              Complete Business Understanding
            </Link>
            <button onClick={findMatches} disabled={matchLoading} className="rounded-lg bg-blue-500/15 px-6 py-3 text-sm text-blue-200 hover:bg-blue-500/20 transition-colors disabled:opacity-50 w-full sm:w-auto text-center">
              {matchLoading ? "Finding Matches..." : "Find Recommended Partners"}
            </button>
          </div>
          {matchError && <p className="mt-3 text-center text-sm text-red-400">{matchError}</p>}
        </div>
        <MatchResults matches={matches} />
      </div>
    </div>
  );
}
