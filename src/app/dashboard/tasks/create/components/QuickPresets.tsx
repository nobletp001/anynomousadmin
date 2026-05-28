import React from "react";
import { FieldLabel } from "./FieldLabel";
import { PRESETS } from "../constants/base";

interface QuickPresetsProps {
  onApplyPreset: (presetValue: string) => void;
}

export function QuickPresets({ onApplyPreset }: QuickPresetsProps) {
  return (
    <div className="backdrop-blur-md bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-6 space-y-4">
      <h2 className="text-sm font-semibold text-zinc-300 pb-2 border-b border-zinc-800">Quick Presets</h2>
      <div>
        <FieldLabel>Select Preset Template</FieldLabel>
        <select
          onChange={(e) => onApplyPreset(e.target.value)}
          defaultValue="custom"
          className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-colors"
        >
          {PRESETS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
        <p className="text-[11px] text-zinc-550 mt-1.5 leading-relaxed">
          Selecting a template pre-populates details and instructions, which you can customize below.
        </p>
      </div>
    </div>
  );
}
