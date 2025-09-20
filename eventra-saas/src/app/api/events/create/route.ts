import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { randomBytes } from "crypto";
import { translateTriple } from "../../../../lib/translate";
import { geocodeAddress } from "../../../../lib/geocode";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({error: "Unauthorized"}, {status: 401});

  const data = await req.json();
  if (!data.title || !data.date) return NextResponse.json({error: "Missing required fields"}, {status: 400});

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({error: "User not found"}, {status: 400});
  
  // Create random unique publicId
  const publicId = randomBytes(6).toString("base64url"); 
  
  const sourceLocale = (data.locale || 'en') as 'en' | 'ar' | 'ku';

  // Attempt geocoding of the location (best-effort)
  let latitude: number | null = null;
  let longitude: number | null = null;
  try {
    if (data.location) {
      const geo = await geocodeAddress(data.location);
      if (geo) { latitude = geo.lat; longitude = geo.lon; }
    }
  } catch {}

  const event = await prisma.event.create({
    data: {
      date: new Date(data.date),
      category: data.category ?? "",
      imageUrl: data.imageUrl ?? "",
      whatsappGroup: data.whatsappGroup ?? "",
      whatsappPhone: data.whatsappPhone ?? "",
      contactMethod: data.contactMethod ?? "",
      city: data.city ?? "",
      latitude: latitude ?? undefined,
      longitude: longitude ?? undefined,
      userId: user.id,
      publicId,
      translations: {
        create: {
          locale: sourceLocale,
          title: data.title,
          description: data.description ?? "",
          location: data.location ?? ""
        }
      }
    },
    include: {
      translations: true
    }
  });

  // Auto-translate to the other locales if translation provider configured
  try {
    const source = { title: data.title as string, description: (data.description ?? "") as string, location: (data.location ?? "") as string };
    const targets: Array<'en'|'ar'|'ku'> = ["en","ar","ku"].filter(l => l !== sourceLocale) as any;
    const translated = await translateTriple(source, targets as any);

    for (const target of targets) {
      // Don't duplicate if an entry for target already exists
      const exists = event.translations.find(t => t.locale === target);
      if (!exists) {
        await prisma.event.update({
          where: { id: event.id },
          data: {
            translations: {
              create: {
                locale: target,
                title: translated[target as 'ar'|'ku'].title,
                description: translated[target as 'ar'|'ku'].description,
                location: translated[target as 'ar'|'ku'].location,
              }
            }
          }
        });
      }
    }
  } catch (e) {
    // Best-effort: keep source translation only if auto-translate fails
    console.warn('Auto-translate failed or skipped:', (e as any)?.message || e);
  }

  const full = await prisma.event.findUnique({ where: { id: event.id }, include: { translations: true } });
  return NextResponse.json({ success: true, event: full });
}
