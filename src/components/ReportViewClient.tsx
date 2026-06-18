"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, ArrowRight } from "lucide-react";

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/rest\/v1\/?$/, "");
const serviceKey = ""; // not available client side

// We use the server API to write events instead of direct Supabase
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

interface ReportViewClientProps {
  reportId: string;
  companyName: string;
}

export default function ReportViewClient({ reportId, companyName }: ReportViewClientProps) {
  const router = useRouter();

  // Fire report_viewed event on mount
  useEffect(() => {
    writeEvent(reportId, "report_viewed", {
      page: "/report/view",
      reportId,
      timestamp: new Date().toISOString(),
    });
  }, [reportId]);

  const handleCTA = async () => {
    await writeEvent(reportId, "cta_clicked", {
      page: "/report/view",
      reportId,
      cta: "book_growth_mri_review",
      timestamp: new Date().toISOString(),
    });
    router.push("/contact?source=report_view&reportId=" + encodeURIComponent(reportId));
  };

  return (
    <section className="rounded-xl border border-white/5 bg-gradient-to-br from-purple-500/[0.06] to-blue-500/[0.06] p-8 md:p-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 mb-4">
        <Calendar className="h-6 w-6 text-blue-400" />
      </div>
      <h2 className="text-2xl font-bold text-white">Want a full AI Growth MRI for your company?</h2>
      <p className="mt-3 text-sm text-gray-400 max-w-2xl mx-auto leading-relaxed">
        GroIntel helps founders, CEOs, and growth teams understand market signals, competitor pressure,
        hiring momentum, and expansion readiness before making growth decisions.
      </p>
      <button
        onClick={handleCTA}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3.5 text-sm font-medium text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:from-blue-500 hover:to-purple-500 transition-all"
      >
        Book a Growth MRI Review
        <ArrowRight className="h-4 w-4" />
      </button>
    </section>
  );
}
