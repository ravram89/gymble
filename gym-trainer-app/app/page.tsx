"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/libs/supabaseClient";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace("/trainer/dashboard");
      } else {
        router.replace("/login");
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Gymble</h1>
        <p className="text-sm text-gray-600">Loading…</p>
      </div>
    </div>
  );
}
