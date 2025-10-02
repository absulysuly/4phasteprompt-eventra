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


// --- Mock API Fetcher ---

const fetchVenueStats = async (): Promise<Record<string, number>> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    const stats = {
        EVENT: 234,
        HOTEL: 1200,
        RESTAURANT: 3500,
        ACTIVITY: 890,
        SERVICE: 1500,
    };
    // Add small random variations to show updates
    for (const key in stats) {
        stats[key] += Math.floor(Math.random() * 10 - 5);
    }
    return stats;
};

// --- Helper Components ---

const StatsTicker: React.FC<{ stats: Record<string, number> | null; locale: 'en' | 'ar' | 'ku' }> = ({ stats, locale }) => {
    const isRTL = locale === 'ar' || locale === 'ku';

    const renderStats = () => (
        STATS_DATA.map(stat => (
            <div key={stat.key} className="flex items-center mx-4 flex-shrink-0">
                <span className="text-2xl mr-2">{stat.icon}</span>
                <span className="font-medium">
                    {stats ? stats[stat.key].toLocaleString() : '...'}
                </span>
                <span className="ml-1 text-gray-600">{stat.label[locale]}</span>
            </div>
        ))
    );

    return (
        <div className="absolute bottom-0 left-0 w-full h-12 bg-white/90 backdrop-blur-sm border-t border-b border-gray-200 shadow-sm overflow-hidden">
            <div dir="ltr" className="flex items-center h-full text-sm text-gray-800 animate-marquee whitespace-nowrap">
                {renderStats()}
                {renderStats()} {/* Duplicate for seamless scroll */}
            </div>
            <style jsx>{`
                @keyframes marquee {
                    0% { transform: translateX(0%); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 40s linear infinite;
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
        <section className="relative h-[360px] md:h-[420px] w-full overflow-hidden text-white">
            {/* Background Images */}
            {LANDMARKS.map((src, index) => (
                <div
                    key={src}
                    className="absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000"
                    style={{
                        backgroundImage: `url(${src})`,
                        opacity: index === currentImageIndex ? 1 : 0,
                    }}
                />
            ))}
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
            
            {/* Hero Content */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4 pt-16 pb-12">
                <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-wider drop-shadow-lg">
                    {content.headline}
                </h1>
                <p className="mt-2 text-lg md:text-xl text-gray-300 drop-shadow-md">
                    {content.subheadline}
                </p>
                <button className="mt-8 bg-amber-600 text-white font-bold py-3 px-8 rounded-lg text-lg uppercase tracking-wider hover:bg-amber-500 transition-all duration-300 ease-in-out shadow-lg transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-amber-500/50">
                    {content.cta}
                </button>
            </div>
            
            {/* Stats Ticker */}
            <StatsTicker stats={stats} locale={locale} />
        </section>
    );
};

export default HeroSection;
