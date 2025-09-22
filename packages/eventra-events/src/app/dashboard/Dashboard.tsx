"use client";

type User = {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};
import EventList from "./EventList";
import EventForm from "./EventForm";
import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "../hooks/useTranslations";

export default function Dashboard({ user }: { user: User }) {
  const [refresh, setRefresh] = useState(0);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { t } = useTranslations();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {t('dashboard.welcomeBack', { name: user.name || user.email })}
              </h1>
              <p className="text-gray-600">
                {t('dashboard.subtitle')}
              </p>
            </div>
            <div className="mt-6 md:mt-0 flex gap-4">
              <Link
                href="/"
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                {t('dashboard.browseEvents')}
              </Link>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-105"
              >
                {showCreateForm ? t('dashboard.cancel') : '+ ' + t('dashboard.createEvent')}
              </button>
              <Link
                href="/dashboard/content"
                className="px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
              >
                Manage Content
              </Link>
            </div>
          </div>
        </div>

        {/* Create Event Form - Only show when button is clicked */}
        {showCreateForm && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('dashboard.createNewEvent')}</h2>
            <EventForm onCreated={() => {
              setRefresh(r => r+1);
              setShowCreateForm(false);
            }} />
          </div>
        )}

        {/* My Events Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('dashboard.myEvents')}</h2>
          <EventList key={refresh} />
        </div>
      </div>
    </div>
  );
}
