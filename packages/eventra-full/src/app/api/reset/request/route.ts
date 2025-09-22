import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";
import { applyRateLimit, resetPasswordRateLimit, getClientIP } from "../../../../lib/ratelimit";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    // Apply rate limiting
    const clientIP = getClientIP(req);
    const rateLimitResult = await applyRateLimit(resetPasswordRateLimit, clientIP);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: true }, // Don't reveal rate limiting for security
        { 
          status: 200,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimitResult.reset).toISOString(),
          }
        }
      );
    }
    
    const { email } = await req.json();
    if (!email) return NextResponse.json({ success: true }); // Do not leak emails

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ success: true });

    const token = randomBytes(24).toString("base64url");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: { token, userId: user.id, expiresAt }
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset/${token}`;
    // In lieu of SMTP configuration, log to server console
    console.log("Password reset link for", email, "=", resetUrl);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reset request error", error);
    return NextResponse.json({ success: true });
  }
}
