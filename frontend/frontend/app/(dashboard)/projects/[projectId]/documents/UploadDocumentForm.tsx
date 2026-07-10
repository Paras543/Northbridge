"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { apiClient,ApiError } from "@/app/lib/api";

export function UploadDocumentForm({ projectId }: { projectId: string }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { getToken } = useAuth();
  const router = useRouter();

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("project_id", projectId);
      formData.append("file", file);

      const api = apiClient(getToken);
      await api.postForm("/documents", formData);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        className="hidden"
        id="file-upload"
        accept=".pdf,.docx,.csv,.xlsx,.xls,.txt"
      />
      <label
        htmlFor="file-upload"
        className={`bg-primary text-on-primary px-4 py-2 rounded-lg font-label-caps text-label-caps hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer ${uploading ? "opacity-50 pointer-events-none" : ""}`}
      >
        <span className="material-symbols-outlined text-[18px]">
          {uploading ? "sync" : "upload_file"}
        </span>
        {uploading ? "Uploading..." : "Upload Document"}
      </label>
      {error && <p className="text-error font-body-sm text-body-sm mt-2">{error}</p>}
    </div>
  );
}

