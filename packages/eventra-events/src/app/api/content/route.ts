import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { PrismaClient, Locale } from "@prisma/client";

const prisma = new PrismaClient();

function isValidLocale(l: string): l is Locale {
  return ["en","ar","ku"].includes(l);
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");
    const locale = searchParams.get("locale") as string | null;
    if (!key || !locale || !isValidLocale(locale)) {
      return NextResponse.json({ error: "Missing or invalid key/locale" }, { status: 400 });
    }

    const content = await prisma.content.findUnique({
      where: { key_locale: { key, locale } },
      select: { key: true, locale: true, data: true, updatedAt: true },
    });

    return NextResponse.json({ content });
  } catch (err) {
    console.error("GET /api/content error", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { key, locale, data } = await req.json();
    if (!key || !locale || !isValidLocale(locale) || typeof data !== "string") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const saved = await prisma.content.upsert({
      where: { key_locale: { key, locale } },
      update: { data },
      create: { key, locale, data },
      select: { key: true, locale: true, data: true, updatedAt: true },
    });

    return NextResponse.json({ content: saved });
  } catch (err) {
    console.error("PUT /api/content error", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
