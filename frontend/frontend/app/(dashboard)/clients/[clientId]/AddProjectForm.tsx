"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { apiClient,ApiError } from "@/app/lib/api";

export function AddProjectForm({ clientId }: { clientId: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const api = apiClient(getToken);
      await api.post("/projects", { name, client_id: clientId });
      setOpen(false);
      setName("");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : "Failed to create project");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="bg-primary text-on-primary px-4 py-2 rounded-lg font-label-caps text-label-caps hover:opacity-90 transition-all flex items-center gap-2"
      >
        <span className="material-symbols-outlined text-[18px]">add</span>
        New Project
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setOpen(false)}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="bg-surface-container-lowest rounded-xl p-6 w-full max-w-md border border-outline-variant"
      >
        <h3 className="font-title-md text-title-md text-primary mb-4">New Project</h3>
        <label className="block font-label-caps text-label-caps text-secondary mb-1">Project Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mb-4 px-3 py-2 bg-surface-container-low border border-outline-variant rounded font-body-sm text-body-sm focus:outline-none focus:border-primary"
          placeholder="Q3 Expansion Strategy"
          required
        />
        {error && <p className="text-error font-body-sm text-body-sm mb-4">{error}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg font-label-caps text-label-caps border border-outline-variant">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="px-4 py-2 rounded-lg font-label-caps text-label-caps bg-primary text-on-primary disabled:opacity-50">
            {submitting ? "Creating..." : "Create Project"}
          </button>
        </div>
      </form>
    </div>
  );
}