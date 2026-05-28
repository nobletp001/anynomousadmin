import React from "react";

export function SkeletonRows() {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <tr key={i} className="border-b border-zinc-800/40 animate-pulse">
          <td className="px-6 py-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-zinc-800" />
              <div className="space-y-1.5">
                <div className="h-3 w-24 bg-zinc-800 rounded" />
                <div className="h-2.5 w-16 bg-zinc-800/60 rounded" />
              </div>
            </div>
          </td>
          <td className="px-6 py-4">
            <div className="h-3 w-32 bg-zinc-800 rounded" />
          </td>
          <td className="px-6 py-4">
            <div className="h-3 w-20 bg-zinc-800 rounded" />
          </td>
          <td className="px-6 py-4">
            <div className="h-3 w-20 bg-zinc-800 rounded" />
          </td>
          <td className="px-6 py-4">
            <div className="h-5 w-16 bg-zinc-800 rounded-full" />
          </td>
          <td className="px-6 py-4">
            <div className="h-7 w-24 bg-zinc-800 rounded-lg" />
          </td>
        </tr>
      ))}
    </>
  );
}
