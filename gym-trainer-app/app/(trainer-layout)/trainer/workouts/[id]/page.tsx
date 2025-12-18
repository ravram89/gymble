"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/libs/supabaseClient";

type Workout = {
  id: string;
  name: string;
  focus: string | null;
  duration: string | null;
  difficulty: string | null;
  notes: string | null;
};

type WorkoutExercise = {
  id: string;
  exercise_id: string;
  sets: number;
  reps: string;
  rest_seconds: number;
  order_index: number;
  exercises: {
    name: string;
    muscle_group: string | null;
    equipment: string | null;
  };
};

export default function WorkoutDetailPage() {
  const params = useParams();
  const router = useRouter();
  const workoutId = params.id as string;

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!workoutId) return;

    const loadWorkout = async () => {
      setLoading(true);
      setError(null);

      // Load workout details
      const { data: workoutData, error: workoutError } = await supabase
        .from("workouts")
        .select("id, name, focus, duration, difficulty, notes")
        .eq("id", workoutId)
        .single();

      if (workoutError) {
        console.error("Error loading workout:", workoutError);
        setError("Failed to load workout");
        setLoading(false);
        return;
      }

      setWorkout(workoutData);

      // Load workout exercises
      const { data: exercisesData, error: exercisesError } = await supabase
        .from("workout_exercises")
        .select("id, exercise_id, sets, reps, rest_seconds, order_index")
        .eq("workout_id", workoutId)
        .order("order_index", { ascending: true });

      if (exercisesError) {
        console.error("Error loading exercises:", exercisesError);
        setError("Failed to load exercises");
        setLoading(false);
        return;
      }

      // Fetch exercise details
      if (exercisesData && exercisesData.length > 0) {
        const exerciseIds = exercisesData.map((e) => e.exercise_id);
        const { data: exerciseDetails, error: detailsError } = await supabase
          .from("exercises")
          .select("id, name, muscle_group, equipment")
          .in("id", exerciseIds);

        if (detailsError) {
          console.error("Error loading exercise details:", detailsError);
        } else if (exerciseDetails) {
          // Merge exercise details with workout exercises
          const merged = exercisesData.map((we) => ({
            ...we,
            exercises: exerciseDetails.find((e) => e.id === we.exercise_id) || {
              name: "Unknown",
              muscle_group: null,
              equipment: null,
            },
          }));
          setExercises(merged);
        }
      }

      setLoading(false);
    };

    loadWorkout();
  }, [workoutId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <p className="text-gray-500">Loading workout...</p>
      </div>
    );
  }

  if (error || !workout) {
    return (
      <div className="space-y-6">
        <p className="text-red-600">{error || "Workout not found"}</p>
        <Link
          href="/trainer/workouts"
          className="text-blue-600 hover:underline text-sm"
        >
          ← Back to Workouts
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header>
        <Link
          href="/trainer/workouts"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back to Workouts
        </Link>
        <div className="mt-4 flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-gray-900">
              {workout.name}
            </h2>
            {workout.focus && (
              <p className="mt-2 text-gray-600">{workout.focus}</p>
            )}
            <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
              {workout.duration && <span>⏱️ {workout.duration}</span>}
              {workout.difficulty && (
                <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                  {workout.difficulty}
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              href={`/trainer/workouts/${workoutId}/edit`}
              className="rounded-md border px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
            >
              Edit
            </Link>
          </div>
        </div>
      </header>

      {/* Notes */}
      {workout.notes && (
        <section className="rounded-xl bg-white shadow p-6">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Notes
          </h3>
          <p className="mt-2 text-gray-900">{workout.notes}</p>
        </section>
      )}

      {/* Exercises */}
      <section className="rounded-xl bg-white shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Exercises ({exercises.length})
        </h3>

        {exercises.length === 0 ? (
          <p className="text-sm text-gray-500">
            No exercises in this workout yet.
          </p>
        ) : (
          <div className="space-y-3">
            {exercises.map((ex, index) => (
              <div
                key={ex.id}
                className="flex items-start gap-4 rounded-lg border p-4"
              >
                {/* Order number */}
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                  {index + 1}
                </div>

                {/* Exercise details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {ex.exercises.name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {ex.exercises.muscle_group || "General"} •{" "}
                        {ex.exercises.equipment || "Bodyweight"}
                      </p>
                    </div>

                    <div className="flex gap-6 text-sm">
                      <div>
                        <p className="text-xs text-gray-500">Sets</p>
                        <p className="font-semibold text-gray-900">
                          {ex.sets}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Reps</p>
                        <p className="font-semibold text-gray-900">
                          {ex.reps}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Rest</p>
                        <p className="font-semibold text-gray-900">
                          {ex.rest_seconds}s
                        </p>
                      </div>
                    </div>
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

