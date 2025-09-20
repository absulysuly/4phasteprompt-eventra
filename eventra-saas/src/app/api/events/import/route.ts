import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { randomBytes } from "crypto";
import { translateTriple } from "../../../lib/translate";
import { geocodeAddress } from "../../../lib/geocode";

const prisma = new PrismaClient();

type IncomingEvent = {
  title: string;
  description?: string;
  date: string; // ISO
  location?: string;
  category?: string;
  price?: number;
  isFree?: boolean;
  imageUrl?: string;
  whatsappGroup?: string;
  whatsappPhone?: string;
  contactMethod?: string;
  city?: string;
};

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 400 });

  try {
    const payload = await req.json();
    if (!Array.isArray(payload?.events)) {
      return NextResponse.json({ error: "Payload must be { events: IncomingEvent[] }" }, { status: 400 });
    }

    const created: any[] = [];
    for (const ev of payload.events as IncomingEvent[]) {
      if (!ev.title || !ev.date) continue;
      const publicId = randomBytes(6).toString("base64url");

      // Geocode location (best-effort)
      let latitude: number | null = null;
      let longitude: number | null = null;
      try {
        if (ev.location) {
          const geo = await geocodeAddress(ev.location);
          if (geo) { latitude = geo.lat; longitude = geo.lon; }
        }
      } catch {}

      // Create base event with English translation as source
      const event = await prisma.event.create({
        data: {
          date: new Date(ev.date),
          category: ev.category || "",
          imageUrl: ev.imageUrl || "",
          whatsappGroup: ev.whatsappGroup || "",
          whatsappPhone: ev.whatsappPhone || "",
          contactMethod: ev.contactMethod || "",
          city: ev.city || "",
          latitude: latitude ?? undefined,
          longitude: longitude ?? undefined,
          userId: user.id,
          publicId,
          translations: {
            create: {
              locale: 'en',
              title: ev.title,
              description: ev.description || "",
              location: ev.location || "",
            }
          }
        },
        include: { translations: true }
      });

      // Auto-translate to ar & ku
      try {
        const translated = await translateTriple({
          title: ev.title,
          description: ev.description || "",
          location: ev.location || "",
        }, ['ar','ku'] as any);

        await prisma.event.update({
          where: { id: event.id },
          data: {
            translations: {
              create: [
                { locale: 'ar', title: translated.ar.title, description: translated.ar.description, location: translated.ar.location },
                { locale: 'ku', title: translated.ku.title, description: translated.ku.description, location: translated.ku.location },
              ]
            }
          }
        });
      } catch {}

      const full = await prisma.event.findUnique({ where: { id: event.id }, include: { translations: true } });
      created.push(full);
    }

    return NextResponse.json({ success: true, count: created.length, events: created });
  } catch (e) {
    console.error('Bulk import failed', e);
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}
