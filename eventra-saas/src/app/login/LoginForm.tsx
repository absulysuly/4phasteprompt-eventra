"use client";

import { signIn, getProviders } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "../components/LanguageProvider";
import { useTranslations } from "../hooks/useTranslations";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [providers, setProviders] = useState<any>(null);
  const router = useRouter();
  const { isRTL } = useLanguage();
  const { t } = useTranslations();
  
  useEffect(() => {
    const fetchProviders = async () => {
      const providers = await getProviders();
      setProviders(providers);
    };
    fetchProviders();
  }, []);
  
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false
    });
    if (res?.ok) {
      router.push("/");
    } else {
      setError(res?.error || t('login.invalidCredentials'));
    }
    setLoading(false);
  }

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    setError("");
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch (error) {
      setError(t('login.googleSignInError'));
    }
    setGoogleLoading(false);
  }

  return (
    <div className={`max-w-md mx-auto p-8 bg-white rounded-2xl shadow-2xl border border-gray-100 ${isRTL ? 'text-right' : 'text-left'}`}>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-2xl">🔑</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('login.welcomeBack')}</h1>
        <p className="text-gray-600">{t('login.subtitle')}</p>
      </div>

      {/* Google Sign In - Only show if Google provider is available */}
      {providers?.google && process.env.NEXT_PUBLIC_ENABLE_GOOGLE === 'true' && (
        <>
          <button
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:border-gray-400 hover:shadow-md transition-all duration-300 disabled:opacity-60 mb-6"
          >
            {googleLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {t('login.continueWithGoogle')}
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">{t('login.orContinueWith')}</span>
            </div>
          </div>
        </>
      )}

      {/* Email/Password Form */}
      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
            {t('login.emailAddress')}
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all duration-300"
            placeholder={t('login.emailPlaceholder')}
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-2">
            {t('login.password')}
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all duration-300"
            placeholder={t('login.passwordPlaceholder')}
          />
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}
        
        <button 
          type="submit" 
          disabled={loading || googleLoading}
          className="w-full bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-60 disabled:transform-none"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              {t('login.signingIn')}
            </div>
          ) : (
            t('login.signIn')
          )}
        </button>
      </form>

      {/* Register / Forgot */}
      <div className="text-center mt-8 pt-6 border-t border-gray-100">
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center text-gray-600">
          <p>
            {t('login.noAccount')}{" "}
            <Link href="/register" className="text-purple-600 font-semibold hover:text-purple-700 transition-colors">
              {t('login.createAccount')}
            </Link>
          </p>
          <Link href="/reset/request" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
            {t('login.forgotPassword')}
          </Link>
        </div>
      </div>
    </div>
  );
}
