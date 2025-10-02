import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { publicId: string } }
) {
  try {
    const { publicId } = params;
    const url = new URL(request.url);
    const locale = url.searchParams.get('locale') || 'en';

    const venue = await prisma.venue.findUnique({
      where: { publicId },
      include: {
        translations: true,
        user: {
          select: { id: true, name: true }
        }
      }
    });

    if (!venue) {
      return NextResponse.json(
        { success: false, error: 'Venue not found' },
        { status: 404 }
      );
    }

    // Get the appropriate translation
    const translation = venue.translations.find((t: any) => t.locale === locale) || 
                       venue.translations.find((t: any) => t.locale === 'en') || 
                       venue.translations[0];

    // Return localized venue data
    const localizedVenue = {
      id: venue.id,
      publicId: venue.publicId,
      type: venue.type,
      status: venue.status,
      title: translation?.title || 'Untitled Venue',
      description: translation?.description || '',
      location: translation?.location || venue.address || '',
      city: venue.city,
      category: venue.category,
      subcategory: venue.subcategory,
      priceRange: venue.priceRange,
      imageUrl: venue.imageUrl,
      galleryUrls: venue.galleryUrls ? JSON.parse(venue.galleryUrls) : [],
      website: venue.website,
      businessPhone: venue.businessPhone,
      whatsappPhone: venue.whatsappPhone,
      contactMethod: venue.contactMethod,
      bookingUrl: venue.bookingUrl,
      eventDate: venue.eventDate,
      cuisineType: venue.cuisineType,
      dietaryOptions: venue.dietaryOptions ? JSON.parse(venue.dietaryOptions) : [],
      amenities: translation?.amenities ? JSON.parse(translation.amenities) : [],
      features: translation?.features ? JSON.parse(translation.features) : [],
      tags: venue.tags ? JSON.parse(venue.tags) : [],
      productCategories: venue.productCategories ? JSON.parse(venue.productCategories) : [],
      brands: venue.brands ? JSON.parse(venue.brands) : [],
      paymentMethods: venue.paymentMethods ? JSON.parse(venue.paymentMethods) : [],
      businessType: venue.businessType,
      services: venue.services ? JSON.parse(venue.services) : [],
      operatingHours: venue.operatingHours ? JSON.parse(venue.operatingHours) : null,
      featured: venue.featured,
      verified: venue.verified,
      createdAt: venue.createdAt,
      owner: venue.user
    };

    return NextResponse.json({
      success: true,
      venue: localizedVenue
    });

  } catch (error) {
    console.error('Error fetching venue details:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch venue details' },
      { status: 500 }
    );
  }
}