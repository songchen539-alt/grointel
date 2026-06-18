"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar, ArrowRight, TrendingUp } from "lucide-react";

async function writeEvent(reportId: string, eventType: string, metadata: Record<string, unknown>) {
  try {
    await fetch("/api/reports/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId, eventType, metadata }),
    });
  } catch {
    console.warn("[GroIntel] Failed to write event:", eventType);
  }
}

async function updateProspect(prospectId: string, status: string) {
  try {
    await fetch("/api/admin/prospects/" + prospectId, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, last_action_at: new Date().toISOString() }),
    });
  } catch {
    console.warn("[GroIntel] Failed to update prospect status");
  }
}

interface ReportViewClientProps {
  reportId: string;
  companyName: string;
}

export default function ReportViewClient({ reportId, companyName }: ReportViewClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prospectId = searchParams.get("prospectId") || "";

  useEffect(() => {
    const metadata: Record<string, unknown> = {
      page: "/report/view",
      reportId,
      timestamp: new Date().toISOString(),
    };
    if (prospectId) {
      metadata.prospectId = prospectId;
      metadata.source = "outbound";
    }
    writeEvent(reportId, "report_viewed", metadata);
    if (prospectId) {
      updateProspect(prospectId, "opened");
    }
  }, [reportId, prospectId]);

  const handleCTA = async () => {
    const metadata: Record<string, unknown> = {
      page: "/report/view",
      reportId,
      cta: "book_growth_mri_review",
      timestamp: new Date().toISOString(),
    };
    if (prospectId) {
      metadata.prospectId = prospectId;
      metadata.source = "outbound";
    }
    await writeEvent(reportId, "cta_clicked", metadata);
    if (prospectId) {
      updateProspect(prospectId, "clicked_cta");
    }
    let contactUrl = "/contact?source=report_view&reportId=" + encodeURIComponent(reportId);
    if (prospectId) {
      contactUrl = "/contact?source=outbound_report&reportId=" + encodeURIComponent(reportId) + "&prospectId=" + encodeURIComponent(prospectId);
    }
    router.push(contactUrl);
  };

  const handleGrowthOptions = async () => {
    await writeEvent(reportId, "growth_options_clicked", {
      page: "/report/view",
      reportId,
      timestamp: new Date().toISOString(),
    });
    router.push("/growth-options?reportId=" + encodeURIComponent(reportId) + "&website=" + encodeURIComponent(companyName));
  };

  return (
    <div className="space-y-6 mt-8">
      {/* Book a Growth MRI Review CTA */}
      <section className="rounded-xl border border-white/5 bg-gradient-to-br from-purple-500/[0.06] to-blue-500/[0.06] p-8 md:p-10 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 mb-4">
          <Calendar className="h-6 w-6 text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">Want a full AI Growth MRI for your company?</h2>
        <p className="mt-3 text-sm text-gray-400 max-w-2xl mx-auto leading-relaxed">
          GroIntel helps founders, CEOs, and growth teams understand market signals, competitor pressure,
          hiring momentum, and expansion readiness before making growth decisions.
        </p>
        <button onClick={handleCTA}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3.5 text-sm font-medium text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:from-blue-500 hover:to-purple-500 transition-all">
          <Calendar className="h-4 w-4" />
          Book a Growth MRI Review
          <ArrowRight className="h-4 w-4" />
        </button>
      </section>

      {/* Request Growth Solutions CTA */}
      <section className="rounded-xl border border-white/5 bg-gradient-to-br from-emerald-500/[0.06] to-blue-500/[0.06] p-8 md:p-10 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 mb-4">
          <TrendingUp className="h-6 w-6 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">Need growth channels to act on this MRI?</h2>
        <p className="mt-3 text-sm text-gray-400 max-w-2xl mx-auto leading-relaxed">
          GroIntel can help you turn this Company MRI into curated growth solution options, including
          outbound, lead generation, market entry, PR, community, media, and channel partnerships.
        </p>
        <button onClick={handleGrowthOptions}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-blue-600 px-8 py-3.5 text-sm font-medium text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:from-emerald-500 hover:to-blue-500 transition-all">
          <TrendingUp className="h-4 w-4" />
          Request Growth Solutions
          <ArrowRight className="h-4 w-4" />
        </button>
      </section>
    </div>
  );
}
