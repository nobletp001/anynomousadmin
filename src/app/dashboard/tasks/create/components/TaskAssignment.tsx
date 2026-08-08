import React from "react";
import { FieldLabel } from "./FieldLabel";

interface TaskAssignmentProps {
  assignedOfficer: string;
  setAssignedOfficer: (v: string) => void;
  isForClient: boolean;
  setIsForClient: (v: boolean) => void;
  clientUsername: string;
  setClientUsername: (v: string) => void;
  clientAmountPaid: string;
  setClientAmountPaid: (v: string) => void;
  clientPricePerUser: string;
  setClientPricePerUser: (v: string) => void;
  officers: any[];
}

export function TaskAssignment({
  assignedOfficer,
  setAssignedOfficer,
  isForClient,
  setIsForClient,
  clientUsername,
  setClientUsername,
  clientAmountPaid,
  setClientAmountPaid,
  clientPricePerUser,
  setClientPricePerUser,
  officers,
}: TaskAssignmentProps) {
  return (
    <div className="backdrop-blur-md bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-6 space-y-4">
      <h2 className="text-sm font-semibold text-zinc-300 pb-2 border-b border-zinc-800">Task Assignment</h2>
      <div className="rounded-xl border border-sky-500/20 bg-sky-500/10 p-4">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={isForClient}
            onChange={(event) => setIsForClient(event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-zinc-600 bg-zinc-900 text-sky-500"
          />
          <span>
            <span className="block text-sm font-bold text-sky-100">Create this task for a client</span>
            <span className="mt-1 block text-xs leading-relaxed text-zinc-400">
              The task will appear on the client&apos;s business dashboard and still appear in admin. The client can
              review submissions from their own end while admin keeps final control.
            </span>
          </span>
        </label>
        {isForClient && (
          <div className="mt-4 space-y-4">
            <FieldLabel required>Client username</FieldLabel>
            <input
              value={clientUsername}
              onChange={(event) => setClientUsername(event.target.value)}
              placeholder="@clientusername"
              className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded-xl px-4 py-2.5 text-sm font-bold text-zinc-100 placeholder:text-zinc-650 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 transition-colors"
            />
            <p className="text-[11px] text-zinc-550 mt-1.5 leading-relaxed">
              Use the client&apos;s PayFluence username. Admin remains the verifier on the task record.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <FieldLabel required>Client amount paid</FieldLabel>
                <input
                  value={clientAmountPaid}
                  onChange={(event) => setClientAmountPaid(event.target.value)}
                  placeholder="30000"
                  inputMode="numeric"
                  className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded-xl px-4 py-2.5 text-sm font-bold text-zinc-100 placeholder:text-zinc-650 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 transition-colors"
                />
              </div>
              <div>
                <FieldLabel required>Client price per user</FieldLabel>
                <input
                  value={clientPricePerUser}
                  onChange={(event) => setClientPricePerUser(event.target.value)}
                  placeholder="300"
                  inputMode="numeric"
                  className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded-xl px-4 py-2.5 text-sm font-bold text-zinc-100 placeholder:text-zinc-650 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 transition-colors"
                />
              </div>
            </div>
          </div>
        )}
      </div>
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
          Select an officer to manage this task and verify submissions. If none is selected, the system will distribute
          the task to available task officers automatically.
        </p>
      </div>
    </div>
  );
}
