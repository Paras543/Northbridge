import { auth } from "@clerk/nextjs/server";
import { apiClient } from "@/app/lib/api";
import { TopBar } from "@/components/layout/TopBar";
import type { Document, Project } from "@/app/lib/types";
import Link from "next/link";

const STATUS_STYLES: Record<string, string> = {
  embedded: "bg-surface-container text-on-surface",
  extracted: "bg-surface-container-low text-on-surface-variant",
  pending: "bg-surface-container-low text-on-surface-variant",
  extraction_failed: "bg-error-container text-on-error-container",
  embedding_failed: "bg-error-container text-on-error-container",
  no_chunks: "bg-surface-container-low text-on-surface-variant",
};

export default async function KnowledgeBasePage() {
  const { getToken } = await auth();
  const api = apiClient(getToken);

  const [documents, projects] = await Promise.all([
    api.get<Document[]>("/documents"),
    api.get<Project[]>("/projects"),
  ]);

  function getProjectName(projectId: string) {
    const project = projects.find((p) => p.id === projectId);
    return project ? project.name : "Unknown Project";
  }

  return (
    <>
      <TopBar title="Knowledge Base" />
      <main className="flex-1 p-margin-page max-w-container-max mx-auto w-full">
        <div className="mb-8">
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Knowledge Base</h1>
          <p className="font-body-md text-body-md text-secondary mt-1">
            Central repository of all documents uploaded for context-grounded AI reasoning.
          </p>
        </div>

        {documents.length === 0 ? (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-12 text-center">
            <p className="font-body-md text-body-md text-secondary mb-4">
              No files uploaded to the knowledge base yet.
            </p>
            <Link
              href="/clients"
              className="inline-block bg-primary text-on-primary px-6 py-2.5 rounded-lg font-label-caps text-label-caps hover:opacity-90 transition-all"
            >
              Go to Projects to Upload
            </Link>
          </div>
        ) : (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low border-b border-outline-variant">
                <tr>
                  <th className="px-6 py-3 font-label-caps text-label-caps text-secondary">Document Name</th>
                  <th className="px-6 py-3 font-label-caps text-label-caps text-secondary">Project</th>
                  <th className="px-6 py-3 font-label-caps text-label-caps text-secondary">Type</th>
                  <th className="px-6 py-3 font-label-caps text-label-caps text-secondary">Embedding Status</th>
                  <th className="px-6 py-3 font-label-caps text-label-caps text-secondary">Uploaded</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-6 py-4 font-body-sm text-body-sm text-on-surface font-medium">
                      {doc.name}
                    </td>
                    <td className="px-6 py-4 font-body-sm text-body-sm text-secondary">
                      <Link
                        href={`/projects/${doc.project_id}/documents`}
                        className="hover:underline hover:text-primary transition-all"
                      >
                        {getProjectName(doc.project_id)}
                      </Link>
                    </td>
                    <td className="px-6 py-4 font-mono-label text-mono-label text-secondary">
                      {doc.content_type}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[doc.embedding_status] ?? ""}`}>
                        {doc.embedding_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono-label text-mono-label text-secondary">
                      {new Date(doc.uploaded_at).toLocaleString()}
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
