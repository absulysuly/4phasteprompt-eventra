import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { readFile } from "fs/promises";
import { join } from "path";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  // Optional static mode for safe deployments without a DB
  const useStatic = process.env.NEXT_PUBLIC_EVENTS_STATIC === '1' || !!process.env.EVENTS_STATIC_FILE;
  if (type === 'public' && useStatic) {
    try {
      const filePath = process.env.EVENTS_STATIC_FILE || join(process.cwd(), 'public', 'data', 'events.json');
      const json = await readFile(filePath, 'utf8');
      const list = JSON.parse(json);
      return NextResponse.json(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error('Static events read failed:', e);
      return NextResponse.json([], { status: 200 });
    }
  }
  
  // If type is 'public', return all public events localized from DB
  if (type === 'public') {
    try {
      const lang = (searchParams.get('lang') || 'ar').toLowerCase();
      const locale = ['ar','ku'].includes(lang) ? (lang as 'ar'|'ku') : 'ar';
      const events = await prisma.event.findMany({
        include: {
          translations: true,
          user: {
            select: {
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          date: 'asc'
        }
      });
      // Map to localized DTO
      const localized = events.map((e: any) => {
        const pick = e.translations.find((t: any) => t.locale === locale) || e.translations.find((t: any) => t.locale === 'ar') || e.translations.find((t: any) => t.locale === 'ku') || e.translations[0];
        return {
          id: e.id,
          publicId: e.publicId,
          date: e.date,
          category: e.category,
          imageUrl: e.imageUrl,
          whatsappGroup: e.whatsappGroup,
          whatsappPhone: e.whatsappPhone,
          contactMethod: e.contactMethod,
          city: e.city,
          user: e.user,
          // localized
          title: pick?.title || '',
          description: pick?.description || '',
          location: pick?.location || ''
        };
      });
      return NextResponse.json(localized);
    } catch (error) {
      console.error('Error fetching public events:', error);
      return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
    }
  }
  
  // Original behavior for user-specific events
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json([], { status: 200 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email }, include: { events: true } });
  return NextResponse.json(user?.events ?? []);
}
