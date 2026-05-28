import React from "react";

export function SkeletonCards() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-72 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl" />
        ))}
      </div>
      <div className="h-72 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl" />
    </div>
  );
}
