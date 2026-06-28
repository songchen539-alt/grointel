import { NextResponse } from "next/server";
import { getAIGatewayStatus } from "@/lib/ai/gateway/status";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getAIGatewayStatus());
}
