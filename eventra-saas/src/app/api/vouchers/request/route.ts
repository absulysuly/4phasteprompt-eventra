import { NextResponse } from 'next/server';
import { PrismaClient, VoucherStatus, PaymentMethodType } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const { name, mobile, email, amountIQD, intendedUse, preferredMethod, address } = body as any;
  if (!amountIQD) return NextResponse.json({ error: 'Missing amount' }, { status: 400 });
  const code = 'VCHR-' + Math.random().toString(36).slice(2, 8).toUpperCase();
  const v = await prisma.voucher.create({
    data: {
      code,
      amountIQD: Number(amountIQD),
      intendedUse: intendedUse || 'sponsorship',
      preferredMethod: preferredMethod ? (String(preferredMethod).toUpperCase() as PaymentMethodType) : null,
      address: address || null,
      requestedById: user.id,
      status: VoucherStatus.REQUESTED,
    },
  });
  return NextResponse.json({ success: true, code: v.code });
}