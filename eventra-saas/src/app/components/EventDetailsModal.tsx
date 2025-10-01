"use client";

import { useState } from "react";
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
  whatsappGroup?: string;
  whatsappPhone?: string;
  contactMethod?: string;
  user?: {
    name?: string;
    email: string;
  };
}

interface EventDetailsModalProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
}

function translateCategoryLabel(categoryName?: string): string {
  if (!categoryName) return '';
  const map: { [key: string]: string } = {
    "Technology & Innovation": "categories.technologyInnovation",
    "Business & Networking": "categories.businessNetworking",
    "Business": "categories.businessNetworking",
    "Music & Concerts": "categories.musicConcerts",
    "Arts & Culture": "categories.artsCulture",
    "Sports & Fitness": "categories.sportsFitness",
    "Food & Drink": "categories.foodDrink",
    "Learning & Development": "categories.learningDevelopment",
    "Health & Wellness": "categories.healthWellness",
    "Community & Social": "categories.communitySocial",
    "Gaming & Esports": "categories.gamingEsports",
    "Spiritual & Religious": "categories.spiritualReligious",
    "Family & Kids": "categories.familyKids",
    "Outdoor & Adventure": "categories.outdoorAdventure",
    "Virtual Events": "categories.virtualEvents",
    "Academic and Conferences": "categories.academicConferences"
  };
  const key = map[categoryName];
  try {
    const { t } = require('../hooks/useTranslations');
    // Note: this dynamic import style is only to avoid top-level circular refs in some bundlers.
    return key ? (require('../hooks/useTranslations').useTranslations().t(key)) : categoryName;
  } catch {
    return categoryName;
  }
}

export default function EventDetailsModal({ event, isOpen, onClose }: EventDetailsModalProps) {
  const { isRTL, language } = useLanguage();
  const { t } = useTranslations();

  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const locale = isRTL ? (document?.documentElement?.lang === 'ku' ? 'ckb-IQ' : 'ar-IQ') : 'en-US';
    return date.toLocaleDateString(locale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return '';
    // Simple phone formatting for Iraqi numbers
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('964')) {
      return `+964 ${cleaned.substring(3, 6)} ${cleaned.substring(6, 9)} ${cleaned.substring(9)}`;
    }
    return phone;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${isRTL ? 'text-right' : 'text-left'}`}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 flex-1">{event.title}</h2>
          <button
            onClick={onClose}
            className={`text-gray-400 hover:text-gray-600 text-2xl font-bold ${isRTL ? 'mr-4' : 'ml-4'}`}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Event Image */}
          {event.imageUrl && (
            <div className="w-full h-64 bg-gray-100 rounded-xl overflow-hidden">
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Event Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date & Time */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">📅</span>
                <h3 className="font-semibold text-gray-900">{t('eventForm.dateTime')}</h3>
              </div>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                {formatDate(event.date)}
              </p>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">📍</span>
                <h3 className="font-semibold text-gray-900">{t('eventForm.location')}</h3>
              </div>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                {event.location || t('common.notSpecified')}
              </p>
            </div>

            {/* Category */}
            {event.category && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🏷️</span>
                  <h3 className="font-semibold text-gray-900">{t('eventForm.category')}</h3>
                </div>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {translateCategoryLabel(event.category)}
                </p>
              </div>
            )}

            {/* Price */}
            <div className="space-y-2">
        <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
                <span className="text-xl">💰</span>
                <h3 className="font-semibold text-gray-900">{t('common.price')}</h3>
              </div>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                {event.isFree || event.price === 0 ? t('common.free') : `$${event.price}`}
              </p>
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 text-lg">{t('eventForm.description')}</h3>
              <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                {event.description}
              </p>
            </div>
          )}

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 text-lg">{t('common.contactInformation')}</h3>
            <div className="grid grid-cols-1 gap-4">
              
              {/* WhatsApp Phone */}
              {event.whatsappPhone && (
              <div className={`flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="text-2xl text-green-600"><i className="fab fa-whatsapp" aria-hidden="true"></i></span>
                  <div>
                    <p className="font-medium text-green-800">{t('eventForm.whatsappPhone')}</p>
                    <a
                      href={`https://wa.me/${event.whatsappPhone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-700 font-medium"
                    >
                      {formatPhoneNumber(event.whatsappPhone)}
                    </a>
                  </div>
                </div>
              )}

              {/* WhatsApp Group */}
              {event.whatsappGroup && (
              <div className={`flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="text-2xl text-green-600"><i className="fab fa-whatsapp" aria-hidden="true"></i></span>
                  <div>
                    <p className="font-medium text-green-800">{t('eventForm.whatsappGroup')}</p>
                    <a
                      href={event.whatsappGroup}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-700 font-medium"
                    >
                      {t('common.joinWhatsAppGroup')}
                    </a>
                  </div>
                </div>
              )}

              {/* Contact Method */}
              {event.contactMethod && (
              <div className={`flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="text-2xl">📞</span>
                  <div>
                    <p className="font-medium text-blue-800">{t('eventForm.contactMethod')}</p>
                    <p className="text-blue-600">{event.contactMethod}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Organizer */}
          {event.user && (
            <div className="border-t pt-4">
              <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {event.user.name?.charAt(0) || event.user.email.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {t('events.byOrganizer', { name: event.user.name || 'Organizer' })}
                  </p>
                  <p className="text-sm text-gray-600">{event.user.email}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className={`sticky bottom-0 bg-gray-50 px-6 py-4 flex gap-3 ${isRTL ? 'justify-start' : 'justify-end'} border-t`}>
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {t('common.close')}
          </button>
          <a
            href={`/${language}/event/${event.publicId}`}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all"
          >
            {t('events.viewPublicPage')}
          </a>
        </div>
      </div>
    </div>
  );
}