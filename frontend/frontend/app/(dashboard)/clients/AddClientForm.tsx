"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { apiClient, ApiError } from "@/app/lib/api";

export function AddClientForm() {
  const [open, setOpen] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [industry, setIndustry] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();
  const router = useRouter();

  function resetForm() {
    setCompanyName("");
    setEmail("");
    setIndustry("");
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!companyName.trim() || !email.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const api = apiClient(getToken);
      // org_id is omitted — the backend auto-resolves a default organization.
      await api.post("/clients", {
        company_name: companyName,
        email,
        industry: industry.trim() || "Other",
      });
      setOpen(false);
      resetForm();
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : "Failed to create client");
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
        Add Client
      </button>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={() => { setOpen(false); resetForm(); }}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="bg-surface-container-lowest rounded-xl p-6 w-full max-w-md border border-outline-variant"
      >
        <h3 className="font-title-md text-title-md text-primary mb-4">Add Client</h3>

        <label className="block font-label-caps text-label-caps text-secondary mb-1">
          Company Name *
        </label>
        <input
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          className="w-full mb-4 px-3 py-2 bg-surface-container-low border border-outline-variant rounded font-body-sm text-body-sm focus:outline-none focus:border-primary"
          placeholder="Acme Corp"
          required
        />

        <label className="block font-label-caps text-label-caps text-secondary mb-1">
          Email *
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-3 py-2 bg-surface-container-low border border-outline-variant rounded font-body-sm text-body-sm focus:outline-none focus:border-primary"
          placeholder="contact@acmecorp.com"
          required
        />

        <label className="block font-label-caps text-label-caps text-secondary mb-1">
          Industry (optional)
        </label>
        <input
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          className="w-full mb-4 px-3 py-2 bg-surface-container-low border border-outline-variant rounded font-body-sm text-body-sm focus:outline-none focus:border-primary"
          placeholder="Financial Services"
        />

        {error && <p className="text-error font-body-sm text-body-sm mb-4">{error}</p>}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => { setOpen(false); resetForm(); }}
            className="px-4 py-2 rounded-lg font-label-caps text-label-caps border border-outline-variant"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 rounded-lg font-label-caps text-label-caps bg-primary text-on-primary disabled:opacity-50"
          >
            {submitting ? "Adding..." : "Add Client"}
          </button>
        </div>
      </form>
    </div>
  );
}