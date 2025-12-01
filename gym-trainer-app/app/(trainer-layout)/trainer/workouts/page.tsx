import Link from "next/link";


const mockWorkouts = [
    {
        id: 1,
        name: "Push Day A",
        focus: "Chest, shoulders, triceps",
        duration: "60 min",
        level: "Intermediate",
        exercisesCount: 6,
    },
    {
        id: 2,
        name: "Leg Day A",
        focus: "Quads, glutes, hamstrings",
        duration: "55 min",
        level: "Intermediate",
        exercisesCount: 5,
    },
    {
        id: 3,
        name: "Full Body Beginner",
        focus: "Full body, technique focus",
        duration: "45 min",
        level: "Beginner",
        exercisesCount: 7,
    },
];

function LevelBadge({ level }: { level: string }) {
    const colorMap: Record<string, string> = {
        Beginner: "bg-green-100 text-green-700",
        Intermediate: "bg-yellow-100 text-yellow-700",
        Advanced: "bg-red-100 text-red-700",
    };

    const className =
        colorMap[level] ?? "bg-gray-100 text-gray-700";

    return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${className}`}>
            {level}
        </span>
    );
}

export default function WorkoutsPage() {
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
                {mockWorkouts.length === 0 ? (
                    <p className="text-sm text-gray-500">
                        You don&apos;t have any workouts yet. Create your first template to get started.
                    </p>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {mockWorkouts.map((w) => (
                            <div
                                key={w.id}
                                className="flex flex-col justify-between rounded-lg border p-4 text-sm"
                            >
                                <div>
                                    <div className="flex items-start justify-between gap-2">
                                        <h3 className="text-base font-semibold text-gray-900">
                                            {w.name}
                                        </h3>
                                        <LevelBadge level={w.level} />
                                    </div>
                                    <p className="mt-1 text-gray-600">{w.focus}</p>
                                    <p className="mt-2 text-xs text-gray-500">
                                        {w.exercisesCount} exercises • {w.duration}
                                    </p>
                                </div>

                                <div className="mt-4 flex justify-between gap-2">
                                    <button className="rounded-md border px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100">
                                        Edit
                                    </button>
                                    <button className="rounded-md border px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100">
                                        Assign
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
