import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { apiClient } from "@/app/lib/api";
import { TopBar } from "@/components/layout/TopBar";
import type { Client } from "@/app/lib/types";
import { AddClientForm } from "./AddClientForm";

export default async function ClientsPage() {
  const { getToken } = await auth();
  const api = apiClient(getToken);
  const clients = await api.get<Client[]>("/clients");

  return (
    <>
      <TopBar title="Clients" />
      <main className="flex-1 p-margin-page max-w-container-max mx-auto w-full">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">Clients</h1>
            <p className="font-body-md text-body-md text-secondary mt-1">
              Manage your enterprise client portfolio.
            </p>
          </div>
          <AddClientForm />
        </div>

        {clients.length === 0 ? (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-12 text-center">
            <p className="font-body-md text-body-md text-secondary">
              No clients yet — add your first client to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
            {clients.map((client) => (
              <Link
                key={client.id}
                href={`/clients/${client.id}`}
                className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 hover:border-primary transition-colors flex flex-col"
              >
                <h3 className="font-title-md text-title-md text-primary mb-1">
                  {client.company_name}
                </h3>
                <p className="font-mono-label text-mono-label text-secondary uppercase tracking-wider">
                  {client.industry ?? "No industry set"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}

