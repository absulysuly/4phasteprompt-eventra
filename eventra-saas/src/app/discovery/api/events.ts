// API Controller for connecting Iraq Discovery frontend to Eventra SaaS backend

// --- Interfaces ---
export interface Event {
  id: string;
  publicId: string;
  imageUrl: string;
  eventDate: string;
  city: string;
  title: string;
  description: string;
  location: string;
}

export interface GetEventsParams {
  city: string | null;
  month: string; // YYYY-MM
  limit: number;
  offset: number;
  locale: 'en' | 'ar' | 'ku';
}

export interface GetEventsResponse {
  events: Event[];
  total: number;
  hasMore: boolean;
}

// --- API Functions ---

export const getEvents = async (params: GetEventsParams): Promise<GetEventsResponse> => {
  const { city, month, limit, offset, locale } = params;
  
  try {
    // First try to get events using the venues API for EVENT type
    const queryParams = new URLSearchParams({
      type: 'EVENT',
      locale,
    });
    
    if (city && city !== 'all') {
      queryParams.append('city', city);
    }

    const response = await fetch(`/api/venues?${queryParams.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    let allEvents = data.venues || [];
    
    // Filter by month if specified
    if (month) {
      allEvents = allEvents.filter((event: any) => {
        if (!event.eventDate) return false;
        const eventMonth = new Date(event.eventDate).toISOString().substring(0, 7);
        return eventMonth === month;
      });
    }
    
    // Sort by event date
    allEvents.sort((a: any, b: any) => {
      if (!a.eventDate && !b.eventDate) return 0;
      if (!a.eventDate) return 1;
      if (!b.eventDate) return -1;
      return new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime();
    });
    
    // Apply pagination
    const total = allEvents.length;
    const paginatedEvents = allEvents.slice(offset, offset + limit);
    
    // Transform to expected format
    const events: Event[] = paginatedEvents.map((venue: any) => ({
      id: venue.id,
      publicId: venue.publicId,
      imageUrl: venue.imageUrl || '',
      eventDate: venue.eventDate || new Date().toISOString(),
      city: venue.city || '',
      title: venue.title || '',
      description: venue.description || '',
      location: venue.location || venue.address || '',
    }));
    
    return {
      events,
      total,
      hasMore: offset + limit < total
    };
  } catch (error) {
    console.error('Error fetching events:', error);
    // Fallback: try the events API with public type
    try {
      const response = await fetch(`/api/events?type=public&lang=${locale}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const events = await response.json();
        let filteredEvents = Array.isArray(events) ? events : [];
        
        // Filter by city and month
        if (city && city !== 'all') {
          filteredEvents = filteredEvents.filter((e: any) => e.city === city);
        }
        
        if (month) {
          filteredEvents = filteredEvents.filter((e: any) => {
            if (!e.date) return false;
            const eventMonth = new Date(e.date).toISOString().substring(0, 7);
            return eventMonth === month;
          });
        }
        
        // Sort and paginate
        filteredEvents.sort((a: any, b: any) => new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime());
        const total = filteredEvents.length;
        const paginatedEvents = filteredEvents.slice(offset, offset + limit);
        
        const transformedEvents: Event[] = paginatedEvents.map((e: any) => ({
          id: e.id,
          publicId: e.publicId || e.id,
          imageUrl: e.imageUrl || '',
          eventDate: e.date || new Date().toISOString(),
          city: e.city || '',
          title: e.title || '',
          description: e.description || '',
          location: e.location || '',
        }));
        
        return {
          events: transformedEvents,
          total,
          hasMore: offset + limit < total
        };
      }
    } catch (fallbackError) {
      console.error('Fallback API also failed:', fallbackError);
    }
    
    // Return empty result on error
    return {
      events: [],
      total: 0,
      hasMore: false
    };
  }
};

export const getEventCountsByMonth = async (city: string | null): Promise<Record<string, number>> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (city && city !== 'all') {
      queryParams.append('city', city);
    }

    const response = await fetch(`/api/events/counts?${queryParams.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.counts || {};
  } catch (error) {
    console.error('Error fetching event counts:', error);
    return {};
  }
};

export const getVenueDetails = async (publicId: string, locale: 'en' | 'ar' | 'ku') => {
  try {
    const response = await fetch(`/api/venues/${publicId}?locale=${locale}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.success ? data.venue : data;
  } catch (error) {
    console.error('Error fetching venue details:', error);
    return null;
  }
};
