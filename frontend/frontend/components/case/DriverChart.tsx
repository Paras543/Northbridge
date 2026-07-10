"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { DriverAnalysisResult } from "@/app/lib/types";

export function DriverChart({ data }: { data: DriverAnalysisResult }) {
  if (!data?.drivers?.length) return null;

  return (
    <div className="mb-4">
      <p className="font-label-caps text-label-caps text-secondary mb-2">
        Drivers of {data.target_variable}
      </p>
      <ResponsiveContainer width="100%" height={Math.max(120, data.drivers.length * 30)}>
        <BarChart data={data.drivers} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis type="number" tick={{ fontSize: 10 }} />
          <YAxis dataKey="feature" type="category" tick={{ fontSize: 10 }} width={100} />
          <Tooltip />
          <Bar dataKey="importance">
            {data.drivers.map((d, i) => (
              <Cell key={i} fill={d.direction === "increases" ? "#000000" : "#9ca3af"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

