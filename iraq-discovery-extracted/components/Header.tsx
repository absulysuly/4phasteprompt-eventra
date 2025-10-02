
import React from 'react';

const Header: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <header className="sticky top-0 z-50 h-16 bg-gray-900/70 backdrop-blur-sm">
      <div className="container mx-auto flex justify-between items-center h-full px-6">
        <div className="font-serif text-2xl font-bold tracking-widest text-white">
          IRAQ
        </div>
        <nav className="flex items-center space-x-8">
          <ul className="hidden md:flex space-x-8 text-gray-200 text-sm uppercase tracking-widest">
            <li><a href="#" className="hover:text-amber-400 transition-colors">Home</a></li>
            <li><a href="#" className="hover:text-amber-400 transition-colors">Timeline</a></li>
            <li><a href="#" className="hover:text-amber-400 transition-colors">Map</a></li>
            <li><a href="#" className="hover:text-amber-400 transition-colors">About</a></li>
          </ul>
          {children}
        </nav>
      </div>
    </header>
  );
};

export default Header;
