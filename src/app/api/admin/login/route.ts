// GroIntel Admin Login
// POST /api/admin/login
// Validates admin password, sets httpOnly session cookie.

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const adminPassword = process.env.ADMIN_ACCESS_PASSWORD || "";

  if (!adminPassword) {
    return NextResponse.json(
      { success: false, error: "Admin access not configured." },
      { status: 500 }
    );
  }

  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request." }, { status: 400 });
  }

  if (!body.password || body.password !== adminPassword) {
    return NextResponse.json(
      { success: false, error: "Incorrect password." },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ success: true });

  response.cookies.set("grointel_admin_session", "true", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
  });

  return response;
}
