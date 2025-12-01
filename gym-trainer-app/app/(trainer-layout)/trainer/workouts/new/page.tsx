const mockExercises = [
    {
      id: 1,
      name: "Barbell Bench Press",
      muscle: "Chest",
      equipment: "Barbell",
    },
    {
      id: 2,
      name: "Incline Dumbbell Press",
      muscle: "Chest",
      equipment: "Dumbbells",
    },
    {
      id: 3,
      name: "Lat Pulldown",
      muscle: "Back",
      equipment: "Machine",
    },
    {
      id: 4,
      name: "Back Squat",
      muscle: "Legs",
      equipment: "Barbell",
    },
  ];
  
  const mockSelected = [
    {
      id: 1,
      name: "Barbell Bench Press",
      sets: 4,
      reps: "8–10",
      rest: "90s",
    },
    {
      id: 3,
      name: "Lat Pulldown",
      sets: 3,
      reps: "10–12",
      rest: "75s",
    },
  ];
  
  export default function NewWorkoutPage() {
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
            <button className="rounded-md border px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100">
              Cancel
            </button>
            <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500">
              Save Workout
            </button>
          </div>
        </header>
  
        {/* Workout meta */}
        <section className="rounded-xl bg-white shadow p-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Workout name
              </label>
              <input
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                placeholder="Push Day A"
              />
            </div>
  
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Focus / goal
              </label>
              <input
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                placeholder="Chest, shoulders, triceps"
              />
            </div>
          </div>
  
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Estimated duration
              </label>
              <input
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                placeholder="60 min"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Difficulty
              </label>
              <select className="mt-1 w-full rounded-md border px-3 py-2 text-sm">
                <option>Beginner</option>
                <option selected>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Notes (optional)
              </label>
              <input
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                placeholder="e.g. focus on tempo, controlled negative"
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
  
            <div className="mt-4 flex gap-3">
              <input
                type="text"
                placeholder="Search exercises…"
                className="flex-1 rounded-md border px-3 py-2 text-sm"
              />
              <select className="rounded-md border px-3 py-2 text-sm">
                <option>All muscles</option>
                <option>Chest</option>
                <option>Back</option>
                <option>Legs</option>
                <option>Shoulders</option>
              </select>
            </div>
  
            <ul className="mt-4 space-y-2 max-h-64 overflow-y-auto">
              {mockExercises.map((e) => (
                <li
                  key={e.id}
                  className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium text-gray-900">{e.name}</p>
                    <p className="text-xs text-gray-500">
                      {e.muscle} • {e.equipment}
                    </p>
                  </div>
                  <button className="rounded-md border px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100">
                    Add
                  </button>
                </li>
              ))}
            </ul>
          </div>
  
          {/* Selected exercises */}
          <div className="rounded-xl bg-white shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Exercises in this workout
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Adjust sets, reps and rest for each exercise.
            </p>
  
            {mockSelected.length === 0 ? (
              <p className="mt-4 text-sm text-gray-500">
                No exercises added yet. Use the list on the left to add them.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {mockSelected.map((ex, index) => (
                  <div
                    key={ex.id}
                    className="rounded-lg border px-3 py-3 text-sm flex flex-col gap-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-700">
                          {index + 1}
                        </span>
                        <p className="font-medium text-gray-900">{ex.name}</p>
                      </div>
                      <button className="rounded-md border px-2 py-1 text-xs text-gray-500 hover:bg-gray-100">
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
                          defaultValue={ex.sets}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">
                          Reps
                        </label>
                        <input
                          className="mt-1 w-full rounded-md border px-2 py-1 text-xs"
                          defaultValue={ex.reps}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">
                          Rest
                        </label>
                        <input
                          className="mt-1 w-full rounded-md border px-2 py-1 text-xs"
                          defaultValue={ex.rest}
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
  