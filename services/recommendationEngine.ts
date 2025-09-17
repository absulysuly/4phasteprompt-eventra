import { GoogleGenerativeAI } from '@google/genai';
import { Event } from '../types';

export interface UserPreferences {
  categories: string[];
  priceRange: { min: number; max: number };
  preferredTimes: string[]; // morning, afternoon, evening, night
  preferredDays: string[]; // weekday, weekend
  locations: string[];
  languages: string[];
  groupSize: 'solo' | 'couple' | 'family' | 'group';
  interests: string[];
}

export interface UserBehavior {
  viewedEvents: string[];
  registeredEvents: string[];
  searchQueries: string[];
  favoriteCategories: { category: string; score: number }[];
  averageEventDuration: number;
  preferredEventSize: 'small' | 'medium' | 'large';
  seasonalPreferences: { season: string; categories: string[] }[];
  timeOfDayPreferences: { time: string; weight: number }[];
}

export interface RecommendationRequest {
  userId: string;
  userPreferences?: UserPreferences;
  userBehavior?: UserBehavior;
  location?: { latitude: number; longitude: number };
  contextualFactors?: {
    currentTime: Date;
    weather?: string;
    socialContext?: string;
    moodIndicators?: string[];
  };
  excludeEventIds?: string[];
  limit?: number;
  includeReasonings?: boolean;
}

export interface EventRecommendation {
  event: Event;
  score: number;
  reasoning: string;
  category: 'perfect_match' | 'similar_interests' | 'trending' | 'seasonal' | 'location_based' | 'time_sensitive' | 'discovery';
  confidence: number;
  factors: {
    categoryMatch: number;
    locationProximity: number;
    timePreference: number;
    priceCompatibility: number;
    socialFit: number;
    trendingScore: number;
    noveltyScore: number;
  };
}

export interface RecommendationResponse {
  recommendations: EventRecommendation[];
  totalProcessed: number;
  processingTime: number;
  insights: {
    dominantCategories: string[];
    suggestedNewCategories: string[];
    locationInsights: string[];
    timingInsights: string[];
    behavioralPattern: string;
  };
}

class RecommendationEngine {
  private static instance: RecommendationEngine;
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  
  public static getInstance(): RecommendationEngine {
    if (!RecommendationEngine.instance) {
      RecommendationEngine.instance = new RecommendationEngine();
    }
    return RecommendationEngine.instance;
  }

  async initialize(): Promise<boolean> {
    try {
      const apiKey = process.env.GEMINI_API_KEY || 'demo-key';
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      console.log('Recommendation engine initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize recommendation engine:', error);
      return false;
    }
  }

  async getRecommendations(request: RecommendationRequest): Promise<RecommendationResponse> {
    const startTime = Date.now();
    
    try {
      // Get available events (in real app, this would be from API)
      const availableEvents = await this.getAvailableEvents(request.location);
      
      // Filter out excluded events
      const eligibleEvents = availableEvents.filter(
        event => !request.excludeEventIds?.includes(event.id)
      );

      // Generate recommendations using multiple algorithms
      const recommendations = await Promise.all([
        this.getContentBasedRecommendations(request, eligibleEvents),
        this.getCollaborativeRecommendations(request, eligibleEvents),
        this.getContextualRecommendations(request, eligibleEvents),
        this.getTrendingRecommendations(request, eligibleEvents),
        this.getDiscoveryRecommendations(request, eligibleEvents)
      ]);

      // Merge and rank recommendations
      const mergedRecommendations = this.mergeAndRankRecommendations(
        recommendations.flat(),
        request
      );

      // Limit results
      const finalRecommendations = mergedRecommendations.slice(0, request.limit || 10);

      // Generate insights using AI
      const insights = await this.generateInsights(request, finalRecommendations);

      const processingTime = Date.now() - startTime;

      return {
        recommendations: finalRecommendations,
        totalProcessed: eligibleEvents.length,
        processingTime,
        insights
      };
    } catch (error) {
      console.error('Error generating recommendations:', error);
      
      // Fallback to simple recommendations
      return this.getFallbackRecommendations(request);
    }
  }

  private async getContentBasedRecommendations(
    request: RecommendationRequest,
    events: Event[]
  ): Promise<EventRecommendation[]> {
    const recommendations: EventRecommendation[] = [];
    
    for (const event of events) {
      const score = this.calculateContentBasedScore(event, request);
      
      if (score > 0.3) { // Threshold for relevance
        recommendations.push({
          event,
          score,
          reasoning: await this.generateReasoning(event, request, 'content-based'),
          category: score > 0.8 ? 'perfect_match' : 'similar_interests',
          confidence: Math.min(score * 1.2, 1.0),
          factors: this.calculateDetailedFactors(event, request)
        });
      }
    }
    
    return recommendations.sort((a, b) => b.score - a.score);
  }

