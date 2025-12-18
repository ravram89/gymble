"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/libs/supabaseClient";

type Client = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  created_at: string;
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [trainerId, setTrainerId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newClient, setNewClient] = useState({ name: "", email: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    setError(null);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    // Try to get trainer record
    let { data: trainerData } = await supabase
      .from("trainers")
      .select("id")
      .eq("user_id", session.user.id)
      .single();

    // If no trainer record exists, create one
    if (!trainerData) {
      console.log("No trainer record found, creating one...");
      const { data: newTrainer, error: insertError } = await supabase
        .from("trainers")
        .insert([{
          user_id: session.user.id,
          email: session.user.email,
          name: session.user.email?.split("@")[0] || "Trainer",
        }])
        .select()
        .single();

      if (insertError) {
        console.error("Error creating trainer:", insertError);
        setError("Failed to create trainer record: " + insertError.message);
        setLoading(false);
        return;
      }
      
      trainerData = newTrainer;
    }

    if (!trainerData) {
      setError("Unable to load trainer data");
      setLoading(false);
      return;
    }

    setTrainerId(trainerData.id);

    const { data, error } = await supabase
      .from("clients")
      .select("id, name, email, phone, created_at")
      .eq("trainer_id", trainerData.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading clients:", error);
      setError("Failed to load clients");
    } else if (data) {
      setClients(data);
    }
    setLoading(false);
  };

  const handleAddClient = async () => {
    if (!newClient.name.trim() || !trainerId) return;

    setSaving(true);
    setError(null);

    const { error } = await supabase.from("clients").insert([
      {
        trainer_id: trainerId,
        name: newClient.name.trim(),
        email: newClient.email.trim() || null,
        phone: newClient.phone.trim() || null,
      },
    ]);

    if (error) {
      setError(error.message);
      setSaving(false);
    } else {
      setNewClient({ name: "", email: "", phone: "" });
      setShowAddForm(false);
      setSaving(false);
      loadClients();
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-gray-900">Clients</h2>
          <p className="mt-2 text-gray-600">
            Manage your clients and track their progress.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
        >
          + Add Client
        </button>
      </header>

      {showAddForm && (
        <section className="rounded-xl bg-white shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Add New Client
          </h3>
          {error && (
            <div className="mb-4 rounded-md border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          <div className="space-y-3">
            <input
              className="w-full rounded-md border px-3 py-2 text-sm text-gray-900 bg-white"
              placeholder="Client Name *"
              value={newClient.name}
              onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
            />
            <input
              className="w-full rounded-md border px-3 py-2 text-sm text-gray-900 bg-white"
              placeholder="Email (optional)"
              type="email"
              value={newClient.email}
              onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
            />
            <input
              className="w-full rounded-md border px-3 py-2 text-sm text-gray-900 bg-white"
              placeholder="Phone (optional)"
              value={newClient.phone}
              onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
            />
            <div className="flex gap-3">
              <button
                onClick={handleAddClient}
                disabled={saving || !newClient.name.trim()}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
              >
                {saving ? "Adding…" : "Add Client"}
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewClient({ name: "", email: "", phone: "" });
                  setError(null);
                }}
                className="rounded-md border px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </div>
        </section>
      )}

      <section className="rounded-xl bg-white shadow p-6">
        {loading ? (
          <p className="text-sm text-gray-500">Loading clients…</p>
        ) : clients.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500 mb-4">
              You don&apos;t have any clients yet.
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
            >
              Add Your First Client
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b text-gray-500">
                <tr>
                  <th className="py-3">Name</th>
                  <th className="py-3">Email</th>
                  <th className="py-3">Phone</th>
                  <th className="py-3">Added</th>
                  <th className="py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => (
                  <tr key={c.id} className="border-b last:border-none">
                    <td className="py-3 font-medium text-gray-900">{c.name}</td>
                    <td className="py-3 text-gray-600">{c.email ?? "-"}</td>
                    <td className="py-3 text-gray-600">{c.phone ?? "-"}</td>
                    <td className="py-3 text-gray-600">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        href={`/trainer/clients/${c.id}`}
                        className="rounded-md border px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100 inline-block"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
  