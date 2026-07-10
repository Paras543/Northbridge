import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { apiClient,ApiError } from "@/app/lib/api";
import { TopBar } from "@/components/layout/TopBar";
import type { Client,Project } from "@/app/lib/types";
import { AddProjectForm } from "./AddProjectForm";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const { getToken } = await auth();
  const api = apiClient(getToken);

  let client: Client;
  try {
    client = await api.get<Client>(`/clients/${clientId}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  const projects = await api.get<Project[]>(`/projects?client_id=${clientId}`);

  return (
    <>
      <TopBar title={client.company_name} search={false} />
      <main className="flex-1 p-margin-page max-w-container-max mx-auto w-full">
        <div className="mb-2 font-mono-label text-mono-label text-secondary">
          <Link href="/clients" className="hover:text-primary">Clients</Link>
          <span className="mx-2">/</span>
          <span className="text-primary">{client.company_name}</span>
        </div>

        <div className="flex justify-between items-end mb-8 mt-4">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">{client.company_name}</h1>
            <p className="font-body-md text-body-md text-secondary mt-1">
              {client.industry ?? "No industry set"}
            </p>
          </div>
          <AddProjectForm clientId={clientId} />
        </div>

        <h3 className="font-title-md text-title-md text-on-surface mb-4">Projects</h3>
        {projects.length === 0 ? (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-12 text-center">
            <p className="font-body-md text-body-md text-secondary">
              No projects yet for this client.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 hover:border-primary transition-colors"
              >
                <h4 className="font-title-md text-title-md text-primary mb-1">{project.name}</h4>
                <p className="font-mono-label text-mono-label text-secondary">
                  Created {new Date(project.created_at).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}