  private async getCollaborativeRecommendations(
    request: RecommendationRequest,
    events: Event[]
  ): Promise<EventRecommendation[]> {
    // Simulate collaborative filtering based on similar users
    const recommendations: EventRecommendation[] = [];
    
    // In a real implementation, this would analyze users with similar preferences/behavior
    const similarUserPreferences = this.findSimilarUserPatterns(request);
    
    for (const event of events) {
      const collaborativeScore = this.calculateCollaborativeScore(event, similarUserPreferences);
      
      if (collaborativeScore > 0.4) {
        recommendations.push({
          event,
          score: collaborativeScore,
          reasoning: await this.generateReasoning(event, request, 'collaborative'),
          category: 'similar_interests',
          confidence: collaborativeScore * 0.9,
          factors: this.calculateDetailedFactors(event, request)
        });
      }
    }
    
    return recommendations;
  }

  private async getContextualRecommendations(
    request: RecommendationRequest,
    events: Event[]
  ): Promise<EventRecommendation[]> {
    const recommendations: EventRecommendation[] = [];
    const contextualFactors = request.contextualFactors;
    
    if (!contextualFactors) return recommendations;
    
    for (const event of events) {
      const contextualScore = this.calculateContextualScore(event, contextualFactors);
      
      if (contextualScore > 0.5) {
        recommendations.push({
          event,
          score: contextualScore,
          reasoning: await this.generateReasoning(event, request, 'contextual'),
          category: this.getContextualCategory(event, contextualFactors),
          confidence: contextualScore,
          factors: this.calculateDetailedFactors(event, request)
        });
      }
    }
    
    return recommendations;
  }

  private async getTrendingRecommendations(
    request: RecommendationRequest,
    events: Event[]
  ): Promise<EventRecommendation[]> {
    const recommendations: EventRecommendation[] = [];
    
    // Simulate trending analysis based on views, registrations, and social signals
    const trendingEvents = events
      .map(event => ({
        event,
        trendingScore: this.calculateTrendingScore(event)
      }))
      .sort((a, b) => b.trendingScore - a.trendingScore)
      .slice(0, 5); // Top 5 trending
    
    for (const { event, trendingScore } of trendingEvents) {
      if (trendingScore > 0.6) {
        recommendations.push({
          event,
          score: trendingScore,
          reasoning: await this.generateReasoning(event, request, 'trending'),
          category: 'trending',
          confidence: trendingScore * 0.8,
          factors: this.calculateDetailedFactors(event, request)
        });
      }
    }
    
    return recommendations;
  }

  private async getDiscoveryRecommendations(
    request: RecommendationRequest,
    events: Event[]
  ): Promise<EventRecommendation[]> {
    const recommendations: EventRecommendation[] = [];
    
    // Find events in categories user hasn't explored much
    const unexploredCategories = this.getUnexploredCategories(request);
    
    const discoveryEvents = events.filter(event =>
      unexploredCategories.includes(event.category)
    );
    
    for (const event of discoveryEvents.slice(0, 3)) {
      const discoveryScore = this.calculateDiscoveryScore(event, request);
      
      recommendations.push({
        event,
        score: discoveryScore,
        reasoning: await this.generateReasoning(event, request, 'discovery'),
        category: 'discovery',
        confidence: discoveryScore * 0.7,
        factors: this.calculateDetailedFactors(event, request)
      });
    }
    
    return recommendations;
  }

  private calculateContentBasedScore(event: Event, request: RecommendationRequest): number {
    let score = 0;
    const preferences = request.userPreferences;
    const behavior = request.userBehavior;
    
    if (!preferences && !behavior) return 0;
    
    // Category preference matching
    if (preferences?.categories.includes(event.category)) {
      score += 0.4;
    }
    
    // Price range compatibility
    if (preferences?.priceRange) {
      const eventPrice = parseFloat(event.price) || 0;
      if (eventPrice >= preferences.priceRange.min && eventPrice <= preferences.priceRange.max) {
        score += 0.2;
      }
    }
    
    // Location preference
    if (preferences?.locations.includes(event.city)) {
      score += 0.2;
    }
    
    // Behavioral category matching
    if (behavior?.favoriteCategories) {
      const categoryScore = behavior.favoriteCategories.find(
        cat => cat.category === event.category
      )?.score || 0;
      score += categoryScore * 0.3;
    }
    
    // Time preference matching
    const eventTime = new Date(event.date);
    const eventHour = eventTime.getHours();
    
    if (preferences?.preferredTimes) {
      let timeMatch = false;
      for (const preferredTime of preferences.preferredTimes) {
        if (this.isTimeMatch(eventHour, preferredTime)) {
          timeMatch = true;
          break;
        }
      }
      if (timeMatch) score += 0.15;
    }
    
    return Math.min(score, 1.0);
  }

