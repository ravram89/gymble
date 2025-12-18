"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/libs/supabaseClient";

type Client = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  created_at: string;
};

type Workout = {
  id: string;
  name: string;
  created_at: string;
};

export default function TrainerDashboardPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [trainerId, setTrainerId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      // Get trainer record
      const { data: trainerData, error: trainerError } = await supabase
        .from("trainers")
        .select("id")
        .eq("user_id", session.user.id)
        .single();

      if (trainerError || !trainerData) {
        console.error("Error loading trainer:", trainerError);
        setLoading(false);
        return;
      }

      const currentTrainerId = trainerData.id;
      setTrainerId(currentTrainerId);

      // Load clients for this trainer
      const { data: clientsData, error: clientsError } = await supabase
        .from("clients")
        .select("id, name, email, phone, created_at")
        .eq("trainer_id", currentTrainerId)
        .order("created_at", { ascending: false })
        .limit(5);

      if (clientsError) {
        console.error("Error loading clients:", clientsError);
      } else if (clientsData) {
        setClients(clientsData);
      }

      // Load recent workouts for this trainer
      const { data: workoutsData, error: workoutsError } = await supabase
        .from("workouts")
        .select("id, name, created_at")
        .eq("trainer_id", currentTrainerId)
        .order("created_at", { ascending: false })
        .limit(5);

      if (workoutsError) {
        console.error("Error loading workouts:", workoutsError);
      } else if (workoutsData) {
        setRecentWorkouts(workoutsData);
      }

      setLoading(false);
    };

    loadData();
  }, []);

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-semibold text-gray-900">Trainer Dashboard</h2>
        <p className="mt-2 text-gray-600">
          Welcome to Gymble – your control center for clients and sessions.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Workouts */}
        <section className="rounded-xl bg-white shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Workouts
            </h3>
            <Link
              href="/trainer/workouts"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              View all
            </Link>
          </div>

          {loading ? (
            <p className="text-sm text-gray-500">Loading…</p>
          ) : recentWorkouts.length === 0 ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                No workouts created yet.
              </p>
              <Link
                href="/trainer/workouts/new"
                className="inline-block rounded-md bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-500"
              >
                Create Workout
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {recentWorkouts.map((w) => (
                <li
                  key={w.id}
                  className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium text-gray-900">{w.name}</p>
                    <p className="text-gray-500">
                      {new Date(w.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Link
                    href="/trainer/workouts"
                    className="rounded-md bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-500"
                  >
                    View
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Active Clients */}
        <section className="rounded-xl bg-white shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Active Clients
            </h3>
            <Link
              href="/trainer/clients"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              View all
            </Link>
          </div>

          {loading ? (
            <p className="text-sm text-gray-500">Loading…</p>
          ) : clients.length === 0 ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                You don&apos;t have any clients yet.
              </p>
              <Link
                href="/trainer/clients"
                className="inline-block rounded-md bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-500"
              >
                Add Client
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {clients.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium text-gray-900">{c.name}</p>
                    <p className="text-gray-500">
                      {c.email ?? "No email"}
                    </p>
                  </div>
                  <Link
                    href="/trainer/clients"
                    className="rounded-md border px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                  >
                    View
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
  