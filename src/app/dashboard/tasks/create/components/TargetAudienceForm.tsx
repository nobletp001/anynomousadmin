import React from "react";
import { FieldLabel } from "./FieldLabel";
import { AudienceFilter } from "../types";
import { NIGERIAN_STATES } from "../constants/base";

interface TargetAudienceFormProps {
  enableTargeting: boolean;
  setEnableTargeting: (v: boolean) => void;
  audience: AudienceFilter;
  setAudience: React.Dispatch<React.SetStateAction<AudienceFilter>>;
}

export function TargetAudienceForm({
  enableTargeting,
  setEnableTargeting,
  audience,
  setAudience,
}: TargetAudienceFormProps) {
  const toggleVal = (arr: string[], val: string) => {
    return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
  };

  const clearAll = () => {
    setAudience({ gender: [], employmentStatus: [], educationLevel: [], state: [], minAge: "", maxAge: "" });
  };

  const inputCls =
    "w-full bg-zinc-800/60 border border-zinc-700/60 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50 transition-colors";

  const btnCls = (isSelected: boolean, colorClass: string) =>
    `px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
      isSelected
        ? `${colorClass}/15 border-${colorClass}/50 text-${colorClass}-300`
        : "bg-zinc-800/50 border-zinc-700/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300"
    }`;

  return (
    <div className="backdrop-blur-md bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-zinc-300">Target Audience</h2>
          <p className="text-[11px] text-zinc-500 mt-0.5">Restrict this task to specific users based on profile</p>
        </div>
        <div
          onClick={() => setEnableTargeting(!enableTargeting)}
          className={`relative w-10 h-5 rounded-full transition-all cursor-pointer ${enableTargeting ? "bg-purple-500" : "bg-zinc-700"}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${enableTargeting ? "translate-x-5" : "translate-x-0"}`} />
        </div>
      </div>

      {enableTargeting && (
        <div className="border border-zinc-700/60 rounded-xl bg-zinc-800/30 p-5 space-y-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-zinc-550">Leaving a section empty means no filter on that dimension.</p>
            <button type="button" onClick={clearAll} className="text-[11px] text-zinc-500 hover:text-red-400 transition-colors">Clear all</button>
          </div>

          <div>
            <FieldLabel>Age Range</FieldLabel>
            <div className="flex items-center gap-3">
              <input
                type="number" min="1" max="100" value={audience.minAge}
                onChange={(e) => setAudience((a) => ({ ...a, minAge: e.target.value }))}
                placeholder="Min age" className={`${inputCls} flex-1`}
              />
              <span className="text-zinc-600 font-bold shrink-0">→</span>
              <input
                type="number" min="1" max="100" value={audience.maxAge}
                onChange={(e) => setAudience((a) => ({ ...a, maxAge: e.target.value }))}
                placeholder="Max age" className={`${inputCls} flex-1`}
              />
            </div>
          </div>

          <div>
            <FieldLabel>Gender</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {[["male", "Male", "purple"], ["female", "Female", "purple"], ["prefer_not_to_say", "Prefer not to say", "purple"]].map(([val, label, col]) => (
                <button
                  key={val} type="button" onClick={() => setAudience((a) => ({ ...a, gender: toggleVal(a.gender, val) }))}
                  className={btnCls(audience.gender.includes(val), col)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <FieldLabel>Employment Status</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {[["student", "Student", "blue"], ["working", "Working", "blue"], ["self_employed", "Self-employed", "blue"], ["unemployed", "Unemployed", "blue"]].map(([val, label, col]) => (
                <button
                  key={val} type="button" onClick={() => setAudience((a) => ({ ...a, employmentStatus: toggleVal(a.employmentStatus, val) }))}
                  className={btnCls(audience.employmentStatus.includes(val), col)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <FieldLabel>Education Level</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {[["ssce", "SSCE/WAEC", "amber"], ["university", "University", "amber"], ["polytechnic", "Polytechnic", "amber"], ["college", "College of Edu.", "amber"]].map(([val, label, col]) => (
                <button
                  key={val} type="button" onClick={() => setAudience((a) => ({ ...a, educationLevel: toggleVal(a.educationLevel, val) }))}
                  className={btnCls(audience.educationLevel.includes(val), col)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <FieldLabel>State of Residence</FieldLabel>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
              {NIGERIAN_STATES.map((state) => (
                <button
                  key={state} type="button" onClick={() => setAudience((a) => ({ ...a, state: toggleVal(a.state, state) }))}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-all ${
                    audience.state.includes(state)
                      ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-300"
                      : "bg-zinc-800/50 border-zinc-700/40 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300"
                  }`}
                >
                  {state}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
