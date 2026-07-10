import { TopBar } from "@/components/layout/TopBar";

export default function SettingsPage() {
  return (
    <>
      <TopBar title="Settings" search={false} />
      <main className="flex-1 p-margin-page max-w-container-max mx-auto w-full">
        <div className="mb-8">
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Settings</h1>
          <p className="font-body-md text-body-md text-secondary mt-1">
            Configure workspace settings, API endpoints, and system parameters.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
          {/* General Section */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
            <h3 className="font-title-md text-title-md text-primary mb-4 pb-2 border-b border-outline-variant">
              General Configuration
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block font-label-caps text-label-caps text-secondary mb-1">
                  Default Currency
                </label>
                <input
                  type="text"
                  defaultValue="USD ($)"
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded font-body-sm text-body-sm focus:outline-none"
                  readOnly
                />
              </div>
              <div>
                <label className="block font-label-caps text-label-caps text-secondary mb-1">
                  Reporting Locale
                </label>
                <input
                  type="text"
                  defaultValue="en-US"
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded font-body-sm text-body-sm focus:outline-none"
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* Integration Section */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
            <h3 className="font-title-md text-title-md text-primary mb-4 pb-2 border-b border-outline-variant">
              API & Integrations
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block font-label-caps text-label-caps text-secondary mb-1">
                  FastAPI Endpoint URL
                </label>
                <input
                  type="text"
                  defaultValue="http://localhost:8000"
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded font-body-sm text-body-sm focus:outline-none"
                  readOnly
                />
              </div>
              <div>
                <label className="block font-label-caps text-label-caps text-secondary mb-1">
                  LLM Provider
                </label>
                <input
                  type="text"
                  defaultValue="Groq — Llama 3.3 70B"
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded font-body-sm text-body-sm focus:outline-none"
                  readOnly
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
