import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get('query') || '').trim();
  const lang = (url.searchParams.get('lang') || 'en').toLowerCase();
  const locale = ['en','ar','ku'].includes(lang) ? (lang as 'en'|'ar'|'ku') : 'en';

  if (!q) return NextResponse.json({ suggestions: [] });

  try {
    // Search in title and location of translations, limit results
    const matches = await prisma.event.findMany({
      take: 10,
      include: { translations: true },
      where: {
        translations: {
          some: {
            locale,
            OR: [
              { title: { contains: q } },
              { location: { contains: q } }
            ]
          }
        }
      },
      orderBy: { date: 'asc' }
    });

    const suggestions = matches.map((e: any) => {
      const tr = e.translations.find((t: any) => t.locale === locale) || e.translations.find((t: any) => t.locale === 'en');
      return {
        type: 'event',
        id: e.id,
        publicId: e.publicId,
        label: tr?.title || 'Event',
        subtitle: tr?.location || '',
      };
    });

    return NextResponse.json({ suggestions });
  } catch (e) {
    console.error('suggest error', e);
    return NextResponse.json({ suggestions: [] });
  }
}
