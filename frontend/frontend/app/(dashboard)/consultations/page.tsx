import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { apiClient } from "@/app/lib/api";
import { TopBar } from "@/components/layout/TopBar";
import type { ConsultationSummary, Project } from "@/app/lib/types";

export default async function ConsultationsListPage() {
  const { getToken } = await auth();
  const api = apiClient(getToken);

  const [consultations, projects] = await Promise.all([
    api.get<ConsultationSummary[]>("/consultations"),
    api.get<Project[]>("/projects"),
  ]);

  // Helper to find project name
  function getProjectName(projectId: string) {
    const project = projects.find((p) => p.id === projectId);
    return project ? project.name : "Unknown Project";
  }

  return (
    <>
      <TopBar title="Consultations" />
      <main className="flex-1 p-margin-page max-w-container-max mx-auto w-full">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">AI Consultations</h1>
            <p className="font-body-md text-body-md text-secondary mt-1">
              Review and manage all historical and active AI agent workflows.
            </p>
          </div>
          <Link
            href="/consultations/new"
            className="bg-primary text-on-primary px-4 py-2 rounded-lg font-label-caps text-label-caps hover:opacity-90 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Consultation
          </Link>
        </div>

        {consultations.length === 0 ? (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-12 text-center">
            <p className="font-body-md text-body-md text-secondary mb-4">
              No consultations started yet.
            </p>
            <Link
              href="/consultations/new"
              className="inline-block bg-primary text-on-primary px-6 py-2.5 rounded-lg font-label-caps text-label-caps hover:opacity-90 transition-all"
            >
              Start First Consultation
            </Link>
          </div>
        ) : (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low border-b border-outline-variant">
                <tr>
                  <th className="px-6 py-3 font-label-caps text-label-caps text-secondary">Brief</th>
                  <th className="px-6 py-3 font-label-caps text-label-caps text-secondary">Project</th>
                  <th className="px-6 py-3 font-label-caps text-label-caps text-secondary">Status</th>
                  <th className="px-6 py-3 font-label-caps text-label-caps text-secondary">Started</th>
                  <th className="px-6 py-3 font-label-caps text-label-caps text-secondary text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {consultations.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-6 py-4 font-body-sm text-body-sm text-on-surface max-w-xs truncate">
                      {c.raw_brief}
                    </td>
                    <td className="px-6 py-4 font-body-sm text-body-sm text-secondary">
                      {getProjectName(c.project_id)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider ${
                          c.status === "completed"
                            ? "bg-surface-container text-on-surface"
                            : c.status === "interrupted"
                            ? "bg-primary text-on-primary"
                            : "bg-surface-container-high text-secondary"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono-label text-mono-label text-secondary">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/projects/${c.project_id}/cases/${c.thread_id}`}
                        className="text-secondary hover:text-primary transition-colors"
                      >
                        <span className="material-symbols-outlined text-[20px]">visibility</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
}
