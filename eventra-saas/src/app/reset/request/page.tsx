"use client";

import { useState } from "react";
import { useTranslations } from "../../hooks/useTranslations";
import { useLanguage } from "../../components/LanguageProvider";

export default function ResetRequestPage() {
  const { t } = useTranslations();
  const { isRTL } = useLanguage();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('/api/reset/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 py-12 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('login.forgotPassword')}</h1>
        {sent ? (
          <p className="text-gray-800 font-medium text-lg leading-relaxed">{t('reset.emailSent')}</p>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <label className="block text-sm font-semibold text-gray-900 mb-2">{t('login.emailAddress')}</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder={t('login.emailPlaceholder')}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-colors text-gray-900 placeholder-gray-500" 
              dir={isRTL ? 'rtl' : 'ltr'}
            />
            <button disabled={loading} className="w-full bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white py-3 rounded-xl font-semibold disabled:opacity-60">
              {loading ? t('reset.sending') : t('reset.sendResetLink')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
