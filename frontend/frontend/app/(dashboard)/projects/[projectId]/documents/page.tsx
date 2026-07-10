import { auth } from "@clerk/nextjs/server";
import { apiClient } from "@/app/lib/api";
import { TopBar } from "@/components/layout/TopBar";
import type { Document } from "@/app/lib/types";
import { UploadDocumentForm } from "./UploadDocumentForm";
import Link from "next/link";

const STATUS_STYLES: Record<string, string> = {
  embedded: "bg-surface-container-high text-on-surface",
  extracted: "bg-surface-container-low text-on-surface-variant",
  pending: "bg-surface-container-low text-on-surface-variant",
  extraction_failed: "bg-error-container text-on-error-container",
  embedding_failed: "bg-error-container text-on-error-container",
  no_chunks: "bg-surface-container-low text-on-surface-variant",
};

export default async function DocumentsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const { getToken } = await auth();
  const api = apiClient(getToken);
  const documents = await api.get<Document[]>(`/documents?project_id=${projectId}`);

  return (
    <>
      <TopBar title="Documents" search={false} />
      <main className="flex-1 p-margin-page max-w-container-max mx-auto w-full">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">Documents</h1>
            <p className="font-body-md text-body-md text-secondary mt-1">
              Upload CSV/XLSX for ML analysis, or PDF/DOCX for RAG-grounded context.
            </p>
          </div>
          <UploadDocumentForm projectId={projectId} />
        </div>

        {documents.length === 0 ? (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-12 text-center">
            <p className="font-body-md text-body-md text-secondary">No documents uploaded yet.</p>
          </div>
        ) : (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low border-b border-outline-variant">
                <tr>
                  <th className="px-6 py-3 font-label-caps text-label-caps text-secondary">Name</th>
                  <th className="px-6 py-3 font-label-caps text-label-caps text-secondary">Type</th>
                  <th className="px-6 py-3 font-label-caps text-label-caps text-secondary">Status</th>
                  <th className="px-6 py-3 font-label-caps text-label-caps text-secondary">Uploaded</th>
                  <th className="px-6 py-3 font-label-caps text-label-caps text-secondary text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-6 py-4 font-body-sm text-body-sm text-on-surface">{doc.name}</td>
                    <td className="px-6 py-4 font-mono-label text-mono-label text-secondary">{doc.content_type}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[doc.embedding_status] ?? ""}`}>
                        {doc.embedding_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono-label text-mono-label text-secondary">
                      {new Date(doc.uploaded_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right font-body-sm">
                      <Link
                        href={`/projects/${projectId}/cases/new?documentName=${encodeURIComponent(doc.name)}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-neutral-200 hover:border-black hover:bg-neutral-50 transition-all text-neutral-700 hover:text-black"
                      >
                        <span className="material-symbols-outlined text-[14px]">bolt</span>
                        Analyze
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

