import Link from "next/link";

export default function TrainerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r p-6 flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-blue-600">Gymble</h1>

        <nav className="flex flex-col gap-3 text-sm font-medium text-gray-700">
          <Link href="/trainer/dashboard" className="hover:text-blue-600">
            Dashboard
          </Link>
          <Link href="/trainer/clients" className="hover:text-blue-600">
            Clients
          </Link>
          <Link href="/trainer/workouts" className="hover:text-blue-600">
            Workouts
          </Link>
          <Link href="/trainer/exercises" className="hover:text-blue-600">
            Exercise Library
          </Link>
          <Link href="/live" className="hover:text-blue-600">
            Live Session
          </Link>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-10">{children}</main>
    </div>
  );
}
