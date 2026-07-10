"use client";

import type { SpecialistReport } from "@/app/lib/types";
import { ForecastChart } from "./ForecastChart";
import { SegmentationChart } from "./SegmentationChart";
import { DriverChart } from "./DriverChart";

const SPECIALIST_LABELS: Record<string, string> = {
  market: "Market Analyst",
  financial: "Financial Analyst",
  risk: "Risk & Operations",
  operation: "Operations",
};

export function SpecialistReportCard({ report }: { report: SpecialistReport }) {
  const supportingData = report.supporting_data;

  // market: SegmentationResult directly | financial: { forecast, drivers } | risk: null
  const segmentation =
    supportingData && "profiles" in supportingData ? supportingData : null;
  const forecast =
    supportingData && "forecast" in supportingData
      ? (supportingData as any).forecast
      : null;
  const drivers =
    supportingData &&
    "drivers" in supportingData &&
    (supportingData as any).drivers &&
    typeof (supportingData as any).drivers === "object" &&
    "target_variable" in (supportingData as any).drivers
      ? (supportingData as any).drivers
      : supportingData &&
        "drivers" in supportingData &&
        (supportingData as any).drivers
      ? (supportingData as any).drivers
      : null;

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col">
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-title-md text-title-md text-primary">
          {SPECIALIST_LABELS[report.specialist] ?? report.specialist}
        </h4>
        <span className="px-2 py-0.5 bg-surface-container-high rounded text-[10px] font-bold uppercase">
          {report.confidence} confidence
        </span>
      </div>

      <ul className="space-y-2 mb-4">
        {report.findings.map((finding, i) => (
          <li key={i} className="font-body-sm text-body-sm text-on-surface flex gap-2">
            <span className="text-secondary">•</span>
            {finding}
          </li>
        ))}
      </ul>

      {Object.keys(report.key_metrics).length > 0 && (
        <div className="grid grid-cols-2 gap-2 mb-4 pt-3 border-t border-outline-variant">
          {Object.entries(report.key_metrics).map(([key, value]) => (
            <div key={key}>
              <p className="font-label-caps text-label-caps text-secondary">{key}</p>
              <p className="font-mono-label text-mono-label text-on-surface">{value}</p>
            </div>
          ))}
        </div>
      )}

      {forecast && <ForecastChart data={forecast} />}
      {segmentation && <SegmentationChart data={segmentation} />}
      {drivers && <DriverChart data={drivers} />}

      <p className="font-mono-label text-mono-label text-secondary/70 mt-4 pt-3 border-t border-outline-variant">
        Assumptions: {report.assumptions}
      </p>
    </div>
  );
}

