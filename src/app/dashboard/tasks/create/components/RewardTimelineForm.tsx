import React from "react";
import { Info, Infinity as InfinityIcon } from "lucide-react";
import { FieldLabel } from "./FieldLabel";
import { TIMELINE_OPTIONS } from "../constants/base";

interface RewardTimelineFormProps {
  amount: string;
  setAmount: (v: string) => void;
  numberOfUsersNeeded: string;
  setNumberOfUsersNeeded: (v: string) => void;
  maxPerHour: string;
  setMaxPerHour: (v: string) => void;
  noExpiry: boolean;
  setNoExpiry: (v: boolean) => void;
  timelineMs: number;
  setTimelineMs: (v: number) => void;
}

export function RewardTimelineForm({
  amount, setAmount,
  numberOfUsersNeeded, setNumberOfUsersNeeded,
  maxPerHour, setMaxPerHour,
  noExpiry, setNoExpiry,
  timelineMs, setTimelineMs,
}: RewardTimelineFormProps) {
  const inputCls =
    "w-full bg-zinc-800/60 border border-zinc-700/60 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-650 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-colors";

  const fmt = (n: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(n);
  };

  return (
    <div className="backdrop-blur-md bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-6 space-y-4">
      <h2 className="text-sm font-semibold text-zinc-300 pb-2 border-b border-zinc-800">Reward &amp; Timeline</h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel required>Amount per User (₦)</FieldLabel>
          <input
            type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)}
            placeholder="500" className={inputCls}
          />
        </div>
        <div>
          <FieldLabel required>Users Needed</FieldLabel>
          <input
            type="number" min="1" value={numberOfUsersNeeded} onChange={(e) => setNumberOfUsersNeeded(e.target.value)}
            placeholder="50" className={inputCls}
          />
        </div>
      </div>

      <div>
        <FieldLabel>Hourly Completion Limit <span className="text-zinc-600 font-normal">(optional — drip feed)</span></FieldLabel>
        <input
          type="number" min="1" value={maxPerHour} onChange={(e) => setMaxPerHour(e.target.value)}
          placeholder="e.g. 20 (leave blank for unlimited)" className={inputCls}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <FieldLabel>Task Duration</FieldLabel>
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setNoExpiry(!noExpiry)}>
            <span className={`text-xs font-semibold transition-colors ${noExpiry ? "text-violet-400" : "text-zinc-500"}`}>
              No expiry
            </span>
            <div className={`relative w-9 h-5 rounded-full transition-all ${noExpiry ? "bg-violet-500" : "bg-zinc-700"}`}>
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-all shadow ${noExpiry ? "translate-x-4" : "translate-x-0"}`} />
            </div>
            <InfinityIcon className={`w-4 h-4 transition-colors ${noExpiry ? "text-violet-400" : "text-zinc-650"}`} />
          </div>
        </div>
        <select
          value={timelineMs} onChange={(e) => setTimelineMs(Number(e.target.value))} disabled={noExpiry}
          className={`${inputCls} ${noExpiry ? "opacity-40 cursor-not-allowed" : ""}`}
        >
          {TIMELINE_OPTIONS.map((opt) => (
            <option key={opt.ms} value={opt.ms}>{opt.label}</option>
          ))}
        </select>
        <p className="text-[11px] text-zinc-605 mt-1.5 leading-relaxed">
          {noExpiry
            ? "Task stays active until you manually close it."
            : `Task closes ${TIMELINE_OPTIONS.find((o) => o.ms === timelineMs)?.label} from creation`}
        </p>
      </div>

      {Number(amount) > 0 && Number(numberOfUsersNeeded) > 0 && (
        <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-purple-500/5 border border-purple-500/20">
          <Info className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
          <p className="text-xs text-zinc-400">
            Total payout exposure:{" "}
            <span className="font-semibold text-purple-300">
              {fmt(Number(amount) * Number(numberOfUsersNeeded))}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
