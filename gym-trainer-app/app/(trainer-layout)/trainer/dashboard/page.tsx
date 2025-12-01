const mockSessions = [
    { id: 1, client: "Alex Popescu", time: "18:00", workout: "Push Day" },
    { id: 2, client: "Roxana Marinescu", time: "19:00", workout: "Leg Day A" },
    { id: 3, client: "Dragos Stoica", time: "20:00", workout: "Full Body" },
  ];
  
  const mockClients = [
    { id: 1, name: "Alex Popescu", program: "Strength Block A" },
    { id: 2, name: "Roxana Marinescu", program: "Fat Loss Phase 2" },
    { id: 3, name: "Dragos Stoica", program: "Hypertrophy Week 3" },
  ];
  
  export default function TrainerDashboardPage() {
    return (
      <div className="space-y-8">
        <header>
          <h2 className="text-3xl font-semibold text-gray-900">Trainer Dashboard</h2>
          <p className="mt-2 text-gray-600">
            Welcome to Gymble – your control center for clients and sessions.
          </p>
        </header>
  
        <div className="grid gap-6 md:grid-cols-2">
          {/* Today’s Sessions */}
          <section className="rounded-xl bg-white shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Today&apos;s Sessions
            </h3>
  
            {mockSessions.length === 0 ? (
              <p className="text-sm text-gray-500">
                No sessions scheduled for today yet.
              </p>
            ) : (
              <ul className="space-y-3">
                {mockSessions.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{s.client}</p>
                      <p className="text-gray-500">
                        {s.time} • {s.workout}
                      </p>
                    </div>
                    <button className="rounded-md bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-500">
                      Open Session
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
  
          {/* Active Clients */}
          <section className="rounded-xl bg-white shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Active Clients
            </h3>
  
            {mockClients.length === 0 ? (
              <p className="text-sm text-gray-500">
                You don&apos;t have any clients yet.
              </p>
            ) : (
              <ul className="space-y-3">
                {mockClients.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{c.name}</p>
                      <p className="text-gray-500">{c.program}</p>
                    </div>
                    <button className="rounded-md border px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100">
                      View
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    );
  }
  