// FIX: Updated import names to match exported variables from mockData.ts
import { CITIES, CATEGORIES, EVENTS, USERS } from '@/data/mockData';
import type { City, Category, Event, User, Review } from '@/types';

// Simulate network delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// FIX: Used correct variable name from import.
let events: Event[] = [...EVENTS];
// FIX: Used correct variable name from import.
let users: User[] = [...USERS];

export const api = {
  getCities: async (): Promise<City[]> => {
    await delay(500);
    // FIX: Used correct variable name from import.
    return CITIES;
  },

  getCategories: async (): Promise<Category[]> => {
    await delay(500);
    // FIX: Used correct variable name from import.
    return CATEGORIES;
  },

  getEvents: async (): Promise<Event[]> => {
    await delay(1000);
    return events;
  },

  getUserById: async (id: string): Promise<User | undefined> => {
    await delay(300);
    return users.find(user => user.id === id);
  },

  addEvent: async (eventData: Omit<Event, 'id' | 'organizerId' | 'reviews'>, organizerId: string): Promise<Event> => {
    await delay(1000);
    const newEvent: Event = {
      ...eventData,
      id: `event-${Date.now()}`,
      organizerId: organizerId,
      reviews: [],
    };
    events.push(newEvent);
    return newEvent;
  },

  updateEvent: async (eventId: string, eventData: Partial<Event>): Promise<Event> => {
    await delay(1000);
    const eventIndex = events.findIndex(e => e.id === eventId);
    if (eventIndex === -1) throw new Error('Event not found');
    events[eventIndex] = { ...events[eventIndex], ...eventData };
    return events[eventIndex];
  },

  addReview: async (eventId: string, reviewData: { rating: number; comment: string }, userId: string): Promise<Event> => {
    await delay(800);
    const eventIndex = events.findIndex(e => e.id === eventId);
    if (eventIndex === -1) throw new Error('Event not found');
    
    const user = await api.getUserById(userId);
    if (!user) throw new Error('User not found');

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      user,
      rating: reviewData.rating,
      comment: reviewData.comment,
      timestamp: new Date().toISOString(),
    };
    events[eventIndex].reviews.push(newReview);
    return events[eventIndex];
  },

  login: async (email: string, password?: string): Promise<User | { error: string; email: string }> => {
    await delay(800);
    const user = users.find(u => u.email === email);
    if (!user) return { error: 'User not found', email };

    // In a real app, you would check the password here
    console.log(`Simulating login for ${email} with password: ${password}`);

    if (!user.isVerified) {
      return { error: 'Account not verified', email };
    }
    return user;
  },

  signup: async (userData: Omit<User, 'id' | 'isVerified'>): Promise<User> => {
    await delay(1200);
    if (users.some(u => u.email === userData.email)) {
      throw new Error('Email already exists');
    }
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      isVerified: false,
      avatarUrl: 'https://picsum.photos/seed/newuser/200'
    };
    users.push(newUser);
    return newUser;
  },

  verifyUser: async (email: string): Promise<User> => {
    await delay(500);
    const userIndex = users.findIndex(u => u.email === email);
    if (userIndex === -1) throw new Error('User not found');
    users[userIndex].isVerified = true;
    return users[userIndex];
  }
};
