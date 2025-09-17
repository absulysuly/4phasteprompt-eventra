import React, { useState, useRef, useEffect } from 'react';
import type { User } from '../types';

interface UserMenuProps {
  user: User;
  onLogout: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 focus:outline-none">
        <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full border-2 border-secondary" />
        <span className="hidden sm:block text-sm font-medium text-neutral-text-soft">{user.name}</span>
      </button>
      {isOpen && (
        <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-48 rounded-md shadow-lg bg-neutral-container ring-1 ring-black ring-opacity-5 z-20 border border-neutral-border">
          <div className="py-1">
            <button
              onClick={onLogout}
              className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-neutral-text-soft hover:bg-primary/20"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};