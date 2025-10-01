"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from './LanguageProvider';
import { useTranslations } from '../hooks/useTranslations';

/**
 * Represents a story user in the stories section
 * @interface StoryUser
 * @property {string} id - Unique identifier for the user
 * @property {string} name - Display name of the user
 * @property {string} avatar - URL to user's avatar image
 * @property {number} count - Number of stories/posts by the user
 */
interface StoryUser {
  id: string;
  name: string;
  avatar: string;
  count: number;
}

/**
 * Represents a category in the platform
 * @interface Category
 * @property {string} id - Unique identifier for the category
 * @property {string} name - Display name of the category
 * @property {string} icon - Emoji icon for the category
 * @property {CategoryColor} color - Color theme for the category
 * @property {number} count - Number of venues/items in this category
 */
interface Category {
  id: string;
  name: string;
  icon: string;
  color: 'events' | 'hotels' | 'restaurants' | 'cafes' | 'tourism';
  count: number;
}

/**
 * NeonHomepage - Main homepage component with neon-themed design
 * 
 * This component serves as the primary landing page for the Eventra platform,
 * featuring a futuristic neon-themed UI with glowing category cards, stories,
 * and featured content sections.
 * 
 * Features:
 * - Responsive neon-themed design with category-specific colors
 * - Interactive story avatars with user engagement
 * - Clickable category cards linking to specific venue types
 * - Featured content sections for events and hotels
 * - Multi-language support with RTL layout for Arabic/Kurdish
 * - Progressive enhancement with loading states and error handling
 * 
 * Color Scheme:
 * - Events: Purple (#B24BF3)
 * - Hotels: Pink (#FF2E97)
 * - Restaurants: Orange (#FF6B35)
 * - Cafes: Yellow (#FFED4E)
 * - Tourism: Cyan (#00F0FF)
 * 
 * @component
 * @example
 * // Basic usage
 * import NeonHomepage from './components/NeonHomepage'
 * 
 * function App() {
 *   return <NeonHomepage />
 * }
 * 
 * @returns {JSX.Element} The rendered homepage with neon theme
 * 
 * @category Components
 * @subcategory Pages
 * @ai-accessible This component is fully documented for AI understanding
 * @since 2.1.0
 */
