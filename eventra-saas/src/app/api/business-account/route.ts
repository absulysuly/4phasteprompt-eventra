import { NextResponse } from 'next/server';
import { PrismaClient, BusinessStatus } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({}, { status: 200 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email }, include: { businessAccount: true } });
  return NextResponse.json(user?.businessAccount || {});
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 400 });
  const body = await req.json().catch(() => ({}));
  const { bankName, account, iban, beneficiary, branch, swift } = body as any;
  if (!bankName || !account) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  const up = await prisma.businessAccount.upsert({
    where: { userId: user.id },
    update: { bankName, account, iban, beneficiary, branch, swift, status: BusinessStatus.PENDING },
    create: { userId: user.id, bankName, account, iban, beneficiary, branch, swift, status: BusinessStatus.PENDING },
  });
  return NextResponse.json({ success: true, account: up });
}