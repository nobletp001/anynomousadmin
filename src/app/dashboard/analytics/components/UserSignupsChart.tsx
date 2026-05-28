import React from "react";
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line } from "recharts";
import { formatShortDate, chartTooltipStyle, CARD_CLASS } from "../utils";

interface SignupData {
  date: string;
  count: number;
}

interface UserSignupsChartProps {
  data: SignupData[];
}

export function UserSignupsChart({ data }: UserSignupsChartProps) {
  return (
    <div className={CARD_CLASS}>
      <h2 className="text-sm font-bold text-zinc-200 mb-1">User Signups</h2>
      <p className="text-xs text-zinc-505 mb-5">Last 30 days</p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
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
            formatter={(value: unknown) => [value as number, "Signups"]}
            cursor={{ stroke: "#7c3aed", strokeWidth: 1 }}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#7c3aed"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, fill: "#7c3aed", stroke: "#3f3f46", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
