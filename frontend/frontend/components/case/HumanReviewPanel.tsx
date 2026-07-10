"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { apiClient,ApiError } from "@/app/lib/api";

export function HumanReviewPanel({
  threadId,
  recommendation,
  message,
  onResumed,
}: {
  threadId: string;
  recommendation: Record<string, unknown>;
  message: string;
  onResumed: () => void;
}) {
  const [changes, setChanges] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  async function handleDecision(approved: boolean) {
    setSubmitting(true);
    setError(null);
    try {
      const api = apiClient(getToken);
      await api.post(`/consultations/${threadId}/resume`, {
        approved,
        request_changes: approved
          ? []
          : changes.split("\n").map((s) => s.trim()).filter(Boolean),
      });
      onResumed();
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-surface-container-lowest border-2 border-primary rounded-xl p-6 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-primary">rate_review</span>
        <h3 className="font-title-md text-title-md text-primary">Human Review Required</h3>
      </div>
      <p className="font-body-sm text-body-sm text-secondary mb-4">{message}</p>

      <div className="bg-surface-container-low rounded-lg p-4 mb-4">
        <p className="font-body-md text-body-md text-on-surface whitespace-pre-wrap">
          {String(recommendation.recommendations ?? "")}
        </p>
      </div>

      <label className="block font-label-caps text-label-caps text-secondary mb-1">
        Requested changes (one per line, only needed if rejecting)
      </label>
      <textarea
        value={changes}
        onChange={(e) => setChanges(e.target.value)}
        className="w-full h-20 p-3 bg-surface-container-low border border-outline-variant rounded-lg font-body-sm text-body-sm resize-none mb-4 focus:outline-none focus:border-primary"
        placeholder="e.g. Revisit the financial ROI assumptions"
      />

      {error && <p className="text-error font-body-sm text-body-sm mb-4">{error}</p>}

      <div className="flex gap-3">
        <button
          onClick={() => handleDecision(true)}
          disabled={submitting}
          className="bg-primary text-on-primary px-6 py-2 rounded-lg font-label-caps text-label-caps hover:opacity-90 disabled:opacity-50"
        >
          Approve
        </button>
        <button
          onClick={() => handleDecision(false)}
          disabled={submitting}
          className="border border-outline-variant px-6 py-2 rounded-lg font-label-caps text-label-caps hover:bg-surface-container-low disabled:opacity-50"
        >
          Request Changes
        </button>
      </div>
    </div>
  );
}

