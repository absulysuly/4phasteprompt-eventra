"use client";

export const dynamic = 'force-dynamic';
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 py-12 px-4">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  );
}
