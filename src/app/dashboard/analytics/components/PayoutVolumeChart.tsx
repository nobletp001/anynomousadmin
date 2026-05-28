import React from "react";
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Area } from "recharts";
import { formatShortWeek, formatAmount, chartTooltipStyle, CARD_CLASS } from "../utils";

interface PayoutData {
  week: string;
  amount: number;
}

interface PayoutVolumeChartProps {
  data: PayoutData[];
}

export function PayoutVolumeChart({ data }: PayoutVolumeChartProps) {
  return (
    <div className={CARD_CLASS}>
      <h2 className="text-sm font-bold text-zinc-200 mb-1">Payout Volume</h2>
      <p className="text-xs text-zinc-505 mb-5">Last 8 weeks — weekly totals</p>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="payoutGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis dataKey="week" tickFormatter={formatShortWeek} tick={{ fill: "#71717a", fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#71717a", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
          <Tooltip
            contentStyle={chartTooltipStyle}
            labelFormatter={(w: unknown) => formatShortWeek(w as string)}
            formatter={(value: unknown) => [formatAmount(value as number), "Payouts"]}
            cursor={{ stroke: "#7c3aed", strokeWidth: 1 }}
          />
          <Area
            type="monotone" dataKey="amount" stroke="#7c3aed" strokeWidth={2.5}
            fill="url(#payoutGradient)" dot={false}
            activeDot={{ r: 4, fill: "#7c3aed", stroke: "#3f3f46", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
