const mockExercises = [
    {
      id: 1,
      name: "Barbell Bench Press",
      muscle: "Chest",
      equipment: "Barbell",
      difficulty: "Intermediate",
    },
    {
      id: 2,
      name: "Lat Pulldown",
      muscle: "Back",
      equipment: "Machine",
      difficulty: "Beginner",
    },
    {
      id: 3,
      name: "Back Squat",
      muscle: "Legs",
      equipment: "Barbell",
      difficulty: "Intermediate",
    },
  ];
  
  export default function ExerciseLibraryPage() {
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
  
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500">
            + Add Exercise
          </button>
        </header>
  
        <section className="rounded-xl bg-white shadow p-6">
          <div className="mb-4 flex gap-3">
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
              <option>Arms</option>
            </select>
          </div>
  
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
              {mockExercises.map((e) => (
                <tr key={e.id} className="border-b last:border-none">
                  <td className="py-3 font-medium text-gray-900">{e.name}</td>
                  <td className="py-3 text-gray-600">{e.muscle}</td>
                  <td className="py-3 text-gray-600">{e.equipment}</td>
                  <td className="py-3 text-gray-600">{e.difficulty}</td>
                  <td className="py-3 text-right">
                    <button className="rounded-md border px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    );
  }
  