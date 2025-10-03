import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions as any);
  if (!session?.user?.email) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });

    const stories = await prisma.story.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { venue: true }
    });
    return NextResponse.json({ success: true, stories });
  } catch (e) {
    console.error("stories.mine error", e);
    return NextResponse.json({ success: false, stories: [] }, { status: 200 });
  }
}
