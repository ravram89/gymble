"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/libs/supabaseClient";

type Exercise = {
  id: string;
  name: string;
  muscle_group: string | null;
  equipment: string | null;
  difficulty: string | null;
};

export default function ExerciseLibraryPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>("all");
  
  // Add Exercise Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newExercise, setNewExercise] = useState({
    name: "",
    muscle_group: "",
    equipment: "",
    difficulty: "Intermediate",
  });

  const loadExercises = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("exercises")
      .select("id, name, muscle_group, equipment, difficulty")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error loading exercises:", error);
    } else if (data) {
      setExercises(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadExercises();
  }, []);

  const handleAddExercise = async () => {
    if (!newExercise.name.trim()) {
      setError("Exercise name is required");
      return;
    }

    setSaving(true);
    setError(null);

    const { error: insertError } = await supabase.from("exercises").insert([
      {
        name: newExercise.name.trim(),
        muscle_group: newExercise.muscle_group || null,
        equipment: newExercise.equipment || null,
        difficulty: newExercise.difficulty || null,
      },
    ]);

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
    } else {
      // Reset form and close modal
      setNewExercise({
        name: "",
        muscle_group: "",
        equipment: "",
        difficulty: "Intermediate",
      });
      setShowAddModal(false);
      setSaving(false);
      // Reload exercises
      loadExercises();
    }
  };

  // Get unique muscle groups for filter dropdown
  const muscleGroups = useMemo(() => {
    const groups = exercises
      .map((e) => e.muscle_group)
      .filter((g): g is string => g !== null && g !== "");
    return Array.from(new Set(groups)).sort();
  }, [exercises]);

  // Filter exercises based on search and muscle group
  const filteredExercises = useMemo(() => {
    return exercises.filter((e) => {
      const matchesSearch =
        searchQuery === "" ||
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.muscle_group &&
          e.muscle_group.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (e.equipment &&
          e.equipment.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesMuscleGroup =
        selectedMuscleGroup === "all" || e.muscle_group === selectedMuscleGroup;

      return matchesSearch && matchesMuscleGroup;
    });
  }, [exercises, searchQuery, selectedMuscleGroup]);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-gray-900">
            Exercise Library
          </h2>
          <p className="mt-2 text-gray-600">
            Browse and manage the exercises you use in your programs.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
        >
          + Add Exercise
        </button>
      </header>

      {/* Add Exercise Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Add New Exercise
            </h3>

            {error && (
              <div className="mb-4 rounded-md border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exercise Name *
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border px-3 py-2 text-sm text-gray-900 bg-white"
                  placeholder="e.g. Barbell Squat"
                  value={newExercise.name}
                  onChange={(e) =>
                    setNewExercise({ ...newExercise, name: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Muscle Group
                </label>
                <select
                  className="w-full rounded-md border px-3 py-2 text-sm text-gray-900 bg-white"
                  value={newExercise.muscle_group}
                  onChange={(e) =>
                    setNewExercise({
                      ...newExercise,
                      muscle_group: e.target.value,
                    })
                  }
                >
                  <option value="">Select muscle group</option>
                  <option value="Chest">Chest</option>
                  <option value="Back">Back</option>
                  <option value="Legs">Legs</option>
                  <option value="Shoulders">Shoulders</option>
                  <option value="Arms">Arms</option>
                  <option value="Core">Core</option>
                  <option value="Full Body">Full Body</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Equipment
                </label>
                <select
                  className="w-full rounded-md border px-3 py-2 text-sm text-gray-900 bg-white"
                  value={newExercise.equipment}
                  onChange={(e) =>
                    setNewExercise({
                      ...newExercise,
                      equipment: e.target.value,
                    })
                  }
                >
                  <option value="">Select equipment</option>
                  <option value="Barbell">Barbell</option>
                  <option value="Dumbbell">Dumbbell</option>
                  <option value="Kettlebell">Kettlebell</option>
                  <option value="Machine">Machine</option>
                  <option value="Cable">Cable</option>
                  <option value="Bodyweight">Bodyweight</option>
                  <option value="Resistance Band">Resistance Band</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Difficulty
                </label>
                <select
                  className="w-full rounded-md border px-3 py-2 text-sm text-gray-900 bg-white"
                  value={newExercise.difficulty}
                  onChange={(e) =>
                    setNewExercise({
                      ...newExercise,
                      difficulty: e.target.value,
                    })
                  }
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleAddExercise}
                disabled={saving || !newExercise.name.trim()}
                className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
              >
                {saving ? "Adding…" : "Add Exercise"}
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setError(null);
                  setNewExercise({
                    name: "",
                    muscle_group: "",
                    equipment: "",
                    difficulty: "Intermediate",
                  });
                }}
                disabled={saving}
                className="rounded-md border px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="rounded-xl bg-white shadow p-6">
        <div className="mb-4 flex gap-3">
          <input
            type="text"
            placeholder="Search exercises…"
            className="flex-1 rounded-md border px-3 py-2 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            className="rounded-md border px-3 py-2 text-sm"
            value={selectedMuscleGroup}
            onChange={(e) => setSelectedMuscleGroup(e.target.value)}
          >
            <option value="all">All muscle groups</option>
            {muscleGroups.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Loading exercises…</p>
        ) : filteredExercises.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">
              {exercises.length === 0
                ? "No exercises yet. Add your first exercise to start building workouts."
                : "No exercises match your search criteria."}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600">
              Showing {filteredExercises.length} of {exercises.length} exercises
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b text-gray-500">
                  <tr>
                    <th className="py-2">Name</th>
                    <th className="py-2">Muscle Group</th>
                    <th className="py-2">Equipment</th>
                    <th className="py-2">Difficulty</th>
                    <th className="py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExercises.map((e) => (
                    <tr key={e.id} className="border-b last:border-none">
                      <td className="py-3 font-medium text-gray-900">
                        {e.name}
                      </td>
                      <td className="py-3 text-gray-600">
                        {e.muscle_group ?? "-"}
                      </td>
                      <td className="py-3 text-gray-600">
                        {e.equipment ?? "-"}
                      </td>
                      <td className="py-3 text-gray-600">
                        {e.difficulty ?? "-"}
                      </td>
                      <td className="py-3 text-right">
                        <button className="rounded-md border px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
