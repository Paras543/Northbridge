"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { apiClient } from "@/app/lib/api";
import type { ReportSummary,ReportDetail } from "@/app/lib/types";

export function ReportRow({ report }: { report: ReportSummary }) {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<ReportDetail | null>(null);
  const { getToken } = useAuth();

  async function handleView() {
    const api = apiClient(getToken);
    const full = await api.get<ReportDetail>(`/reports/${report.id}`);
    setDetail(full);
    setOpen(true);
  }

  return (
    <>
      <tr className="hover:bg-surface-container-low transition-colors">
        <td className="px-6 py-4 font-body-sm text-body-sm text-on-surface">{report.name}</td>
        <td className="px-6 py-4 font-mono-label text-mono-label text-secondary">
          {new Date(report.created_at).toLocaleDateString()}
        </td>
        <td className="px-6 py-4 text-right">
          <button onClick={handleView} className="text-secondary hover:text-primary">
            <span className="material-symbols-outlined">visibility</span>
          </button>
        </td>
      </tr>
      {open && detail && (
        <tr>
          <td colSpan={3} className="px-6 py-6 bg-surface-container-low">
            <div className="whitespace-pre-wrap font-body-sm text-body-sm text-on-surface">
              {detail.content}
            </div>
            <button onClick={() => setOpen(false)} className="mt-4 font-label-caps text-label-caps text-secondary hover:text-primary">
              Close
            </button>
          </td>
        </tr>
      )}
    </>
  );
}

