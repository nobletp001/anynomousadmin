import React from "react";

interface StarRatingProps {
  rating: number | null;
}

export function StarRating({ rating }: StarRatingProps) {
  if (rating === null || rating === undefined) {
    return <span className="text-zinc-650 text-xs italic">No rating</span>;
  }
  const rounded = Math.round(rating);
  return (
    <div className="flex items-center gap-1">
      <div className="flex text-amber-450 text-xs">
        {"★".repeat(rounded)}
        <span className="text-zinc-700">{"★".repeat(5 - rounded)}</span>
      </div>
      <span className="text-[11px] text-zinc-500 font-mono">({rating.toFixed(1)})</span>
    </div>
  );
}
