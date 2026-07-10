"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, ComposedChart } from "recharts";
import type { ForecastResult } from "@/app/lib/types";

export function ForecastChart({ data }: { data: ForecastResult }) {
  if (!data?.forecast?.length) return null;

  return (
    <div className="mb-4">
      <p className="font-label-caps text-label-caps text-secondary mb-2">
        Forecast: {data.metric_name} ({data.trend_direction})
      </p>
      <ResponsiveContainer width="100%" height={180}>
        <ComposedChart data={data.forecast}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip />
          <Area dataKey="upper_bound" stroke="none" fill="#00000010" />
          <Area dataKey="lower_bound" stroke="none" fill="#ffffff" />
          <Line dataKey="predicted" stroke="#000000" strokeWidth={2} dot={{ r: 2 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

