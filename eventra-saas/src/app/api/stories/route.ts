import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/stories - fetch approved, non-expired stories for homepage strip
export async function GET(req: Request) {
  try {
    const now = new Date();
    const url = new URL(req.url);
    const lang = (url.searchParams.get("lang") || "").toLowerCase();

    const stories = await prisma.story.findMany({
      where: {
        moderationStatus: "APPROVED",
        expiresAt: { gt: now },
        ...(lang && ["en","ar","ku"].includes(lang) ? { OR: [{ language: lang as any }, { language: null }] } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        user: true,
        venue: true,
      },
    });

    // Structure for UI: group by owner (user/venue) if needed on client
    return NextResponse.json({ stories });
  } catch (e) {
    console.error("stories list error", e);
    return NextResponse.json({ stories: [] });
  }
}
