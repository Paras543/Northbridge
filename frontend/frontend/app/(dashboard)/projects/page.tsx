import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { apiClient } from "@/app/lib/api";
import { TopBar } from "@/components/layout/TopBar";
import type { Project, Client } from "@/app/lib/types";

export default async function ProjectsPage() {
  const { getToken } = await auth();
  const api = apiClient(getToken);

  const [projects, clients] = await Promise.all([
    api.get<Project[]>("/projects"),
    api.get<Client[]>("/clients"),
  ]);

  // Helper to find client name for a project
  function getClientName(clientId: string) {
    const client = clients.find((c) => c.id === clientId);
    return client ? client.company_name : "Unknown Client";
  }

  return (
    <>
      <TopBar title="Projects" />
      <main className="flex-1 p-margin-page max-w-container-max mx-auto w-full">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">Projects</h1>
            <p className="font-body-md text-body-md text-secondary mt-1">
              Track and access active consulting projects.
            </p>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-12 text-center">
            <p className="font-body-md text-body-md text-secondary mb-4">
              No projects yet — create a client and start a project to get started.
            </p>
            <Link
              href="/clients"
              className="inline-block bg-primary text-on-primary px-6 py-2.5 rounded-lg font-label-caps text-label-caps hover:opacity-90 transition-all"
            >
              Go to Clients
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 hover:border-primary transition-colors flex flex-col justify-between min-h-[160px]"
              >
                <div>
                  <span className="font-mono-label text-mono-label text-secondary uppercase tracking-wider text-[11px] block mb-1">
                    {getClientName(project.client_id)}
                  </span>
                  <h3 className="font-title-md text-title-md text-primary mb-2">
                    {project.name}
                  </h3>
                  {project.description && (
                    <p className="font-body-sm text-body-sm text-secondary line-clamp-2">
                      {project.description}
                    </p>
                  )}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-surface-container-low text-on-surface">
                    {project.status}
                  </span>
                  <span className="material-symbols-outlined text-secondary text-[20px]">
                    arrow_forward
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
