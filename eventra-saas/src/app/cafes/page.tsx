"use client";

import Link from 'next/link';

export default function CafesPage() {
  const cafes = [
    {
      id: '1',
      name: 'Baghdad Coffee House',
      description: 'Traditional Iraqi coffee in a cozy atmosphere',
      rating: 4.6,
      priceRange: '$$',
      image: '☕',
      specialty: 'Turkish Coffee',
      location: 'Baghdad Old City'
    },
    {
      id: '2', 
      name: 'Kurdish Mountain Cafe',
      description: 'Authentic Kurdish tea and sweets with mountain views',
      rating: 4.8,
      priceRange: '$',
      image: '🫖',
      specialty: 'Kurdish Tea',
      location: 'Erbil Hills'
    },
    {
      id: '3',
      name: 'Tigris River Cafe',
      description: 'Riverside cafe with fresh pastries and specialty drinks',
      rating: 4.5,
      priceRange: '$$',
      image: '🧁',
      specialty: 'Pastries & Desserts',
      location: 'Baghdad Riverside'
    },
    {
      id: '4',
      name: 'Modern Brew Co.',
      description: 'Contemporary cafe with international coffee blends',
      rating: 4.7,
      priceRange: '$$$',
      image: '🥤',
      specialty: 'Specialty Coffee',
      location: 'Erbil Center'
    }
  ];

  const cafeTypes = [
    { name: 'Traditional Coffee Houses', icon: '☕', count: 32, description: 'Authentic Iraqi coffee culture' },
    { name: 'Tea Gardens', icon: '🍵', count: 28, description: 'Kurdish tea traditions' },
    { name: 'Modern Cafes', icon: '🥤', count: 24, description: 'International coffee & vibes' },
    { name: 'Shisha Lounges', icon: '💨', count: 18, description: 'Relaxing hookah experience' },
    { name: 'Bakery Cafes', icon: '🥐', count: 22, description: 'Fresh pastries & coffee' },
    { name: 'Rooftop Cafes', icon: '🌆', count: 15, description: 'City views & coffee' }
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
          background: 'rgba(255, 237, 78, 0.1)',
          border: '2px solid var(--cafes-color)',
          borderRadius: '15px',
          padding: '24px',
          backdropFilter: 'blur(10px)'
        }}>
          <h1 style={{
            fontSize: '3rem',
            color: 'var(--cafes-color)',
            textShadow: '0 0 10px var(--cafes-color)',
            marginBottom: '16px'
          }}>
            ☕ Cafes
          </h1>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '1.2rem'
          }}>
            Experience the rich coffee culture of Iraq & Kurdistan
          </p>
        </div>
      </div>

      {/* Back Button */}
      <div style={{ marginBottom: '32px' }}>
        <Link href="/" className="neon-button cafes">
          ← Back to Home
        </Link>
      </div>

      {/* Featured Cafes Grid */}
      <div style={{
        marginBottom: '60px'
      }}>
        <h2 style={{
          textAlign: 'center',
          color: 'var(--cafes-color)',
          fontSize: '2.5rem',
          marginBottom: '32px',
          textShadow: '0 0 10px var(--cafes-color)'
        }}>
          Featured Cafes
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '24px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {cafes.map((cafe) => (
            <div key={cafe.id} className="neon-card cafes cafes-glow">
              <div style={{ padding: '24px' }}>
                {/* Cafe Image/Icon */}
                <div style={{
                  width: '100%',
                  height: '200px',
                  background: 'linear-gradient(135deg, var(--cafes-color), var(--bg-secondary))',
                  borderRadius: '12px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '4rem'
                }}>
                  {cafe.image}
                </div>

                {/* Cafe Info */}
                <h3 style={{
                  color: 'var(--text-primary)',
                  fontSize: '1.5rem',
                  marginBottom: '8px',
                  textShadow: '0 0 5px var(--cafes-color)'
                }}>
                  {cafe.name}
                </h3>

                <p style={{
                  color: 'var(--text-secondary)',
                  marginBottom: '16px',
                  lineHeight: '1.6'
                }}>
                  {cafe.description}
                </p>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  marginBottom: '16px'
                }}>
                  <div>
                    <span style={{
                      color: 'var(--cafes-color)',
                      fontSize: '1.1rem',
                      fontWeight: 'bold'
                    }}>
                      ⭐ {cafe.rating}
                    </span>
                  </div>
                  <div>
                    <span style={{
                      color: 'var(--text-tertiary)',
                      fontSize: '0.9rem'
                    }}>
                      📍 {cafe.location}
                    </span>
                  </div>
                  <div>
                    <span style={{
                      color: 'var(--cafes-color)',
                      fontSize: '0.9rem',
                      fontWeight: '600'
                    }}>
                      ✨ {cafe.specialty}
                    </span>
                  </div>
                  <div>
                    <span style={{
                      color: 'var(--text-tertiary)',
                      fontSize: '0.9rem'
                    }}>
                      💰 {cafe.priceRange}
                    </span>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '12px',
                  justifyContent: 'center'
                }}>
                  <button className="neon-button cafes" style={{
                    fontSize: '0.9rem',
                    padding: '8px 16px'
                  }}>
                    Visit Cafe
                  </button>
                  <button className="neon-button tourism" style={{
                    fontSize: '0.9rem',
                    padding: '8px 16px'
                  }}>
                    View Menu
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cafe Types */}
      <div style={{
        marginTop: '60px',
        textAlign: 'center'
      }}>
        <h2 style={{
          color: 'var(--cafes-color)',
          fontSize: '2.5rem',
          marginBottom: '32px',
          textShadow: '0 0 10px var(--cafes-color)'
        }}>
          Explore Cafe Types
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          maxWidth: '1000px',
          margin: '0 auto'
        }}>
          {cafeTypes.map((type, index) => (
            <div 
              key={index}
              className="neon-card cafes cafes-glow"
              style={{
                cursor: 'pointer',
                animationDelay: `${index * 0.1}s`,
                padding: '24px',
                textAlign: 'center',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>
                {type.icon}
              </div>
              <h3 style={{
                color: 'var(--cafes-color)',
                fontSize: '1.3rem',
                fontWeight: '600',
                marginBottom: '8px',
                textShadow: '0 0 5px var(--cafes-color)'
              }}>
                {type.name}
              </h3>
              <p style={{
                color: 'var(--text-secondary)',
                fontSize: '0.9rem',
                marginBottom: '12px'
              }}>
                {type.description}
              </p>
              <div style={{
                color: 'var(--text-tertiary)',
                fontSize: '0.8rem'
              }}>
                {type.count} places
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Coffee Culture Section */}
      <div style={{
        marginTop: '80px',
        textAlign: 'center'
      }}>
        <div className="neon-card tourism tourism-glow" style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '40px'
        }}>
          <h2 style={{
            color: 'var(--tourism-color)',
            fontSize: '2.2rem',
            marginBottom: '20px',
            textShadow: '0 0 10px var(--tourism-color)'
          }}>
            ☕ Iraqi Coffee Culture
          </h2>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '1.1rem',
            lineHeight: '1.8',
            marginBottom: '24px'
          }}>
            From traditional Baghdad coffee houses serving strong Turkish coffee to modern Kurdish tea gardens 
            nestled in the mountains, Iraq and Kurdistan offer a rich tapestry of coffee and tea culture. 
            Each cup tells a story of hospitality, tradition, and the timeless art of gathering over good drinks.
          </p>
          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button className="neon-button cafes">
              Learn More
            </button>
            <button className="neon-button restaurants">
              Try Local Dishes
            </button>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div style={{
        textAlign: 'center',
        marginTop: '60px',
        padding: '40px 20px'
      }}>
        <div className="neon-card cafes cafes-glow" style={{
          maxWidth: '600px',
          margin: '0 auto',
          padding: '32px'
        }}>
          <h2 style={{
            color: 'var(--cafes-color)',
            fontSize: '2rem',
            marginBottom: '16px',
            textShadow: '0 0 10px var(--cafes-color)'
          }}>
            Own a Cafe?
          </h2>
          <p style={{
            color: 'var(--text-secondary)',
            marginBottom: '24px',
            fontSize: '1.1rem'
          }}>
            Join our platform and connect with coffee lovers across Iraq & Kurdistan
          </p>
          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button className="neon-button cafes">
              List Your Cafe
            </button>
            <button className="neon-button hotels">
              Explore Hotels
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}