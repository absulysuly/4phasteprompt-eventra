import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { initiatePSPPayment } from '../../../../lib/psp-iraq';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { method, amount, phoneNumber, campaignId, context } = body;
    
    if (!method || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate order ID
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    
    // For real PSP methods, initiate payment
    if (['FIB', 'QI', 'FASTPAY'].includes(method.toUpperCase())) {
      const result = await initiatePSPPayment(
        method.toUpperCase() as 'FIB' | 'QI' | 'FASTPAY',
        parseFloat(amount),
        orderId,
        phoneNumber
      );
      
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      
      // Store payment intent in database
      const user = await prisma.user.findUnique({ where: { email: session.user.email } });
      if (user) {
        await prisma.paymentRecord.create({
          data: {
            userId: user.id,
            campaignId: campaignId || null,
            amount: parseFloat(amount),
            method: method.toUpperCase() as any,
            status: 'pending',
            reference: result.transactionId || orderId,
          }
        });
      }
      
      return NextResponse.json({
        success: true,
        redirectUrl: result.redirectUrl,
        transactionId: result.transactionId,
        orderId,
      });
    }
    
    // For mock methods (BANK, COD), return success immediately
    return NextResponse.json({
      success: true,
      orderId,
      message: `${method} payment initiated`,
    });
    
  } catch (error) {
    console.error('Payment initiation error:', error);
    return NextResponse.json(
      { error: 'Payment initiation failed' },
      { status: 500 }
    );
  }
}