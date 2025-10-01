import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../../lib/auth";
import MonitorClient from "./MonitorClient";

export default async function AdminMonitorPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/login");
  }

  const allowedEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  const isAllowed = allowedEmails.length > 0 && allowedEmails.includes(session.user.email.toLowerCase());

  if (!isAllowed) {
    // If not configured, block access by default to keep this admin-only page secure
    redirect("/");
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">System Monitor</h1>
      <p className="text-sm text-gray-500 mb-6">
        Admin-only dashboard. Polls /api/health and /api/events?type=public every 10 seconds.
      </p>
      <MonitorClient />
    </div>
  );
}