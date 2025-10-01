"use client";

import Link from 'next/link';

export default function HotelsPage() {
  const hotels = [
    {
      id: '1',
      name: 'Baghdad Palace Hotel',
      description: 'Luxury accommodation in the heart of Baghdad',
      rating: 4.8,
      price: '$120/night',
      image: '🏰',
      location: 'Central Baghdad'
    },
    {
      id: '2', 
      name: 'Erbil Grand Hotel',
      description: 'Modern hotel with stunning city views',
      rating: 4.6,
      price: '$95/night',
      image: '🏨',
      location: 'Erbil Center'
    },
    {
      id: '3',
      name: 'Basra Riverside Hotel',
      description: 'Peaceful riverside accommodation',
      rating: 4.4,
      price: '$80/night',
      image: '🌊',
      location: 'Basra Waterfront'
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
          background: 'rgba(255, 46, 151, 0.1)',
          border: '2px solid var(--hotels-color)',
          borderRadius: '15px',
          padding: '24px',
          backdropFilter: 'blur(10px)'
        }}>
          <h1 style={{
            fontSize: '3rem',
            color: 'var(--hotels-color)',
            textShadow: '0 0 10px var(--hotels-color)',
            marginBottom: '16px'
          }}>
            🏨 Hotels
          </h1>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '1.2rem'
          }}>
            Find the perfect place to stay in Iraq & Kurdistan
          </p>
        </div>
      </div>

      {/* Back Button */}
      <div style={{ marginBottom: '32px' }}>
        <Link href="/" className="neon-button hotels">
          ← Back to Home
        </Link>
      </div>

      {/* Hotels Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '24px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {hotels.map((hotel) => (
          <div key={hotel.id} className="neon-card hotels hotels-glow">
            <div style={{ padding: '24px' }}>
              {/* Hotel Image/Icon */}
              <div style={{
                width: '100%',
                height: '200px',
                background: 'linear-gradient(135deg, var(--hotels-color), var(--bg-secondary))',
                borderRadius: '12px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '4rem'
              }}>
                {hotel.image}
              </div>

              {/* Hotel Info */}
              <h3 style={{
                color: 'var(--text-primary)',
                fontSize: '1.5rem',
                marginBottom: '8px',
                textShadow: '0 0 5px var(--hotels-color)'
              }}>
                {hotel.name}
              </h3>

              <p style={{
                color: 'var(--text-secondary)',
                marginBottom: '16px',
                lineHeight: '1.6'
              }}>
                {hotel.description}
              </p>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px'
              }}>
                <span style={{
                  color: 'var(--hotels-color)',
                  fontSize: '1.1rem',
                  fontWeight: 'bold'
                }}>
                  ⭐ {hotel.rating}
                </span>
                <span style={{
                  color: 'var(--text-tertiary)',
                  fontSize: '0.9rem'
                }}>
                  📍 {hotel.location}
                </span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{
                  color: 'var(--hotels-color)',
                  fontSize: '1.3rem',
                  fontWeight: 'bold',
                  textShadow: '0 0 5px var(--hotels-color)'
                }}>
                  {hotel.price}
                </span>
                <button className="neon-button hotels">
                  Book Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Call to Action */}
      <div style={{
        textAlign: 'center',
        marginTop: '60px',
        padding: '40px 20px'
      }}>
        <div className="neon-card hotels hotels-glow" style={{
          maxWidth: '600px',
          margin: '0 auto',
          padding: '32px'
        }}>
          <h2 style={{
            color: 'var(--hotels-color)',
            fontSize: '2rem',
            marginBottom: '16px',
            textShadow: '0 0 10px var(--hotels-color)'
          }}>
            Can't find what you're looking for?
          </h2>
          <p style={{
            color: 'var(--text-secondary)',
            marginBottom: '24px',
            fontSize: '1.1rem'
          }}>
            Contact us to find more hotel options in your preferred location
          </p>
          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button className="neon-button hotels">
              Contact Us
            </button>
            <button className="neon-button tourism">
              Browse All Categories
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}