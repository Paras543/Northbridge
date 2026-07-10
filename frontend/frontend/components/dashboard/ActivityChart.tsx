"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import type { ConsultationSummary } from "@/app/lib/types";

interface ChartDataPoint {
  date: string;
  count: number;
}

export function ActivityChart({ consultations }: { consultations: ConsultationSummary[] }) {
  // Aggregate consultations by date for the chart
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split("T")[0];
  }).reverse();

  const data: ChartDataPoint[] = last7Days.map((dateStr) => {
    const matchCount = consultations.filter((c) => {
      if (!c.created_at) return false;
      return c.created_at.split("T")[0] === dateStr;
    }).length;

    // Convert date string to user-friendly label (e.g. "Jul 10")
    const dateObj = new Date(dateStr);
    const label = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    return {
      date: label,
      count: matchCount,
    };
  });

  // Fallback data for preview if no consultations exist yet
  const chartData = consultations.length > 0 ? data : [
    { date: "Mon", count: 2 },
    { date: "Tue", count: 4 },
    { date: "Wed", count: 3 },
    { date: "Thu", count: 7 },
    { date: "Fri", count: 5 },
    { date: "Sat", count: 2 },
    { date: "Sun", count: 4 },
  ];

  return (
    <div className="bg-white border border-neutral-100 rounded-xl p-6 h-[340px] flex flex-col justify-between">
      <div>
        <h3 className="text-[14px] font-semibold text-neutral-800">
          Consultation Activity
        </h3>
        <p className="text-[12px] text-neutral-400 mt-0.5">
          Volume of AI specialist agent invocations.
        </p>
      </div>

      <div className="h-[220px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#71717a" }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#71717a" }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #e4e4e7",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#000000"
              strokeWidth={2}
              fill="#00000005"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
