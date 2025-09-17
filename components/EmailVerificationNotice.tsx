
import React from 'react';
import { XIcon } from './icons';

interface EmailVerificationNoticeProps {
  email: string;
  onResend: () => void;
  onClose: () => void;
}

export const EmailVerificationNotice: React.FC<EmailVerificationNoticeProps> = ({ email, onResend, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 text-center relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            <XIcon className="w-6 h-6"/>
        </button>
        <h2 className="text-2xl font-bold mb-4">Please Verify Your Email</h2>
        <p className="text-gray-600 mb-6">
          We've sent a verification link to <strong>{email}</strong>. Please check your inbox (and spam folder) to complete your registration.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <p className="text-sm text-gray-500">Didn't receive the email?</p>
            <button onClick={onResend} className="font-semibold text-primary hover:underline">
                Resend Verification Link
            </button>
        </div>
      </div>
    </div>
  );
};
