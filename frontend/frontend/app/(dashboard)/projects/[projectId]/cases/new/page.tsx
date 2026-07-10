"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { apiClient, ApiError } from "@/app/lib/api";
import { TopBar } from "@/components/layout/TopBar";
import type { CaseState } from "@/app/lib/types";

function NewConsultationForm() {
  const { projectId } = useParams<{ projectId: string }>();
  const searchParams = useSearchParams();
  const [rawBrief, setRawBrief] = useState("");

  useEffect(() => {
    const docName = searchParams.get("documentName");
    if (docName) {
      setRawBrief(
        `Please perform a complete analysis of the document '${docName}'. Summarize its core findings, detail the key metrics, and highlight any potential risks or assumptions discussed in the text.`
      );
    }
  }, [searchParams]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rawBrief.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const api = apiClient(getToken);
      const result = await api.post<CaseState>("/consultations/start", {
        raw_brief: rawBrief,
        project_id: projectId,
      });
      router.push(`/projects/${projectId}/cases/${result.thread_id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : "Failed to start consultation");
      setSubmitting(false);
    }
  }

  return (
    <>
      <TopBar title="New Consultation" search={false} />
      <main className="flex-1 p-margin-page max-w-container-max mx-auto w-full">
        <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">
          Business Problem Definition
        </h1>
        <p className="font-body-md text-body-md text-secondary mb-8">
          Describe the challenge — the AI will run market, financial, and risk
          analysis, grounded in any documents you've uploaded to this project.
        </p>

        <form onSubmit={handleSubmit} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
          <textarea
            value={rawBrief}
            onChange={(e) => setRawBrief(e.target.value)}
            className="w-full h-48 p-4 bg-surface-container-low border border-outline-variant rounded-lg font-body-md text-body-md resize-none focus:outline-none focus:border-primary transition-colors"
            placeholder="e.g. 'Should we expand our logistics operations into the Southeast Asian market given current supply chain constraints?'"
            required
          />
          {error && <p className="text-error font-body-sm text-body-sm mt-3">{error}</p>}
          <div className="flex justify-end mt-4">
            <button
              type="submit"
              disabled={submitting}
              className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-label-caps text-label-caps hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">
                {submitting ? "sync" : "bolt"}
              </span>
              {submitting ? "Running agents..." : "Execute Agent Flow"}
            </button>
          </div>
        </form>
      </main>
    </>
  );
}

export default function NewConsultationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <span className="material-symbols-outlined text-primary animate-spin text-[32px]">sync</span>
        </div>
      }
    >
      <NewConsultationForm />
    </Suspense>
  );
}
