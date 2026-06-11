import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export function Row({ label, value, color }: { label: string; value: string; color?: "emerald" | "red" }) {
  const colorClass = color === "emerald" ? "text-emerald-400" : color === "red" ? "text-red-400" : "text-zinc-300";
  return (
    <>
      <span className="text-zinc-500">{label}</span>
      <span className={`text-right font-semibold ${colorClass}`}>{value}</span>
    </>
  );
}

export function Section({
  icon,
  title,
  expanded,
  onToggle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/30">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-left cursor-pointer hover:bg-zinc-800/30 transition rounded-xl"
      >
        <div className="flex items-center gap-2 text-zinc-400">
          {icon}
          <span className="text-xs font-bold uppercase tracking-wider">{title}</span>
        </div>
        {expanded ? (
          <ChevronUp className="w-3.5 h-3.5 text-zinc-500" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
        )}
      </button>
      {expanded && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

export function TokenBadge({ status }: { status: "valid" | "legacy" | "invalid" }) {
  if (status === "valid")
    return <span title="Platform-verified token" className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />;
  if (status === "legacy")
    return <span title="Legacy submission (pre-token era)" className="w-2 h-2 rounded-full bg-zinc-500 shrink-0" />;
  return <span title="Invalid token — excluded from balance" className="w-2 h-2 rounded-full bg-red-500 shrink-0" />;
}

export function SeverityBadge({ severity }: { severity: string }) {
  const cls =
    severity === "critical"
      ? "bg-red-500/20 text-red-400"
      : severity === "high"
        ? "bg-orange-500/20 text-orange-400"
        : "bg-amber-500/20 text-amber-400";
  return <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase ${cls}`}>{severity}</span>;
}
