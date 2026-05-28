import React from "react";
import { Users, ClipboardList, CheckSquare, CreditCard } from "lucide-react";
import { formatAmount, CARD_CLASS } from "../utils";

interface StatCardsProps {
  totals: {
    users: number;
    tasks: number;
    submissions: number;
    payoutsPaid: number;
  };
}

export function StatCards({ totals }: StatCardsProps) {
  const cards = [
    {
      label: "Total Users",
      value: totals.users.toLocaleString(),
      icon: Users,
      iconClass: "text-purple-400",
      bgClass: "bg-purple-500/10 border-purple-500/20",
      glowClass: "bg-purple-500/5",
      hoverClass: "hover:border-purple-500/30",
    },
    {
      label: "Total Tasks",
      value: totals.tasks.toLocaleString(),
      icon: ClipboardList,
      iconClass: "text-indigo-400",
      bgClass: "bg-indigo-500/10 border-indigo-500/20",
      glowClass: "bg-indigo-500/5",
      hoverClass: "hover:border-indigo-500/30",
    },
    {
      label: "Task Completions",
      value: totals.submissions.toLocaleString(),
      icon: CheckSquare,
      iconClass: "text-emerald-400",
      bgClass: "bg-emerald-500/10 border-emerald-500/20",
      glowClass: "bg-emerald-500/5",
      hoverClass: "hover:border-emerald-500/30",
    },
    {
      label: "Total Payouts Paid",
      value: formatAmount(totals.payoutsPaid),
      icon: CreditCard,
      iconClass: "text-amber-400",
      bgClass: "bg-amber-500/10 border-amber-500/20",
      glowClass: "bg-amber-500/5",
      hoverClass: "hover:border-amber-500/30",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`${CARD_CLASS} relative overflow-hidden group transition-all duration-300 ${card.hoverClass}`}
        >
          <div
            className={`absolute top-0 right-0 w-20 h-20 rounded-full blur-xl transition-all duration-300 ${card.glowClass} group-hover:opacity-150`}
          />
          <div className="flex items-center justify-between mb-3">
            <span className="text-zinc-500 text-[11px] font-semibold uppercase tracking-wider">
              {card.label}
            </span>
            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${card.bgClass}`}>
              <card.icon className="w-4.5 h-4.5" />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-zinc-100 tracking-tight block truncate">
            {card.value}
          </span>
        </div>
      ))}
    </div>
  );
}
