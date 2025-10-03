import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // Attach payment to user/campaign and record status
  const { getServerSession } = await import('next-auth');
  const { authOptions } = await import('../../../../lib/auth');
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();
  // In production, confirm payment server-side; never trust client inputs for status.
  const body = await req.text().catch(() => '{}');
  const payload = (() => { try { return JSON.parse(body); } catch { return {}; } })();
  const { amount, method, context, campaignId } = payload as any;
  // Simulate short delay
  await new Promise(r => setTimeout(r, 400));

  // Record payment
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user?.email ? await prisma.user.findUnique({ where: { email: session.user.email } }) : null;
    let campaignLink: string | undefined = undefined;
    if (context === 'sponsorship') {
      if (campaignId) {
        campaignLink = campaignId;
      } else if (user) {
        const latest = await prisma.sponsorshipCampaign.findFirst({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } });
        if (latest) campaignLink = latest.id;
      }
    }
    const mapMethod = (m: string): any => {
      const t = String(m || '').toLowerCase();
      if (t === 'bank') return 'BANK';
      if (t === 'cod') return 'COD';
      if (t === 'knet') return 'QI';
      if (t === 'zain' || t === 'asia') return 'FASTPAY';
      return 'BANK';
    };
    if (user) {
      await prisma.paymentRecord.create({
        data: {
          userId: user.id,
          campaignId: campaignLink,
          amount: Number(amount || 0),
          method: mapMethod(method),
          status: 'succeeded',
          reference: 'rcpt_' + Math.random().toString(36).slice(2),
        }
      });
    }
  } catch (e) {
    console.warn('Payment record error', e);
  }

  return NextResponse.json({ status: 'succeeded', receiptId: 'rcpt_' + Math.random().toString(36).slice(2), amount, method, context, campaignId });
}