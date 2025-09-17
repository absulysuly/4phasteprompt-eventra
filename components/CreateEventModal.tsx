// FIX: Implemented the create/edit event modal with a form and AI assistant integration.
import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { loggingService } from '@/services/loggingService';
import type { Event, City, Category, User, LocalizedString, AIAutofillData } from '@/types';
import { XIcon, SparklesIcon } from './icons';
import { AIAssistantModal } from './AIAssistantModal';

interface CreateEventModalProps {
  eventToEdit?: Event | null;
  onClose: () => void;
  onSave: (event: Event) => void;
  cities: City[];
  categories: Category[];
  currentUser: User;
}

const initialEventState: Omit<Event, 'id' | 'organizerId' | 'reviews'> = {
  title: { en: '', ar: '', ku: '' },
  description: { en: '', ar: '', ku: '' },
  organizerName: '',
  categoryId: '',
  cityId: '',
  date: '',
  venue: '',
  organizerPhone: '',
  imageUrl: '',
  isFeatured: false,
  isTop: false,
};

export const CreateEventModal: React.FC<CreateEventModalProps> = ({ eventToEdit, onClose, onSave, cities, categories, currentUser }) => {
  const [eventData, setEventData] = useState(initialEventState);
  const [isLoading, setIsLoading] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);

  useEffect(() => {
    if (eventToEdit) {
      setEventData({ ...eventToEdit, date: eventToEdit.date.substring(0, 16) });
    } else {
      setEventData({ ...initialEventState, organizerName: currentUser.name, organizerPhone: currentUser.phone });
    }
  }, [eventToEdit, currentUser]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEventData(prev => ({ ...prev, [name]: value }));
  };

  const handleLocalizedStringChange = (field: 'title' | 'description', lang: keyof LocalizedString, value: string) => {
    setEventData(prev => ({ ...prev, [field]: { ...prev[field], [lang]: value } }));
  };

  const handleApplyAISuggestion = (data: AIAutofillData) => {
    setEventData(prev => ({
      ...prev,
      title: data.title,
      description: data.description,
      cityId: data.cityId,
      categoryId: data.categoryId,
      imageUrl: `data:image/jpeg;base64,${data.imageBase64}`
    }));
    setIsAIAssistantOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let savedEvent;
      if (eventToEdit) {
        savedEvent = await api.updateEvent(eventToEdit.id, eventData);
        loggingService.trackEvent('event_updated', { eventId: savedEvent.id });
      } else {
        savedEvent = await api.addEvent(eventData, currentUser.id);
        loggingService.trackEvent('event_created', { eventId: savedEvent.id });
      }
      onSave(savedEvent);
    } catch (error) {
      loggingService.logError(error as Error, { eventData });
      // In a real app, show an error toast to the user
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">{eventToEdit ? 'Edit Event' : 'Create a New Event'}</h2>
                <button type="button" onClick={onClose}><XIcon className="w-6 h-6" /></button>
              </div>

              <button type="button" onClick={() => setIsAIAssistantOpen(true)} className="w-full flex items-center justify-center px-4 py-2 mb-6 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-secondary hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition-all">
                <SparklesIcon className="w-5 h-5 mr-2" />
                Generate with AI Assistant
              </button>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium">Title (EN)</label>
                  <input name="title.en" value={eventData.title.en} onChange={(e) => handleLocalizedStringChange('title', 'en', e.target.value)} required className="mt-1 w-full border-gray-300 rounded-md shadow-sm" />
                </div>
                 <div>
                  <label className="block text-sm font-medium">Title (AR)</label>
                  <input name="title.ar" value={eventData.title.ar} onChange={(e) => handleLocalizedStringChange('title', 'ar', e.target.value)} required className="mt-1 w-full border-gray-300 rounded-md shadow-sm" />
                </div>
                 <div>
                  <label className="block text-sm font-medium">Title (KU)</label>
                  <input name="title.ku" value={eventData.title.ku} onChange={(e) => handleLocalizedStringChange('title', 'ku', e.target.value)} required className="mt-1 w-full border-gray-300 rounded-md shadow-sm" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium">Description (EN)</label>
                  <textarea name="description.en" value={eventData.description.en} onChange={(e) => handleLocalizedStringChange('description', 'en', e.target.value)} required rows={3} className="mt-1 w-full border-gray-300 rounded-md shadow-sm" />
                </div>
                {/* Add textareas for AR and KU descriptions similarly */}
                <div>
                  <label className="block text-sm font-medium">Category</label>
                  <select name="categoryId" value={eventData.categoryId} onChange={handleInputChange} required className="mt-1 w-full border-gray-300 rounded-md shadow-sm">
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name.en}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">City</label>
                  <select name="cityId" value={eventData.cityId} onChange={handleInputChange} required className="mt-1 w-full border-gray-300 rounded-md shadow-sm">
                    <option value="">Select City</option>
                    {cities.map(c => <option key={c.id} value={c.id}>{c.name.en}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">Date and Time</label>
                  <input type="datetime-local" name="date" value={eventData.date} onChange={handleInputChange} required className="mt-1 w-full border-gray-300 rounded-md shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Venue</label>
                  <input name="venue" value={eventData.venue} onChange={handleInputChange} required className="mt-1 w-full border-gray-300 rounded-md shadow-sm" />
                </div>
                 <div>
                  <label className="block text-sm font-medium">Image URL</label>
                  <input name="imageUrl" value={eventData.imageUrl} onChange={handleInputChange} required className="mt-1 w-full border-gray-300 rounded-md shadow-sm" />
                </div>
                 <div>
                  <label className="block text-sm font-medium">Organizer Name</label>
                  <input name="organizerName" value={eventData.organizerName} onChange={handleInputChange} required className="mt-1 w-full border-gray-300 rounded-md shadow-sm" />
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-8 py-4 text-right">
              <button type="submit" disabled={isLoading} className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400">
                {isLoading ? 'Saving...' : 'Save Event'}
              </button>
            </div>
          </form>
        </div>
      </div>
      {isAIAssistantOpen && (
        <AIAssistantModal 
          cities={cities}
          categories={categories}
          onClose={() => setIsAIAssistantOpen(false)}
          onApplySuggestion={handleApplyAISuggestion}
        />
      )}
    </>
  );
};
