import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { apiClient,ApiError } from "@/app/lib/api";
import { TopBar } from "@/components/layout/TopBar";
import type { Project,Document,ConsultationSummary } from "@/app/lib/types";

const STATUS_STYLES: Record<string, string> = {
  running: "bg-surface-container-high text-on-surface-variant",
  interrupted: "bg-primary text-on-primary",
  completed: "bg-surface-container-highest text-on-surface",
};

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const { getToken } = await auth();
  const api = apiClient(getToken);

  let project: Project;
  try {
    project = await api.get<Project>(`/projects/${projectId}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  const [documents, consultations] = await Promise.all([
    api.get<Document[]>(`/documents?project_id=${projectId}`),
    api.get<ConsultationSummary[]>(`/consultations?project_id=${projectId}`),
  ]);

  return (
    <>
      <TopBar title={project.name} search={false} />
      <main className="flex-1 p-margin-page max-w-container-max mx-auto w-full">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">{project.name}</h1>
            <p className="font-body-md text-body-md text-secondary mt-1">
              {documents.length} document{documents.length !== 1 ? "s" : ""} · {consultations.length} consultation{consultations.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href={`/projects/${projectId}/documents`}
              className="border border-outline-variant px-4 py-2 rounded-lg font-label-caps text-label-caps hover:bg-surface-container-low transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">upload_file</span>
              Documents
            </Link>
            <Link
              href={`/projects/${projectId}/cases/new`}
              className="bg-primary text-on-primary px-4 py-2 rounded-lg font-label-caps text-label-caps hover:opacity-90 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">bolt</span>
              New Consultation
            </Link>
          </div>
        </div>

        <h3 className="font-title-md text-title-md text-on-surface mb-4">Consultations</h3>
        {consultations.length === 0 ? (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-12 text-center mb-8">
            <p className="font-body-md text-body-md text-secondary">
              No consultations yet — start one to get an AI-generated recommendation.
            </p>
          </div>
        ) : (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden mb-8">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low border-b border-outline-variant">
                <tr>
                  <th className="px-6 py-3 font-label-caps text-label-caps text-secondary">Brief</th>
                  <th className="px-6 py-3 font-label-caps text-label-caps text-secondary">Status</th>
                  <th className="px-6 py-3 font-label-caps text-label-caps text-secondary">Started</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {consultations.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/projects/${projectId}/cases/${c.thread_id}`} className="font-body-sm text-body-sm text-primary hover:underline">
                        {c.raw_brief.slice(0, 60)}{c.raw_brief.length > 60 ? "..." : ""}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[c.status] ?? ""}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono-label text-mono-label text-secondary">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <h3 className="font-title-md text-title-md text-on-surface mb-4">Recent Documents</h3>
        {documents.length === 0 ? (
          <p className="font-body-sm text-body-sm text-secondary">No documents uploaded yet.</p>
        ) : (
          <div className="space-y-2">
            {documents.slice(0, 5).map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 bg-surface-container-lowest border border-outline-variant rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary">description</span>
                  <span className="font-body-sm text-body-sm text-on-surface">{doc.name}</span>
                </div>
                <span className="font-mono-label text-mono-label text-secondary">{doc.embedding_status}</span>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}

