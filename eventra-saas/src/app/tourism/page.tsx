"use client";

import Link from 'next/link';

export default function TourismPage() {
  const attractions = [
    {
      id: '1',
      name: 'Ancient Babylon',
      description: 'Explore the legendary ruins of one of history\'s greatest civilizations',
      rating: 4.9,
      category: 'Historical Site',
      image: '🏛️',
      location: 'Babylon, Iraq',
      duration: 'Full Day'
    },
    {
      id: '2', 
      name: 'Kurdish Mountains',
      description: 'Breathtaking mountain landscapes and traditional villages',
      rating: 4.8,
      category: 'Nature & Adventure',
      image: '🏔️',
      location: 'Kurdistan Region',
      duration: '2-3 Days'
    },
    {
      id: '3',
      name: 'Marsh Arab Culture',
      description: 'Unique wetland ecosystem and ancient way of life',
      rating: 4.7,
      category: 'Cultural Experience',
      image: '🌾',
      location: 'Southern Iraq',
      duration: '1-2 Days'
    },
    {
      id: '4',
      name: 'Baghdad Museums',
      description: 'World-class artifacts and Iraqi heritage collections',
      rating: 4.6,
      category: 'Museums & Culture',
      image: '🏺',
      location: 'Baghdad',
      duration: 'Half Day'
    }
  ];

  const tourismCategories = [
    { name: 'Historical Sites', icon: '🏛️', count: 45, description: 'Ancient civilizations & monuments' },
    { name: 'Natural Wonders', icon: '🌄', count: 32, description: 'Mountains, rivers & landscapes' },
    { name: 'Cultural Experiences', icon: '🎭', count: 28, description: 'Local traditions & customs' },
    { name: 'Adventure Tours', icon: '🧗', count: 24, description: 'Outdoor activities & exploration' },
    { name: 'Religious Sites', icon: '🕌', count: 38, description: 'Sacred places & pilgrimage sites' },
    { name: 'City Tours', icon: '🏙️', count: 22, description: 'Urban exploration & city life' }
  ];

  const highlights = [
    {
      title: "Mesopotamian Heritage",
      description: "Walk through the cradle of civilization and discover 5,000 years of history",
      icon: "📜"
    },
    {
      title: "Kurdish Nature",
      description: "Experience pristine mountain landscapes and traditional mountain culture",
      icon: "🌲"
    },
    {
      title: "Tigris & Euphrates",
      description: "Explore the legendary rivers that shaped human civilization",
      icon: "🌊"
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
          background: 'rgba(0, 240, 255, 0.1)',
          border: '2px solid var(--tourism-color)',
          borderRadius: '15px',
          padding: '24px',
          backdropFilter: 'blur(10px)'
        }}>
          <h1 style={{
            fontSize: '3rem',
            color: 'var(--tourism-color)',
            textShadow: '0 0 10px var(--tourism-color)',
            marginBottom: '16px'
          }}>
            📸 Tourism
          </h1>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '1.2rem'
          }}>
            Discover the wonders of Iraq & Kurdistan - Where history meets adventure
          </p>
        </div>
      </div>

      {/* Back Button */}
      <div style={{ marginBottom: '32px' }}>
        <Link href="/" className="neon-button tourism">
          ← Back to Home
        </Link>
      </div>

      {/* Highlights Section */}
      <div style={{ marginBottom: '60px' }}>
        <h2 style={{
          textAlign: 'center',
          color: 'var(--tourism-color)',
          fontSize: '2.5rem',
          marginBottom: '32px',
          textShadow: '0 0 10px var(--tourism-color)'
        }}>
          Why Visit Iraq & Kurdistan?
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          maxWidth: '1000px',
          margin: '0 auto',
          marginBottom: '40px'
        }}>
          {highlights.map((highlight, index) => (
            <div key={index} className="neon-card tourism tourism-glow">
              <div style={{ padding: '24px', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>
                  {highlight.icon}
                </div>
                <h3 style={{
                  color: 'var(--tourism-color)',
                  fontSize: '1.5rem',
                  marginBottom: '12px',
                  textShadow: '0 0 5px var(--tourism-color)'
                }}>
                  {highlight.title}
                </h3>
                <p style={{
                  color: 'var(--text-secondary)',
                  lineHeight: '1.6'
                }}>
                  {highlight.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Attractions */}
      <div style={{ marginBottom: '60px' }}>
        <h2 style={{
          textAlign: 'center',
          color: 'var(--tourism-color)',
          fontSize: '2.5rem',
          marginBottom: '32px',
          textShadow: '0 0 10px var(--tourism-color)'
        }}>
          Featured Attractions
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '24px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {attractions.map((attraction) => (
            <div key={attraction.id} className="neon-card tourism tourism-glow">
              <div style={{ padding: '24px' }}>
                {/* Attraction Image/Icon */}
                <div style={{
                  width: '100%',
                  height: '200px',
                  background: 'linear-gradient(135deg, var(--tourism-color), var(--bg-secondary))',
                  borderRadius: '12px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '4rem'
                }}>
                  {attraction.image}
                </div>

                {/* Attraction Info */}
                <h3 style={{
                  color: 'var(--text-primary)',
                  fontSize: '1.5rem',
                  marginBottom: '8px',
                  textShadow: '0 0 5px var(--tourism-color)'
                }}>
                  {attraction.name}
                </h3>

                <p style={{
                  color: 'var(--text-secondary)',
                  marginBottom: '16px',
                  lineHeight: '1.6'
                }}>
                  {attraction.description}
                </p>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  marginBottom: '16px'
                }}>
                  <div>
                    <span style={{
                      color: 'var(--tourism-color)',
                      fontSize: '1.1rem',
                      fontWeight: 'bold'
                    }}>
                      ⭐ {attraction.rating}
                    </span>
                  </div>
                  <div>
                    <span style={{
                      color: 'var(--text-tertiary)',
                      fontSize: '0.9rem'
                    }}>
                      📍 {attraction.location}
                    </span>
                  </div>
                  <div>
                    <span style={{
                      color: 'var(--tourism-color)',
                      fontSize: '0.9rem',
                      fontWeight: '600'
                    }}>
                      🎯 {attraction.category}
                    </span>
                  </div>
                  <div>
                    <span style={{
                      color: 'var(--text-tertiary)',
                      fontSize: '0.9rem'
                    }}>
                      ⏱️ {attraction.duration}
                    </span>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '12px',
                  justifyContent: 'center'
                }}>
                  <button className="neon-button tourism" style={{
                    fontSize: '0.9rem',
                    padding: '8px 16px'
                  }}>
                    Learn More
                  </button>
                  <button className="neon-button events" style={{
                    fontSize: '0.9rem',
                    padding: '8px 16px'
                  }}>
                    Book Tour
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tourism Categories */}
      <div style={{
        marginTop: '60px',
        textAlign: 'center'
      }}>
        <h2 style={{
          color: 'var(--tourism-color)',
          fontSize: '2.5rem',
          marginBottom: '32px',
          textShadow: '0 0 10px var(--tourism-color)'
        }}>
          Explore by Category
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          maxWidth: '1000px',
          margin: '0 auto'
        }}>
          {tourismCategories.map((category, index) => (
            <div 
              key={index}
              className="neon-card tourism tourism-glow"
              style={{
                cursor: 'pointer',
                animationDelay: `${index * 0.1}s`,
                padding: '24px',
                textAlign: 'center',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>
                {category.icon}
              </div>
              <h3 style={{
                color: 'var(--tourism-color)',
                fontSize: '1.3rem',
                fontWeight: '600',
                marginBottom: '8px',
                textShadow: '0 0 5px var(--tourism-color)'
              }}>
                {category.name}
              </h3>
              <p style={{
                color: 'var(--text-secondary)',
                fontSize: '0.9rem',
                marginBottom: '12px'
              }}>
                {category.description}
              </p>
              <div style={{
                color: 'var(--text-tertiary)',
                fontSize: '0.8rem'
              }}>
                {category.count} places
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Travel Information */}
      <div style={{
        marginTop: '80px',
        textAlign: 'center'
      }}>
        <div className="neon-card events events-glow" style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '40px'
        }}>
          <h2 style={{
            color: 'var(--events-color)',
            fontSize: '2.2rem',
            marginBottom: '20px',
            textShadow: '0 0 10px var(--events-color)'
          }}>
            🗺️ Plan Your Journey
          </h2>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '1.1rem',
            lineHeight: '1.8',
            marginBottom: '24px'
          }}>
            Iraq and Kurdistan offer incredible diversity - from ancient Mesopotamian sites to Kurdish mountain 
            adventures. Whether you're interested in history, culture, nature, or adventure, we'll help you 
            discover the hidden gems of this remarkable region.
          </p>
          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button className="neon-button tourism">
              Travel Guide
            </button>
            <button className="neon-button hotels">
              Find Hotels
            </button>
            <button className="neon-button restaurants">
              Local Cuisine
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
        <div className="neon-card tourism tourism-glow" style={{
          maxWidth: '600px',
          margin: '0 auto',
          padding: '32px'
        }}>
          <h2 style={{
            color: 'var(--tourism-color)',
            fontSize: '2rem',
            marginBottom: '16px',
            textShadow: '0 0 10px var(--tourism-color)'
          }}>
            Ready to Explore?
          </h2>
          <p style={{
            color: 'var(--text-secondary)',
            marginBottom: '24px',
            fontSize: '1.1rem'
          }}>
            Start planning your adventure in Iraq & Kurdistan today
          </p>
          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button className="neon-button tourism">
              Plan Your Trip
            </button>
            <button className="neon-button events">
              Find Events
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}