import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const checks: Record<string, any> = {};

  // Env checks
  checks.env = {
    databaseUrlSet: Boolean(process.env.DATABASE_URL),
    nextAuthSecretSet: Boolean(process.env.NEXTAUTH_SECRET),
    googleAuthConfigured: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CLIENT_ID !== 'your-google-client-id-here'),
  };

  // DB connectivity check
  try {
    // For SQLite, a simple SELECT 1 works
    await prisma.$queryRaw`SELECT 1`;
    checks.database = { status: 'ok' };
  } catch (err: any) {
    checks.database = { status: 'error', message: err?.message || String(err) };
  }

  return NextResponse.json({ status: 'ok', checks });
}
