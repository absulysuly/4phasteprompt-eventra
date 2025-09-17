
import React from 'react';
import type { User, Event } from '@/types';
import { ProfileHeader } from './ProfileHeader';
import { XIcon } from './icons';

interface UserProfileModalProps {
  user: User;
  userEvents: Event[];
  onClose: () => void;
  onUpdateProfile: (userData: Partial<User>) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ user, userEvents, onClose, onUpdateProfile }) => {
  // Placeholder handler for future implementation
  const handleUpdate = () => {
    onUpdateProfile({ name: "Updated Name" }); // Example update
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-neutral-50 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
            <XIcon className="w-6 h-6" />
          </button>
          
          <ProfileHeader user={user} eventCount={userEvents.length} />
          
          <div className="mt-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">My Events</h3>
            <div className="space-y-4">
              {userEvents.length > 0 ? userEvents.map(event => (
                <div key={event.id} className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{event.title.en}</p>
                    <p className="text-sm text-gray-500">{new Date(event.date).toLocaleDateString()}</p>
                  </div>
                  <button className="text-sm text-primary hover:underline">View</button>
                </div>
              )) : (
                <p className="text-gray-500">You haven't created any events yet.</p>
              )}
            </div>
          </div>
          
          <div className="mt-8">
             <button onClick={handleUpdate} className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-indigo-700">Update Profile (Demo)</button>
          </div>
        </div>
      </div>
    </div>
  );
};
