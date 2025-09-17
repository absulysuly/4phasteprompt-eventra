export interface SearchQuery {
  query: string;
  filters: SearchFilters;
  sortBy: 'relevance' | 'date' | 'popularity' | 'distance' | 'price';
  sortOrder: 'asc' | 'desc';
  limit: number;
  offset: number;
}

export interface SearchFilters {
  categories: string[];
  dateRange: {
    start?: string;
    end?: string;
  };
  priceRange: {
    min?: number;
    max?: number;
  };
  location: {
    lat?: number;
    lng?: number;
    radius?: number; // in miles
    city?: string;
    country?: string;
  };
  tags: string[];
  organizer?: string;
  attendeeCount: {
    min?: number;
    max?: number;
  };
  availability: 'all' | 'available' | 'sold_out';
  eventType: 'free' | 'paid' | 'all';
  isOnline?: boolean;
  language?: string;
}

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  location: {
    name: string;
    city: string;
    country: string;
    lat?: number;
    lng?: number;
  };
  price: {
    min: number;
    max: number;
    currency: string;
  };
  organizer: {
    name: string;
    verified: boolean;
  };
  attendeeCount: number;
  maxAttendees: number;
  tags: string[];
  imageUrl: string;
  isOnline: boolean;
  isFree: boolean;
  relevanceScore: number;
  popularityScore: number;
  distance?: number; // in miles from search location
  aiInsight?: string;
}

export interface SearchResponse {
  results: SearchResult[];
  totalCount: number;
  facets: SearchFacets;
  suggestions: string[];
  aiSummary: string;
  searchTime: number;
  relatedQueries: string[];
}

export interface SearchFacets {
  categories: Array<{ name: string; count: number }>;
  locations: Array<{ name: string; count: number }>;
  priceRanges: Array<{ range: string; count: number }>;
  dateRanges: Array<{ range: string; count: number }>;
  organizers: Array<{ name: string; count: number }>;
  tags: Array<{ name: string; count: number }>;
}

export interface NaturalLanguageQuery {
  originalQuery: string;
  extractedIntent: {
    action: 'search' | 'filter' | 'suggest' | 'compare';
    entities: {
      eventType?: string[];
      location?: string[];
      date?: {
        type: 'specific' | 'relative' | 'range';
        value: string;
      };
      price?: {
        type: 'free' | 'budget' | 'range';
        value?: string;
      };
      category?: string[];
      organizer?: string;
    };
  };
  confidence: number;
  structuredFilters: SearchFilters;
  suggestedQuery: string;
}

export interface SmartFilter {
  id: string;
  name: string;
  description: string;
  conditions: Array<{
    field: string;
    operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'between' | 'in';
    value: any;
  }>;
  isActive: boolean;
  resultCount?: number;
}

export interface SearchInsight {
  type: 'trending' | 'popular_nearby' | 'price_comparison' | 'availability' | 'recommendation';
  title: string;
  description: string;
  data: any;
  actionable: boolean;
  actionText?: string;
  actionQuery?: SearchQuery;
}

class SearchService {
  private static instance: SearchService;
  private searchHistory: string[] = [];
  private popularQueries: Map<string, number> = new Map();
  private userPreferences: Map<string, any> = new Map();
  private searchCache: Map<string, SearchResponse> = new Map();

  public static getInstance(): SearchService {
    if (!SearchService.instance) {
      SearchService.instance = new SearchService();
    }
    return SearchService.instance;
  }

  constructor() {
    this.loadSearchData();
  }

  private loadSearchData(): void {
    try {
      const history = localStorage.getItem('eventra-search-history');
      if (history) {
        this.searchHistory = JSON.parse(history);
      }

      const popular = localStorage.getItem('eventra-popular-queries');
      if (popular) {
        this.popularQueries = new Map(Object.entries(JSON.parse(popular)));
      }

      const preferences = localStorage.getItem('eventra-search-preferences');
      if (preferences) {
        this.userPreferences = new Map(Object.entries(JSON.parse(preferences)));
      }
    } catch (error) {
      console.error('Error loading search data:', error);
    }
  }

