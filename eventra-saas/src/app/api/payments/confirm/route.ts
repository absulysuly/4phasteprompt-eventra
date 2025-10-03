import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // In production, confirm payment server-side; never trust client inputs for status.
  const body = await req.text().catch(() => '{}');
  const payload = (() => { try { return JSON.parse(body); } catch { return {}; } })();
  const { amount, method, context } = payload as any;
  // Simulate short delay
  await new Promise(r => setTimeout(r, 400));
  return NextResponse.json({ status: 'succeeded', receiptId: 'rcpt_' + Math.random().toString(36).slice(2), amount, method, context });
}