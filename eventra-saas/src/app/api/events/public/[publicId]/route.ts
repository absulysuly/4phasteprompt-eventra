import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request, context: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await context.params;
  const url = new URL(req.url);
  const lang = (url.searchParams.get('lang') || 'ar').toLowerCase();
  const locale = ['ar','ku'].includes(lang) ? (lang as 'ar'|'ku') : 'ar';
  const event = await prisma.event.findUnique({ 
    where: { publicId },
    include: { 
      translations: true,
      user: { select: { name: true, email: true } } 
    }
  });
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });
  const pick = event.translations.find(t => t.locale === locale) || event.translations.find(t => t.locale === 'ar') || event.translations.find(t => t.locale === 'ku') || event.translations[0];
  const dto = {
    id: event.id,
    publicId: event.publicId,
    date: event.date,
    category: event.category,
    imageUrl: event.imageUrl,
    whatsappGroup: event.whatsappGroup,
    whatsappPhone: event.whatsappPhone,
    contactMethod: event.contactMethod,
    city: event.city,
    user: event.user,
    title: pick?.title || '',
    description: pick?.description || '',
    location: pick?.location || ''
  };
  return NextResponse.json(dto);
}
