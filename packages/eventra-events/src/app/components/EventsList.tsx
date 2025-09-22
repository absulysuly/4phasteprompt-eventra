"use client";

import { useState } from "react";
import EventCard from "./EventCard";
import EventDetailsModal from "./EventDetailsModal";
import { useLanguage } from "./LanguageProvider";
import { useTranslations } from "../hooks/useTranslations";

interface Event {
  id: string;
  publicId: string;
  title: string;
  description: string;
  date: string;
  location: string;
  category?: string;
  price?: number;
  isFree?: boolean;
  imageUrl?: string;
  user?: {
    name?: string;
    email: string;
  };
}

interface EventsListProps {
  events: Event[];
  loading?: boolean;
  className?: string;
  gridCols?: string;
}

export default function EventsList({ 
  events, 
  loading = false, 
  className = "", 
  gridCols = "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
}: EventsListProps) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isRTL } = useLanguage();
  const { t } = useTranslations();

  const handleViewDetails = (event: Event, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className={`grid ${gridCols} gap-8`}>
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse">
              <div className="h-64 bg-gradient-to-br from-gray-200 to-gray-300" />
              <div className="p-6">
                <div className="h-6 bg-gray-200 rounded mb-3" />
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className={`text-center py-16 ${className}`}>
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {t('events.noEventsFound')}
        </h3>
        <p className="text-gray-600 text-lg">
          {t('events.noEventsMessage')}
        </p>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className={`grid ${gridCols} gap-8`}>
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onViewDetails={handleViewDetails}
            showQuickPreview={true}
          />
        ))}
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <EventDetailsModal 
          event={selectedEvent}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedEvent(null);
          }}
        />
      )}
    </div>
  );
}