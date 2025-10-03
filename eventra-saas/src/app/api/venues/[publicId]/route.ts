import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { publicId: string } }
) {
  try {
    const { publicId } = params;

    const venue = await prisma.venue.findUnique({
      where: { publicId },
      include: {
        translations: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!venue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
    }

    // Parse JSON fields
    const galleryUrls = venue.galleryUrls ? JSON.parse(venue.galleryUrls) : [];
    const amenities = venue.amenities ? JSON.parse(venue.amenities) : [];
    const features = venue.features ? JSON.parse(venue.features) : [];
    const tags = venue.tags ? JSON.parse(venue.tags) : [];

    // Get language from query params
    const url = new URL(request.url);
    const lang = (url.searchParams.get('lang') || 'en').toLowerCase();
    const locale = ['ar', 'ku'].includes(lang) ? (lang as 'ar' | 'ku') : 'en';

    // Find the appropriate translation
    const translation = venue.translations.find(t => t.locale === locale) || 
                       venue.translations.find(t => t.locale === 'en') || 
                       venue.translations[0];

    const result = {
      id: venue.id,
      publicId: venue.publicId,
      type: venue.type,
      status: venue.status,
      priceRange: venue.priceRange,
      availability: venue.availability,
      businessEmail: venue.businessEmail,
      businessPhone: venue.businessPhone,
      website: venue.website,
      address: venue.address,
      city: venue.city,
      latitude: venue.latitude,
      longitude: venue.longitude,
      imageUrl: venue.imageUrl,
      galleryUrls,
      videoUrl: venue.videoUrl,
      bookingUrl: venue.bookingUrl,
      whatsappPhone: venue.whatsappPhone,
      contactMethod: venue.contactMethod,
      eventDate: venue.eventDate,
      amenities,
      features,
      cuisineType: venue.cuisineType,
      tags,
      category: venue.category,
      subcategory: venue.subcategory,
      featured: venue.featured,
      verified: venue.verified,
      user: venue.user,
      createdAt: venue.createdAt,
      updatedAt: venue.updatedAt,
      // Localized content
      title: translation?.title || venue.publicId,
      description: translation?.description || '',
      location: translation?.location || venue.address || ''
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching venue details:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}