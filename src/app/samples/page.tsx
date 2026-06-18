"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Loader2, ExternalLink, RefreshCw, AlertTriangle } from "lucide-react";

interface Sample {
  name: string;
  website: string;
  reportId: string;
  category: string;
  description: string;
}

const samples: Sample[] = [
  { name: "Stripe", website: "stripe.com", reportId: "stripe-com", category: "Fintech", description: "Payments infrastructure and global financial technology platform." },
  { name: "OpenAI", website: "openai.com", reportId: "openai-com", category: "AI", description: "Frontier AI research and product company." },
  { name: "Anthropic", website: "anthropic.com", reportId: "anthropic-com", category: "AI", description: "AI safety and enterprise AI assistant company." },
  { name: "Perplexity", website: "perplexity.ai", reportId: "perplexity-ai", category: "AI Search", description: "AI-native answer engine and research assistant." },
  { name: "Cursor", website: "cursor.com", reportId: "cursor-com", category: "AI Developer Tools", description: "AI coding assistant and developer productivity platform." },
  { name: "Clay", website: "clay.com", reportId: "clay-com", category: "GTM AI", description: "AI-powered go-to-market data and workflow platform." },
  { name: "Ramp", website: "ramp.com", reportId: "ramp-com", category: "Fintech", description: "Corporate card, spend management, and finance automation platform." },
  { name: "Rippling", website: "rippling.com", reportId: "rippling-com", category: "SaaS", description: "Workforce management, HR, IT, and finance operations platform." },
  { name: "Notion", website: "notion.so", reportId: "notion-so", category: "SaaS", description: "Connected workspace for notes, docs, projects, and knowledge management." },
  { name: "Vercel", website: "vercel.com", reportId: "vercel-com", category: "Developer Platform", description: "Frontend cloud platform for developers and AI-native web applications." },
];

const categoryColors: Record<string, string> = {
  "Fintech": "bg-emerald-500/10 text-emerald-300",
  "AI": "bg-purple-500/10 text-purple-300",
  "AI Search": "bg-blue-500/10 text-blue-300",
  "AI Developer Tools": "bg-cyan-500/10 text-cyan-300",
  "GTM AI": "bg-amber-500/10 text-amber-300",
  "SaaS": "bg-rose-500/10 text-rose-300",
  "Developer Platform": "bg-indigo-500/10 text-indigo-300",
};

function trackEvent(eventType: string, company: string, website: string, reportId: string) {
  try {
    fetch("/api/reports/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reportId,
        eventType,
        metadata: { page: "/samples", company, website, timestamp: new Date().toISOString() },
      }),
    });
  } catch {
    console.warn("[samples] Failed to track event:", eventType);
  }
}

function SampleCard({ sample }: { sample: Sample }) {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate() {
    setGenerating(true);
    setError("");
    trackEvent("sample_report_generate_clicked", sample.name, sample.website, sample.reportId);
    try {
      const res = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ website: "https://" + sample.website }),
      });
      const data = await res.json();
      if (data.success && data.redirectUrl) {
        router.push(data.redirectUrl);
      } else {
        setError(data.error || "Failed to generate.");
        setGenerating(false);
      }
    } catch {
      setError("Network error.");
      setGenerating(false);
    }
  }

  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5 hover:border-white/10 transition-all">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-white">{sample.name}</h3>
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${categoryColors[sample.category] || "bg-gray-500/10 text-gray-400"}`}>
          {sample.category}
        </span>
      </div>
      <p className="text-[10px] text-gray-600">{sample.website}</p>
      <p className="mt-2 text-xs text-gray-500 line-clamp-2">{sample.description}</p>
      <div className="mt-3 flex items-center gap-2">
        <Link
          href={"/report/view?id=" + sample.reportId}
          onClick={() => trackEvent("sample_report_clicked", sample.name, sample.website, sample.reportId)}
          className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
        >
          View MRI Report
          <ExternalLink className="h-3 w-3" />
        </Link>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors disabled:opacity-50"
        >
          {generating ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <RefreshCw className="h-3 w-3" />
          )}
          {generating ? "Generating..." : "Generate / Refresh"}
        </button>
      </div>
      {error && <p className="mt-2 text-[10px] text-red-400">{error}</p>}
    </div>
  );
}

export default function SamplesPage() {
  useEffect(() => { document.title = "Sample Company MRI Reports - GroIntel"; }, []);
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-white">Sample Company MRI Reports</h1>
        <p className="mt-3 text-sm text-gray-500 max-w-2xl mx-auto">
          Explore AI-generated growth intelligence reports for high-growth companies
          across AI, SaaS, fintech, and Web3.
        </p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {samples.map((sample) => (
          <SampleCard key={sample.reportId} sample={sample} />
        ))}
      </div>
    </div>
  );
}