  private saveSearchData(): void {
    try {
      localStorage.setItem('eventra-search-history', JSON.stringify(this.searchHistory));
      
      const popularObj = Object.fromEntries(this.popularQueries);
      localStorage.setItem('eventra-popular-queries', JSON.stringify(popularObj));
      
      const preferencesObj = Object.fromEntries(this.userPreferences);
      localStorage.setItem('eventra-search-preferences', JSON.stringify(preferencesObj));
    } catch (error) {
      console.error('Error saving search data:', error);
    }
  }

  // Natural Language Processing
  async parseNaturalLanguageQuery(query: string): Promise<NaturalLanguageQuery> {
    const startTime = Date.now();
    
    try {
      // Simulate AI processing with Gemini-style analysis
      const nlQuery = await this.analyzeQueryWithAI(query);
      
      console.log(`NLP processing time: ${Date.now() - startTime}ms`);
      return nlQuery;
    } catch (error) {
      console.error('Error parsing natural language query:', error);
      return this.getFallbackNLQuery(query);
    }
  }

  private async analyzeQueryWithAI(query: string): Promise<NaturalLanguageQuery> {
    // Simulate AI analysis (in production, integrate with Gemini AI)
    const keywords = query.toLowerCase();
    
    const entities: NaturalLanguageQuery['extractedIntent']['entities'] = {};
    const filters: SearchFilters = {
      categories: [],
      dateRange: {},
      priceRange: {},
      location: {},
      tags: [],
      attendeeCount: {},
      availability: 'all',
      eventType: 'all'
    };

    // Extract event types/categories
    const categoryKeywords = {
      'music': ['concert', 'music', 'band', 'singer', 'acoustic', 'jazz', 'rock', 'pop'],
      'food': ['food', 'restaurant', 'dining', 'culinary', 'cooking', 'wine', 'tasting'],
      'tech': ['tech', 'technology', 'startup', 'coding', 'ai', 'programming', 'conference'],
      'sports': ['sport', 'game', 'match', 'tournament', 'fitness', 'gym', 'running'],
      'education': ['workshop', 'seminar', 'course', 'training', 'learn', 'education'],
      'art': ['art', 'gallery', 'exhibition', 'painting', 'sculpture', 'creative'],
      'networking': ['networking', 'meetup', 'business', 'professional', 'career']
    };

    for (const [category, words] of Object.entries(categoryKeywords)) {
      if (words.some(word => keywords.includes(word))) {
        filters.categories.push(category);
        entities.eventType = entities.eventType || [];
        entities.eventType.push(category);
      }
    }

    // Extract location
    const locationPatterns = [
      /in ([a-zA-Z\s]+)/i,
      /at ([a-zA-Z\s]+)/i,
      /near ([a-zA-Z\s]+)/i,
      /around ([a-zA-Z\s]+)/i
    ];
    
    for (const pattern of locationPatterns) {
      const match = query.match(pattern);
      if (match) {
        const location = match[1].trim();
        filters.location.city = location;
        entities.location = [location];
        break;
      }
    }

    // Extract date information
    if (keywords.includes('today')) {
      const today = new Date().toISOString().split('T')[0];
      filters.dateRange.start = today;
      filters.dateRange.end = today;
      entities.date = { type: 'specific', value: 'today' };
    } else if (keywords.includes('tomorrow')) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      filters.dateRange.start = tomorrowStr;
      filters.dateRange.end = tomorrowStr;
      entities.date = { type: 'specific', value: 'tomorrow' };
    } else if (keywords.includes('weekend')) {
      const now = new Date();
      const saturday = new Date(now);
      saturday.setDate(now.getDate() + (6 - now.getDay()));
      const sunday = new Date(saturday);
      sunday.setDate(saturday.getDate() + 1);
      
      filters.dateRange.start = saturday.toISOString().split('T')[0];
      filters.dateRange.end = sunday.toISOString().split('T')[0];
      entities.date = { type: 'relative', value: 'weekend' };
    }

