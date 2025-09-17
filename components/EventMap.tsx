
import React from 'react';

interface EventMapProps {
  coordinates: { lat: number; lon: number };
}

export const EventMap: React.FC<EventMapProps> = ({ coordinates }) => {
  // In a real application, you would integrate a mapping library like Leaflet or Google Maps.
  // For this placeholder, we'll use a static image and display the coordinates.
  const mapImageUrl = `https://picsum.photos/seed/map/400/300`;

  return (
    <div className="rounded-lg overflow-hidden border">
      <img src={mapImageUrl} alt="Event location map" className="w-full h-48 object-cover" />
      <div className="p-2 bg-gray-50 text-xs text-center">
        <span>Lat: {coordinates.lat.toFixed(4)}, Lon: {coordinates.lon.toFixed(4)}</span>
      </div>
    </div>
  );
};
