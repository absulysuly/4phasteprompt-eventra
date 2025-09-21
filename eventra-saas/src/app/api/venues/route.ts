import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get('type'); // EVENT, HOTEL, RESTAURANT, ACTIVITY
    const city = url.searchParams.get('city');
    const locale = url.searchParams.get('locale') || 'en';
    const featured = url.searchParams.get('featured') === 'true';
    const category = url.searchParams.get('category');

    // Build filter conditions
    const where: any = {
      status: 'ACTIVE',
    };

    if (type) {
      where.type = type;
    }

    if (city) {
      where.city = city;
    }

    if (featured) {
      where.featured = true;
    }

    if (category) {
      where.category = category;
    }

    // Fetch venues with translations
    const venues = await prisma.venue.findMany({
      where,
      include: {
        translations: true,
        user: {
          select: { id: true, name: true }
        }
      },
      orderBy: [
        { featured: 'desc' },
        { verified: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    // Localize venues
    const localizedVenues = venues.map((venue: any) => {
      const translation = venue.translations.find((t: any) => t.locale === locale) || 
                         venue.translations.find((t: any) => t.locale === 'en') || 
                         venue.translations[0];

      return {
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
        featured: venue.featured,
        verified: venue.verified,
        createdAt: venue.createdAt,
        owner: venue.user
      };
    });

    return NextResponse.json({
      success: true,
      venues: localizedVenues,
      count: localizedVenues.length
    });

  } catch (error) {
    console.error('Error fetching venues:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch venues' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const data = await request.json();

    // Validate required fields
    if (!data.type || !data.translations || !Array.isArray(data.translations)) {
      return NextResponse.json(
        { success: false, error: 'Type and translations are required' },
        { status: 400 }
      );
    }

    // Generate unique public ID
    const publicId = `${data.type.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

    // Create venue with translations
    const venue = await prisma.venue.create({
      data: {
        type: data.type,
        publicId,
        status: 'PENDING', // Admin approval required
        userId: user.id,
        
        // Business info
        businessEmail: data.businessEmail || '',
        businessPhone: data.businessPhone || '',
        website: data.website || '',
        socialLinks: data.socialLinks ? JSON.stringify(data.socialLinks) : null,
        
        // Location
        address: data.address || '',
        city: data.city || '',
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        
        // Media
        imageUrl: data.imageUrl || '',
        galleryUrls: data.galleryUrls ? JSON.stringify(data.galleryUrls) : null,
        videoUrl: data.videoUrl || '',
        
        // Contact and booking
        bookingUrl: data.bookingUrl || '',
        whatsappPhone: data.whatsappPhone || '',
        contactMethod: data.contactMethod || '',
        
        // Pricing and availability
        priceRange: data.priceRange || '',
        availability: data.availability ? JSON.stringify(data.availability) : null,
        
        // Event-specific
        eventDate: data.eventDate ? new Date(data.eventDate) : null,
        
        // Hotel-specific
        amenities: data.amenities ? JSON.stringify(data.amenities) : null,
        features: data.features ? JSON.stringify(data.features) : null,
        
        // Restaurant-specific
        cuisineType: data.cuisineType || '',
        dietaryOptions: data.dietaryOptions ? JSON.stringify(data.dietaryOptions) : null,
        
        // SEO and categorization
        category: data.category || '',
        subcategory: data.subcategory || '',
        tags: data.tags ? JSON.stringify(data.tags) : null,
        
        // Platform flags
        featured: data.featured || false,
        verified: data.verified || false,

        // Translations
        translations: {
          create: data.translations.map((t: any) => ({
            locale: t.locale,
            title: t.title,
            description: t.description || '',
            location: t.location || '',
            amenities: t.amenities ? JSON.stringify(t.amenities) : null,
            features: t.features ? JSON.stringify(t.features) : null,
          }))
        }
      },
      include: {
        translations: true
      }
    });

    return NextResponse.json({
      success: true,
      venue: venue,
      message: 'Venue created successfully and pending approval'
    });

  } catch (error) {
    console.error('Error creating venue:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create venue' },
      { status: 500 }
    );
  }
}