  private calculateDetailedFactors(event: Event, request: RecommendationRequest) {
    const preferences = request.userPreferences;
    const location = request.location;
    
    return {
      categoryMatch: preferences?.categories.includes(event.category) ? 1.0 : 0.0,
      locationProximity: location ? this.calculateLocationProximity(event, location) : 0.5,
      timePreference: this.calculateTimePreference(event, preferences),
      priceCompatibility: this.calculatePriceCompatibility(event, preferences),
      socialFit: this.calculateSocialFit(event, preferences),
      trendingScore: this.calculateTrendingScore(event),
      noveltyScore: this.calculateNoveltyScore(event, request)
    };
  }

  private async generateReasoning(
    event: Event,
    request: RecommendationRequest,
    type: string
  ): Promise<string> {
    if (!this.model || !request.includeReasonings) {
      return this.getSimpleReasoning(event, type);
    }
    
    try {
      const prompt = this.buildReasoningPrompt(event, request, type);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().slice(0, 200); // Limit length
    } catch (error) {
      console.error('Error generating AI reasoning:', error);
      return this.getSimpleReasoning(event, type);
    }
  }

  private buildReasoningPrompt(
    event: Event,
    request: RecommendationRequest,
    type: string
  ): string {
    return `
    Generate a brief, personalized recommendation explanation for why this event matches the user.
    
    Event: ${event.title}
    Category: ${event.category}
    Location: ${event.city}
    Date: ${event.date}
    Price: ${event.price}
    
    User Preferences: ${JSON.stringify(request.userPreferences || {})}
    User Behavior: ${JSON.stringify(request.userBehavior || {})}
    Recommendation Type: ${type}
    
    Provide a concise, friendly explanation (max 150 characters) of why this event is recommended.
    Focus on the most relevant matching factors.
    `;
  }

  private getSimpleReasoning(event: Event, type: string): string {
    switch (type) {
      case 'content-based':
        return `Matches your interest in ${event.category} events`;
      case 'collaborative':
        return `Popular with users who have similar preferences`;
      case 'contextual':
        return `Perfect for the current time and context`;
      case 'trending':
        return `Trending event with high engagement`;
      case 'discovery':
        return `Explore something new in ${event.category}`;
      default:
        return `Recommended based on your activity`;
    }
  }

  private mergeAndRankRecommendations(
    recommendations: EventRecommendation[],
    request: RecommendationRequest
  ): EventRecommendation[] {
    // Remove duplicates and merge scores
    const eventMap = new Map<string, EventRecommendation>();
    
    for (const rec of recommendations) {
      const existing = eventMap.get(rec.event.id);
      
      if (existing) {
        // Merge scores with weights
        const newScore = (existing.score * 0.6) + (rec.score * 0.4);
        const newConfidence = Math.max(existing.confidence, rec.confidence);
        
        eventMap.set(rec.event.id, {
          ...existing,
          score: newScore,
          confidence: newConfidence,
          reasoning: existing.reasoning.length > rec.reasoning.length ? 
                    existing.reasoning : rec.reasoning
        });
      } else {
        eventMap.set(rec.event.id, rec);
      }
    }
    
    return Array.from(eventMap.values())
      .sort((a, b) => b.score - a.score);
  }

  private async generateInsights(
    request: RecommendationRequest,
    recommendations: EventRecommendation[]
  ) {
    const categories = recommendations.map(r => r.event.category);
    const locations = recommendations.map(r => r.event.city);
    
    const dominantCategories = this.getMostFrequent(categories, 3);
    const suggestedNewCategories = this.getSuggestedCategories(request, categories);
    
    return {
      dominantCategories,
      suggestedNewCategories,
      locationInsights: this.getLocationInsights(locations),
      timingInsights: this.getTimingInsights(recommendations),
      behavioralPattern: this.getBehavioralPattern(request)
    };
  }

