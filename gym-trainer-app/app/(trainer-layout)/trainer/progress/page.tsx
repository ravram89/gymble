"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/libs/supabaseClient";
import Link from "next/link";

type Client = {
  id: string;
  name: string;
  email: string | null;
};

type WorkoutSession = {
  id: string;
  client_id: string;
  workout_id: string;
  started_at: string;
  completed_at: string | null;
  duration_minutes: number | null;
  notes: string | null;
  clients: {
    name: string;
  };
  workouts: {
    name: string;
  };
};

export default function ProgressPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    if (selectedClientId) {
      loadSessions(selectedClientId);
    }
  }, [selectedClientId]);

  const loadClients = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const { data: trainerData } = await supabase
      .from("trainers")
      .select("id")
      .eq("user_id", session.user.id)
      .single();

    if (!trainerData) return;

    const { data, error } = await supabase
      .from("clients")
      .select("id, name, email")
      .eq("trainer_id", trainerData.id)
      .order("name", { ascending: true });

    if (error) {
      console.error("Error loading clients:", error);
    } else if (data) {
      setClients(data);
      if (data.length > 0) {
        setSelectedClientId(data[0].id);
      }
    }
    setLoading(false);
  };

  const loadSessions = async (clientId: string) => {
    // First get session data
    const { data: sessionsData, error: sessionsError } = await supabase
      .from("workout_sessions")
      .select("id, client_id, workout_id, started_at, completed_at, duration_minutes, notes")
      .eq("client_id", clientId)
      .order("started_at", { ascending: false });

    if (sessionsError) {
      console.error("Error loading sessions:", sessionsError);
      return;
    }

    if (sessionsData && sessionsData.length > 0) {
      // Get client details
      const { data: clientData } = await supabase
        .from("clients")
        .select("name")
        .eq("id", clientId)
        .single();

      // Get workout IDs
      const workoutIds = [...new Set(sessionsData.map((s) => s.workout_id))];
      const { data: workoutsData } = await supabase
        .from("workouts")
        .select("id, name")
        .in("id", workoutIds);

      // Merge data
      const merged = sessionsData.map((session) => ({
        ...session,
        clients: { name: clientData?.name || "Unknown" },
        workouts: {
          name: workoutsData?.find((w) => w.id === session.workout_id)?.name || "Unknown Workout",
        },
      }));

      setSessions(merged);
    } else {
      setSessions([]);
    }
  };

  const selectedClient = clients.find((c) => c.id === selectedClientId);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-gray-900">
            Progress Tracking
          </h2>
          <p className="mt-2 text-gray-600">
            Track workout sessions and exercise progress for your clients.
          </p>
        </div>

        <Link
          href="/trainer/progress/log"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
        >
          + Log Workout
        </Link>
      </header>

      {/* Client selector */}
      <section className="rounded-xl bg-white shadow p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Client
        </label>
        {loading ? (
          <p className="text-sm text-gray-500">Loading clients...</p>
        ) : clients.length === 0 ? (
          <p className="text-sm text-gray-500">
            No clients found. Add clients first.
          </p>
        ) : (
          <select
            className="w-full md:w-80 rounded-md border px-3 py-2 text-sm text-gray-900"
            value={selectedClientId || ""}
            onChange={(e) => setSelectedClientId(e.target.value)}
          >
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        )}
      </section>

      {/* Sessions list */}
      {selectedClient && (
        <section className="rounded-xl bg-white shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Workout History - {selectedClient.name}
          </h3>

          {sessions.length === 0 ? (
            <p className="text-sm text-gray-500">
              No workout sessions logged yet.
            </p>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <Link
                  key={session.id}
                  href={`/trainer/progress/session/${session.id}`}
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">
                      {session.workouts.name}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(session.started_at).toLocaleDateString("en-US", {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                      {" • "}
                      {new Date(session.started_at).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    {session.duration_minutes && (
                      <span className="text-sm text-gray-600">
                        {session.duration_minutes} min
                      </span>
                    )}
                    {session.completed_at ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                        Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">
                        In Progress
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

