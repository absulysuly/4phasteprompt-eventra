import React from 'react';
import LanguageProviderWrapper from '../dashboard/LanguageProviderWrapper';

export default function PayLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProviderWrapper>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Secure Payment</h1>
            <p className="text-gray-600 text-sm">Complete your payment safely using trusted local methods</p>
          </div>
          {children}
        </div>
      </div>
    </LanguageProviderWrapper>
  );
}