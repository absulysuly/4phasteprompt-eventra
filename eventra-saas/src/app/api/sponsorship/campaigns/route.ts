import { NextResponse } from 'next/server';
import { PrismaClient, CampaignStatus, Placement } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json([], { status: 200 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json([], { status: 200 });
  const list = await prisma.sponsorshipCampaign.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } });
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const { name, placement, budgetDaily, durationDays, audience } = body as any;
  if (!placement || !budgetDaily || !durationDays) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + Number(durationDays));
  const created = await prisma.sponsorshipCampaign.create({
    data: {
      name: name || 'Untitled Campaign',
      placement: String(placement).toUpperCase() as Placement,
      budgetDaily: Number(budgetDaily),
      durationDays: Number(durationDays),
      audienceJson: audience ? JSON.stringify(audience) : undefined,
      userId: user.id,
      status: CampaignStatus.ACTIVE,
      endDate,
    },
  });
  return NextResponse.json({ success: true, campaign: created });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 400 });
  const body = await req.json().catch(() => ({}));
  const { id, budgetDaily, durationDays, status } = body as any;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const updated = await prisma.sponsorshipCampaign.update({
    where: { id },
    data: {
      budgetDaily: budgetDaily !== undefined ? Number(budgetDaily) : undefined,
      durationDays: durationDays !== undefined ? Number(durationDays) : undefined,
      status: status ? (String(status).toUpperCase() as CampaignStatus) : undefined,
    },
  });
  return NextResponse.json({ success: true, campaign: updated });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const { id } = body as any;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  await prisma.sponsorshipCampaign.delete({ where: { id } });
  return NextResponse.json({ success: true });
}