import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Dashboard from "./Dashboard";
import { authOptions } from "../../lib/auth";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }
  return <Dashboard user={session.user} />;
}
