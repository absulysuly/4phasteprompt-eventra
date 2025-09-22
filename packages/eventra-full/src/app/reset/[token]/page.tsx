"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ResetConfirmPage({ params }: { params: { token: string } }) {
  const router = useRouter();
  const { token } = params;
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return setError("Password must be at least 6 characters");
    if (password !== confirm) return setError("Passwords do not match");
    setError("");
    setLoading(true);
    try {
      const res = await fetch('/api/reset/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => router.push('/login'), 1500);
      } else {
        setError(data.error || 'Failed to reset password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 py-12 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Set a new password</h1>
        {success ? (
          <p className="text-green-700">Password updated. Redirecting to login…</p>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded">{error}</div>}
            <div>
              <label className="block text-sm font-semibold text-gray-900">New password</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900">Confirm password</label>
              <input type="password" required value={confirm} onChange={e => setConfirm(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl" />
            </div>
            <button disabled={loading} className="w-full bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white py-3 rounded-xl font-semibold disabled:opacity-60">
              {loading ? 'Updating…' : 'Update password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
