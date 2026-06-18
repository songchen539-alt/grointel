import { cookies } from "next/headers";
import Link from "next/link";
import { AlertTriangle, Activity, ArrowLeft, Clock } from "lucide-react";
import AdminNav from "@/components/admin/AdminNav";
import { adminQuery } from "@/lib/admin/supabaseQueries";

export const dynamic = "force-dynamic";

interface ReportEvent {
  id: string;
  report_id: string;
  event_type: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

async function ensureAuthorized() {
  const store = await cookies();
  return store.get("grointel_admin_session")?.value === "true";
}

const eventBadgeColors: Record<string, string> = {
  generated: "bg-blue-500/10 text-blue-300",
  report_viewed: "bg-purple-500/10 text-purple-300",
  cta_clicked: "bg-amber-500/10 text-amber-300",
  contact_submitted: "bg-emerald-500/10 text-emerald-300",
};

function EventBadge({ type }: { type: string }) {
  const color = eventBadgeColors[type] || "bg-gray-500/10 text-gray-400";
  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${color}`}>
      {type}
    </span>
  );
}

export default async function AdminEventsPage({ searchParams }: { searchParams: Promise<{ reportId?: string }> }) {
  if (!(await ensureAuthorized())) {
    return (
      <div className="mx-auto max-w-sm px-6 py-24 text-center">
        <AlertTriangle className="mx-auto h-10 w-10 text-amber-500" />
        <h1 className="mt-4 text-lg font-semibold text-white">Access Denied</h1>
        <p className="mt-2 text-xs text-gray-500">Please sign in.</p>
        <Link href="/admin/leads" className="mt-6 text-xs text-blue-400 hover:text-blue-300">Go to Login</Link>
      </div>
    );
  }

  const { reportId } = await searchParams;
  const filter = reportId ? "&report_id=eq." + encodeURIComponent(reportId) : undefined;
  const events = await adminQuery<ReportEvent>(
    "report_events",
    "id,report_id,event_type,metadata,created_at",
    { order: "created_at.desc", limit: 200, filter }
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <AdminNav />

      {reportId ? (
        <div className="mb-6">
          <Link href="/admin/events" className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 mb-2">
            <ArrowLeft className="h-3 w-3" /> All Events
          </Link>
          <h1 className="text-lg font-bold text-white">Events for report: <span className="text-blue-400">{reportId}</span></h1>
        </div>
      ) : (
        <div className="mb-6">
          <h1 className="text-xl font-bold text-white">Events</h1>
          <p className="text-xs text-gray-500 mt-1">All report events.</p>
        </div>
      )}

      {!events || events.length === 0 ? (
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-8 text-center">
          <Activity className="mx-auto h-8 w-8 text-gray-600" />
          <p className="mt-2 text-sm text-gray-500">No events yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/5 bg-white/[0.02]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {["Event Type", "Report ID", "Metadata", "Created"].map((h) => (
                  <th key={h} className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {events.map((evt) => (
                <tr key={evt.id} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <EventBadge type={evt.event_type} />
                  </td>
                  <td className="px-4 py-3">
                    <Link href={"/admin/events?reportId=" + evt.report_id} className="text-xs font-mono text-blue-400 hover:text-blue-300">
                      {evt.report_id}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <pre className="text-[10px] text-gray-500 max-w-xs truncate">
                      {JSON.stringify(evt.metadata, null, 1)}
                    </pre>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-gray-600 shrink-0" />
                      <span className="text-[10px] text-gray-500">
                        {evt.created_at ? new Date(evt.created_at).toLocaleString() : "-"}
                      </span>
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
