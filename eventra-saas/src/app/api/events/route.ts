import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  
  // If type is 'public', return all public events localized
  if (type === 'public') {
    try {
      const lang = (searchParams.get('lang') || 'en').toLowerCase();
      const locale = ['en','ar','ku'].includes(lang) ? (lang as 'en'|'ar'|'ku') : 'en';
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
      const localized = events.map((e) => {
        const pick = e.translations.find(t => t.locale === locale) || e.translations.find(t => t.locale === 'en');
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