  // Helper methods
  private async getAvailableEvents(location?: { latitude: number; longitude: number }): Promise<Event[]> {
    // In real implementation, this would fetch from API
    // For now, return mock data
    return [
      {
        id: '1',
        title: 'Tech Innovation Summit',
        description: 'Leading technology conference',
        category: 'Technology',
        city: 'Erbil',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        price: '50',
        image: 'https://example.com/tech-summit.jpg',
        organizer: 'Tech Corp',
        capacity: 500,
        attendees: 234,
        rating: 4.8,
        featured: true,
        tags: ['AI', 'Innovation', 'Networking']
      },
      {
        id: '2',
        title: 'Kurdish Music Festival',
        description: 'Traditional and modern Kurdish music',
        category: 'Music',
        city: 'Sulaymaniyah',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        price: '25',
        image: 'https://example.com/music-festival.jpg',
        organizer: 'Culture Ministry',
        capacity: 1000,
        attendees: 567,
        rating: 4.9,
        featured: true,
        tags: ['Music', 'Culture', 'Traditional']
      }
      // Add more mock events...
    ];
  }

  private calculateCollaborativeScore(event: Event, similarPatterns: any): number {
    // Simulate collaborative filtering score
    return Math.random() * 0.8 + 0.2;
  }

  private calculateContextualScore(event: Event, contextualFactors: any): number {
    let score = 0.5; // Base score
    
    // Weather-based scoring
    if (contextualFactors.weather === 'rainy' && event.category === 'Indoor') {
      score += 0.3;
    }
    
    // Time-based scoring
    const eventDate = new Date(event.date);
    const now = contextualFactors.currentTime;
    const daysUntilEvent = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysUntilEvent <= 7) {
      score += 0.2; // Time-sensitive boost
    }
    
