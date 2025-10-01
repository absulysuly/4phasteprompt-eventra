export const dynamic = 'force-dynamic';
import RegisterForm from "./RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50 py-12 px-4">
      <div className="w-full max-w-md">
        <RegisterForm />
      </div>
    </div>
  );
}
