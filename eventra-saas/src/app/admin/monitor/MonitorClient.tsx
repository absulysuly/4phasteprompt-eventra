"use client";

import { useEffect, useState } from "react";

type Health = {
  status?: string;
  checks?: {
    env?: {
      databaseUrlSet?: boolean;
      nextAuthSecretSet?: boolean;
      googleAuthConfigured?: boolean;
    };
    database?: { status?: string; message?: string };
  };
};

export default function MonitorClient() {
  const [health, setHealth] = useState<Health | null>(null);
  const [eventCount, setEventCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  async function load() {
    try {
      setError(null);
      const [healthRes, eventsRes] = await Promise.all([
        fetch("/api/health", { cache: "no-store" }),
        fetch("/api/events?type=public", { cache: "no-store" }),
      ]);

      const healthJson: Health = await healthRes.json();
      setHealth(healthJson);

      const eventsJson: any[] = await eventsRes.json();
      setEventCount(Array.isArray(eventsJson) ? eventsJson.length : 0);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (e: any) {
      setError(e?.message || String(e));
    }
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 10000);
    return () => clearInterval(id);
  }, []);

  const dbOk = health?.checks?.database?.status === "ok";
  const envDb = health?.checks?.env?.databaseUrlSet;
  const envSecret = health?.checks?.env?.nextAuthSecretSet;

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="rounded border p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Health</h2>
          <span className={`text-xs px-2 py-1 rounded ${dbOk ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {dbOk ? "OK" : "ERROR"}
          </span>
        </div>
        <div className="mt-3 text-sm">
          <div>DB connectivity: <strong>{dbOk ? "ok" : (health?.checks?.database?.message || "error")}</strong></div>
          <div>Env: DATABASE_URL=<strong>{envDb ? "set" : "missing"}</strong>, NEXTAUTH_SECRET=<strong>{envSecret ? "set" : "missing"}</strong></div>
        </div>
      </div>

      <div className="rounded border p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Events</h2>
          <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">Public</span>
        </div>
        <div className="mt-3 text-3xl font-semibold">{eventCount ?? "-"}</div>
        <div className="text-xs text-gray-500 mt-1">Count of items from /api/events?type=public</div>
      </div>

      {error && (
        <div className="rounded border border-red-300 bg-red-50 text-red-800 p-3 text-sm">Error: {error}</div>
      )}

      <div className="text-xs text-gray-500">Last updated: {lastUpdated ?? "loading..."}</div>
    </div>
  );
}