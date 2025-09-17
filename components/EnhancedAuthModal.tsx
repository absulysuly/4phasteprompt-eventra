import React, { useState } from 'react';
import type { Language, User } from '@/types';
import { emailService } from '../services/emailService';

interface EnhancedAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
  initialMode: 'login' | 'signup';
  lang: Language;
  onVerificationNeeded: (email: string) => void;
}

export const EnhancedAuthModal: React.FC<EnhancedAuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode,
  lang,
  onVerificationNeeded
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [showGmailEmailInput, setShowGmailEmailInput] = useState(false);
  const [gmailEmail, setGmailEmail] = useState('');

  // Helper function to simulate checking Gmail signed-in status
  const checkGmailSignedInStatus = async (): Promise<boolean> => {
    // In a real app, this would check Google OAuth session or gapi.auth2
    // For demo purposes, we'll simulate a 70% chance of being signed in
    await new Promise(resolve => setTimeout(resolve, 300));
    return Math.random() > 0.3; // 70% chance of being signed in
  };

  if (!isOpen) return null;

  const handleGmailLogin = async () => {
    // Check if user is already signed in to Gmail (simulate checking Gmail session)
    const isGmailSignedIn = await checkGmailSignedInStatus();
    
    if (isGmailSignedIn && !showGmailEmailInput) {
      // User is already signed in to Gmail, authenticate directly
      setIsLoading(true);
      setError('');
      
      try {
        // Simulate automatic Gmail login
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Mock successful Gmail login with detected user
        const user: User = {
          id: `gmail-${Date.now()}`,
          name: 'Gmail User', // In real app, this would come from Gmail API
          email: 'user@gmail.com', // In real app, this would come from Gmail API
          avatarUrl: 'https://i.pravatar.cc/150?u=gmail-auto',
          phone: '',
          isVerified: true,
          preferences: {
            language: lang,
            notifications: {
              email: true,
              push: true
            },
            categories: []
          },
          location: {
            city: 'Baghdad',
            country: 'Iraq'
          }
        };
        
        onAuthSuccess(user);
        return;
      } catch (error) {
        setError(lang === 'en' ? 'Auto-login failed. Please try manual login.' : 'فشل الدخول التلقائي. حاول الدخول اليدوي.');
      } finally {
        setIsLoading(false);
      }
    }
    
    if (!showGmailEmailInput) {
      setShowGmailEmailInput(true);
      return;
    }
    
    if (!gmailEmail || !gmailEmail.includes('@')) {
      setError(lang === 'en' ? 'Please enter a valid email address.' : 'يرجى إدخال عنوان بريد إلكتروني صحيح.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Simulate Gmail OAuth login with provided email
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful Gmail login with the provided email
      const user: User = {
        id: `gmail-${Date.now()}`,
        name: gmailEmail.split('@')[0] || 'Gmail User',
        email: gmailEmail,
        avatarUrl: 'https://i.pravatar.cc/150?u=gmail-user',
        phone: '',
        isVerified: true,
        preferences: {
          language: lang,
          notifications: {
            email: true,
            push: true
          },
          categories: []
        },
        location: {
          city: 'Baghdad',
          country: 'Iraq'
        }
      };
      
      onAuthSuccess(user);
    } catch (error) {
      setError(lang === 'en' ? 'Gmail login failed. Please try again.' : 'فشل تسجيل الدخول بجيميل. حاول مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (mode === 'signup') {
        if (password !== confirmPassword) {
          setError(lang === 'en' ? 'Passwords do not match' : 'كلمات المرور غير متطابقة');
          return;
        }
        
        // Send actual verification email
        const emailResult = await emailService.sendVerificationEmail(email, lang);
        
        if (emailResult.success) {
          onVerificationNeeded(email);
          // Store verification code for testing (in real app, this would be handled server-side)
          console.log('Verification Code for testing:', emailResult.verificationCode);
        } else {
          setError(emailResult.message || (lang === 'en' ? 'Failed to send verification email' : 'فشل في إرسال رسالة التحقق'));
        }
        setIsLoading(false);
        return;
      }
      
      if (mode === 'login') {
        // Simulate login with 2FA
        await new Promise(resolve => setTimeout(resolve, 1000));
        setShowTwoFactor(true);
        setIsLoading(false);
        return;
      }
      
      if (mode === 'forgot') {
        // Simulate password reset
        await new Promise(resolve => setTimeout(resolve, 1000));
        setError(lang === 'en' ? 'Password reset email sent!' : 'تم إرسال رسالة إعادة تعيين كلمة المرور!');
      }
      
    } catch (error) {
      setError(lang === 'en' ? 'Authentication failed. Please try again.' : 'فشل المصادقة. حاول مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTwoFactorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (twoFactorCode === '123456') {
        const user: User = {
          id: `user-${Date.now()}`,
          name: name || 'User',
          email: email,
          avatarUrl: 'https://i.pravatar.cc/150?u=verified-user',
          phone: '',
          isVerified: true,
          preferences: {
            language: lang,
            notifications: {
              email: true,
              push: true
            },
            categories: []
          },
          location: {
            city: 'Baghdad',
            country: 'Iraq'
          }
        };
        
        onAuthSuccess(user);
      } else {
        setError(lang === 'en' ? 'Invalid verification code' : 'رمز التحقق غير صحيح');
      }
    } catch (error) {
      setError(lang === 'en' ? 'Verification failed' : 'فشل التحقق');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl transform transition-all duration-300"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 15px 35px -5px rgba(0, 0, 0, 0.1), inset 0 2px 4px rgba(255, 255, 255, 0.9)'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
            <span className="text-3xl">🎉</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {mode === 'login' ? (lang === 'en' ? 'Welcome Back!' : 'مرحباً بعودتك!') : 
             mode === 'signup' ? (lang === 'en' ? 'Join Eventara' : 'انضم لإيفنتارا') :
             (lang === 'en' ? 'Reset Password' : 'إعادة تعيين كلمة المرور')}
          </h2>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {!showTwoFactor ? (
          <>
            {/* Gmail Authentication Section */}
            {!showGmailEmailInput ? (
              <button
                onClick={handleGmailLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 mb-6 shadow-lg hover:shadow-xl disabled:opacity-50"
                style={{
                  boxShadow: '0 4px 15px -3px rgba(0, 0, 0, 0.1), 0 2px 6px -2px rgba(0, 0, 0, 0.05), inset 0 1px 2px rgba(255, 255, 255, 0.9)'
                }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {isLoading ? 
                  (lang === 'en' ? 'Checking Gmail...' : 'فحص جيميل...') :
                  (lang === 'en' ? 'Continue with Gmail' : 'المتابعة باستخدام جيميل')
                }
              </button>
            ) : (
              <div className="mb-6">
                <div className="text-center mb-4">
                  <div className="text-2xl mb-2">📧</div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {lang === 'en' ? 'Enter Your Gmail Address' : 'أدخل عنوان جيميل الخاص بك'}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {lang === 'en' ? 'We\'ll redirect you to Gmail for secure authentication' : 'سنقوم بتوجيهك إلى جيميل للمصادقة الآمنة'}
                  </p>
                </div>
                
                <div className="space-y-4">
                  <input
                    type="email"
                    placeholder={lang === 'en' ? 'your.email@gmail.com' : 'your.email@gmail.com'}
                    value={gmailEmail}
                    onChange={(e) => setGmailEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-400 transition-all duration-300"
                    autoFocus
                  />
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => {setShowGmailEmailInput(false); setGmailEmail(''); setError('');}}
                      className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      {lang === 'en' ? 'Back' : 'العودة'}
                    </button>
                    <button
                      onClick={handleGmailLogin}
                      disabled={isLoading || !gmailEmail}
                      className="flex-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-6 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50"
                    >
                      {isLoading ? (lang === 'en' ? 'Connecting...' : 'جاري الاتصال...') : (lang === 'en' ? 'Continue' : 'متابعة')}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  {lang === 'en' ? 'Or continue with email' : 'أو المتابعة بالإيميل'}
                </span>
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {mode === 'signup' && (
                <input
                  type="text"
                  placeholder={lang === 'en' ? 'Full Name' : 'الاسم الكامل'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-400 transition-all duration-300"
                  required
                />
              )}
              
              <input
                type="email"
                placeholder={lang === 'en' ? 'Email Address' : 'عنوان البريد الإلكتروني'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-400 transition-all duration-300"
                required
              />
              
              {mode !== 'forgot' && (
                <input
                  type="password"
                  placeholder={lang === 'en' ? 'Password' : 'كلمة المرور'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-400 transition-all duration-300"
                  required
                />
              )}
              
              {mode === 'signup' && (
                <input
                  type="password"
                  placeholder={lang === 'en' ? 'Confirm Password' : 'تأكيد كلمة المرور'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-400 transition-all duration-300"
                  required
                />
              )}
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 transform hover:scale-105"
              >
                {isLoading ? '⏳' : 
                 mode === 'login' ? (lang === 'en' ? 'Sign In' : 'تسجيل الدخول') :
                 mode === 'signup' ? (lang === 'en' ? 'Sign Up' : 'إنشاء حساب') :
                 (lang === 'en' ? 'Reset Password' : 'إعادة تعيين كلمة المرور')}
              </button>
            </form>
          </>
        ) : (
          /* Two-Factor Authentication */
          <form onSubmit={handleTwoFactorSubmit} className="space-y-6">
            <div className="text-center">
              <div className="text-6xl mb-4">📧</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {lang === 'en' ? 'Check Your Email' : 'تحقق من بريدك الإلكتروني'}
              </h3>
              <p className="text-gray-600 text-sm">
                {lang === 'en' ? `We sent a verification code to ${email}` : `أرسلنا رمز التحقق إلى ${email}`}
              </p>
            </div>
            
            <input
              type="text"
              placeholder={lang === 'en' ? 'Enter 6-digit code' : 'أدخل الرمز المكون من 6 أرقام'}
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-400 transition-all duration-300 text-center text-lg font-mono"
              maxLength={6}
              required
            />
            
            <button
              type="submit"
              disabled={isLoading || twoFactorCode.length !== 6}
              className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-green-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 transform hover:scale-105"
            >
              {isLoading ? '⏳' : (lang === 'en' ? 'Verify & Sign In' : 'تحقق وادخل')}
            </button>
            
            <button
              type="button"
              onClick={() => setShowTwoFactor(false)}
              className="w-full text-gray-600 py-2 text-sm hover:text-gray-800 transition-colors duration-200"
            >
              {lang === 'en' ? 'Back to login' : 'العودة لتسجيل الدخول'}
            </button>
          </form>
        )}

        {/* Footer Links */}
        {!showTwoFactor && (
          <div className="mt-8 text-center space-y-2">
            {mode === 'login' && (
              <>
                <button
                  onClick={() => setMode('forgot')}
                  className="text-blue-600 hover:text-blue-800 text-sm transition-colors duration-200"
                >
                  {lang === 'en' ? 'Forgot password?' : 'هل نسيت كلمة المرور؟'}
                </button>
                <p className="text-gray-600 text-sm">
                  {lang === 'en' ? "Don't have an account?" : 'ليس لديك حساب؟'}{' '}
                  <button
                    onClick={() => setMode('signup')}
                    className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
                  >
                    {lang === 'en' ? 'Sign up' : 'إنشاء حساب'}
                  </button>
                </p>
              </>
            )}
            
            {mode === 'signup' && (
              <p className="text-gray-600 text-sm">
                {lang === 'en' ? 'Already have an account?' : 'هل لديك حساب بالفعل؟'}{' '}
                <button
                  onClick={() => setMode('login')}
                  className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
                >
                  {lang === 'en' ? 'Sign in' : 'تسجيل الدخول'}
                </button>
              </p>
            )}
            
            {mode === 'forgot' && (
              <button
                onClick={() => setMode('login')}
                className="text-blue-600 hover:text-blue-800 text-sm transition-colors duration-200"
              >
                {lang === 'en' ? 'Back to login' : 'العودة لتسجيل الدخول'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};