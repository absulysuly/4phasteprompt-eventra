import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import EventForm from "../../dashboard/EventForm";
import { authOptions } from "../../../lib/auth";

export default async function CreateEventPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Create Event</h1>
        <EventForm onCreated={() => redirect("/dashboard")} />
      </div>
    </div>
  );
}
