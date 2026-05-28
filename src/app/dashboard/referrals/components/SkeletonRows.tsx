import React from "react";

export function SkeletonRows() {
  return (
    <div className="divide-y divide-zinc-800/50">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="flex gap-4 px-6 py-4 animate-pulse">
          <div className="h-4 bg-zinc-800 rounded w-32" />
          <div className="h-4 bg-zinc-800 rounded w-6" />
          <div className="h-4 bg-zinc-800 rounded w-32" />
          <div className="h-4 bg-zinc-800 rounded w-36 ml-auto" />
        </div>
      ))}
    </div>
  );
}
