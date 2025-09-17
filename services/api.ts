import type { City, Category, Event, User, Review } from '../types';
import { CITIES, CATEGORIES, EVENTS as initialEvents, USERS as initialUsers } from '../data/mockData';
import { loggingService } from './loggingService';

// Simulate a database
let events: Event[] = JSON.parse(JSON.stringify(initialEvents));
let users: User[] = JSON.parse(JSON.stringify(initialUsers));

const simulateDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const api = {
  getCities: async (): Promise<City[]> => {
    await simulateDelay(100);
    return CITIES;
  },

  getCategories: async (): Promise<Category[]> => {
    await simulateDelay(100);
    return CATEGORIES;
  },

  getEvents: async (): Promise<Event[]> => {
    await simulateDelay(500);
    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },
  
  getUserById: async (id: string): Promise<User | undefined> => {
      await simulateDelay(100);
      return users.find(u => u.id === id);
  },

  addEvent: async (eventData: Omit<Event, 'id' | 'reviews' | 'organizerId'>, organizerId: string): Promise<Event> => {
    await simulateDelay(500);
    const organizer = await api.getUserById(organizerId);
    if (!organizer) throw new Error("Organizer not found");

    const newEvent: Event = {
      ...eventData,
      id: `event-${Date.now()}`,
      organizerId,
      reviews: [],
    };
    events.unshift(newEvent);
    loggingService.trackEvent('event_created', { eventId: newEvent.id, city: newEvent.cityId });
    return newEvent;
  },
  
  updateEvent: async (eventId: string, eventData: Omit<Event, 'id' | 'reviews' | 'organizerId' | 'organizerName'>): Promise<Event> => {
      await simulateDelay(500);
      const eventIndex = events.findIndex(e => e.id === eventId);
      if (eventIndex === -1) throw new Error("Event not found");
      
      const updatedEvent = { ...events[eventIndex], ...eventData };
      events[eventIndex] = updatedEvent;
      loggingService.trackEvent('event_updated', { eventId });
      return updatedEvent;
  },

  addReview: async (eventId: string, reviewData: Omit<Review, 'id' | 'user' | 'timestamp'>, userId: string): Promise<Event> => {
    await simulateDelay(300);
    const event = events.find(e => e.id === eventId);
    const user = users.find(u => u.id === userId);
    if (!event || !user) throw new Error("Event or user not found");

    const newReview: Review = {
      ...reviewData,
      id: `review-${Date.now()}`,
      user: { id: user.id, name: user.name, avatarUrl: user.avatarUrl, phone: user.phone, email: user.email, isVerified: user.isVerified },
      timestamp: new Date().toISOString(),
    };
    event.reviews.unshift(newReview);
    loggingService.trackEvent('review_added', { eventId, rating: newReview.rating });
    return event;
  },

  login: async (email: string, password?: string): Promise<User | { error: 'unverified'; email: string }> => {
    await simulateDelay(500);
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        if (!user.isVerified) {
            return { error: 'unverified', email: user.email };
        }
        loggingService.trackEvent('login_success', { userId: user.id });
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    throw new Error("Invalid credentials");
  },

  signup: async (userData: Omit<User, 'id' | 'avatarUrl' | 'isVerified'>): Promise<User> => {
      await simulateDelay(700);
      if (users.some(u => u.email === userData.email)) {
          throw new Error("An account with this email already exists.");
      }
      const newUser: User = {
          ...userData,
          id: `user-${Date.now()}`,
          avatarUrl: `https://i.pravatar.cc/150?u=${userData.email}`,
          isVerified: false, // Start as unverified
      };
      users.push(newUser);
      loggingService.trackEvent('signup_success', { userId: newUser.id });
      // In a real app, you would now send a verification email.
      return newUser;
  },
  
  verifyUser: async (email: string): Promise<User> => {
      await simulateDelay(400);
      const user = users.find(u => u.email === email);
      if (!user) {
          throw new Error("User not found for verification.");
      }
      user.isVerified = true;
      loggingService.trackEvent('user_verified', { userId: user.id });
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
  }
};
