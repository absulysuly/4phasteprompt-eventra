"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "../hooks/useTranslations";
import { useLanguage } from "../components/LanguageProvider";

export default function EventForm({ onCreated }: { onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [whatsappGroup, setWhatsappGroup] = useState("");
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [contactMethod, setContactMethod] = useState("");
  const [category, setCategory] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useTranslations();
  const { isRTL, language } = useLanguage();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      let imageUrl = "";
      
      // Upload image if selected
      if (imageFile) {
        try {
          imageUrl = await uploadImage(imageFile);
        } catch (uploadError) {
          setError(t('eventForm.imageUploadError'));
          setLoading(false);
          return;
        }
      }
      
      const res = await fetch("/api/events/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title, 
          date, 
          description, 
          location,
          whatsappGroup,
          whatsappPhone,
          contactMethod,
          category,
          imageUrl,
          locale: language
        })
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || t('common.unknownError'));
      } else {
        setTitle(""); setDate(""); setDescription(""); setLocation("");
        setWhatsappGroup(""); setWhatsappPhone(""); setContactMethod(""); setCategory("");
        setImageFile(null); setImagePreview("");
        if (onCreated) onCreated();
      }
    } catch (error) {
      setError(t('eventForm.createEventError'));
    }
    
    setLoading(false);
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(t('eventForm.uploadImageFailed'));
    }
    
    const data = await response.json();
    return data.url;
  };

  return (
    <form onSubmit={onSubmit} className={`space-y-6 ${isRTL ? 'text-right' : 'text-left'}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Event Name */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            {t('eventForm.eventNameRequired')}
          </label>
          <input
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder={t('eventForm.eventNamePlaceholder')}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
          />
        </div>

        {/* Date & Time */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            {t('eventForm.dateTimeRequired')}
          </label>
          <input
            required
            type="datetime-local"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            {t('eventForm.category')}
          </label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
          >
            <option value="">{t('eventForm.selectCategory')}</option>
            <option value="technologyInnovation">{t('categories.technologyInnovation')}</option>
            <option value="businessNetworking">{t('categories.businessNetworking')}</option>
            <option value="musicConcerts">{t('categories.musicConcerts')}</option>
            <option value="artsCulture">{t('categories.artsCulture')}</option>
            <option value="sportsFitness">{t('categories.sportsFitness')}</option>
            <option value="foodDrink">{t('categories.foodDrink')}</option>
            <option value="learningDevelopment">{t('categories.learningDevelopment')}</option>
            <option value="healthWellness">{t('categories.healthWellness')}</option>
            <option value="communitySocial">{t('categories.communitySocial')}</option>
            <option value="gamingEsports">{t('categories.gamingEsports')}</option>
            <option value="spiritualReligious">{t('categories.spiritualReligious')}</option>
            <option value="familyKids">{t('categories.familyKids')}</option>
            <option value="outdoorAdventure">{t('categories.outdoorAdventure')}</option>
            <option value="virtualEvents">{t('categories.virtualEvents')}</option>
            <option value="academicConferences">{t('categories.academicConferences')}</option>
          </select>
        </div>

        {/* Location */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            {t('eventForm.location')}
          </label>
          <input
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder={t('eventForm.locationPlaceholder')}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          {t('eventForm.description')}
        </label>
        <textarea
          rows={4}
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder={t('eventForm.descriptionPlaceholder')}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all resize-none"
        />
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          {t('eventForm.eventImage')}
        </label>
        <div className="flex items-center space-x-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="cursor-pointer bg-gray-100 hover:bg-gray-200 border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center text-gray-600 transition-colors min-h-[120px] flex-1"
          >
            {imagePreview ? (
              <div className="relative w-20 h-20">
                <Image 
                  src={imagePreview} 
                  alt="Preview" 
                  fill
                  className="object-cover rounded"
                  sizes="80px"
                />
              </div>
            ) : (
              <>
                <span className="text-2xl mb-2">📷</span>
                <span className="text-sm">{t('eventForm.selectImage')}</span>
              </>
            )}
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* WhatsApp Group */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            {t('eventForm.whatsappGroup')}
          </label>
          <input
            type="url"
            value={whatsappGroup}
            onChange={e => setWhatsappGroup(e.target.value)}
            placeholder={t('eventForm.whatsappPlaceholder')}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
          />
        </div>

        {/* WhatsApp Phone Number */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            {t('eventForm.whatsappPhone')}
          </label>
          <input
            type="tel"
            value={whatsappPhone}
            onChange={e => setWhatsappPhone(e.target.value)}
            placeholder={t('eventForm.whatsappPhonePlaceholder')}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
          />
        </div>
      </div>

      {/* Contact Method */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          {t('eventForm.contactMethod')}
        </label>
        <input
          value={contactMethod}
          onChange={e => setContactMethod(e.target.value)}
          placeholder={t('eventForm.contactPlaceholder')}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'}`}>
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-60 disabled:transform-none"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              {t('eventForm.creating')}
            </div>
          ) : (
            t('eventForm.createEvent')
          )}
        </button>
      </div>
    </form>
  );
}
