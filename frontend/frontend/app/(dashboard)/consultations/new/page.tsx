"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { apiClient, ApiError } from "@/app/lib/api";
import { TopBar } from "@/components/layout/TopBar";
import type { Client, Project, CaseState } from "@/app/lib/types";

function NewConsultationForm() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [rawBrief, setRawBrief] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const docName = searchParams.get("documentName");
    if (docName) {
      setRawBrief(
        `Please perform a complete analysis of the document '${docName}'. Summarize its core findings, detail the key metrics, and highlight any potential risks or assumptions discussed in the text.`
      );
    }
  }, [searchParams]);

  useEffect(() => {
    async function fetchData() {
      try {
        const api = apiClient(getToken);
        const [clientsData, projectsData] = await Promise.all([
          api.get<Client[]>("/clients"),
          api.get<Project[]>("/projects"),
        ]);
        setClients(clientsData);
        setProjects(projectsData);
        if (projectsData.length > 0) {
          const pId = searchParams.get("projectId");
          const exists = pId && projectsData.some((p) => p.id === pId);
          setSelectedProjectId(exists ? pId : projectsData[0].id);
        }
      } catch (err) {
        console.error("Failed to load projects/clients", err);
        setError("Failed to load initial data. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [getToken, searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProjectId || !rawBrief.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const api = apiClient(getToken);
      const result = await api.post<CaseState>("/consultations/start", {
        raw_brief: rawBrief,
        project_id: selectedProjectId,
      });
      router.push(`/projects/${selectedProjectId}/cases/${result.thread_id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : "Failed to start consultation");
      setSubmitting(false);
    }
  }

  function getClientPrefix(clientId: string) {
    const client = clients.find((c) => c.id === clientId);
    return client ? `${client.company_name} — ` : "";
  }

  return (
    <>
      <TopBar title="New Consultation" search={false} />
      <main className="flex-1 p-margin-page max-w-container-max mx-auto w-full">
        <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">
          New AI Consultation
        </h1>
        <p className="font-body-md text-body-md text-secondary mb-8">
          Select a project, define the business challenge, and trigger the specialist agent workflow.
        </p>

        {loading ? (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-12 text-center">
            <span className="material-symbols-outlined text-primary animate-spin text-[32px]">sync</span>
            <p className="font-body-md text-body-md text-secondary mt-2">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-12 text-center">
            <p className="font-body-md text-body-md text-secondary mb-4">
              You need a project with uploaded documents to start an AI Consultation.
            </p>
            <button
              onClick={() => router.push("/clients")}
              className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-label-caps text-label-caps hover:opacity-90 transition-all"
            >
              Go to Clients & Projects
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 space-y-6">
            <div>
              <label className="block font-label-caps text-label-caps text-secondary mb-2">
                Select Project *
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full px-3 py-2.5 bg-surface-container-low border border-outline-variant rounded font-body-sm text-body-sm focus:outline-none focus:border-primary"
                required
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {getClientPrefix(p.client_id)}{p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-label-caps text-label-caps text-secondary mb-2">
                Business Problem Description *
              </label>
              <textarea
                value={rawBrief}
                onChange={(e) => setRawBrief(e.target.value)}
                className="w-full h-48 p-4 bg-surface-container-low border border-outline-variant rounded-lg font-body-md text-body-md resize-none focus:outline-none focus:border-primary transition-colors"
                placeholder="Describe the challenge in detail. E.g. 'Should we expand our product offerings into retail given our current manufacturing capacities?'"
                required
              />
            </div>

            {error && <p className="text-error font-body-sm text-body-sm">{error}</p>}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-label-caps text-label-caps hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {submitting ? "sync" : "bolt"}
                </span>
                {submitting ? "Executing agents..." : "Execute Agent Flow"}
              </button>
            </div>
          </form>
        )}
      </main>
    </>
  );
}

export default function GlobalNewConsultationPage() {
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
