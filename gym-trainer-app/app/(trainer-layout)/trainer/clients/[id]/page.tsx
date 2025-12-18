"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/libs/supabaseClient";

type Client = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  created_at: string;
};

type Workout = {
  id: string;
  name: string;
  focus: string | null;
  duration: string | null;
  difficulty: string | null;
};

export default function ClientProfilePage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadClientData();
  }, [clientId]);

  const loadClientData = async () => {
    setLoading(true);
    setError(null);

    // Load client details
    const { data: clientData, error: clientError } = await supabase
      .from("clients")
      .select("*")
      .eq("id", clientId)
      .single();

    if (clientError) {
      setError("Failed to load client");
      setLoading(false);
      return;
    }

    setClient(clientData);
    setEditForm({
      name: clientData.name,
      email: clientData.email || "",
      phone: clientData.phone || "",
    });

    // Load assigned workouts
    const { data: assignmentData, error: assignmentError } = await supabase
      .from("client_workouts")
      .select("workout_id")
      .eq("client_id", clientId)
      .eq("is_active", true);

    if (assignmentError) {
      console.error("Error loading workout assignments:", assignmentError);
    } else if (assignmentData && assignmentData.length > 0) {
      // Get workout IDs
      const workoutIds = assignmentData.map((a) => a.workout_id);

      // Fetch workout details
      const { data: workoutsData, error: workoutsError } = await supabase
        .from("workouts")
        .select("id, name, focus, duration, difficulty")
        .in("id", workoutIds);

      if (workoutsError) {
        console.error("Error loading workouts:", workoutsError);
      } else if (workoutsData) {
        setWorkouts(workoutsData);
      }
    }

    setLoading(false);
  };

  const handleSaveEdit = async () => {
    if (!editForm.name.trim()) {
      setError("Name is required");
      return;
    }

    setSaving(true);
    setError(null);

    const { error: updateError } = await supabase
      .from("clients")
      .update({
        name: editForm.name.trim(),
        email: editForm.email.trim() || null,
        phone: editForm.phone.trim() || null,
      })
      .eq("id", clientId);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
    } else {
      setIsEditing(false);
      setSaving(false);
      loadClientData();
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${client?.name}? This cannot be undone.`)) {
      return;
    }

    const { error } = await supabase
      .from("clients")
      .delete()
      .eq("id", clientId);

    if (error) {
      setError(error.message);
    } else {
      router.push("/trainer/clients");
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-sm text-gray-500">Loading client...</p>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-6">
        <p className="text-sm text-red-600">Client not found</p>
        <Link href="/trainer/clients" className="text-sm text-blue-600 hover:underline">
          ← Back to Clients
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/trainer/clients"
            className="text-sm text-blue-600 hover:underline mb-2 inline-block"
          >
            ← Back to Clients
          </Link>
          <h2 className="text-3xl font-semibold text-gray-900">
            {client.name}
          </h2>
          <p className="mt-2 text-gray-600">
            Client since {new Date(client.created_at).toLocaleDateString()}
          </p>
        </div>

        <div className="flex gap-3">
          {!isEditing && (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="rounded-md border px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="rounded-md border px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
              >
                Delete Client
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Client Information */}
      <section className="rounded-xl bg-white shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Client Information
        </h3>

        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                className="w-full rounded-md border px-3 py-2 text-sm text-gray-900 bg-white"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                className="w-full rounded-md border px-3 py-2 text-sm text-gray-900 bg-white"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                className="w-full rounded-md border px-3 py-2 text-sm text-gray-900 bg-white"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditForm({
                    name: client.name,
                    email: client.email || "",
                    phone: client.phone || "",
                  });
                  setError(null);
                }}
                className="rounded-md border px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="text-base font-medium text-gray-900">{client.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-base text-gray-900">{client.email || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="text-base text-gray-900">{client.phone || "—"}</p>
            </div>
          </div>
        )}
      </section>

      {/* Assigned Workouts */}
      <section className="rounded-xl bg-white shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Assigned Workouts
        </h3>

        {workouts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500 mb-4">
              No workouts assigned yet
            </p>
            <Link
              href="/trainer/workouts"
              className="inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
            >
              Assign Workouts
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {workouts.map((workout) => (
              <div
                key={workout.id}
                className="rounded-lg border p-4"
              >
                <h4 className="font-semibold text-gray-900">{workout.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{workout.focus || "—"}</p>
                <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                  <span>{workout.duration || "—"}</span>
                  {workout.difficulty && (
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium">
                      {workout.difficulty}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

