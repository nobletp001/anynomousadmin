import React from "react";

interface InfoRowProps {
  label: string;
  value: React.ReactNode;
}

export function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-zinc-500 text-xs font-medium w-24 shrink-0">{label}</span>
      <span className="text-zinc-300 text-xs">{value}</span>
    </div>
  );
}
