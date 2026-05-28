import React from "react";
import { FieldLabel } from "./FieldLabel";

interface TaskAssignmentProps {
  assignedOfficer: string;
  setAssignedOfficer: (v: string) => void;
  officers: any[];
}

export function TaskAssignment({ assignedOfficer, setAssignedOfficer, officers }: TaskAssignmentProps) {
  return (
    <div className="backdrop-blur-md bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-6 space-y-4">
      <h2 className="text-sm font-semibold text-zinc-300 pb-2 border-b border-zinc-800">Task Assignment</h2>
      <div>
        <FieldLabel>
          Assign to Task Officer <span className="text-zinc-600 font-normal">(optional)</span>
        </FieldLabel>
        <select
          value={assignedOfficer}
          onChange={(e) => setAssignedOfficer(e.target.value)}
          className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-650 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-colors"
        >
          <option value="">Auto-distribute to available officers</option>
          {officers &&
            officers.map((off: any) => (
              <option key={off.username} value={off.username}>
                {off.name} (@{off.username})
              </option>
            ))}
        </select>
        <p className="text-[11px] text-zinc-550 mt-1.5 leading-relaxed">
          Select an officer to manage this task and verify submissions. If none is selected, the system will
          distribute the task to available task officers automatically.
        </p>
      </div>
    </div>
  );
}
