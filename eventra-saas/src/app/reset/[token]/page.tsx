import React from 'react';
import ClientResetWidget from './ClientResetWidget';

// During development, avoid 404s for deep links by returning an empty list.
export async function generateStaticParams() {
  return [] as Array<{ token: string }>;
}

export default async function ResetPage({ params }: { params: { token: string } }) {
  const { token } = params;
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 py-12 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Set a new password</h1>
        <ClientResetWidget token={token} />
      </div>
    </div>
  );
}
