import React, { useState } from 'react';
import type { AuthMode, User } from '@/types';
import { api } from '@/services/api';
import { loggingService } from '@/services/loggingService';
import { validateEmail, validatePassword, validateName } from '@/utils/validation';
import { XIcon } from './icons';

interface AuthModalProps {
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
  onVerificationNeeded: (email: string) => void;
  initialMode?: AuthMode;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  onClose,
  onAuthSuccess,
  onVerificationNeeded,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setPhone('');
    setError(null);
    setMessage(null);
  };

  const switchMode = (newMode: AuthMode) => {
    resetForm();
    setMode(newMode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    if (!validateEmail(email)) {
        setError("Please enter a valid email address.");
        setIsLoading(false);
        return;
    }

    try {
      if (mode === 'login') {
        const result = await api.login(email, password);
        if ('error' in result) {
            if (result.error === 'Account not verified') {
                onVerificationNeeded(result.email);
            } else {
                throw new Error(result.error);
            }
        } else {
            onAuthSuccess(result);
        }
      } else if (mode === 'signup') {
         if (!validateName(name) || !validatePassword(password).isValid) {
            setError("Please fill all fields correctly. Password must be at least 8 characters.");
            setIsLoading(false);
            return;
        }
        await api.signup({ name, email, password, phone, avatarUrl: `https://i.pravatar.cc/150?u=${email}` });
        onVerificationNeeded(email);
      } else if (mode === 'forgot-password') {
        // Mock forgot password logic
        console.log(`Password reset requested for ${email}`);
        setMessage('If an account exists for this email, a password reset link has been sent.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      loggingService.logError(err, { email, mode });
    } finally {
      setIsLoading(false);
    }
  };

  const renderFormContent = () => {
    if (mode === 'login') {
      return (
        <>
          <h2 className="text-2xl font-bold text-center">Log In</h2>
          <div className="mt-4 text-center">
            <span className="text-sm text-gray-600">New to Eventara? </span>
            <button type="button" onClick={() => switchMode('signup')} className="text-sm font-medium text-primary hover:underline">
              Create an account
            </button>
          </div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 mt-6 border rounded-md"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 mt-4 border rounded-md"
          />
          <div className="text-right mt-2">
            <button type="button" onClick={() => switchMode('forgot-password')} className="text-sm text-gray-500 hover:underline">
                Forgot password?
            </button>
          </div>
        </>
      );
    }
    if (mode === 'signup') {
      return (
        <>
          <h2 className="text-2xl font-bold text-center">Create Account</h2>
           <div className="mt-4 text-center">
            <span className="text-sm text-gray-600">Already have an account? </span>
            <button type="button" onClick={() => switchMode('login')} className="text-sm font-medium text-primary hover:underline">
              Log in
            </button>
          </div>
          <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required className="w-full px-4 py-2 mt-6 border rounded-md" />
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-2 mt-4 border rounded-md" />
          <input type="tel" placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} required className="w-full px-4 py-2 mt-4 border rounded-md" />
          <input type="password" placeholder="Password (min. 8 characters)" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-4 py-2 mt-4 border rounded-md" />
        </>
      );
    }
    if (mode === 'forgot-password') {
        return (
            <>
                <h2 className="text-2xl font-bold text-center">Reset Password</h2>
                <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600">Enter your email and we'll send you a link to get back into your account.</p>
                </div>
                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-2 mt-6 border rounded-md" />
                <div className="text-center mt-4">
                     <button type="button" onClick={() => switchMode('login')} className="text-sm font-medium text-primary hover:underline">
                        Back to Log in
                    </button>
                </div>
            </>
        )
    }
  };

  const getButtonText = () => {
      switch(mode) {
          case 'login': return 'Log In';
          case 'signup': return 'Sign Up';
          case 'forgot-password': return 'Send Reset Link';
      }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <XIcon className="w-6 h-6" />
        </button>
        <form onSubmit={handleSubmit}>
            {renderFormContent()}
            {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
            {message && <p className="text-green-600 text-sm mt-4 text-center">{message}</p>}
            <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 mt-6 font-semibold text-white bg-primary rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
            >
                {isLoading ? 'Loading...' : getButtonText()}
            </button>
        </form>
      </div>
    </div>
  );
};
