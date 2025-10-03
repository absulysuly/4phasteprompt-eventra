import { NextResponse } from 'next/server';
import { PrismaClient, VoucherStatus } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  // Simple guard: allow only logged-in users (extend with role check as needed)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const { code } = body as any;
  if (!code) return NextResponse.json({ error: 'Missing code' }, { status: 400 });
  const v = await prisma.voucher.findUnique({ where: { code } });
  if (!v) return NextResponse.json({ error: 'Voucher not found' }, { status: 404 });
  if (v.status === 'APPROVED') return NextResponse.json({ success: true, message: 'Already approved' });
  if (v.status === 'REDEEMED') return NextResponse.json({ error: 'Voucher already redeemed' }, { status: 400 });
  const updated = await prisma.voucher.update({ where: { code }, data: { status: VoucherStatus.APPROVED } });
  return NextResponse.json({ success: true, code: updated.code });
}