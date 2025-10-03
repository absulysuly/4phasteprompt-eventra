import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { PrismaClient, StoryMediaType, ModerationStatus } from "@prisma/client";
import { moderateImageUrl, moderateVideoUrl } from "../../../lib/moderation";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const session = await getServerSession(authOptions as any);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const venueId = formData.get("venueId") as string | null;
    const caption = formData.get("caption") as string | null;
    const language = (formData.get("language") as string | null) as any;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const allowedImage = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    const allowedVideo = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];
    const isImage = allowedImage.includes(file.type);
    const isVideo = allowedVideo.includes(file.type);

    if (!isImage && !isVideo) {
      return NextResponse.json({ error: "Unsupported media type" }, { status: 400 });
    }

    // Save to disk
    const folder = join(process.cwd(), "public", "uploads", "stories");
    await mkdir(folder, { recursive: true });

    const timestamp = Date.now();
    const sanitized = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${timestamp}_${sanitized}`;
    const filePath = join(folder, filename);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/stories/${filename}`;

    // Determine absolute URL for moderation providers that require it
    const origin = (req.headers as any).get?.("origin") || process.env.APP_ORIGIN || "";
    const absoluteUrl = origin ? `${origin}${publicUrl}` : publicUrl;

    // Run moderation
    const mod = isImage ? await moderateImageUrl(absoluteUrl) : await moderateVideoUrl(absoluteUrl);
    const moderationStatus: ModerationStatus = mod.allowed ? "APPROVED" : "REJECTED";

    // Resolve userId
    const user = await prisma.user.findUnique({ where: { email: session.user.email as string } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const story = await prisma.story.create({
      data: {
        userId: user.id,
        venueId: venueId || undefined,
        mediaType: isImage ? ("IMAGE" as StoryMediaType) : ("VIDEO" as StoryMediaType),
        mediaUrl: publicUrl,
        caption: caption || undefined,
        language: language && ["en","ar","ku"].includes(language) ? language : null,
        isMuted: true,
        moderationStatus,
        moderationLabels: mod.labels ? JSON.stringify(mod.labels) : undefined,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    return NextResponse.json({ success: true, story });
  } catch (e) {
    console.error("story upload error", e);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