    return Math.min(score, 1.0);
  }

  private calculateTrendingScore(event: Event): number {
    // Simulate trending calculation based on engagement metrics
    const attendeeRatio = event.attendees / event.capacity;
    const ratingBoost = event.rating / 5;
    const featuredBoost = event.featured ? 0.2 : 0;
    
    return (attendeeRatio * 0.4) + (ratingBoost * 0.4) + featuredBoost;
  }

  private calculateDiscoveryScore(event: Event, request: RecommendationRequest): number {
    // Score based on how different this is from user's usual preferences
    const behavior = request.userBehavior;
    if (!behavior) return 0.6;
    
    const categoryExposure = behavior.favoriteCategories.find(
      cat => cat.category === event.category
    )?.score || 0;
    
    return Math.max(0.3, 1.0 - categoryExposure);
  }

  private findSimilarUserPatterns(request: RecommendationRequest): any {
    // Simulate finding similar user patterns
    return {
      commonCategories: ['Technology', 'Music', 'Food'],
      avgPriceRange: { min: 20, max: 80 }
    };
  }

  private getUnexploredCategories(request: RecommendationRequest): string[] {
    const allCategories = ['Technology', 'Music', 'Food', 'Sports', 'Arts', 'Education', 'Business'];
    const exploredCategories = request.userBehavior?.favoriteCategories.map(
      cat => cat.category
    ) || [];
    
    return allCategories.filter(cat => !exploredCategories.includes(cat));
  }

  private getContextualCategory(event: Event, contextualFactors: any): EventRecommendation['category'] {
    if (contextualFactors.weather === 'sunny' && event.category === 'Outdoor') {
      return 'seasonal';
    }
    
    const eventDate = new Date(event.date);
    const now = contextualFactors.currentTime;
    const daysUntilEvent = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysUntilEvent <= 3) {
      return 'time_sensitive';
    }
    
    return 'location_based';
  }

  private isTimeMatch(eventHour: number, preferredTime: string): boolean {
    switch (preferredTime) {
      case 'morning': return eventHour >= 6 && eventHour < 12;
      case 'afternoon': return eventHour >= 12 && eventHour < 17;
      case 'evening': return eventHour >= 17 && eventHour < 22;
      case 'night': return eventHour >= 22 || eventHour < 6;
      default: return false;
    }
  }

  private calculateLocationProximity(event: Event, location: { latitude: number; longitude: number }): number {
    // Simplified distance calculation - in real app would use proper geolocation
    return Math.random() * 0.5 + 0.5;
  }

  private calculateTimePreference(event: Event, preferences?: UserPreferences): number {
    if (!preferences?.preferredTimes) return 0.5;
    
    const eventTime = new Date(event.date);
    const eventHour = eventTime.getHours();
    
    for (const preferredTime of preferences.preferredTimes) {
      if (this.isTimeMatch(eventHour, preferredTime)) {
        return 1.0;
      }
    }
    
    return 0.2;
  }

  private calculatePriceCompatibility(event: Event, preferences?: UserPreferences): number {
    if (!preferences?.priceRange) return 0.5;
    
    const eventPrice = parseFloat(event.price) || 0;
    const { min, max } = preferences.priceRange;
    
    if (eventPrice >= min && eventPrice <= max) {
      return 1.0;
    }
    
    // Partial compatibility for prices slightly outside range
    if (eventPrice < min) {
      return Math.max(0, 1.0 - ((min - eventPrice) / min));
    } else {
      return Math.max(0, 1.0 - ((eventPrice - max) / max));
    }
  }

  private calculateSocialFit(event: Event, preferences?: UserPreferences): number {
    if (!preferences?.groupSize) return 0.5;
    
    // Simple heuristic based on event capacity and type
    const capacity = event.capacity;
    
    switch (preferences.groupSize) {
      case 'solo':
        return capacity < 100 ? 0.8 : 0.4;
      case 'couple':
        return capacity < 300 ? 0.8 : 0.5;
      case 'family':
        return capacity < 500 && event.category !== 'Business' ? 0.8 : 0.3;
      case 'group':
        return capacity > 200 ? 0.8 : 0.4;
      default:
        return 0.5;
    }
  }

  private calculateNoveltyScore(event: Event, request: RecommendationRequest): number {
    const behavior = request.userBehavior;
    if (!behavior) return 0.5;
    
    const hasViewedSimilar = behavior.viewedEvents.includes(event.id);
    const categoryFamiliarity = behavior.favoriteCategories.find(
      cat => cat.category === event.category
    )?.score || 0;
    
    if (hasViewedSimilar) return 0.1;
    
    return Math.max(0.3, 1.0 - categoryFamiliarity);
  }

  private getMostFrequent<T>(array: T[], count: number): T[] {
    const frequency = new Map<T, number>();
    
    array.forEach(item => {
      frequency.set(item, (frequency.get(item) || 0) + 1);
    });
    
    return Array.from(frequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(([item]) => item);
  }

  private getSuggestedCategories(request: RecommendationRequest, currentCategories: string[]): string[] {
    const allCategories = ['Technology', 'Music', 'Food', 'Sports', 'Arts', 'Education', 'Business', 'Health', 'Travel'];
    const userCategories = request.userPreferences?.categories || [];
    
    return allCategories
      .filter(cat => !userCategories.includes(cat) && !currentCategories.includes(cat))
      .slice(0, 2);
  }

  private getLocationInsights(locations: string[]): string[] {
    const frequent = this.getMostFrequent(locations, 2);
    return frequent.map(location => `High activity in ${location}`);
  }

  private getTimingInsights(recommendations: EventRecommendation[]): string[] {
    const times = recommendations.map(r => new Date(r.event.date).getHours());
    const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    
    let timeCategory = 'afternoon';
    if (avgTime < 12) timeCategory = 'morning';
    else if (avgTime >= 17) timeCategory = 'evening';
    
    return [`You prefer ${timeCategory} events`];
  }

  private getBehavioralPattern(request: RecommendationRequest): string {
    const behavior = request.userBehavior;
    if (!behavior) return 'New user - exploring preferences';
    
    if (behavior.favoriteCategories.length > 3) {
      return 'Diverse interests across multiple categories';
    } else if (behavior.favoriteCategories.length === 1) {
      return `Focused primarily on ${behavior.favoriteCategories[0].category}`;
    } else {
      return 'Selective with clear preferences';
    }
  }

  private async getFallbackRecommendations(request: RecommendationRequest): Promise<RecommendationResponse> {
    const events = await this.getAvailableEvents();
    
    const recommendations: EventRecommendation[] = events.slice(0, request.limit || 5).map(event => ({
      event,
      score: 0.5,
      reasoning: 'Popular event in your area',
      category: 'trending',
      confidence: 0.5,
      factors: {
        categoryMatch: 0.5,
        locationProximity: 0.5,
        timePreference: 0.5,
        priceCompatibility: 0.5,
        socialFit: 0.5,
        trendingScore: 0.5,
        noveltyScore: 0.5
      }
    }));

    return {
      recommendations,
      totalProcessed: events.length,
      processingTime: 100,
      insights: {
        dominantCategories: ['Technology', 'Music'],
        suggestedNewCategories: ['Food', 'Arts'],
        locationInsights: ['Popular events nearby'],
        timingInsights: ['Weekend events preferred'],
        behavioralPattern: 'Standard user pattern'
      }
    };
  }
}

export const recommendationEngine = RecommendationEngine.getInstance();