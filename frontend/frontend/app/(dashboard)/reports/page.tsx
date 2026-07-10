import { auth } from "@clerk/nextjs/server";
import { apiClient } from "@/app/lib/api";
import { TopBar } from "@/components/layout/TopBar";
import type { ReportSummary } from "@/app/lib/types";
import { ReportRow } from "./ReportRow";

export default async function ReportsPage() {
  const { getToken } = await auth();
  const api = apiClient(getToken);
  const reports = await api.get<ReportSummary[]>("/reports");

  return (
    <>
      <TopBar title="Reports" />
      <main className="flex-1 p-margin-page max-w-container-max mx-auto w-full">
        <h1 className="font-headline-lg text-headline-lg text-on-surface mb-8">Reports</h1>
        {reports.length === 0 ? (
          <p className="font-body-md text-body-md text-secondary">No reports generated yet.</p>
        ) : (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low border-b border-outline-variant">
                <tr>
                  <th className="px-6 py-3 font-label-caps text-label-caps text-secondary">Name</th>
                  <th className="px-6 py-3 font-label-caps text-label-caps text-secondary">Generated</th>
                  <th className="px-6 py-3 font-label-caps text-label-caps text-secondary text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {reports.map((r) => (
                  <ReportRow key={r.id} report={r} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
}


