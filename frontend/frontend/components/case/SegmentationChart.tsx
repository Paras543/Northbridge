"use client";

import type { SegmentationResult } from "@/app/lib/types";

export function SegmentationChart({ data }: { data: SegmentationResult }) {
  if (!data?.profiles?.length) return null;

  return (
    <div className="mb-4">
      <p className="font-label-caps text-label-caps text-secondary mb-2">
        Segmentation ({data.n_clusters} clusters)
      </p>
      <div className="space-y-2">
        {data.profiles.map((profile) => (
          <div key={profile.cluster_id} className="bg-surface-container-low rounded p-2">
            <div className="flex justify-between font-mono-label text-mono-label">
              <span>Cluster {profile.cluster_id} ({profile.size} records)</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface mt-1">
              {profile.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

