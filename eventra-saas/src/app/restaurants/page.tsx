"use client";

import Link from 'next/link';

export default function RestaurantsPage() {
  const restaurants = [
    {
      id: '1',
      name: 'Al-Mansour Palace Restaurant',
      description: 'Authentic Iraqi cuisine in an elegant setting',
      rating: 4.7,
      priceRange: '$$$',
      image: '🍽️',
      cuisine: 'Traditional Iraqi',
      location: 'Baghdad Center'
    },
    {
      id: '2', 
      name: 'Kurdistan Grill House',
      description: 'Famous for kebabs and Kurdish specialties',
      rating: 4.5,
      priceRange: '$$',
      image: '🥩',
      cuisine: 'Kurdish Grills',
      location: 'Erbil'
    },
    {
      id: '3',
      name: 'Mesopotamia Fine Dining',
      description: 'Modern Iraqi cuisine with a contemporary twist',
      rating: 4.8,
      priceRange: '$$$$',
      image: '🍷',
      cuisine: 'Modern Iraqi',
      location: 'Baghdad'
    },
    {
      id: '4',
      name: 'Basra Fish Market',
      description: 'Fresh seafood from the Persian Gulf',
      rating: 4.4,
      priceRange: '$$',
      image: '🐟',
      cuisine: 'Seafood',
      location: 'Basra'
    }
  ];

  return (
    <div className="min-h-screen" style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '40px',
        padding: '40px 20px'
      }}>
        <div style={{
          display: 'inline-block',
          background: 'rgba(255, 107, 53, 0.1)',
          border: '2px solid var(--restaurants-color)',
          borderRadius: '15px',
          padding: '24px',
          backdropFilter: 'blur(10px)'
        }}>
          <h1 style={{
            fontSize: '3rem',
            color: 'var(--restaurants-color)',
            textShadow: '0 0 10px var(--restaurants-color)',
            marginBottom: '16px'
          }}>
            🍽️ Restaurants
          </h1>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '1.2rem'
          }}>
            Discover the finest dining experiences in Iraq & Kurdistan
          </p>
        </div>
      </div>

      {/* Back Button */}
      <div style={{ marginBottom: '32px' }}>
        <Link href="/" className="neon-button restaurants">
          ← Back to Home
        </Link>
      </div>

      {/* Restaurants Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '24px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {restaurants.map((restaurant) => (
          <div key={restaurant.id} className="neon-card restaurants restaurants-glow">
            <div style={{ padding: '24px' }}>
              {/* Restaurant Image/Icon */}
              <div style={{
                width: '100%',
                height: '200px',
                background: 'linear-gradient(135deg, var(--restaurants-color), var(--bg-secondary))',
                borderRadius: '12px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '4rem'
              }}>
                {restaurant.image}
              </div>

              {/* Restaurant Info */}
              <h3 style={{
                color: 'var(--text-primary)',
                fontSize: '1.5rem',
                marginBottom: '8px',
                textShadow: '0 0 5px var(--restaurants-color)'
              }}>
                {restaurant.name}
              </h3>

              <p style={{
                color: 'var(--text-secondary)',
                marginBottom: '16px',
                lineHeight: '1.6'
              }}>
                {restaurant.description}
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginBottom: '16px'
              }}>
                <div>
                  <span style={{
                    color: 'var(--restaurants-color)',
                    fontSize: '1.1rem',
                    fontWeight: 'bold'
                  }}>
                    ⭐ {restaurant.rating}
                  </span>
                </div>
                <div>
                  <span style={{
                    color: 'var(--text-tertiary)',
                    fontSize: '0.9rem'
                  }}>
                    📍 {restaurant.location}
                  </span>
                </div>
                <div>
                  <span style={{
                    color: 'var(--restaurants-color)',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                  }}>
                    🍴 {restaurant.cuisine}
                  </span>
                </div>
                <div>
                  <span style={{
                    color: 'var(--text-tertiary)',
                    fontSize: '0.9rem'
                  }}>
                    💰 {restaurant.priceRange}
                  </span>
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center'
              }}>
                <button className="neon-button restaurants" style={{
                  fontSize: '0.9rem',
                  padding: '8px 16px'
                }}>
                  View Menu
                </button>
                <button className="neon-button tourism" style={{
                  fontSize: '0.9rem',
                  padding: '8px 16px'
                }}>
                  Reserve Table
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Food Categories */}
      <div style={{
        marginTop: '60px',
        textAlign: 'center'
      }}>
        <h2 style={{
          color: 'var(--restaurants-color)',
          fontSize: '2.5rem',
          marginBottom: '32px',
          textShadow: '0 0 10px var(--restaurants-color)'
        }}>
          Browse by Cuisine
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          {[
            { name: 'Iraqi Traditional', icon: '🥘', count: 24 },
            { name: 'Kurdish Specialties', icon: '🍖', count: 18 },
            { name: 'Middle Eastern', icon: '🧆', count: 15 },
            { name: 'Seafood', icon: '🦐', count: 12 },
            { name: 'International', icon: '🍝', count: 20 },
            { name: 'Desserts & Sweets', icon: '🍯', count: 16 }
          ].map((cuisine, index) => (
            <div 
              key={index}
              className="category-icon restaurants restaurants-glow"
              style={{
                cursor: 'pointer',
                animationDelay: `${index * 0.1}s`
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>
                {cuisine.icon}
              </div>
              <div style={{
                color: 'var(--restaurants-color)',
                fontWeight: '600',
                marginBottom: '4px'
              }}>
                {cuisine.name}
              </div>
              <div style={{
                color: 'var(--text-tertiary)',
                fontSize: '0.9rem'
              }}>
                {cuisine.count} places
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div style={{
        textAlign: 'center',
        marginTop: '60px',
        padding: '40px 20px'
      }}>
        <div className="neon-card restaurants restaurants-glow" style={{
          maxWidth: '600px',
          margin: '0 auto',
          padding: '32px'
        }}>
          <h2 style={{
            color: 'var(--restaurants-color)',
            fontSize: '2rem',
            marginBottom: '16px',
            textShadow: '0 0 10px var(--restaurants-color)'
          }}>
            Own a Restaurant?
          </h2>
          <p style={{
            color: 'var(--text-secondary)',
            marginBottom: '24px',
            fontSize: '1.1rem'
          }}>
            Join Eventra and showcase your restaurant to thousands of food lovers
          </p>
          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button className="neon-button restaurants">
              List Your Restaurant
            </button>
            <button className="neon-button cafes">
              Browse Cafes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}