export default function NeonHomepage() {
  const { language, isRTL } = useLanguage();
  const { t } = useTranslations();
  const [selectedCity, setSelectedCity] = useState('Baghdad');

  // Story users (mock data)
  const storyUsers: StoryUser[] = [
    { id: '1', name: 'Ahmed M.', avatar: '/api/placeholder/64/64', count: 245 },
    { id: '2', name: 'Sara K.', avatar: '/api/placeholder/64/64', count: 89 },
    { id: '3', name: 'Omar H.', avatar: '/api/placeholder/64/64', count: 156 }
  ];

  // Categories with specific neon colors
  const categories: Category[] = [
    { id: 'events', name: 'Events', icon: '📅', color: 'events', count: 124 },
    { id: 'hotels', name: 'Hotels', icon: '🏨', color: 'hotels', count: 87 },
    { id: 'restaurants', name: 'Restaurants', icon: '🍽️', color: 'restaurants', count: 156 },
    { id: 'cafes', name: 'Cafes', icon: '☕', color: 'cafes', count: 92 },
    { id: 'tourism', name: 'Tourism', icon: '📸', color: 'tourism', count: 73 }
  ];

  return (
    <div className="min-h-screen">
      {/* Stories Section */}
      <div className="story-section">
        <div className="story-container">
          {/* Add Story Button */}
          <div className="story-avatar add-story">
            <span>+</span>
            <div className="name">Add Story</div>
          </div>
          
          {/* User Stories */}
          {storyUsers.map((user) => (
            <div key={user.id} className="story-avatar events-glow">
              <img 
                src={user.avatar} 
                alt={user.name}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `data:image/svg+xml;base64,${btoa(`
                    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="64" height="64" fill="#2D1B4E"/>
                      <circle cx="32" cy="24" r="8" fill="#B24BF3"/>
                      <path d="M16 48c0-8 7-16 16-16s16 8 16 16" fill="#B24BF3"/>
                    </svg>
                  `)}`;
                }}
              />
              <div className="name">{user.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Currently Exploring Section */}
      <div className="currently-exploring tourism-glow">
        <h2 className="neon-glow">Currently Exploring</h2>
        
        <div className="city-name">
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#00F0FF', textShadow: '0 0 10px #00F0FF' }}>
            Baghdad
          </div>
          <div className="arabic-name">بغداد</div>
          <div style={{ marginTop: '8px', opacity: 0.8 }}>Central Iraq</div>
        </div>
        
        <p style={{ margin: '16px 0', fontSize: '1.1rem' }}>
          The vibrant capital city
        </p>
        
        <button className="neon-button tourism" style={{ marginTop: '16px' }}>
          Change City
        </button>
        
        <button 
          className="neon-button tourism" 
          style={{ marginTop: '8px', marginLeft: '12px' }}
        >
          Select a City
        </button>
      </div>

      {/* Categories Section */}
      <div style={{ padding: '40px 20px' }}>
        <h2 style={{ 
          textAlign: 'center', 
          fontSize: '2rem', 
          marginBottom: '32px',
          color: 'var(--text-primary)',
          textShadow: '0 0 10px var(--events-color)'
        }}>
          Categories
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '24px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/${category.id}`}
              className={`category-icon ${category.color} ${category.color}-glow neon-pulse`}
              style={{
                textDecoration: 'none',
                animationDelay: `${categories.indexOf(category) * 0.2}s`
              }}
            >
              <div className="icon" style={{
                fontSize: '3rem',
                filter: `drop-shadow(0 0 10px var(--${category.color}-color))`
              }}>
                {category.icon}
              </div>
              <div className="label" style={{
                fontSize: '1.1rem',
                fontWeight: 'bold',
                color: `var(--${category.color}-color)`,
                textShadow: `0 0 5px var(--${category.color}-color)`
              }}>
                {category.name}
              </div>
              <div style={{
                fontSize: '0.9rem',
                color: 'var(--text-secondary)',
                marginTop: '4px'
              }}>
                {category.count}+ places
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Content Sections */}
      <div style={{ padding: '40px 20px' }}>
        {/* Featured Events */}
        <section style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{
              fontSize: '1.8rem',
              color: 'var(--text-primary)',
              textShadow: '0 0 5px var(--events-color)'
            }}>
              Featured Events in {selectedCity}
            </h3>
            <Link 
              href="/events" 
              className="neon-button events"
              style={{ fontSize: '0.9rem', padding: '8px 16px' }}
            >
              See All
            </Link>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {/* Sample Featured Event Cards */}
            <div className="neon-card events events-glow featured">
              <div style={{ padding: '20px' }}>
                <div style={{
                  width: '100%',
                  height: '150px',
                  background: 'linear-gradient(135deg, var(--events-color), var(--bg-secondary))',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '3rem'
                }}>
                  🎭
                </div>
                <h4 style={{ color: 'var(--text-primary)', marginBottom: '8px', fontSize: '1.2rem' }}>
                  Baghdad Cultural Night
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '12px' }}>
                  Experience traditional Iraqi culture with music, dance, and art
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>
                    📅 Oct 15, 2024
                  </span>
                  <button className="neon-button events" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
                    View Details
                  </button>
                </div>
              </div>
            </div>

            <div className="neon-card events events-glow">
              <div style={{ padding: '20px' }}>
                <div style={{
                  width: '100%',
                  height: '150px',
                  background: 'linear-gradient(135deg, var(--events-color), var(--bg-secondary))',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '3rem'
                }}>
                  🎪
                </div>
                <h4 style={{ color: 'var(--text-primary)', marginBottom: '8px', fontSize: '1.2rem' }}>
                  Tech Innovation Summit
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '12px' }}>
                  Join leading tech experts for the future of technology in Iraq
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>
                    📅 Oct 28, 2024
                  </span>
                  <button className="neon-button events" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Hotels */}
        <section style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{
              fontSize: '1.8rem',
              color: 'var(--text-primary)',
              textShadow: '0 0 5px var(--hotels-color)'
            }}>
              Featured Hotels in {selectedCity}
            </h3>
            <Link 
              href="/hotels" 
              className="neon-button hotels"
              style={{ fontSize: '0.9rem', padding: '8px 16px' }}
            >
              See All
            </Link>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            <div className="neon-card hotels hotels-glow featured">
              <div style={{ padding: '20px' }}>
                <div style={{
                  width: '100%',
                  height: '150px',
                  background: 'linear-gradient(135deg, var(--hotels-color), var(--bg-secondary))',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '3rem'
                }}>
                  🏰
                </div>
                <h4 style={{ color: 'var(--text-primary)', marginBottom: '8px', fontSize: '1.2rem' }}>
                  Baghdad Palace Hotel
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '12px' }}>
                  Luxury accommodation in the heart of Baghdad
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--hotels-color)', fontSize: '1rem', fontWeight: 'bold' }}>
                    ⭐ 4.8
                  </span>
                  <button className="neon-button hotels" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section style={{ textAlign: 'center', marginTop: '60px' }}>
          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button className="neon-button tourism tourism-glow">
              <span>+</span>
              Create Event
            </button>
            <button className="neon-button events events-glow">
              Explore Events
            </button>
            <button className="neon-button hotels hotels-glow">
              Find Hotels
            </button>
            <button className="neon-button restaurants restaurants-glow">
              Discover Restaurants
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}