"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/libs/supabaseClient";

type Workout = {
  id: string;
  name: string;
  focus: string | null;
  duration: string | null;
  difficulty: string | null;
};

type Client = {
  id: string;
  name: string;
  email: string | null;
};

type WorkoutWithAssignments = Workout & {
  assignedClients?: Client[];
  assignmentCount?: number;
};

function LevelBadge({ level }: { level: string | null }) {
  if (!level) return null;

  const colorMap: Record<string, string> = {
    Beginner: "bg-green-100 text-green-700",
    Intermediate: "bg-yellow-100 text-yellow-700",
    Advanced: "bg-red-100 text-red-700",
  };

  const className =
    colorMap[level] ?? "bg-gray-100 text-gray-700";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${className}`}
    >
      {level}
    </span>
  );
}

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState<WorkoutWithAssignments[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  
  // Assign modal state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);
  const [availableClients, setAvailableClients] = useState<Client[]>([]);
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);

  const loadWorkouts = async () => {
    const { data, error } = await supabase
      .from("workouts")
      .select("id, name, focus, duration, difficulty")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading workouts:", error);
      setLoading(false);
      return;
    }

    if (data) {
      // Load assignment counts for each workout
      const workoutsWithCounts = await Promise.all(
        data.map(async (workout) => {
          const { count } = await supabase
            .from("client_workouts")
            .select("*", { count: "exact", head: true })
            .eq("workout_id", workout.id)
            .eq("is_active", true);

          return {
            ...workout,
            assignmentCount: count || 0,
          };
        })
      );

      setWorkouts(workoutsWithCounts);
    }
    setLoading(false);
  };

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
      setAvailableClients(data);
    }
  };

  const handleOpenAssignModal = async (workoutId: string) => {
    setSelectedWorkoutId(workoutId);
    setShowAssignModal(true);
    setAssignError(null);
    setSelectedClientIds([]);
    
    // Load clients if not already loaded
    if (availableClients.length === 0) {
      await loadClients();
    }

    // Load already assigned clients for this workout
    const { data } = await supabase
      .from("client_workouts")
      .select("client_id")
      .eq("workout_id", workoutId)
      .eq("is_active", true);

    if (data) {
      setSelectedClientIds(data.map((a) => a.client_id));
    }
  };

  const handleAssignWorkout = async () => {
    if (!selectedWorkoutId || selectedClientIds.length === 0) {
      setAssignError("Please select at least one client");
      return;
    }

    setAssigning(true);
    setAssignError(null);

    // Remove all existing assignments for this workout
    await supabase
      .from("client_workouts")
      .delete()
      .eq("workout_id", selectedWorkoutId);

    // Insert new assignments
    const assignments = selectedClientIds.map((clientId) => ({
      workout_id: selectedWorkoutId,
      client_id: clientId,
    }));

    const { error } = await supabase
      .from("client_workouts")
      .insert(assignments);

    if (error) {
      setAssignError(error.message);
      setAssigning(false);
    } else {
      setShowAssignModal(false);
      setSelectedWorkoutId(null);
      setSelectedClientIds([]);
      setAssigning(false);
      // Reload workouts to update counts
      loadWorkouts();
    }
  };

  const toggleClientSelection = (clientId: string) => {
    setSelectedClientIds((prev) =>
      prev.includes(clientId)
        ? prev.filter((id) => id !== clientId)
        : [...prev, clientId]
    );
  };

  useEffect(() => {
    loadWorkouts();
  }, []);

  const handleDelete = async (workoutId: string) => {
    if (confirmDelete !== workoutId) {
      setConfirmDelete(workoutId);
      return;
    }

    setDeletingId(workoutId);
    setConfirmDelete(null);

    // Delete workout exercises first (if foreign key constraints require it)
    const { error: exercisesError } = await supabase
      .from("workout_exercises")
      .delete()
      .eq("workout_id", workoutId);

    if (exercisesError) {
      console.error("Error deleting workout exercises:", exercisesError);
    }

    // Delete the workout
    const { error } = await supabase
      .from("workouts")
      .delete()
      .eq("id", workoutId);

    if (error) {
      console.error("Error deleting workout:", error);
      alert("Failed to delete workout. Please try again.");
    } else {
      // Reload workouts
      loadWorkouts();
    }

    setDeletingId(null);
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-gray-900">Workouts</h2>
          <p className="mt-2 text-gray-600">
            Manage your workout templates and assign them to clients.
          </p>
        </div>

        <Link
          href="/trainer/workouts/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
        >
          + Create Workout
        </Link>
      </header>

      <section className="rounded-xl bg-white shadow p-6">
        {loading ? (
          <p className="text-sm text-gray-500">Loading workouts…</p>
        ) : workouts.length === 0 ? (
          <p className="text-sm text-gray-500">
            No workouts created yet. Click "Create Workout" to start.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {workouts.map((w) => (
              <div
                key={w.id}
                className="flex flex-col justify-between rounded-lg border p-4 text-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-semibold text-gray-900">
                      {w.name}
                    </h3>
                    <LevelBadge level={w.difficulty} />
                  </div>
                  <p className="mt-1 text-gray-600">{w.focus}</p>
                  <p className="mt-2 text-xs text-gray-500">
                    {w.duration ?? "-"}
                  </p>
                </div>

                {/* Assignment badge */}
                {w.assignmentCount! > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                      {w.assignmentCount} {w.assignmentCount === 1 ? "client" : "clients"}
                    </span>
                  </div>
                )}

                <div className="mt-4 flex justify-between gap-2">
                  <div className="flex gap-2">
                    <Link
                      href={`/trainer/workouts/${w.id}`}
                      className="rounded-md border px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50"
                    >
                      View
                    </Link>
                    <Link
                      href={`/trainer/workouts/${w.id}/edit`}
                      className="rounded-md border px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleOpenAssignModal(w.id)}
                      className="rounded-md bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-500"
                    >
                      Assign
                    </button>
                  </div>
                  <div className="flex gap-2">
                    {confirmDelete === w.id ? (
                      <>
                        <button
                          onClick={() => handleDelete(w.id)}
                          disabled={deletingId === w.id}
                          className="rounded-md bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-500 disabled:opacity-60"
                        >
                          {deletingId === w.id ? "Deleting…" : "Confirm"}
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="rounded-md border px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleDelete(w.id)}
                        disabled={deletingId === w.id}
                        className="rounded-md border px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Assign Workout Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Assign Workout to Clients
            </h3>

            {assignError && (
              <div className="mb-4 rounded-md border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">
                {assignError}
              </div>
            )}

            {availableClients.length === 0 ? (
              <p className="text-sm text-gray-500 mb-4">
                No clients available. Add clients first to assign workouts.
              </p>
            ) : (
              <div className="space-y-2 mb-6 max-h-96 overflow-y-auto">
                <p className="text-sm text-gray-600 mb-3">
                  Select clients to assign this workout:
                </p>
                {availableClients.map((client) => (
                  <label
                    key={client.id}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedClientIds.includes(client.id)}
                      onChange={() => toggleClientSelection(client.id)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{client.name}</p>
                      {client.email && (
                        <p className="text-xs text-gray-500">{client.email}</p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleAssignWorkout}
                disabled={assigning || selectedClientIds.length === 0}
                className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
              >
                {assigning ? "Assigning…" : `Assign to ${selectedClientIds.length} ${selectedClientIds.length === 1 ? "client" : "clients"}`}
              </button>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedWorkoutId(null);
                  setSelectedClientIds([]);
                  setAssignError(null);
                }}
                disabled={assigning}
                className="rounded-md border px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
