import React, { useState, useEffect } from 'react';
import { GoogleIcon, FacebookIcon } from './icons';
import type { AuthMode, Language } from '../types';
import { loggingService } from '../services/loggingService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (provider: 'email' | 'google' | 'facebook', data?: any) => Promise<void>;
  onSignUp: (data: any) => Promise<void>;
  initialMode: AuthMode;
  onForgotPassword: (email: string) => Promise<void>;
  lang: Language;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin, onSignUp, initialMode, onForgotPassword, lang }) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
        setMode(initialMode);
        setError('');
        setEmail('');
        setPassword('');
        setName('');
        setPhone('');
        setResetSent(false);
        setIsLoading(false);
    }
  }, [isOpen, initialMode]);
  
  const t = {
    signIn: { en: 'Sign In', ar: 'تسجيل الدخول', ku: 'چوونەژوورەوە' },
    signUp: { en: 'Sign Up', ar: 'إنشاء حساب', ku: 'هەژمار دروستکردن' },
    name: { en: 'Name', ar: 'الاسم', ku: 'ناو' },
    email: { en: 'Email', ar: 'البريد الإلكتروني', ku: 'ئیمەیڵ' },
    password: { en: 'Password', ar: 'كلمة المرور', ku: 'وشەی نهێنی' },
    phone: { en: 'Phone Number', ar: 'رقم الهاتف', ku: 'ژمارەی تەلەفۆن' },
    forgotPassword: { en: 'Forgot Password?', ar: 'هل نسيت كلمة المرور؟', ku: 'وشەی نهێنیت لەبیرچووە؟' },
    createAccount: { en: 'Create Account', ar: 'إنشاء حساب', ku: 'هەژمار دروستکردن' },
    noAccount: { en: "Don't have an account?", ar: 'ليس لديك حساب؟', ku: 'هەژمارێکت نییە؟' },
    haveAccount: { en: 'Already have an account?', ar: 'هل لديك حساب بالفعل؟', ku: 'پێشتر هەژمارێکت هەیە؟' },
    resetPassword: { en: 'Reset Password', ar: 'إعادة تعيين كلمة المرور', ku: 'دانانەوەی وشەی نهێنی' },
    resetSent: { en: "If an account with that email exists, we've sent instructions to reset your password.", ar: 'إذا كان هناك حساب بهذا البريد الإلكتروني، فقد أرسلنا تعليمات لإعادة تعيين كلمة المرور الخاصة بك.', ku: 'ئەگەر هەژمارێک بەم ئیمەیڵە هەبێت، ئێمە ڕێنماییمان ناردووە بۆ دانانەوەی وشەی نهێنییەکەت.' },
    backToSignIn: { en: 'Back to Sign In', ar: 'العودة إلى تسجيل الدخول', ku: 'گەڕانەوە بۆ چوونەژوورەوە' },
    resetPrompt: { en: "Enter your email address and we'll send you a link to reset your password.", ar: 'أدخل عنوان بريدك الإلكتروني وسنرسل لك رابطًا لإعادة تعيين كلمة المرور الخاصة بك.', ku: 'ناونیشانی ئیمەیڵەکەت بنووسە و ئێمە لینکێکت بۆ دەنێرین بۆ دانانەوەی وشەی نهێنییەکەت.' },
    sendResetLink: { en: 'Send Reset Link', ar: 'إرسال رابط إعادة التعيين', ku: 'ناردنی لینکی دانانەوە' },
    errorRequired: { en: 'Please fill all fields.', ar: 'يرجى ملء جميع الحقول.', ku: 'تکایە هەموو خانەکان پڕبکەرەوە.' },
    errorEmailPassword: { en: 'Please enter email and password.', ar: 'يرجى إدخال البريد الإلكتروني وكلمة المرور.', ku: 'تکایە ئیمەیڵ و وشەی نهێنی بنووسە.' },
    errorEmail: { en: 'Please enter your email address.', ar: 'يرجى إدخال عنوان بريدك الإلكتروني.', ku: 'تکایە ناونیشانی ئیمەیڵەکەت بنووسە.' },
    processing: { en: 'Processing...', ar: 'جار المعالجة...', ku: '...کارلێککردن' },
  };


  if (!isOpen) return null;

  const handleAsyncSubmit = async (action: () => Promise<void>) => {
    setError('');
    setIsLoading(true);
    try {
        await action();
    } catch (e) {
        const err = e as Error;
        // Don't log expected errors like "unverified"
        if (err.message !== 'unverified') {
            loggingService.logError(err, { context: 'AuthModal', mode });
        }
        setError(err.message);
    } finally {
        setIsLoading(false);
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      if (!email || !password) {
        setError(t.errorEmailPassword[lang]);
        return;
      }
      handleAsyncSubmit(() => onLogin('email', { email, password }));
    } else { // signup
      if (!name || !email || !password || !phone) {
        setError(t.errorRequired[lang]);
        return;
      }
      handleAsyncSubmit(() => onSignUp({ name, email, password, phone }));
    }
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError(t.errorEmail[lang]);
      return;
    }
    handleAsyncSubmit(async () => {
        await onForgotPassword(email);
        setResetSent(true);
    });
  };

  const switchMode = (newMode: 'login' | 'signup') => {
    setMode(newMode);
    setError('');
    setPassword('');
    setName('');
    setPhone('');
  };

  const inputClasses = "mt-1 block w-full px-3 py-2 border border-neutral-border bg-neutral-container text-neutral-text rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary disabled:opacity-60";
  
  const renderLoginSignUp = () => (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-neutral-text">{mode === 'login' ? t.signIn[lang] : t.signUp[lang]}</h2>
        <button onClick={onClose} disabled={isLoading} className="text-neutral-text-soft hover:text-neutral-text text-3xl leading-none disabled:opacity-50">&times;</button>
      </div>

      <div className="flex flex-col gap-3">
         <button onClick={() => handleAsyncSubmit(() => onLogin('google'))} disabled={isLoading} className="w-full flex items-center justify-center gap-3 px-4 py-2 border border-neutral-border rounded-md bg-neutral-container hover:bg-neutral-border/50 disabled:opacity-60">
            <GoogleIcon className="w-5 h-5" />
            <span className="text-sm font-medium text-neutral-text">Continue with Google</span>
         </button>
         <button onClick={() => handleAsyncSubmit(() => onLogin('facebook'))} disabled={isLoading} className="w-full flex items-center justify-center gap-3 px-4 py-2 bg-[#1877F2] text-white rounded-md hover:bg-[#166eab] disabled:opacity-60">
            <FacebookIcon className="w-5 h-5" />
            <span className="text-sm font-medium">Continue with Facebook</span>
         </button>
      </div>
      
      <div className="flex items-center my-4">
        <div className="flex-grow border-t border-neutral-border"></div>
        <span className="flex-shrink mx-4 text-neutral-text-soft text-sm">OR</span>
        <div className="flex-grow border-t border-neutral-border"></div>
      </div>

      <form onSubmit={handleEmailSubmit} className="space-y-4">
        {mode === 'signup' && (
          <>
            <div>
              <label className="block text-sm font-medium text-neutral-text-soft">{t.name[lang]}</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClasses} required disabled={isLoading} />
            </div>
             <div>
              <label className="block text-sm font-medium text-neutral-text-soft">{t.phone[lang]}</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className={inputClasses} required disabled={isLoading} inputMode="tel" autoComplete="tel" pattern="[0-9+ ]{7,}" />
            </div>
          </>
        )}
        <div>
          <label className="block text-sm font-medium text-neutral-text-soft">{t.email[lang]}</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClasses} required disabled={isLoading} />
        </div>
        <div>
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-neutral-text-soft">{t.password[lang]}</label>
            {mode === 'login' && (
              <button type="button" onClick={() => setMode('forgot-password')} disabled={isLoading} className="text-xs font-medium text-primary hover:underline focus:outline-none disabled:opacity-60">
                {t.forgotPassword[lang]}
              </button>
            )}
          </div>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className={inputClasses} required disabled={isLoading} />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" disabled={isLoading} className="w-full px-4 py-2 bg-primary text-white font-bold rounded-md hover:bg-primary/90 disabled:bg-primary/70 disabled:cursor-wait">
          {isLoading ? t.processing[lang] : (mode === 'login' ? t.signIn[lang] : t.createAccount[lang])}
        </button>
      </form>

      <div className="mt-4 text-center">
        <p className="text-sm text-neutral-text-soft">
          {mode === 'login' ? t.noAccount[lang] : t.haveAccount[lang]}
          <button onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')} disabled={isLoading} className="font-medium text-primary hover:underline ltr:ml-1 rtl:mr-1 disabled:opacity-60">
            {mode === 'login' ? t.signUp[lang] : t.signIn[lang]}
          </button>
        </p>
      </div>
    </>
  );

  const renderForgotPassword = () => (
    <>
      <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-neutral-text">{t.resetPassword[lang]}</h2>
          <button onClick={onClose} disabled={isLoading} className="text-neutral-text-soft hover:text-neutral-text text-3xl leading-none disabled:opacity-50">&times;</button>
      </div>
      {resetSent ? (
        <div className="text-center py-4">
          <p className="text-neutral-text">{t.resetSent[lang]}</p>
          <button onClick={() => setMode('login')} className="mt-6 w-full px-4 py-2 bg-primary text-white font-bold rounded-md hover:bg-primary/90">
              {t.backToSignIn[lang]}
          </button>
        </div>
      ) : (
        <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
          <p className="text-sm text-neutral-text-soft">{t.resetPrompt[lang]}</p>
          <div>
              <label className="block text-sm font-medium text-neutral-text-soft">{t.email[lang]}</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClasses} required disabled={isLoading} />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={isLoading} className="w-full px-4 py-2 bg-primary text-white font-bold rounded-md hover:bg-primary/90 disabled:bg-primary/70 disabled:cursor-wait">
              {isLoading ? t.processing[lang] : t.sendResetLink[lang]}
          </button>
          <div className="text-center pt-2">
              <button type="button" onClick={() => setMode('login')} disabled={isLoading} className="font-medium text-primary hover:underline disabled:opacity-60">
                  {t.backToSignIn[lang]}
              </button>
          </div>
        </form>
      )}
    </>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
      <div className="bg-neutral-container rounded-lg shadow-xl w-full max-w-md p-6 border border-neutral-border">
        {mode === 'forgot-password' ? renderForgotPassword() : renderLoginSignUp()}
      </div>
    </div>
  );
};
