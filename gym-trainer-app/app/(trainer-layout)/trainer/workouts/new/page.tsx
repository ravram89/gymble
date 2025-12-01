"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/libs/supabaseClient";

type DbExercise = {
  id: string;
  name: string;
  muscle_group: string | null;
  equipment: string | null;
};

type SelectedExercise = {
  exerciseId: string;
  name: string;
  sets: number;
  reps: string;
  restSeconds: number;
};

export default function NewWorkoutPage() {
  const router = useRouter();

  const [workoutName, setWorkoutName] = useState("");
  const [focus, setFocus] = useState("");
  const [duration, setDuration] = useState("60 min");
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [notes, setNotes] = useState("");

  const [availableExercises, setAvailableExercises] = useState<DbExercise[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>([]);

  const [loadingExercises, setLoadingExercises] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load exercises from Supabase
  useEffect(() => {
    const loadExercises = async () => {
      const { data, error } = await supabase
        .from("exercises")
        .select("id, name, muscle_group, equipment")
        .order("name", { ascending: true });

      if (error) {
        console.error("Error loading exercises in builder:", error);
        setErrorMsg("Could not load exercises. Please try again.");
      } else if (data) {
        setAvailableExercises(data);
      }
      setLoadingExercises(false);
    };

    loadExercises();
  }, []);

  const handleAddExercise = (exercise: DbExercise) => {
    setSelectedExercises((prev) => [
      ...prev,
      {
        exerciseId: exercise.id,
        name: exercise.name,
        sets: 3,
        reps: "8–12",
        restSeconds: 90,
      },
    ]);
  };

  const handleRemoveSelected = (index: number) => {
    setSelectedExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSelectedField = (
    index: number,
    field: keyof SelectedExercise,
    value: string
  ) => {
    setSelectedExercises((prev) =>
      prev.map((ex, i) => {
        if (i !== index) return ex;
        if (field === "sets") {
          return { ...ex, sets: Number(value) || 0 };
        }
        if (field === "restSeconds") {
          return { ...ex, restSeconds: Number(value) || 0 };
        }
        if (field === "reps") {
          return { ...ex, reps: value };
        }
        return ex;
      })
    );
  };

  const handleSaveWorkout = async () => {
    setErrorMsg(null);

    if (!workoutName.trim()) {
      setErrorMsg("Workout name is required.");
      return;
    }

    if (selectedExercises.length === 0) {
      setErrorMsg("Add at least one exercise to the workout.");
      return;
    }

    setSaving(true);

    try {
      // 1) Insert into workouts
      const { data: workout, error: workoutError } = await supabase
        .from("workouts")
        .insert([
          {
            trainer_id: null, // TODO: replace with real trainer id after auth
            name: workoutName,
            focus: focus || null,
            duration: duration || null,
            difficulty: difficulty || null,
            notes: notes || null,
            is_public: false,
            source_workout_id: null,
          },
        ])
        .select("id")
        .single();

      if (workoutError || !workout) {
        console.error("Error inserting workout:", workoutError);
        setErrorMsg("Could not save workout. Please try again.");
        setSaving(false);
        return;
      }

      const workoutId = workout.id as string;

      // 2) Insert exercises for this workout
      const rowsToInsert = selectedExercises.map((ex, index) => ({
        workout_id: workoutId,
        exercise_id: ex.exerciseId,
        order_index: index + 1,
        sets: ex.sets,
        reps: ex.reps,
        rest_seconds: ex.restSeconds,
      }));

      const { error: weError } = await supabase
        .from("workout_exercises")
        .insert(rowsToInsert);

      if (weError) {
        console.error("Error inserting workout_exercises:", weError);
        setErrorMsg("Workout created, but failed to attach exercises.");
        setSaving(false);
        return;
      }

      // Success – redirect back to workouts list
      router.push("/trainer/workouts");
    } catch (err) {
      console.error("Unexpected error saving workout:", err);
      setErrorMsg("Unexpected error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-gray-900">
            Create Workout
          </h2>
          <p className="mt-2 text-gray-600">
            Build a workout template by combining exercises and setting sets,
            reps, and rest.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            className="rounded-md border px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
            onClick={() => router.push("/trainer/workouts")}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
            onClick={handleSaveWorkout}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Workout"}
          </button>
        </div>
      </header>

      {errorMsg && (
        <div className="rounded-md border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      {/* Workout meta */}
      <section className="rounded-xl bg-white shadow p-6 space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Workout name
            </label>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400"
              placeholder="Push Day A"
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Focus / goal
            </label>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400"
              placeholder="Chest, shoulders, triceps"
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Estimated duration
            </label>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400"
              placeholder="60 min"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Difficulty
            </label>
            <select
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Notes (optional)
            </label>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400"
              placeholder="e.g. focus on tempo, controlled negative"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Builder */}
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1.5fr)]">
        {/* Exercise Library */}
        <div className="rounded-xl bg-white shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Exercise Library
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            Search and add exercises to this workout.
          </p>

          {loadingExercises ? (
            <p className="mt-4 text-sm text-gray-500">Loading exercises…</p>
          ) : (
            <>
              <div className="mt-4 flex gap-3">
                <input
                  type="text"
                  placeholder="Search exercises… (not functional yet)"
                  className="flex-1 rounded-md border px-3 py-2 text-sm"
                  disabled
                />
                <select
                  className="rounded-md border px-3 py-2 text-sm"
                  disabled
                >
                  <option>All muscles</option>
                  <option>Chest</option>
                  <option>Back</option>
                  <option>Legs</option>
                  <option>Shoulders</option>
                </select>
              </div>

              <ul className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                {availableExercises.map((e) => (
                  <li
                    key={e.id}
                    className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{e.name}</p>
                      <p className="text-xs text-gray-500">
                        {e.muscle_group ?? "-"} • {e.equipment ?? "-"}
                      </p>
                    </div>
                    <button
                      className="rounded-md border px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                      onClick={() => handleAddExercise(e)}
                    >
                      Add
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* Selected exercises */}
        <div className="rounded-xl bg-white shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Exercises in this workout
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            Adjust sets, reps and rest for each exercise.
          </p>

          {selectedExercises.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500">
              No exercises added yet. Use the list on the left to add them.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {selectedExercises.map((ex, index) => (
                <div
                  key={`${ex.exerciseId}-${index}`}
                  className="rounded-lg border px-3 py-3 text-sm flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-700">
                        {index + 1}
                      </span>
                      <p className="font-medium text-gray-900">{ex.name}</p>
                    </div>
                    <button
                      className="rounded-md border px-2 py-1 text-xs text-gray-500 hover:bg-gray-100"
                      onClick={() => handleRemoveSelected(index)}
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    <div>
                      <label className="block text-xs text-gray-500">
                        Sets
                      </label>
                      <input
                        className="mt-1 w-full rounded-md border px-2 py-1 text-xs"
                        type="number"
                        value={ex.sets}
                        onChange={(e) =>
                          updateSelectedField(
                            index,
                            "sets",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500">
                        Reps
                      </label>
                      <input
                        className="mt-1 w-full rounded-md border px-2 py-1 text-xs"
                        value={ex.reps}
                        onChange={(e) =>
                          updateSelectedField(
                            index,
                            "reps",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500">
                        Rest (seconds)
                      </label>
                      <input
                        className="mt-1 w-full rounded-md border px-2 py-1 text-xs"
                        type="number"
                        value={ex.restSeconds}
                        onChange={(e) =>
                          updateSelectedField(
                            index,
                            "restSeconds",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
