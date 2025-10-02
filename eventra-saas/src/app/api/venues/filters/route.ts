/**
 * Venues Filters Metadata API
 * 
 * GET /api/venues/filters
 * 
 * Returns available filter options for the frontend:
 * - Available cities
 * - Available categories
 * - Available cuisine types
 * - Available amenities
 * - Available price ranges
 * 
 * This helps frontend build dynamic filter UIs
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en';

    // Get all active venues to extract filter options
    const venues = await prisma.venue.findMany({
      where: {
        status: 'ACTIVE'
      },
      select: {
        city: true,
        category: true,
        subcategory: true,
        priceRange: true,
        cuisineType: true,
        amenities: true,
        tags: true,
        type: true
      }
    });

    // Extract unique values for filters
    const cities = [...new Set(venues.map(v => v.city).filter(Boolean))].sort();
    
    const categories = [...new Set(venues.map(v => v.category).filter(Boolean))].sort();
    
    const subcategories = [...new Set(venues.map(v => v.subcategory).filter(Boolean))].sort();
    
    const priceRanges = [...new Set(venues.map(v => v.priceRange).filter(Boolean))].sort();
    
    const cuisineTypes = [...new Set(venues.map(v => v.cuisineType).filter(Boolean))].sort();

    // Extract amenities from JSON fields
    const allAmenities = new Set<string>();
    venues.forEach(venue => {
      if (venue.amenities) {
        try {
          const amenitiesArray = JSON.parse(venue.amenities);
          if (Array.isArray(amenitiesArray)) {
            amenitiesArray.forEach(a => allAmenities.add(a));
          }
        } catch {}
      }
    });
    const amenities = [...allAmenities].sort();

    // Extract tags
    const allTags = new Set<string>();
    venues.forEach(venue => {
      if (venue.tags) {
        try {
          const tagsArray = JSON.parse(venue.tags);
          if (Array.isArray(tagsArray)) {
            tagsArray.forEach(t => allTags.add(t));
          }
        } catch {}
      }
    });
    const tags = [...allTags].sort();

    // Venue types
    const types = ['HOTEL', 'RESTAURANT', 'ACTIVITY', 'SERVICE', 'EVENT'];

    // Iraqi governorates with translations
    const governorates = [
      {
        code: 'baghdad',
        name: {
          en: 'Baghdad',
          ar: 'بغداد',
          ku: 'بەغدا'
        }
      },
      {
        code: 'erbil',
        name: {
          en: 'Erbil',
          ar: 'أربيل',
          ku: 'هەولێر'
        }
      },
      {
        code: 'basra',
        name: {
          en: 'Basra',
          ar: 'البصرة',
          ku: 'بەسرە'
        }
      },
      {
        code: 'nineveh',
        name: {
          en: 'Nineveh (Mosul)',
          ar: 'نينوى (الموصل)',
          ku: 'نەینەوا (موسڵ)'
        }
      },
      {
        code: 'sulaymaniyah',
        name: {
          en: 'Sulaymaniyah',
          ar: 'السليمانية',
          ku: 'سلێمانی'
        }
      },
      {
        code: 'kirkuk',
        name: {
          en: 'Kirkuk',
          ar: 'كركوك',
          ku: 'کەرکووک'
        }
      },
      {
        code: 'najaf',
        name: {
          en: 'Najaf',
          ar: 'النجف',
          ku: 'نەجەف'
        }
      },
      {
        code: 'karbala',
        name: {
          en: 'Karbala',
          ar: 'كربلاء',
          ku: 'کەربەلا'
        }
      },
      {
        code: 'duhok',
        name: {
          en: 'Duhok',
          ar: 'دهوك',
          ku: 'دهۆک'
        }
      },
      {
        code: 'anbar',
        name: {
          en: 'Anbar',
          ar: 'الأنبار',
          ku: 'ئەنبار'
        }
      },
      {
        code: 'diyala',
        name: {
          en: 'Diyala',
          ar: 'ديالى',
          ku: 'دیالە'
        }
      },
      {
        code: 'saladin',
        name: {
          en: 'Saladin',
          ar: 'صلاح الدين',
          ku: 'سەلاحەدین'
        }
      },
      {
        code: 'wasit',
        name: {
          en: 'Wasit',
          ar: 'واسط',
          ku: 'واست'
        }
      },
      {
        code: 'babil',
        name: {
          en: 'Babil',
          ar: 'بابل',
          ku: 'بابل'
        }
      },
      {
        code: 'maysan',
        name: {
          en: 'Maysan',
          ar: 'ميسان',
          ku: 'مەیسان'
        }
      },
      {
        code: 'dhi_qar',
        name: {
          en: 'Dhi Qar',
          ar: 'ذي قار',
          ku: 'زیقار'
        }
      },
      {
        code: 'muthanna',
        name: {
          en: 'Muthanna',
          ar: 'المثنى',
          ku: 'موسەنا'
        }
      },
      {
        code: 'qadisiyyah',
        name: {
          en: 'Qadisiyyah',
          ar: 'القادسية',
          ku: 'قادسیە'
        }
      }
    ];

    // Filter governorates that have venues
    const availableGovernorates = governorates
      .filter(gov => cities.includes(gov.code))
      .map(gov => ({
        code: gov.code,
        name: gov.name[locale as keyof typeof gov.name] || gov.name.en,
        count: venues.filter(v => v.city === gov.code).length
      }));

    // Price range translations
    const priceRangeOptions = [
      {
        value: '$',
        label: {
          en: 'Budget',
          ar: 'اقتصادي',
          ku: 'ئابووری'
        }
      },
      {
        value: '$$',
        label: {
          en: 'Moderate',
          ar: 'متوسط',
          ku: 'مامناوەند'
        }
      },
      {
        value: '$$$',
        label: {
          en: 'Expensive',
          ar: 'غالي',
          ku: 'گران'
        }
      },
      {
        value: '$$$$',
        label: {
          en: 'Luxury',
          ar: 'فاخر',
          ku: 'لوکس'
        }
      },
      {
        value: 'Free',
        label: {
          en: 'Free',
          ar: 'مجاني',
          ku: 'بێبەرامبەر'
        }
      }
    ].filter(pr => priceRanges.includes(pr.value));

    // Venue type translations
    const typeOptions = [
      {
        value: 'HOTEL',
        label: {
          en: 'Hotels',
          ar: 'فنادق',
          ku: 'هوتێل'
        }
      },
      {
        value: 'RESTAURANT',
        label: {
          en: 'Restaurants',
          ar: 'مطاعم',
          ku: 'چێشتخانە'
        }
      },
      {
        value: 'ACTIVITY',
        label: {
          en: 'Activities',
          ar: 'أنشطة',
          ku: 'چالاکی'
        }
      },
      {
        value: 'SERVICE',
        label: {
          en: 'Services',
          ar: 'خدمات',
          ku: 'خزمەتگوزاری'
        }
      },
      {
        value: 'EVENT',
        label: {
          en: 'Events',
          ar: 'فعاليات',
          ku: 'بۆنە'
        }
      }
    ];

    return NextResponse.json({
      success: true,
      filters: {
        types: typeOptions,
        governorates: availableGovernorates,
        cities,
        categories,
        subcategories,
        priceRanges: priceRangeOptions,
        cuisineTypes,
        amenities,
        tags
      },
      locale
    });

  } catch (error: any) {
    console.error('Error fetching filter options:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch filter options',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

/**
 * Example Response:
 * {
 *   "success": true,
 *   "filters": {
 *     "types": [
 *       { "value": "HOTEL", "label": "Hotels" },
 *       { "value": "RESTAURANT", "label": "Restaurants" }
 *     ],
 *     "governorates": [
 *       { "code": "baghdad", "name": "Baghdad", "count": 60 },
 *       { "code": "erbil", "name": "Erbil", "count": 45 }
 *     ],
 *     "priceRanges": [
 *       { "value": "$", "label": "Budget" },
 *       { "value": "$$", "label": "Moderate" }
 *     ],
 *     "cuisineTypes": ["Iraqi", "Italian", "Turkish"],
 *     "amenities": ["WiFi", "Parking", "Pool"]
 *   }
 * }
 */
