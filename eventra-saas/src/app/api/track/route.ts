import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Basic validation
    if (!body || !Array.isArray(body.events)) {
      return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
    }

    // In real production, forward to analytics vendor or write to durable storage
    // For verification, echo back events and a server receipt id
    const receipt = {
      ok: true,
      received: body.events.length,
      receipt_id: Math.random().toString(36).slice(2),
      server_time: Date.now(),
    };

    return NextResponse.json(receipt, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Unknown error" }, { status: 500 });
  }
}