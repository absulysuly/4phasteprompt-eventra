"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import EventForm from "../../../dashboard/EventForm";
import { useTranslations } from "../../../hooks/useTranslations";
import { useLanguage } from "../../../components/LanguageProvider";

interface CreateEventPageProps {
  params: Promise<{ locale: string }>;
}

export default function CreateEventPage({ params }: CreateEventPageProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useTranslations();
  const { setLanguage } = useLanguage();
  
  useEffect(() => {
    const setupLocale = async () => {
      try {
        const resolvedParams = await params;
        if (['en', 'ar', 'ku'].includes(resolvedParams.locale)) {
          setLanguage(resolvedParams.locale as 'en' | 'ar' | 'ku');
        }
      } catch (error) {
        console.error('Error setting up locale:', error);
      }
    };
    
    setupLocale();
  }, [params, setLanguage]);

  useEffect(() => {
    if (status === "loading") return; // Still loading
    if (!session?.user) {
      router.push("/login");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('common.loading')}</h2>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null; // Will redirect
  }

  const handleEventCreated = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{t('dashboard.createEvent')}</h1>
        <EventForm onCreated={handleEventCreated} />
      </div>
    </div>
  );
}