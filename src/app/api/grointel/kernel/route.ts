// GENESIS-1 — API routes
import { NextRequest, NextResponse } from "next/server";
import { LivingKernel } from "../../../../../apps/grointel/genesis/living_kernel";
import { GenesisFlow } from "../../../../../apps/grointel/genesis/genesis_flow";

const kernel = new LivingKernel();
const flow = new GenesisFlow();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    switch (action) {
      case "start": kernel.startKernel(); break;
      case "stop": kernel.stopKernel(); break;
      case "pause": kernel.pauseKernel(); break;
      case "resume": kernel.resumeKernel(); break;
      default: return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
    return NextResponse.json({ success: true, state: kernel.state });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const status = kernel.kernelStatus();
    return NextResponse.json({ success: true, status });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
