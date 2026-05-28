import React from "react";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from "recharts";
import { formatShortDate, chartTooltipStyle, CARD_CLASS } from "../utils";

interface CompletionData {
  date: string;
  count: number;
}

interface TaskCompletionsChartProps {
  data: CompletionData[];
}

export function TaskCompletionsChart({ data }: TaskCompletionsChartProps) {
  return (
    <div className={CARD_CLASS}>
      <h2 className="text-sm font-bold text-zinc-200 mb-1">Task Completions</h2>
      <p className="text-xs text-zinc-505 mb-5">Last 30 days</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis
            dataKey="date"
            tickFormatter={formatShortDate}
            tick={{ fill: "#71717a", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis tick={{ fill: "#71717a", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={chartTooltipStyle}
            labelFormatter={(d: unknown) => formatShortDate(d as string)}
            formatter={(value: unknown) => [value as number, "Completions"]}
            cursor={{ fill: "rgba(99,102,241,0.06)" }}
          />
          <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
