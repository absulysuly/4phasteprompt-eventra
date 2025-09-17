// FIX: Implemented the authentication modal for user login and signup.
import React, { useState } from 'react';
import { api } from '@/services/api';
import { loggingService } from '@/services/loggingService';
import type { AuthMode, User } from '@/types';
import { XIcon } from './icons';

interface AuthModalProps {
  initialMode?: AuthMode;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  onSwitchToVerify: (email: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ initialMode = 'login', onClose, onLoginSuccess, onSwitchToVerify }) => {
  const [authMode, setAuthMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (authMode === 'login') {
        const result = await api.login(email, password);
        if ('error' in result) {
          if (result.error === 'Account not verified') {
            onSwitchToVerify(result.email);
          } else {
            setError(result.error);
          }
        } else {
          loggingService.trackEvent('login_success', { userId: result.id });
          onLoginSuccess(result);
        }
      } else if (authMode === 'signup') {
        const newUser = await api.signup({ name, email, phone, password, avatarUrl: '' });
        loggingService.trackEvent('signup_success', { userId: newUser.id });
        onSwitchToVerify(newUser.email);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      loggingService.logError(err, { authMode, email });
    } finally {
      setIsLoading(false);
    }
  };

  const renderForm = () => {
    if (authMode === 'login') {
      return (
        <>
          <h2 className="text-2xl font-bold text-center text-gray-800">Welcome Back</h2>
          <p className="text-center text-gray-500 mb-6">Log in to continue your journey.</p>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
          </div>
        </>
      );
    }
    return (
      <>
        <h2 className="text-2xl font-bold text-center text-gray-800">Create an Account</h2>
        <p className="text-center text-gray-500 mb-6">Join Eventara today!</p>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Full Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Phone Number</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
        </div>
      </>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <XIcon className="w-6 h-6" />
        </button>
        <div className="p-8">
          <div className="flex border-b mb-6">
            <button onClick={() => { setAuthMode('login'); setError(null); }} className={`flex-1 py-2 text-sm font-medium ${authMode === 'login' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}>Log In</button>
            <button onClick={() => { setAuthMode('signup'); setError(null); }} className={`flex-1 py-2 text-sm font-medium ${authMode === 'signup' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}>Sign Up</button>
          </div>
          <form onSubmit={handleSubmit}>
            {error && <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</div>}
            {renderForm()}
            <button type="submit" disabled={isLoading} className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors">
              {isLoading ? 'Processing...' : (authMode === 'login' ? 'Log In' : 'Create Account')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
