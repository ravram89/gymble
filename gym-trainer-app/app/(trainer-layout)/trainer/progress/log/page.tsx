"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/libs/supabaseClient";

type Client = {
  id: string;
  name: string;
};

type Workout = {
  id: string;
  name: string;
  focus: string | null;
};

type WorkoutExercise = {
  id: string;
  exercise_id: string;
  sets: number;
  reps: string;
  order_index: number;
  exercises: {
    name: string;
  };
};

type ExerciseLog = {
  exerciseId: string;
  name: string;
  sets: Array<{
    set: number;
    reps: number;
    weight: number;
  }>;
};

export default function LogWorkoutPage() {
  const router = useRouter();

  const [clients, setClients] = useState<Client[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string>("");
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([]);
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);

  const [startTime, setStartTime] = useState<Date>(new Date());
  const [duration, setDuration] = useState<number>(60);
  const [notes, setNotes] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadClientsAndWorkouts();
  }, []);

  useEffect(() => {
    if (selectedWorkoutId) {
      loadWorkoutExercises();
    }
  }, [selectedWorkoutId]);

  const loadClientsAndWorkouts = async () => {
    setLoading(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const { data: trainerData } = await supabase
      .from("trainers")
      .select("id")
      .eq("user_id", session.user.id)
      .single();

    if (!trainerData) return;

    // Load clients
    const { data: clientsData, error: clientsError } = await supabase
      .from("clients")
      .select("id, name")
      .eq("trainer_id", trainerData.id)
      .order("name", { ascending: true });

    if (clientsError) {
      console.error("Error loading clients:", clientsError);
    } else if (clientsData) {
      setClients(clientsData);
    }

    // Load workouts
    const { data: workoutsData, error: workoutsError } = await supabase
      .from("workouts")
      .select("id, name, focus")
      .order("name", { ascending: true });

    if (workoutsError) {
      console.error("Error loading workouts:", workoutsError);
    } else if (workoutsData) {
      setWorkouts(workoutsData);
    }

    setLoading(false);
  };

  const loadWorkoutExercises = async () => {
    const { data: exercisesData, error: exercisesError } = await supabase
      .from("workout_exercises")
      .select("id, exercise_id, sets, reps, order_index")
      .eq("workout_id", selectedWorkoutId)
      .order("order_index", { ascending: true });

    if (exercisesError) {
      console.error("Error loading workout exercises:", exercisesError);
      return;
    }

    if (exercisesData && exercisesData.length > 0) {
      // Fetch exercise details
      const exerciseIds = exercisesData.map((e) => e.exercise_id);
      const { data: exerciseDetails } = await supabase
        .from("exercises")
        .select("id, name")
        .in("id", exerciseIds);

      // Merge
      const merged = exercisesData.map((we) => ({
        ...we,
        exercises: exerciseDetails?.find((e) => e.id === we.exercise_id) || {
          name: "Unknown",
        },
      }));

      setWorkoutExercises(merged);

      // Initialize exercise logs
      const logs: ExerciseLog[] = merged.map((ex) => ({
        exerciseId: ex.exercise_id,
        name: ex.exercises.name,
        sets: Array.from({ length: ex.sets }, (_, i) => ({
          set: i + 1,
          reps: 0,
          weight: 0,
        })),
      }));

      setExerciseLogs(logs);
    }
  };

  const updateSetLog = (
    exerciseId: string,
    setIndex: number,
    field: "reps" | "weight",
    value: number
  ) => {
    setExerciseLogs((prev) =>
      prev.map((log) => {
        if (log.exerciseId !== exerciseId) return log;
        return {
          ...log,
          sets: log.sets.map((s, i) =>
            i === setIndex ? { ...s, [field]: value } : s
          ),
        };
      })
    );
  };

  const handleSaveSession = async () => {
    if (!selectedClientId || !selectedWorkoutId) {
      setError("Please select a client and workout.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Create workout session
      const { data: sessionData, error: sessionError } = await supabase
        .from("workout_sessions")
        .insert([
          {
            client_id: selectedClientId,
            workout_id: selectedWorkoutId,
            started_at: startTime.toISOString(),
            completed_at: new Date().toISOString(),
            duration_minutes: duration,
            notes: notes || null,
          },
        ])
        .select("id")
        .single();

      if (sessionError || !sessionData) {
        console.error("Error creating session:", sessionError);
        setError("Failed to create workout session.");
        setSaving(false);
        return;
      }

      const sessionId = sessionData.id;

      // Log each exercise set
      const setLogs = [];
      for (const log of exerciseLogs) {
        const workoutExercise = workoutExercises.find(
          (we) => we.exercise_id === log.exerciseId
        );

        for (const set of log.sets) {
          setLogs.push({
            session_id: sessionId,
            exercise_id: log.exerciseId,
            workout_exercise_id: workoutExercise?.id || null,
            set_number: set.set,
            reps_completed: set.reps || null,
            weight_kg: set.weight || null,
          });
        }
      }

      if (setLogs.length > 0) {
        const { error: logsError } = await supabase
          .from("session_exercises")
          .insert(setLogs);

        if (logsError) {
          console.error("Error logging exercises:", logsError);
          setError("Session created, but failed to log exercises.");
        }
      }

      // Success - redirect to progress page
      router.push("/trainer/progress");
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <Link
          href="/trainer/progress"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back to Progress
        </Link>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-gray-900">
              Log Workout Session
            </h2>
            <p className="mt-2 text-gray-600">
              Record a completed workout with sets, reps, and weights.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/trainer/progress"
              className="rounded-md border px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </Link>
            <button
              onClick={handleSaveSession}
              disabled={saving || !selectedClientId || !selectedWorkoutId}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Session"}
            </button>
          </div>
        </div>
      </header>

      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Session Details */}
      <section className="rounded-xl bg-white shadow p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Session Details</h3>

        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Client
              </label>
              <select
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm text-gray-900"
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
              >
                <option value="">Select client...</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Workout
              </label>
              <select
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm text-gray-900"
                value={selectedWorkoutId}
                onChange={(e) => setSelectedWorkoutId(e.target.value)}
              >
                <option value="">Select workout...</option>
                {workouts.map((workout) => (
                  <option key={workout.id} value={workout.id}>
                    {workout.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Duration (minutes)
              </label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm text-gray-900"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Notes (optional)
              </label>
              <input
                type="text"
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm text-gray-900"
                placeholder="Client felt strong today..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
        )}
      </section>

      {/* Exercise Logs */}
      {exerciseLogs.length > 0 && (
        <section className="rounded-xl bg-white shadow p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Exercise Performance
          </h3>

          {exerciseLogs.map((log, exIndex) => (
            <div key={log.exerciseId} className="rounded-lg border p-4">
              <h4 className="font-semibold text-gray-900 mb-3">
                {exIndex + 1}. {log.name}
              </h4>

              <div className="space-y-2">
                {log.sets.map((set, setIndex) => (
                  <div
                    key={setIndex}
                    className="grid grid-cols-3 gap-3 items-center"
                  >
                    <div className="text-sm text-gray-700 font-medium">
                      Set {set.set}
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500">Reps</label>
                      <input
                        type="number"
                        className="mt-1 w-full rounded-md border px-2 py-1 text-sm"
                        value={set.reps || ""}
                        onChange={(e) =>
                          updateSetLog(
                            log.exerciseId,
                            setIndex,
                            "reps",
                            Number(e.target.value)
                          )
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500">
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        className="mt-1 w-full rounded-md border px-2 py-1 text-sm"
                        value={set.weight || ""}
                        onChange={(e) =>
                          updateSetLog(
                            log.exerciseId,
                            setIndex,
                            "weight",
                            Number(e.target.value)
                          )
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

