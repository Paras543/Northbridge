"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { apiClient,ApiError } from "@/app/lib/api";
import { TopBar } from "@/components/layout/TopBar";
import type { CaseState } from "@/app/lib/types";
import { SpecialistReportCard } from "@/components/case/SpecialistReportCard";
import { HumanReviewPanel } from "@/components/case/HumanReviewPanel";

const POLL_INTERVAL_MS = 3000;

export default function CaseWorkspacePage() {
  const { threadId } = useParams<{ threadId: string }>();
  const [caseState, setCaseState] = useState<CaseState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  const fetchStatus = useCallback(async () => {
    try {
      const api = apiClient(getToken);
      const result = await api.get<CaseState>(`/consultations/${threadId}`);
      setCaseState(result);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : "Failed to load case");
    }
  }, [threadId, getToken]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    if (!caseState || caseState.status === "completed") return;
    const interval = setInterval(fetchStatus, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [caseState, fetchStatus]);

  if (error) {
    return (
      <>
        <TopBar title="Consultation" search={false} />
        <main className="flex-1 p-margin-page max-w-container-max mx-auto w-full">
          <p className="text-error font-body-md text-body-md">{error}</p>
        </main>
      </>
    );
  }

  if (!caseState) {
    return (
      <>
        <TopBar title="Consultation" search={false} />
        <main className="flex-1 p-margin-page max-w-container-max mx-auto w-full">
          <p className="font-body-md text-body-md text-secondary">Loading...</p>
        </main>
      </>
    );
  }

  const data = caseState.data;

  return (
    <>
      <TopBar title="Consultation Workspace" search={false} />
      <main className="flex-1 p-margin-page max-w-container-max mx-auto w-full">
        {/* Status banner */}
        <div className="mb-8 flex items-center gap-3">
          <StatusBadge status={caseState.status} />
          <span className="font-mono-label text-mono-label text-secondary">
            Thread {threadId.slice(0, 8)}
          </span>
        </div>

        {caseState.status === "interrupted" && (
          <HumanReviewPanel
            threadId={threadId}
            recommendation={data.recommendation as Record<string, unknown>}
            message={data.message as string}
            onResumed={fetchStatus}
          />
        )}

        {caseState.status === "running" && (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-12 text-center">
            <span className="material-symbols-outlined text-primary animate-spin text-3xl mb-4 inline-block">
              sync
            </span>
            <p className="font-body-md text-body-md text-on-surface">
              Agents are working — market, financial, and risk analysts are
              building their reports.
            </p>
          </div>
        )}

        {caseState.status === "completed" && (
          <div className="space-y-8">
            {/* Specialist reports */}
            <section>
              <h3 className="font-title-md text-title-md text-on-surface mb-4">
                Specialist Reports
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
                {data.market_report ? (
                  <SpecialistReportCard report={data.market_report as any} />
                ) : null}
                {data.financial_report ? (
                  <SpecialistReportCard report={data.financial_report as any} />
                ) : null}
                {data.Risk_report ? (
                  <SpecialistReportCard report={data.Risk_report as any} />
                ) : null}
              </div>
            </section>

            {/* Final recommendation */}
            {data.final_recommendation ? (
              <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
                <h3 className="font-title-md text-title-md text-on-surface mb-4">
                  Final Recommendation
                </h3>
                <p className="font-body-md text-body-md text-on-surface mb-4 whitespace-pre-wrap">
                  {(data.final_recommendation as any).recommendations}
                </p>
                {(data.final_recommendation as any).risk_flags?.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-outline-variant">
                    <p className="font-label-caps text-label-caps text-secondary mb-2">
                      Risk Flags
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      {(data.final_recommendation as any).risk_flags.map(
                        (flag: string, i: number) => (
                          <li key={i} className="font-body-sm text-body-sm text-on-surface">
                            {flag}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}
              </section>
            ) : null}

            {/* Full report */}
            {data.report_path ? (
              <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
                <h3 className="font-title-md text-title-md text-on-surface mb-4">
                  Client Report
                </h3>
                <div className="font-body-sm text-body-sm text-on-surface whitespace-pre-wrap leading-relaxed">
                  {data.report_path as string}
                </div>
              </section>
            ) : null}
          </div>
        )}
      </main>
    </>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    running: "bg-surface-container-high text-on-surface-variant",
    interrupted: "bg-primary text-on-primary",
    completed: "bg-surface-container-highest text-on-surface",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${styles[status] ?? ""}`}>
      {status}
    </span>
  );
}

