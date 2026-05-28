import React from "react";

interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  label: string;
  color?: "red" | "amber" | "orange";
}

export function Toggle({
  checked,
  onChange,
  disabled,
  label,
  color = "red",
}: ToggleProps) {
  const activeColors = {
    red: "bg-red-500",
    amber: "bg-amber-500",
    orange: "bg-orange-500",
  };
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative w-9 h-5 rounded-full transition-all shrink-0 ${
        disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
      } ${checked ? activeColors[color] : "bg-zinc-700"}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}
