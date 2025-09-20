import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();
    if (!token || !password) return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });

    const record = await prisma.passwordResetToken.findUnique({ where: { token } });
    if (!record || record.expiresAt < new Date()) {
      return NextResponse.json({ success: false, error: 'Token expired or invalid' }, { status: 400 });
    }

    const hash = await bcrypt.hash(password, 10);
    await prisma.user.update({ where: { id: record.userId }, data: { password: hash } });
    await prisma.passwordResetToken.delete({ where: { token } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reset confirm error', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
