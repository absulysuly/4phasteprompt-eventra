import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // In production, validate and create a payment intent server-side with your PSP.
  const body = await req.text().catch(() => '{}');
  const payload = (() => { try { return JSON.parse(body); } catch { return {}; } })();
  const { amount, method, context } = payload as any;
  // Return a mock intent id
  return NextResponse.json({ intentId: 'pi_' + Math.random().toString(36).slice(2), amount, method, context });
}