    // Extract price information
    if (keywords.includes('free') || keywords.includes('no cost')) {
      filters.eventType = 'free';
      entities.price = { type: 'free' };
    } else if (keywords.includes('cheap') || keywords.includes('budget')) {
      filters.priceRange.max = 50;
      entities.price = { type: 'budget' };
    }

    // Extract online/offline preference
    if (keywords.includes('online') || keywords.includes('virtual')) {
      filters.isOnline = true;
    } else if (keywords.includes('offline') || keywords.includes('in-person')) {
      filters.isOnline = false;
    }

    // Determine confidence based on extracted entities
    const extractedCount = Object.keys(entities).length;
    const confidence = Math.min(0.9, 0.3 + (extractedCount * 0.15));

    // Generate suggested structured query
    const suggestedQuery = this.generateStructuredQuery(entities);

    return {
      originalQuery: query,
      extractedIntent: {
        action: 'search',
        entities
      },
      confidence,
      structuredFilters: filters,
      suggestedQuery
    };
  }

  private getFallbackNLQuery(query: string): NaturalLanguageQuery {
    return {
      originalQuery: query,
      extractedIntent: {
        action: 'search',
        entities: {}
      },
      confidence: 0.1,
      structuredFilters: {
        categories: [],
        dateRange: {},
        priceRange: {},
        location: {},
        tags: [],
        attendeeCount: {},
        availability: 'all',
        eventType: 'all'
      },
      suggestedQuery: query
    };
  }

  private generateStructuredQuery(entities: any): string {
    const parts = [];
    
    if (entities.eventType?.length) {
      parts.push(`${entities.eventType.join(' or ')} events`);
    }
    
    if (entities.location?.length) {
      parts.push(`in ${entities.location.join(' or ')}`);
    }
    
    if (entities.date) {
      parts.push(entities.date.value);
    }
    
    if (entities.price?.type === 'free') {
      parts.push('free');
    } else if (entities.price?.type === 'budget') {
      parts.push('under $50');
    }

    return parts.join(' ') || 'events';
  }

  // Main search functionality
  async search(searchQuery: SearchQuery): Promise<SearchResponse> {
    const startTime = Date.now();
    
    try {
      // Check cache first
      const cacheKey = JSON.stringify(searchQuery);
      if (this.searchCache.has(cacheKey)) {
        console.log('Returning cached results');
        return this.searchCache.get(cacheKey)!;
      }

      // Update search history
      this.updateSearchHistory(searchQuery.query);
      
      // Perform search
      const results = await this.performSearch(searchQuery);
      
      // Generate AI insights and summary
      const aiSummary = await this.generateSearchSummary(searchQuery, results);
      const suggestions = this.generateSearchSuggestions(searchQuery.query);
      const relatedQueries = this.generateRelatedQueries(searchQuery);
      
      // Build facets
      const facets = this.buildSearchFacets(results);
      
      const response: SearchResponse = {
        results,
        totalCount: results.length,
        facets,
        suggestions,
        aiSummary,
        searchTime: Date.now() - startTime,
        relatedQueries
      };

      // Cache results
      this.searchCache.set(cacheKey, response);
      
      return response;
    } catch (error) {
      console.error('Search error:', error);
      return this.getEmptySearchResponse();
    }
  }

  private async performSearch(searchQuery: SearchQuery): Promise<SearchResult[]> {
    // Simulate search with mock data
    const mockEvents: SearchResult[] = [
      {
        id: '1',
        title: 'Tech Innovation Summit 2024',
        description: 'Join industry leaders discussing the future of technology and innovation.',
        category: 'tech',
        date: '2024-04-15T10:00:00Z',
        location: {
          name: 'Convention Center',
          city: 'San Francisco',
          country: 'USA',
          lat: 37.7749,
          lng: -122.4194
        },
        price: { min: 99, max: 299, currency: 'USD' },
        organizer: { name: 'TechCorp Inc', verified: true },
        attendeeCount: 1250,
        maxAttendees: 1500,
        tags: ['technology', 'innovation', 'startup', 'networking'],
        imageUrl: 'https://example.com/tech-summit.jpg',
        isOnline: false,
        isFree: false,
        relevanceScore: 0.95,
        popularityScore: 0.88
      },
      {
        id: '2',
        title: 'Jazz Night at Blue Moon',
        description: 'An intimate evening of live jazz music featuring local artists.',
        category: 'music',
        date: '2024-04-16T19:00:00Z',
        location: {
          name: 'Blue Moon Club',
          city: 'New York',
          country: 'USA',
          lat: 40.7128,
          lng: -74.0060
        },
        price: { min: 25, max: 45, currency: 'USD' },
        organizer: { name: 'Blue Moon Entertainment', verified: true },
        attendeeCount: 85,
        maxAttendees: 120,
        tags: ['jazz', 'music', 'live', 'intimate'],
        imageUrl: 'https://example.com/jazz-night.jpg',
        isOnline: false,
        isFree: false,
        relevanceScore: 0.78,
        popularityScore: 0.65
      },
      {
        id: '3',
        title: 'Virtual Cooking Masterclass',
        description: 'Learn to cook authentic Italian pasta from a Michelin-starred chef.',
        category: 'food',
        date: '2024-04-17T15:00:00Z',
        location: {
          name: 'Online Event',
          city: 'Virtual',
          country: 'Global'
        },
        price: { min: 0, max: 0, currency: 'USD' },
        organizer: { name: 'Chef Academy', verified: true },
        attendeeCount: 2340,
        maxAttendees: 5000,
        tags: ['cooking', 'food', 'italian', 'masterclass', 'virtual'],
        imageUrl: 'https://example.com/cooking-class.jpg',
        isOnline: true,
        isFree: true,
        relevanceScore: 0.82,
        popularityScore: 0.91
      },
      {
        id: '4',
        title: 'AI & Machine Learning Workshop',
        description: 'Hands-on workshop covering the latest in AI and ML technologies.',
        category: 'tech',
        date: '2024-04-18T09:00:00Z',
        location: {
          name: 'Tech Hub',
          city: 'Austin',
          country: 'USA',
          lat: 30.2672,
          lng: -97.7431
        },
        price: { min: 150, max: 150, currency: 'USD' },
        organizer: { name: 'AI Institute', verified: true },
        attendeeCount: 45,
        maxAttendees: 50,
        tags: ['ai', 'machine learning', 'workshop', 'hands-on'],
        imageUrl: 'https://example.com/ai-workshop.jpg',
        isOnline: false,
        isFree: false,
        relevanceScore: 0.89,
        popularityScore: 0.72
      }
    ];

    // Apply filters
    let filteredResults = mockEvents;

    if (searchQuery.filters.categories.length > 0) {
      filteredResults = filteredResults.filter(event =>
        searchQuery.filters.categories.includes(event.category)
      );
    }

    if (searchQuery.filters.location.city) {
      filteredResults = filteredResults.filter(event =>
        event.location.city.toLowerCase().includes(searchQuery.filters.location.city!.toLowerCase())
      );
    }

    if (searchQuery.filters.eventType === 'free') {
      filteredResults = filteredResults.filter(event => event.isFree);
    } else if (searchQuery.filters.eventType === 'paid') {
      filteredResults = filteredResults.filter(event => !event.isFree);
    }

    if (searchQuery.filters.isOnline !== undefined) {
      filteredResults = filteredResults.filter(event => event.isOnline === searchQuery.filters.isOnline);
    }

    if (searchQuery.filters.priceRange.max !== undefined) {
      filteredResults = filteredResults.filter(event => event.price.min <= searchQuery.filters.priceRange.max!);
    }

    // Apply text search
    if (searchQuery.query) {
      const query = searchQuery.query.toLowerCase();
      filteredResults = filteredResults.filter(event =>
        event.title.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query) ||
        event.tags.some(tag => tag.toLowerCase().includes(query)) ||
        event.category.toLowerCase().includes(query)
      );
    }

    // Calculate distances if location provided
    if (searchQuery.filters.location.lat && searchQuery.filters.location.lng) {
      filteredResults = filteredResults.map(event => ({
        ...event,
        distance: event.location.lat && event.location.lng 
          ? this.calculateDistance(
              searchQuery.filters.location.lat!,
              searchQuery.filters.location.lng!,
              event.location.lat,
              event.location.lng
            )
          : undefined
      }));

      // Filter by radius if specified
      if (searchQuery.filters.location.radius) {
        filteredResults = filteredResults.filter(event =>
          !event.distance || event.distance <= searchQuery.filters.location.radius!
        );
      }
    }

    // Sort results
    filteredResults = this.sortResults(filteredResults, searchQuery.sortBy, searchQuery.sortOrder);

    // Generate AI insights for each result
    filteredResults = await this.addAIInsights(filteredResults, searchQuery);

    // Apply pagination
    const startIndex = searchQuery.offset;
    const endIndex = startIndex + searchQuery.limit;
    
    return filteredResults.slice(startIndex, endIndex);
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private sortResults(results: SearchResult[], sortBy: string, sortOrder: string): SearchResult[] {
    return results.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'popularity':
          comparison = b.popularityScore - a.popularityScore;
          break;
        case 'price':
          comparison = a.price.min - b.price.min;
          break;
        case 'distance':
          comparison = (a.distance || Infinity) - (b.distance || Infinity);
          break;
        case 'relevance':
        default:
          comparison = b.relevanceScore - a.relevanceScore;
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }

  private async addAIInsights(results: SearchResult[], query: SearchQuery): Promise<SearchResult[]> {
    return results.map(result => ({
      ...result,
      aiInsight: this.generateEventInsight(result, query)
    }));
  }

  private generateEventInsight(event: SearchResult, query: SearchQuery): string {
    const insights = [];
    
    if (event.distance && event.distance < 5) {
      insights.push('Very close to you');
    }
    
    if (event.popularityScore > 0.85) {
      insights.push('Highly popular event');
    }
    
    if (event.attendeeCount / event.maxAttendees > 0.8) {
      insights.push('Almost sold out');
    }
    
    if (event.isFree) {
      insights.push('Free event');
    }
    
    if (event.organizer.verified) {
      insights.push('Verified organizer');
    }
    
    if (new Date(event.date).getTime() - Date.now() < 24 * 60 * 60 * 1000) {
      insights.push('Starting soon');
    }

    return insights.length > 0 ? insights[0] : '';
  }

  private async generateSearchSummary(query: SearchQuery, results: SearchResult[]): Promise<string> {
    const totalResults = results.length;
    const categories = [...new Set(results.map(r => r.category))];
    const locations = [...new Set(results.map(r => r.location.city))];
    
    if (totalResults === 0) {
      return `No events found matching your search criteria. Try adjusting your filters or search terms.`;
    }
    
    let summary = `Found ${totalResults} event${totalResults !== 1 ? 's' : ''}`;
    
    if (categories.length > 0) {
      summary += ` in ${categories.slice(0, 3).join(', ')}`;
      if (categories.length > 3) summary += ` and ${categories.length - 3} other categories`;
    }
    
    if (locations.length > 0) {
      summary += ` across ${locations.slice(0, 3).join(', ')}`;
      if (locations.length > 3) summary += ` and ${locations.length - 3} other locations`;
    }
    
    const popularEvents = results.filter(r => r.popularityScore > 0.8).length;
    if (popularEvents > 0) {
      summary += `. ${popularEvents} highly popular events included.`;
    }
    
    return summary;
  }

  private generateSearchSuggestions(query: string): string[] {
    const suggestions = [];
    
    // Add popular queries
    const popular = Array.from(this.popularQueries.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([query]) => query);
    suggestions.push(...popular);
    
    // Add query variations
    if (query) {
      const words = query.toLowerCase().split(' ');
      if (words.length > 1) {
        suggestions.push(`${words[0]} events`);
        suggestions.push(`${words[words.length - 1]} near me`);
      }
    }
    
    // Add trending suggestions
    suggestions.push('tech events this weekend', 'free online workshops', 'music concerts tonight');
    
    return [...new Set(suggestions)].slice(0, 5);
  }

  private generateRelatedQueries(query: SearchQuery): string[] {
    const related = [];
    
    if (query.filters.categories.length > 0) {
      const category = query.filters.categories[0];
      related.push(`${category} workshops`, `${category} networking events`);
    }
    
    if (query.filters.location.city) {
      const city = query.filters.location.city;
      related.push(`events in ${city} this month`, `popular venues in ${city}`);
    }
    
    related.push('similar events', 'events by same organizer', 'upcoming events');
    
    return related.slice(0, 5);
  }

  private buildSearchFacets(results: SearchResult[]): SearchFacets {
    const facets: SearchFacets = {
      categories: [],
      locations: [],
      priceRanges: [],
      dateRanges: [],
      organizers: [],
      tags: []
    };

    // Category facets
    const categoryCount = new Map<string, number>();
    results.forEach(result => {
      const count = categoryCount.get(result.category) || 0;
      categoryCount.set(result.category, count + 1);
    });
    facets.categories = Array.from(categoryCount.entries()).map(([name, count]) => ({ name, count }));

    // Location facets
    const locationCount = new Map<string, number>();
    results.forEach(result => {
      const location = result.location.city;
      const count = locationCount.get(location) || 0;
      locationCount.set(location, count + 1);
    });
    facets.locations = Array.from(locationCount.entries()).map(([name, count]) => ({ name, count }));

    // Price range facets
    const priceRanges = ['Free', '$1-25', '$26-50', '$51-100', '$100+'];
    const priceCount = new Map<string, number>();
    
    results.forEach(result => {
      let range = '$100+';
      if (result.isFree) range = 'Free';
      else if (result.price.min <= 25) range = '$1-25';
      else if (result.price.min <= 50) range = '$26-50';
      else if (result.price.min <= 100) range = '$51-100';
      
      const count = priceCount.get(range) || 0;
      priceCount.set(range, count + 1);
    });
    facets.priceRanges = priceRanges.map(range => ({ 
      range, 
      count: priceCount.get(range) || 0 
    })).filter(item => item.count > 0);

    return facets;
  }

  private getEmptySearchResponse(): SearchResponse {
    return {
      results: [],
      totalCount: 0,
      facets: {
        categories: [],
        locations: [],
        priceRanges: [],
        dateRanges: [],
        organizers: [],
        tags: []
      },
      suggestions: [],
      aiSummary: 'No results found.',
      searchTime: 0,
      relatedQueries: []
    };
  }

  // Smart Filters
  createSmartFilter(name: string, description: string, conditions: SmartFilter['conditions']): SmartFilter {
    return {
      id: this.generateId(),
      name,
      description,
      conditions,
      isActive: false
    };
  }

  getSmartFilterSuggestions(query: SearchQuery): SmartFilter[] {
    const suggestions: SmartFilter[] = [];
    
    // Popular this week
    suggestions.push(this.createSmartFilter(
      'Popular This Week',
      'Events with high engagement and attendance',
      [
        { field: 'popularityScore', operator: 'greater_than', value: 0.7 },
        { field: 'attendeeCount', operator: 'greater_than', value: 100 }
      ]
    ));

    // Near you (if location provided)
    if (query.filters.location.lat && query.filters.location.lng) {
      suggestions.push(this.createSmartFilter(
        'Near You',
        'Events within 10 miles of your location',
        [
          { field: 'distance', operator: 'less_than', value: 10 }
        ]
      ));
    }

    // Budget friendly
    suggestions.push(this.createSmartFilter(
      'Budget Friendly',
      'Events under $50 or free',
      [
        { field: 'price.max', operator: 'less_than', value: 50 }
      ]
    ));

    // This weekend
    const now = new Date();
    const startOfWeekend = new Date(now);
    startOfWeekend.setDate(now.getDate() + (6 - now.getDay()));
    startOfWeekend.setHours(0, 0, 0, 0);
    
    const endOfWeekend = new Date(startOfWeekend);
    endOfWeekend.setDate(startOfWeekend.getDate() + 1);
    endOfWeekend.setHours(23, 59, 59, 999);

    suggestions.push(this.createSmartFilter(
      'This Weekend',
      'Events happening Saturday and Sunday',
      [
        { field: 'date', operator: 'between', value: [startOfWeekend.toISOString(), endOfWeekend.toISOString()] }
      ]
    ));

    return suggestions;
  }

  // Search Insights
  async getSearchInsights(query?: SearchQuery): Promise<SearchInsight[]> {
    const insights: SearchInsight[] = [];

    // Trending categories
    insights.push({
      type: 'trending',
      title: 'Trending: Tech Events',
      description: 'Tech events are 300% more popular this month',
      data: { category: 'tech', growth: 3.0 },
      actionable: true,
      actionText: 'Explore Tech Events',
      actionQuery: {
        query: 'tech events',
        filters: { categories: ['tech'], dateRange: {}, priceRange: {}, location: {}, tags: [], attendeeCount: {}, availability: 'all', eventType: 'all' },
        sortBy: 'popularity',
        sortOrder: 'desc',
        limit: 20,
        offset: 0
      }
    });

    // Popular nearby (if location available)
    if (query?.filters.location.city) {
      insights.push({
        type: 'popular_nearby',
        title: `Popular in ${query.filters.location.city}`,
        description: '15 highly-rated events happening near you',
        data: { location: query.filters.location.city, count: 15 },
        actionable: true,
        actionText: 'See Nearby Events'
      });
    }

    // Price comparison
    insights.push({
      type: 'price_comparison',
      title: 'Price Insight',
      description: 'Average event price has decreased by 15% this month',
      data: { trend: 'down', percentage: 15 },
      actionable: false
    });

    return insights;
  }

  // User preferences and personalization
  saveUserPreference(key: string, value: any, userId?: string): void {
    const prefKey = userId ? `${userId}_${key}` : key;
    this.userPreferences.set(prefKey, value);
    this.saveSearchData();
  }

  getUserPreference(key: string, userId?: string): any {
    const prefKey = userId ? `${userId}_${key}` : key;
    return this.userPreferences.get(prefKey);
  }

  getPersonalizedSuggestions(userId?: string): string[] {
    const preferences = this.getUserPreference('categories', userId) || [];
    const location = this.getUserPreference('location', userId);
    
    const suggestions = [];
    
    if (preferences.length > 0) {
      suggestions.push(...preferences.map((cat: string) => `${cat} events near me`));
    }
    
    if (location) {
      suggestions.push(`events in ${location}`, `things to do in ${location}`);
    }
    
    return suggestions.slice(0, 5);
  }

  // Search history management
  private updateSearchHistory(query: string): void {
    if (!query.trim()) return;
    
    // Remove if already exists
    const index = this.searchHistory.indexOf(query);
    if (index > -1) {
      this.searchHistory.splice(index, 1);
    }
    
    // Add to front
    this.searchHistory.unshift(query);
    
    // Keep only last 50 searches
    this.searchHistory = this.searchHistory.slice(0, 50);
    
    // Update popular queries
    const count = this.popularQueries.get(query) || 0;
    this.popularQueries.set(query, count + 1);
    
    this.saveSearchData();
  }

  getSearchHistory(limit: number = 10): string[] {
    return this.searchHistory.slice(0, limit);
  }

  clearSearchHistory(): void {
    this.searchHistory = [];
    this.saveSearchData();
  }

  // Auto-complete and suggestions
  async getAutoCompleteSuggestions(partialQuery: string): Promise<string[]> {
    const suggestions = new Set<string>();
    
    // Add from search history
    this.searchHistory
      .filter(query => query.toLowerCase().includes(partialQuery.toLowerCase()))
      .slice(0, 3)
      .forEach(query => suggestions.add(query));
    
    // Add popular queries
    Array.from(this.popularQueries.keys())
      .filter(query => query.toLowerCase().includes(partialQuery.toLowerCase()))
      .slice(0, 3)
      .forEach(query => suggestions.add(query));
    
    // Add category suggestions
    const categories = ['music', 'tech', 'food', 'sports', 'art', 'networking'];
    categories
      .filter(cat => cat.includes(partialQuery.toLowerCase()))
      .forEach(cat => suggestions.add(`${cat} events`));
    
    return Array.from(suggestions).slice(0, 8);
  }

  // Utility methods
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const searchService = SearchService.getInstance();