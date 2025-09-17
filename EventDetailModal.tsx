import React, { useState } from 'react';
import type { Event, City, Category, Language, User, Review } from '@/types';
// FIX: Corrected import paths since this file is at the root.
import { CalendarIcon, MapPinIcon, XIcon, StarIcon } from './components/icons';
import { EventMap } from './components/EventMap';

interface EventDetailModalProps {
  event: Event;
  city?: City;
  category?: Category;
  lang: Language;
  onClose: () => void;
  currentUser: User | null;
  onAddReview: (eventId: string, reviewData: { rating: number; comment: string }, userId: string) => Promise<void>;
  onEdit: (event: Event) => void;
}

const StarRatingInput: React.FC<{ rating: number; setRating: (r: number) => void }> = ({ rating, setRating }) => {
    return (
        <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setRating(star)} type="button">
                    <StarIcon className={`w-6 h-6 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`} />
                </button>
            ))}
        </div>
    );
};

export const EventDetailModal: React.FC<EventDetailModalProps> = ({ event, city, category, lang, onClose, currentUser, onAddReview, onEdit }) => {
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(0);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser && newReviewText && newReviewRating > 0) {
      await onAddReview(event.id, { rating: newReviewRating, comment: newReviewText }, currentUser.id);
      setNewReviewText('');
      setNewReviewRating(0);
    }
  };

  const eventDate = new Date(event.date).toLocaleString(lang, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit'
  });
  
  const averageRating = event.reviews.length > 0 ? event.reviews.reduce((acc, r) => acc + r.rating, 0) / event.reviews.length : 0;


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="relative">
          <img src={event.imageUrl} alt={event.title[lang]} className="w-full h-64 object-cover rounded-t-lg" />
          <button onClick={onClose} className="absolute top-4 right-4 bg-white rounded-full p-2 text-gray-600 hover:text-gray-900">
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-secondary">{category?.name[lang]}</p>
              <h2 className="text-4xl font-extrabold text-gray-900 my-2">{event.title[lang]}</h2>
            </div>
            {currentUser?.id === event.organizerId && (
                <button onClick={() => onEdit(event)} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-indigo-700">Edit Event</button>
            )}
          </div>

          <div className="flex items-center space-x-6 text-gray-600 my-4">
            <div className="flex items-center"><CalendarIcon className="w-5 h-5 mr-2 text-primary" /> {eventDate}</div>
            <div className="flex items-center"><MapPinIcon className="w-5 h-5 mr-2 text-primary" /> {event.venue}, {city?.name[lang]}</div>
          </div>
          
          <div className="flex items-center my-4">
            <div className="flex">
                {[...Array(5)].map((_, i) => <StarIcon key={i} className={`w-5 h-5 ${i < Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-300'}`} />)}
            </div>
            <span className="ml-2 text-gray-600">({event.reviews.length} reviews)</span>
          </div>

          <p className="text-gray-700 leading-relaxed my-6">{event.description[lang]}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Event Details</h3>
              <ul className="space-y-2 text-gray-600">
                <li><strong>Organizer:</strong> {event.organizerName}</li>
                <li><strong>Contact:</strong> {event.organizerPhone}</li>
                {event.whatsappNumber && <li><strong>WhatsApp:</strong> {event.whatsappNumber}</li>}
                {event.ticketInfo && <li><strong>Tickets:</strong> {event.ticketInfo}</li>}
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Location</h3>
              {event.coordinates ? <EventMap coordinates={event.coordinates} /> : <p>Map not available.</p>}
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-bold mb-4">Reviews</h3>
            <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
              {event.reviews.map((review: Review) => (
                <div key={review.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                        <img src={review.user.avatarUrl} alt={review.user.name} className="w-8 h-8 rounded-full mr-3"/>
                        <p className="font-semibold">{review.user.name}</p>
                        <div className="flex ml-auto">{[...Array(review.rating)].map((_, i) => <StarIcon key={i} className="w-4 h-4 text-yellow-400" />)}</div>
                    </div>
                  <p className="text-gray-600">{review.comment}</p>
                </div>
              ))}
            </div>

            {currentUser && (
              <form onSubmit={handleReviewSubmit} className="mt-6">
                <h4 className="font-semibold mb-2">Leave a Review</h4>
                 <StarRatingInput rating={newReviewRating} setRating={setNewReviewRating} />
                <textarea
                  value={newReviewText}
                  onChange={(e) => setNewReviewText(e.target.value)}
                  placeholder="Share your experience..."
                  className="w-full p-2 border rounded-md mt-2"
                  rows={3}
                ></textarea>
                <button type="submit" className="mt-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400" disabled={!newReviewText || newReviewRating === 0}>Submit Review</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
