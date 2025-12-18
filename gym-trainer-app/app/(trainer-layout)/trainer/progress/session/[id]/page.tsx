"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/libs/supabaseClient";

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
    focus: string | null;
  };
};

type SessionExercise = {
  exercise_id: string;
  set_number: number;
  reps_completed: number | null;
  weight_kg: number | null;
  exercises: {
    name: string;
    muscle_group: string | null;
  };
};

type GroupedExercise = {
  exerciseId: string;
  name: string;
  muscleGroup: string | null;
  sets: Array<{
    setNumber: number;
    reps: number | null;
    weight: number | null;
  }>;
};

export default function SessionDetailPage() {
  const params = useParams();
  const sessionId = params.id as string;

  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [exercises, setExercises] = useState<GroupedExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    const loadSession = async () => {
      setLoading(true);
      setError(null);

      // Load session details
      const { data: sessionData, error: sessionError } = await supabase
        .from("workout_sessions")
        .select("id, client_id, workout_id, started_at, completed_at, duration_minutes, notes")
        .eq("id", sessionId)
        .single();

      if (sessionError) {
        console.error("Error loading session:", sessionError);
        setError("Failed to load session");
        setLoading(false);
        return;
      }

      // Load client details
      const { data: clientData } = await supabase
        .from("clients")
        .select("name")
        .eq("id", sessionData.client_id)
        .single();

      // Load workout details
      const { data: workoutData } = await supabase
        .from("workouts")
        .select("name, focus")
        .eq("id", sessionData.workout_id)
        .single();

      setSession({
        ...sessionData,
        clients: { name: clientData?.name || "Unknown" },
        workouts: { name: workoutData?.name || "Unknown", focus: workoutData?.focus || null },
      });

      // Load session exercises
      const { data: exercisesData, error: exercisesError } = await supabase
        .from("session_exercises")
        .select("exercise_id, set_number, reps_completed, weight_kg")
        .eq("session_id", sessionId)
        .order("exercise_id")
        .order("set_number");

      if (exercisesError) {
        console.error("Error loading exercises:", exercisesError);
        setError("Failed to load exercises");
        setLoading(false);
        return;
      }

      if (exercisesData && exercisesData.length > 0) {
        // Get unique exercise IDs
        const exerciseIds = [...new Set(exercisesData.map((e) => e.exercise_id))];

        // Fetch exercise details
        const { data: exerciseDetails } = await supabase
          .from("exercises")
          .select("id, name, muscle_group")
          .in("id", exerciseIds);

        // Group by exercise
        const grouped: GroupedExercise[] = [];
        
        for (const exId of exerciseIds) {
          const sets = exercisesData
            .filter((e) => e.exercise_id === exId)
            .map((e) => ({
              setNumber: e.set_number,
              reps: e.reps_completed,
              weight: e.weight_kg,
            }));

          const exDetail = exerciseDetails?.find((e) => e.id === exId);

          grouped.push({
            exerciseId: exId,
            name: exDetail?.name || "Unknown",
            muscleGroup: exDetail?.muscle_group || null,
            sets,
          });
        }

        setExercises(grouped);
      }

      setLoading(false);
    };

    loadSession();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <p className="text-gray-500">Loading session...</p>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="space-y-6">
        <p className="text-red-600">{error || "Session not found"}</p>
        <Link
          href="/trainer/progress"
          className="text-blue-600 hover:underline text-sm"
        >
          ← Back to Progress
        </Link>
      </div>
    );
  }

  const totalVolume = exercises.reduce((acc, ex) => {
    const exVolume = ex.sets.reduce((sum, set) => {
      return sum + ((set.reps || 0) * (set.weight || 0));
    }, 0);
    return acc + exVolume;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <header>
        <Link
          href="/trainer/progress"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back to Progress
        </Link>
        <div className="mt-4">
          <h2 className="text-3xl font-semibold text-gray-900">
            {session.workouts.name}
          </h2>
          <p className="mt-2 text-gray-600">{session.clients.name}</p>
          <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
            <span>
              📅{" "}
              {new Date(session.started_at).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            {session.duration_minutes && (
              <span>⏱️ {session.duration_minutes} min</span>
            )}
            {session.completed_at && (
              <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                Completed
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Stats */}
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-white shadow p-6">
          <p className="text-sm text-gray-600">Total Exercises</p>
          <p className="text-3xl font-semibold text-gray-900 mt-2">
            {exercises.length}
          </p>
        </div>
        <div className="rounded-xl bg-white shadow p-6">
          <p className="text-sm text-gray-600">Total Sets</p>
          <p className="text-3xl font-semibold text-gray-900 mt-2">
            {exercises.reduce((acc, ex) => acc + ex.sets.length, 0)}
          </p>
        </div>
        <div className="rounded-xl bg-white shadow p-6">
          <p className="text-sm text-gray-600">Total Volume (kg)</p>
          <p className="text-3xl font-semibold text-gray-900 mt-2">
            {totalVolume.toFixed(1)}
          </p>
        </div>
      </section>

      {/* Notes */}
      {session.notes && (
        <section className="rounded-xl bg-white shadow p-6">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Session Notes
          </h3>
          <p className="mt-2 text-gray-900">{session.notes}</p>
        </section>
      )}

      {/* Exercises */}
      <section className="rounded-xl bg-white shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Exercises Performed
        </h3>

        {exercises.length === 0 ? (
          <p className="text-sm text-gray-500">No exercises logged.</p>
        ) : (
          <div className="space-y-6">
            {exercises.map((ex, index) => (
              <div key={ex.exerciseId} className="rounded-lg border p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{ex.name}</h4>
                    {ex.muscleGroup && (
                      <p className="text-xs text-gray-500">{ex.muscleGroup}</p>
                    )}
                  </div>
                </div>

                {/* Sets table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3 text-gray-600 font-medium">
                          Set
                        </th>
                        <th className="text-left py-2 px-3 text-gray-600 font-medium">
                          Reps
                        </th>
                        <th className="text-left py-2 px-3 text-gray-600 font-medium">
                          Weight (kg)
                        </th>
                        <th className="text-left py-2 px-3 text-gray-600 font-medium">
                          Volume
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {ex.sets.map((set) => (
                        <tr key={set.setNumber} className="border-b last:border-0">
                          <td className="py-2 px-3 text-gray-900">
                            {set.setNumber}
                          </td>
                          <td className="py-2 px-3 text-gray-900">
                            {set.reps || "-"}
                          </td>
                          <td className="py-2 px-3 text-gray-900">
                            {set.weight ? `${set.weight} kg` : "-"}
                          </td>
                          <td className="py-2 px-3 text-gray-900">
                            {set.reps && set.weight
                              ? `${(set.reps * set.weight).toFixed(1)} kg`
                              : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Exercise totals */}
                <div className="mt-3 pt-3 border-t flex gap-6 text-sm">
                  <div>
                    <span className="text-gray-600">Total Sets: </span>
                    <span className="font-semibold text-gray-900">
                      {ex.sets.length}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Reps: </span>
                    <span className="font-semibold text-gray-900">
                      {ex.sets.reduce((sum, s) => sum + (s.reps || 0), 0)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Volume: </span>
                    <span className="font-semibold text-gray-900">
                      {ex.sets
                        .reduce((sum, s) => sum + ((s.reps || 0) * (s.weight || 0)), 0)
                        .toFixed(1)}{" "}
                      kg
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

