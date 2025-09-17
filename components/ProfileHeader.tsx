
import React from 'react';
import type { User } from '@/types';

interface ProfileHeaderProps {
  user: User;
  eventCount: number;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, eventCount }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-6">
      <img src={user.avatarUrl} alt={user.name} className="w-24 h-24 rounded-full border-4 border-primary" />
      <div>
        <h2 className="text-3xl font-bold text-gray-800">{user.name}</h2>
        <p className="text-gray-500">{user.email}</p>
        <div className="mt-4 flex space-x-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{eventCount}</p>
            <p className="text-sm text-gray-500">Events Created</p>
          </div>
          {/* Add more stats here later */}
        </div>
      </div>
    </div>
  );
};
