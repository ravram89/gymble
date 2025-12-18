"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/libs/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const quickTestLogin = async () => {
    // Use example.com which is a reserved test domain and should always pass validation
    const testEmail = "test@example.com";
    const testPassword = "test123456";
    
    setEmail(testEmail);
    setPassword(testPassword);
    setMode("login");
    
    // Try to login, if fails, try signup
    setError(null);
    setBusy(true);

    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });

      if (loginError) {
        // User doesn't exist, try to sign up
        const { data, error: signupError } = await supabase.auth.signUp({
          email: testEmail,
          password: testPassword,
        });

        if (signupError) throw signupError;

        const userId = data.user?.id;
        if (userId) {
          const { error: trainerErr } = await supabase.from("trainers").insert([
            { user_id: userId, email: testEmail, name: "Test Trainer" },
          ]);
          if (trainerErr) throw trainerErr;
        }
      }

      router.push("/trainer/dashboard");
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const submit = async () => {
    setError(null);
    setBusy(true);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        const userId = data.user?.id;
        if (userId) {
          const { error: trainerErr } = await supabase.from("trainers").insert([
            { user_id: userId, email, name: email.split("@")[0] },
          ]);
          if (trainerErr) throw trainerErr;
        }
      }

      router.push("/trainer/dashboard");
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl bg-white shadow p-6 space-y-4">
        <h1 className="text-2xl font-semibold text-gray-900">
          {mode === "login" ? "Log in" : "Create account"}
        </h1>

        {error && (
          <div className="rounded-md border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <input
          className="w-full rounded-md border px-3 py-2 text-sm text-gray-900"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full rounded-md border px-3 py-2 text-sm text-gray-900"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
          onClick={submit}
          disabled={busy || !email || !password}
        >
          {busy ? "Working…" : mode === "login" ? "Log in" : "Sign up"}
        </button>

        <button
          className="w-full rounded-md border px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          disabled={busy}
        >
          {mode === "login" ? "Need an account? Sign up" : "Already have an account? Log in"}
        </button>

        <div className="pt-4 border-t">
          <button
            className="w-full rounded-md bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200 disabled:opacity-60"
            onClick={quickTestLogin}
            disabled={busy}
          >
            🚀 Quick Test Login
          </button>
          <p className="mt-2 text-xs text-center text-gray-500">
            Creates test account if it doesn't exist
          </p>
        </div>
      </div>
    </div>
  );
}
