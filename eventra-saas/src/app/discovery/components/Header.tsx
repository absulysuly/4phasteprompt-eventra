import React from 'react';
import Link from 'next/link';

const Header: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <header className="sticky top-0 z-50 h-20 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 backdrop-blur-xl border-b border-amber-500/20 shadow-2xl">
      <div className="container mx-auto flex justify-between items-center h-full px-8">
        <div className="flex items-center gap-3">
          <Link href="/discovery" className="group flex items-center gap-3 hover:scale-105 transition-transform duration-300">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 via-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-amber-500/50 transition-shadow">
              <span className="text-2xl font-black text-white">IQ</span>
            </div>
            <div>
              <div className="font-bold text-2xl tracking-tight bg-gradient-to-r from-amber-300 via-amber-200 to-amber-400 bg-clip-text text-transparent">
                IRAQ DISCOVERY
              </div>
              <div className="text-xs text-gray-400 tracking-wider">Explore the Land of Civilizations</div>
            </div>
          </Link>
        </div>
        
        <nav className="flex items-center gap-6">
          <ul className="hidden lg:flex items-center gap-1">
            <li>
              <Link href="/discovery" className="px-4 py-2 text-gray-300 hover:text-white text-sm font-medium rounded-lg hover:bg-white/10 transition-all duration-200">
                🏠 Home
              </Link>
            </li>
            <li>
              <Link href="/discovery#timeline" className="px-4 py-2 text-gray-300 hover:text-white text-sm font-medium rounded-lg hover:bg-white/10 transition-all duration-200">
                📅 Timeline
              </Link>
            </li>
            <li>
              <Link href="/discovery#map" className="px-4 py-2 text-gray-300 hover:text-white text-sm font-medium rounded-lg hover:bg-white/10 transition-all duration-200">
                🗺️ Map
              </Link>
            </li>
            <li>
              <Link href="/" className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white text-sm font-semibold rounded-lg hover:from-amber-500 hover:to-orange-500 transition-all duration-200 shadow-lg hover:shadow-amber-500/50">
                ⚡ Dashboard
              </Link>
            </li>
          </ul>
          
          <div className="flex items-center gap-4">
            {children}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;