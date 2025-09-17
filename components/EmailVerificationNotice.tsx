import React, { useState } from 'react';

// FIX: Removed unused onLoginAttempt prop from EmailVerificationNoticeProps to resolve a TypeScript type mismatch in App.tsx.
interface EmailVerificationNoticeProps {
  email: string;
  onSimulateVerification: (email: string) => Promise<void>;
  onBackToLogin: () => void;
}

export const EmailVerificationNotice: React.FC<EmailVerificationNoticeProps> = ({
  email,
  onSimulateVerification,
  onBackToLogin,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSimulateClick = async () => {
    setError('');
    setIsLoading(true);
    try {
      await onSimulateVerification(email);
    } catch(e) {
      setError((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-bg p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-neutral-container rounded-lg shadow-xl border border-neutral-border text-center">
        <h1 className="text-2xl font-bold text-neutral-text">Check Your Email</h1>
        <p className="text-neutral-text-soft">
          We've sent a verification link to <strong className="text-primary">{email}</strong>. Please click the link in the email to activate your account.
        </p>
        
        <div className="pt-4 space-y-3">
            <button
              onClick={() => handleSimulateClick()}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-accent text-dark-text font-bold rounded-md hover:bg-accent/90 disabled:bg-accent/70"
            >
              {isLoading ? 'Verifying...' : 'Simulate Clicking Email Link & Login'}
            </button>
            <p className="text-xs text-neutral-text-soft">
                (This is for demonstration. In a real app, you would check your actual email.)
            </p>
        </div>

        {error && <p className="text-red-500 text-sm font-semibold">{error}</p>}
        
        <div className="border-t border-neutral-border pt-6">
          <p className="text-sm text-neutral-text-soft mb-2">
            Didn't receive the email? Check your spam folder or
          </p>
          <button
            onClick={onBackToLogin}
            className="font-medium text-primary hover:underline"
          >
            Go back to the Login page
          </button>
        </div>
      </div>
    </div>
  );
};
