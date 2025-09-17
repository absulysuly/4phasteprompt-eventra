
import React, { useState, useRef, useEffect } from 'react';
import type { User } from '@/types';

interface UserMenuProps {
  user: User;
  onLogout: () => void;
  onProfileClick: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ user, onLogout, onProfileClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center space-x-2">
        <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full" />
        <span className="hidden md:inline text-sm font-medium text-gray-700">{user.name}</span>
      </button>
      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
          <button
            onClick={() => { onProfileClick(); setIsOpen(false); }}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
          >
            My Profile
          </button>
          <button
            onClick={onLogout}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
};
