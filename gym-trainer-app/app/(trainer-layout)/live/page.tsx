"use client";

import { useState } from "react";

type SessionClient = {
  id: number;
  name: string;
  exercise: string;
  setInfo: string;
  status: "Working" | "Resting" | "Waiting";
};

const mockClients: SessionClient[] = [
  {
    id: 1,
    name: "Alex Popescu",
    exercise: "Barbell Bench Press",
    setInfo: "Set 2 of 4 • 8–10 reps",
    status: "Working",
  },
  {
    id: 2,
    name: "Roxana Marinescu",
    exercise: "Walking Lunges",
    setInfo: "Set 1 of 3 • 12 reps/leg",
    status: "Resting",
  },
  {
    id: 3,
    name: "Dragos Stoica",
    exercise: "Deadlift",
    setInfo: "Set 4 of 5 • 5 reps",
    status: "Waiting",
  },
];

function StatusBadge({ status }: { status: SessionClient["status"] }) {
  const styles: Record<SessionClient["status"], string> = {
    Working: "bg-green-100 text-green-700",
    Resting: "bg-yellow-100 text-yellow-700",
    Waiting: "bg-gray-100 text-gray-700",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}

export default function LiveSessionPage() {
  const [selectedId, setSelectedId] = useState<number>(mockClients[0]?.id ?? 0);

  const selectedClient = mockClients.find((c) => c.id === selectedId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-gray-900">Live Session</h2>
          <p className="mt-2 text-gray-600">
            Track multiple clients in a single training session.
          </p>
        </div>

        <div className="flex gap-3">
          <button className="rounded-md border px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100">
            End Session
          </button>
          <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500">
            Start Timer
          </button>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)]">
        {/* Left: Clients overview */}
        <div className="rounded-xl bg-white shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Clients in this session
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Tap a client to see details, track sets and make quick notes.
          </p>

          <ul className="space-y-2">
            {mockClients.map((c) => (
              <li
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={`flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2 text-sm transition hover:bg-gray-50 ${
                  c.id === selectedId ? "border-blue-500 bg-blue-50" : ""
                }`}
              >
                <div>
                  <p className="font-medium text-gray-900">{c.name}</p>
                  <p className="text-xs text-gray-500">
                    {c.exercise} • {c.setInfo}
                  </p>
                </div>
                <StatusBadge status={c.status} />
              </li>
            ))}
          </ul>
        </div>

        {/* Right: Selected client details */}
        <div className="rounded-xl bg-white shadow p-6">
          {selectedClient ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedClient.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedClient.exercise}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {selectedClient.setInfo}
                  </p>
                </div>
                <StatusBadge status={selectedClient.status} />
              </div>

              <div className="grid gap-4 md:grid-cols-3 mb-6">
                <div>
                  <label className="block text-xs text-gray-500">
                    Current set
                  </label>
                  <input
                    className="mt-1 w-full rounded-md border px-2 py-1 text-xs"
                    defaultValue="2"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500">
                    Reps done
                  </label>
                  <input
                    className="mt-1 w-full rounded-md border px-2 py-1 text-xs"
                    defaultValue="9"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500">Weight</label>
                  <input
                    className="mt-1 w-full rounded-md border px-2 py-1 text-xs"
                    defaultValue="80 kg"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-xs text-gray-500 mb-1">
                  Quick notes for this client
                </label>
                <textarea
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  rows={3}
                  placeholder="e.g. focus on elbow path, good control, slight fatigue on last reps..."
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button className="rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500">
                  Mark Set Complete
                </button>
                <button className="rounded-md border px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100">
                  Start Rest Timer
                </button>
                <button className="rounded-md border px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100">
                  Skip to Next Exercise
                </button>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500">
              Select a client on the left to see their details.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
