"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthGate from "@/app/components/AuthGate";
import { supabase } from "@/libs/supabaseClient";

export default function TrainerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <AuthGate>
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
            <Link href="/trainer/progress" className="hover:text-blue-600">
              Progress
            </Link>
            <Link href="/live" className="hover:text-blue-600">
              Live Session
            </Link>
          </nav>

          <div className="mt-auto pt-6 border-t">
            <button
              onClick={handleLogout}
              className="w-full rounded-md border px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-10">{children}</main>
      </div>
    </AuthGate>
  );
}

