import React, { useState, useEffect } from 'react';

// --- Component Configuration & Data ---

const LANDMARKS = [
  'https://images.unsplash.com/photo-1631123539503-29114b0a4902?q=80&w=1920&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // Baghdad Al-Shaheed Monument
  'https://images.unsplash.com/photo-1576487249764-a63f1092a35d?q=80&w=1920&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // Erbil Citadel
  'https://images.unsplash.com/photo-1616423838531-85d7199c8358?q=80&w=1920&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // Basra
  'https://images.unsplash.com/photo-1631123539352-25807986f1e2?q=80&w=1920&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // Baghdad Firdos Square
];

const STATS_DATA = [
    { icon: '🎉', label: { en: 'Live Events', ar: 'فعاليات مباشرة', ku: 'ئاهەنگی ڕاستەوخۆ' }, key: 'EVENT' },
    { icon: '🏨', label: { en: 'Hotels', ar: 'فنادق', ku: 'هۆتێلەکان' }, key: 'HOTEL' },
    { icon: '🍴', label: { en: 'Restaurants', ar: 'مطاعم', ku: 'چێشتخانەکان' }, key: 'RESTAURANT' },
    { icon: '🎯', label: { en: 'Activities', ar: 'أنشطة', ku: 'چالاکییەکان' }, key: 'ACTIVITY' },
    { icon: '🏢', label: { en: 'Services', ar: 'خدمات', ku: 'خزمەتگوزارییەکان' }, key: 'SERVICE' },
];

const heroContent = {
    en: {
        headline: "Discover Iraq",
        subheadline: "Events, Hotels & Restaurants",
        cta: "Explore Now"
    },
    ar: {
        headline: "اكتشف العراق",
        subheadline: "فعاليات، فنادق ومطاعم",
        cta: "استكشف الآن"
    },
    ku: {
        headline: "عێراق بدۆزەرەوە",
        subheadline: "ئاهەنگەکان، هۆتێلەکان و چێشتخانەکان",
        cta: "ئێستا بگەڕێ"
    }
};

// --- Backend API Integration ---

const fetchVenueStats = async (): Promise<Record<string, number>> => {
    try {
        const response = await fetch('/api/venues/stats', {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.success ? data.stats : data.stats || {};
    } catch (error) {
        console.error('Error fetching venue stats:', error);
        // Return fallback stats on error
        return {
            EVENT: 234,
            HOTEL: 1200,
            RESTAURANT: 3500,
            ACTIVITY: 890,
            SERVICE: 1500,
        };
    }
};

// --- Helper Components ---

const StatsTicker: React.FC<{ stats: Record<string, number> | null; locale: 'en' | 'ar' | 'ku' }> = ({ stats, locale }) => {
    const renderStats = () => (
        STATS_DATA.map(stat => (
            <div key={stat.key} className="flex items-center gap-3 mx-6 flex-shrink-0 group">
                <div className="text-3xl transform group-hover:scale-125 transition-transform duration-300">{stat.icon}</div>
                <div className="flex flex-col">
                    <span className="font-bold text-xl text-gray-900 group-hover:text-amber-600 transition-colors">
                        {stats ? stats[stat.key]?.toLocaleString() || '0' : '...'}
                    </span>
                    <span className="text-xs text-gray-600 uppercase tracking-wide font-medium">{stat.label[locale]}</span>
                </div>
            </div>
        ))
    );

    return (
        <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-r from-white via-amber-50 to-white backdrop-blur-md border-t-2 border-amber-300/50 shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-100/30 to-transparent"></div>
            <div dir="ltr" className="flex items-center h-full text-sm animate-marquee whitespace-nowrap relative z-10">
                {renderStats()}
                {renderStats()} {/* Duplicate for seamless scroll */}
            </div>
            <style jsx>{`
                @keyframes marquee {
                    0% { transform: translateX(0%); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 45s linear infinite;
                }
                .animate-marquee:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </div>
    );
};

// --- Main Component ---

interface HeroSectionProps {
  locale: 'en' | 'ar' | 'ku';
}

const HeroSection: React.FC<HeroSectionProps> = ({ locale }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [stats, setStats] = useState<Record<string, number> | null>(null);

    // Effect for rotating background images
    useEffect(() => {
        const timer = setTimeout(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % LANDMARKS.length);
        }, 5000);
        return () => clearTimeout(timer);
    }, [currentImageIndex]);
    
    // Effect for fetching stats
    useEffect(() => {
        const getStats = async () => {
            const data = await fetchVenueStats();
            setStats(data);
        };
        getStats();
        const interval = setInterval(getStats, 30000); // Update every 30s
        return () => clearInterval(interval);
    }, []);

    const content = heroContent[locale];

    return (
        <section className="relative h-[500px] md:h-[600px] w-full overflow-hidden text-white">
            {/* Background Images */}
            {LANDMARKS.map((src, index) => (
                <div
                    key={src}
                    className="absolute inset-0 w-full h-full bg-cover bg-center transition-all duration-2000 ease-in-out"
                    style={{
                        backgroundImage: `url(${src})`,
                        opacity: index === currentImageIndex ? 1 : 0,
                        transform: index === currentImageIndex ? 'scale(1.05)' : 'scale(1)',
                    }}
                />
            ))}
            {/* Enhanced Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-blue-900/60 to-gray-900/80" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            
            {/* Floating Elements */}
            <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-amber-400/20 to-orange-500/20 rounded-full blur-xl animate-pulse" />
            <div className="absolute bottom-32 right-16 w-32 h-32 bg-gradient-to-r from-blue-400/20 to-purple-500/20 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}} />
            
            {/* Hero Content */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6 pt-20 pb-16">
                <div className="mb-6 animate-fade-in">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-sm font-medium">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                        {locale === 'ar' ? 'اكتشف جمال العراق' : locale === 'ku' ? 'جوانی عێراق بدۆزەرەوە' : 'Explore the Beauty of Iraq'}
                    </div>
                </div>
                
                <h1 className="font-bold text-6xl md:text-8xl lg:text-9xl tracking-tight drop-shadow-2xl mb-6 bg-gradient-to-r from-white via-amber-200 to-white bg-clip-text text-transparent animate-slide-up">
                    {content.headline}
                </h1>
                
                <p className="mt-4 text-xl md:text-2xl text-gray-200 drop-shadow-lg max-w-3xl leading-relaxed animate-slide-up" style={{animationDelay: '0.2s'}}>
                    {content.subheadline}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 mt-10 animate-slide-up" style={{animationDelay: '0.4s'}}>
                    <button className="group relative px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-2xl text-lg uppercase tracking-wider transition-all duration-300 transform hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/50 overflow-hidden">
                        <span className="relative z-10">{content.cta}</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    </button>
                    
                    <button className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-2xl text-lg border-2 border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white/50">
                        {locale === 'ar' ? 'شاهد الفيديو' : locale === 'ku' ? 'ڤیدیۆ ببینە' : 'Watch Video'} ▶
                    </button>
                </div>
            </div>
            
            {/* Enhanced Stats Ticker */}
            <StatsTicker stats={stats} locale={locale} />
            
            {/* Custom Animations */}
            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.8s ease-out;
                }
                .animate-slide-up {
                    animation: slide-up 0.8s ease-out;
                    animation-fill-mode: both;
                }
            `}</style>
        </section>
    );
};

export default HeroSection;