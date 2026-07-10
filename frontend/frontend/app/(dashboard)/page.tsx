import { auth } from "@clerk/nextjs/server";
import { apiClient } from "../lib/api";
import { TopBar } from "@/components/layout/TopBar";
import { ActivityChart } from "@/components/dashboard/ActivityChart";
import type { Client, Document, Project, ConsultationSummary, ReportSummary } from "../lib/types";

interface ActivityItem {
  label: string;
  sublabel: string;
  timestamp: string;
}

function buildActivityFeed(
  clients: Client[],
  projects: Project[],
  documents: Document[],
  reports: ReportSummary[]
): ActivityItem[] {
  const items: ActivityItem[] = [
    ...clients.map((c) => ({
      label: `New client added: ${c.company_name}`,
      sublabel: c.industry ?? "Client",
      timestamp: c.created_at ?? "",
    })),
    ...projects.map((p) => ({
      label: `New project started: ${p.name}`,
      sublabel: "Project",
      timestamp: p.created_at ?? "",
    })),
    ...documents.map((d) => ({
      label: `Document uploaded: ${d.name}`,
      sublabel: d.embedding_status,
      timestamp: d.uploaded_at ?? "",
    })),
    ...reports.map((r) => ({
      label: `Report generated: ${r.name}`,
      sublabel: "Report",
      timestamp: r.created_at ?? "",
    })),
  ];

  return items
    .filter((i) => i.timestamp)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 8);
}

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export default async function DashboardPage() {
  const { getToken } = await auth();
  const api = apiClient(getToken);

  const [clients, projects, documents, consultations, reports] = await Promise.all([
    api.get<Client[]>("/clients"),
    api.get<Project[]>("/projects"),
    api.get<Document[]>("/documents"),
    api.get<ConsultationSummary[]>("/consultations"),
    api.get<ReportSummary[]>("/reports"),
  ]);

  const feed = buildActivityFeed(clients, projects, documents, reports);
  const runningCount = consultations.filter((c) => c.status === "running").length;
  const interruptedCount = consultations.filter((c) => c.status === "interrupted").length;

  return (
    <>
      <TopBar title="NorthBridge Dashboard" />
      <main className="flex-1 p-margin-page max-w-container-max mx-auto w-full">
        <div className="mb-10">
          <h1 className="font-headline-lg text-headline-lg text-on-surface">
            Firm Overview
          </h1>
          <p className="font-body-md text-body-md text-secondary mt-1">
            Real-time snapshot of your consulting operations.
          </p>
        </div>

        {/* Stat cards */}
        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-gutter mb-gutter">
          <StatCard label="Total Clients" value={clients.length} />
          <StatCard label="Active Projects" value={projects.length} />
          <StatCard label="Documents" value={documents.length} />
          <StatCard
            label="AI Consultations"
            value={consultations.length}
            note={interruptedCount > 0 ? `${interruptedCount} awaiting review` : undefined}
          />
          <StatCard label="Reports Generated" value={reports.length} />
        </section>

        {runningCount > 0 && (
          <div className="mb-gutter bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-primary animate-pulse">sync</span>
            <p className="font-body-sm text-body-sm text-on-surface">
              {runningCount} consultation{runningCount > 1 ? "s" : ""} currently running.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter mt-gutter">
          {/* Chart Section */}
          <div className="lg:col-span-2">
            <ActivityChart consultations={consultations} />
          </div>

          {/* Recent Activity Section */}
          <div className="lg:col-span-1 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 h-[340px] flex flex-col justify-between overflow-hidden">
            <div className="flex flex-col h-full justify-between">
              <div>
                <h3 className="text-[14px] font-semibold text-neutral-800 mb-4">
                  Recent Activity
                </h3>
                <div className="overflow-y-auto max-h-[230px] pr-1 space-y-3">
                  {feed.length === 0 ? (
                    <p className="text-[12px] text-neutral-400">
                      No activity logged.
                    </p>
                  ) : (
                    feed.map((item, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-start pb-3 border-b border-outline-variant last:border-0 last:pb-0"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-[12px] font-medium text-neutral-800 truncate">
                            {item.label}
                          </p>
                          <p className="text-[10px] text-neutral-400 mt-0.5">
                            {item.sublabel}
                          </p>
                        </div>
                        <span className="text-[10px] text-neutral-400 whitespace-nowrap ml-4">
                          {formatRelativeTime(item.timestamp)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}


function StatCard({
  label,
  value,
  note,
}: {
  label: string;
  value: number | string;
  note?: string;
}) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 hover:border-primary transition-colors">
      <p className="font-label-caps text-label-caps text-secondary mb-2">{label}</p>
      <p className="font-title-md text-title-md text-primary">{value}</p>
      {note && (
        <p className="font-mono-label text-mono-label text-secondary/60 mt-1">{note}</p>
      )}
    </div>
  );
}

