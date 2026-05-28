import React from "react";
import { FieldLabel } from "./FieldLabel";
import { AudienceFilter, NIGERIAN_STATES } from "../../types";
import { toggle } from "../../utils";

const inputCls =
  "w-full bg-zinc-800/60 border border-zinc-700/60 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-colors";

interface TargetingProps {
  editEnableTargeting: boolean;
  setEditEnableTargeting: React.Dispatch<React.SetStateAction<boolean>>;
  editAudience: AudienceFilter;
  setEditAudience: React.Dispatch<React.SetStateAction<AudienceFilter>>;
}

export function Targeting({
  editEnableTargeting,
  setEditEnableTargeting,
  editAudience,
  setEditAudience,
}: TargetingProps) {
  const updateAudience = (key: keyof AudienceFilter, val: any) => {
    setEditAudience((prev) => ({ ...prev, [key]: val }));
  };

  const handleToggle = (key: keyof AudienceFilter, val: string) => {
    const current = editAudience[key] as string[];
    updateAudience(key, toggle(current, val));
  };

  return (
    <div className="backdrop-blur-md bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-zinc-300">Target Audience</h2>
          <p className="text-[11px] text-zinc-500 mt-0.5">Restrict this task to specific users based on their profile</p>
        </div>
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <span className={`text-xs font-semibold transition-colors ${editEnableTargeting ? "text-purple-400" : "text-zinc-500"}`}>
            {editEnableTargeting ? "Enabled" : "Disabled"}
          </span>
          <div
            onClick={() => setEditEnableTargeting(!editEnableTargeting)}
            className={`relative w-10 h-5 rounded-full transition-all ${editEnableTargeting ? "bg-purple-500" : "bg-zinc-700"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${editEnableTargeting ? "translate-x-5" : "translate-x-0"}`} />
          </div>
        </label>
      </div>

      {editEnableTargeting && (
        <div className="border border-zinc-700/60 rounded-xl bg-zinc-800/30 p-4 space-y-4">
          <div>
            <FieldLabel>Age Range</FieldLabel>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                max="100"
                value={editAudience.minAge}
                onChange={(e) => updateAudience("minAge", e.target.value)}
                placeholder="Min age"
                className={`${inputCls} flex-1`}
              />
              <span className="text-zinc-650 font-bold shrink-0">→</span>
              <input
                type="number"
                min="1"
                max="100"
                value={editAudience.maxAge}
                onChange={(e) => updateAudience("maxAge", e.target.value)}
                placeholder="Max age"
                className={`${inputCls} flex-1`}
              />
            </div>
          </div>

          <div>
            <FieldLabel>Gender</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {[
                ["male", "👨 Male"],
                ["female", "👩 Female"],
                ["prefer_not_to_say", "🤔 Prefer not to say"],
              ].map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleToggle("gender", val)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    editAudience.gender.includes(val)
                      ? "bg-purple-500/15 border-purple-500/50 text-purple-300"
                      : "bg-zinc-800/50 border-zinc-700/50 text-zinc-450 hover:text-zinc-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <FieldLabel>Employment Status</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {[
                ["student", "🎓 Student"],
                ["working", "💼 Working"],
                ["self_employed", "🧑‍💻 Self-employed"],
                ["unemployed", "🔍 Unemployed"],
              ].map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleToggle("employmentStatus", val)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    editAudience.employmentStatus.includes(val)
                      ? "bg-blue-500/15 border-blue-500/50 text-blue-300"
                      : "bg-zinc-800/50 border-zinc-700/50 text-zinc-455 hover:text-zinc-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <FieldLabel>Education Level</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {[
                ["ssce", "SSCE"],
                ["university", "University"],
                ["polytechnic", "Polytechnic"],
                ["college", "College"],
              ].map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleToggle("educationLevel", val)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    editAudience.educationLevel.includes(val)
                      ? "bg-amber-500/15 border-amber-500/50 text-amber-300"
                      : "bg-zinc-800/50 border-zinc-700/50 text-zinc-455 hover:text-zinc-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <FieldLabel>State of Residence</FieldLabel>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
              {NIGERIAN_STATES.map((state) => (
                <button
                  key={state}
                  type="button"
                  onClick={() => handleToggle("state", state)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-semibold border transition-all ${
                    editAudience.state.includes(state)
                      ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-300"
                      : "bg-zinc-800/50 border-zinc-700/40 text-zinc-550 hover:text-zinc-300"
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
