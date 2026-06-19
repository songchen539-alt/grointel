// GET /api/knowledge/session/[id] — return session with questions and updates
import { NextRequest, NextResponse } from "next/server";
const u = process.env.NEXT_PUBLIC_SUPABASE_URL || "", k = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const h = () => ({ "apikey": k, "Authorization": "Bearer " + k });

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!k) return NextResponse.json({ success: false, error: "Not configured" }, { status: 500 });
  try {
    const [sr, qr, ur] = await Promise.all([
      fetch(u + "/rest/v1/knowledge_completion_sessions?select=*&id=eq." + encodeURIComponent(id), { headers: h() }),
      fetch(u + "/rest/v1/knowledge_completion_questions?select=*&session_id=eq." + encodeURIComponent(id) + "&order=created_at.asc", { headers: h() }),
      fetch(u + "/rest/v1/knowledge_updates?select=*&session_id=eq." + encodeURIComponent(id) + "&order=created_at.asc", { headers: h() }),
    ]);

    const session = sr.ok ? (await sr.json())[0] : null;
    if (!session) return NextResponse.json({ success: false, error: "Session not found" }, { status: 404 });

    return NextResponse.json({
      success: true,
      session,
      questions: qr.ok ? await qr.json() : [],
      updates: ur.ok ? await ur.json() : [],
    });
  } catch { return NextResponse.json({ success: false, error: "Server error" }, { status: 500 }); }
}
