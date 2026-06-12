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
  setNoExpiry: React.Dispatch<React.SetStateAction<boolean>>;
  timelineMs: number;
  setTimelineMs: (v: number) => void;
  isPayFluenceTask: boolean;
  setIsPayFluenceTask: (v: boolean) => void;
  volutterPayFluenceTaskPerformNumber: string;
  setVolutterPayFluenceTaskPerformNumber: (v: string) => void;
  scheduledAt: string;
  setScheduledAt: (v: string) => void;
  isPinned: boolean;
  setIsPinned: (v: boolean) => void;
}

export function RewardTimelineForm({
  amount,
  setAmount,
  numberOfUsersNeeded,
  setNumberOfUsersNeeded,
  maxPerHour,
  setMaxPerHour,
  noExpiry,
  setNoExpiry,
  timelineMs,
  setTimelineMs,
  isPayFluenceTask,
  setIsPayFluenceTask,
  volutterPayFluenceTaskPerformNumber,
  setVolutterPayFluenceTaskPerformNumber,
  scheduledAt,
  setScheduledAt,
  isPinned,
  setIsPinned,
}: RewardTimelineFormProps) {
  const inputCls =
    "w-full bg-zinc-800/60 border border-zinc-700/60 rounded-xl px-4 py-2.5 text-sm text-zinc-105 placeholder:text-zinc-655 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-colors";

  const [scheduleDate, setScheduleDate] = React.useState("");
  const [scheduleHour, setScheduleHour] = React.useState("12");
  const [scheduleMinute, setScheduleMinute] = React.useState("00");
  const [schedulePeriod, setSchedulePeriod] = React.useState("PM");

  React.useEffect(() => {
    if (scheduledAt) {
      const parts = scheduledAt.split(/[T ]/);
      const date = parts[0] || "";
      setScheduleDate(date);

      const time = parts[1] || "";
      if (time) {
        const [h24, m] = time.split(":");
        const h24Num = parseInt(h24) || 0;
        const mStr = m ? m.slice(0, 2) : "00";

        let h12 = h24Num % 12;
        if (h12 === 0) h12 = 12;
        const period = h24Num >= 12 ? "PM" : "AM";

        setScheduleHour(String(h12).padStart(2, "0"));
        setScheduleMinute(mStr);
        setSchedulePeriod(period);
      }
    } else {
      setScheduleDate("");
      setScheduleHour("12");
      setScheduleMinute("00");
      setSchedulePeriod("PM");
    }
  }, [scheduledAt]);

  const updateDateTime = (dateVal: string, hourVal: string, minVal: string, periodVal: string) => {
    setScheduleDate(dateVal);
    if (dateVal) {
      let h24 = parseInt(hourVal) || 12;
      if (periodVal === "PM" && h24 < 12) {
        h24 += 12;
      } else if (periodVal === "AM" && h24 === 12) {
        h24 = 0;
      }
      const h24Str = String(h24).padStart(2, "0");
      const mStr = minVal.padStart(2, "0");
      setScheduledAt(`${dateVal}T${h24Str}:${mStr}`);
    } else {
      setScheduledAt("");
    }
  };

  const fmt = (n: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(n);
  };

  const getLocalMinDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return (
    <div className="backdrop-blur-md bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-300">Reward &amp; Timeline</h2>
        <div
          className="flex items-center gap-2 cursor-pointer select-none"
          onClick={() => setIsPayFluenceTask(!isPayFluenceTask)}
        >
          <span
            className={`text-xs font-semibold transition-colors ${isPayFluenceTask ? "text-purple-400" : "text-zinc-500"}`}
          >
            PayFluence Task (Free/Volunteer)
          </span>
          <div
            className={`relative w-9 h-5 rounded-full transition-all ${isPayFluenceTask ? "bg-purple-500" : "bg-zinc-700"}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-all shadow ${isPayFluenceTask ? "translate-x-4" : "translate-x-0"}`}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel required>Amount per User (₦)</FieldLabel>
          <input
            type="number"
            min={isPayFluenceTask ? "0" : "1"}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={isPayFluenceTask ? "0 (Volunteer Task)" : "500"}
            className={inputCls}
          />
        </div>
        <div>
          <FieldLabel required>Users Needed</FieldLabel>
          <input
            type="number"
            min="1"
            value={numberOfUsersNeeded}
            onChange={(e) => setNumberOfUsersNeeded(e.target.value)}
            placeholder="50"
            className={inputCls}
          />
        </div>
      </div>

      {isPayFluenceTask && (
        <div>
          <FieldLabel required>Volunteer Task Perform Number</FieldLabel>
          <input
            type="number"
            min="0"
            value={volutterPayFluenceTaskPerformNumber}
            onChange={(e) => setVolutterPayFluenceTaskPerformNumber(e.target.value)}
            placeholder="e.g. 5"
            className={inputCls}
          />
          <p className="text-[10px] text-zinc-500 leading-normal">
            Specify the volunteer performance number representing this volunteer campaign identifier.
          </p>
        </div>
      )}

      <div>
        <FieldLabel>
          Hourly Completion Limit <span className="text-zinc-600 font-normal">(optional — drip feed)</span>
        </FieldLabel>
        <input
          type="number"
          min="1"
          value={maxPerHour}
          onChange={(e) => setMaxPerHour(e.target.value)}
          placeholder="e.g. 20 (leave blank for unlimited)"
          className={inputCls}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <FieldLabel>Task Duration</FieldLabel>
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setNoExpiry(!noExpiry)}>
            <span
              className={`text-xs font-semibold transition-colors ${noExpiry ? "text-violet-400" : "text-zinc-500"}`}
            >
              No expiry
            </span>
            <div
              className={`relative w-9 h-5 rounded-full transition-all ${noExpiry ? "bg-violet-500" : "bg-zinc-700"}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-all shadow ${noExpiry ? "translate-x-4" : "translate-x-0"}`}
              />
            </div>
            <InfinityIcon className={`w-4 h-4 transition-colors ${noExpiry ? "text-violet-400" : "text-zinc-650"}`} />
          </div>
        </div>
        <select
          value={timelineMs}
          onChange={(e) => setTimelineMs(Number(e.target.value))}
          disabled={noExpiry}
          className={`${inputCls} ${noExpiry ? "opacity-40 cursor-not-allowed" : ""}`}
        >
          {TIMELINE_OPTIONS.map((opt) => (
            <option key={opt.ms} value={opt.ms}>
              {opt.label}
            </option>
          ))}
        </select>
        <p className="text-[11px] text-zinc-605 mt-1.5 leading-relaxed">
          {noExpiry
            ? "Task stays active until you manually close it."
            : `Task closes ${TIMELINE_OPTIONS.find((o) => o.ms === timelineMs)?.label} from creation`}
        </p>
      </div>

      <div>
        <FieldLabel>
          Schedule Task Start <span className="text-zinc-600 font-normal">(optional — future start time)</span>
        </FieldLabel>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-[10px] font-medium text-zinc-500 mb-1 block">Start Date</span>
            <input
              type="date"
              value={scheduleDate}
              onChange={(e) => updateDateTime(e.target.value, scheduleHour, scheduleMinute, schedulePeriod)}
              min={getLocalMinDateTime().split("T")[0]}
              className={inputCls}
            />
          </div>
          <div>
            <span className="text-[10px] font-medium text-zinc-500 mb-1 block">Start Time</span>
            <div className="flex gap-1">
              <select
                value={scheduleHour}
                onChange={(e) => {
                  setScheduleHour(e.target.value);
                  updateDateTime(scheduleDate, e.target.value, scheduleMinute, schedulePeriod);
                }}
                className="bg-zinc-800/60 border border-zinc-700/60 rounded-xl px-2 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-purple-500/50 transition-colors w-[34%]"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => {
                  const val = String(h).padStart(2, "0");
                  return (
                    <option key={val} value={val}>
                      {val}
                    </option>
                  );
                })}
              </select>
              <span className="text-zinc-500 self-center font-bold px-0.5">:</span>
              <select
                value={scheduleMinute}
                onChange={(e) => {
                  setScheduleMinute(e.target.value);
                  updateDateTime(scheduleDate, scheduleHour, e.target.value, schedulePeriod);
                }}
                className="bg-zinc-800/60 border border-zinc-700/60 rounded-xl px-2 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-purple-500/50 transition-colors w-[34%]"
              >
                {Array.from({ length: 60 }, (_, i) => i).map((m) => {
                  const val = String(m).padStart(2, "0");
                  return (
                    <option key={val} value={val}>
                      {val}
                    </option>
                  );
                })}
              </select>
              <select
                value={schedulePeriod}
                onChange={(e) => {
                  setSchedulePeriod(e.target.value);
                  updateDateTime(scheduleDate, scheduleHour, scheduleMinute, e.target.value);
                }}
                className="bg-zinc-800/60 border border-zinc-700/60 rounded-xl px-2 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-purple-500/50 transition-colors w-[28%]"
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <FieldLabel>Pin Task to Top</FieldLabel>
        <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => setIsPinned(!isPinned)}>
          <span className={`text-xs font-semibold transition-colors ${isPinned ? "text-amber-400" : "text-zinc-500"}`}>
            {isPinned ? "Pinned" : "Not Pinned"}
          </span>
          <div className={`relative w-9 h-5 rounded-full transition-all ${isPinned ? "bg-amber-500" : "bg-zinc-700"}`}>
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-all shadow ${isPinned ? "translate-x-4" : "translate-x-0"}`}
            />
          </div>
        </div>
      </div>

      {Number(amount) > 0 && Number(numberOfUsersNeeded) > 0 && (
        <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-purple-500/5 border border-purple-500/20">
          <Info className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
          <p className="text-xs text-zinc-400">
            Total payout exposure:{" "}
            <span className="font-semibold text-purple-300">{fmt(Number(amount) * Number(numberOfUsersNeeded))}</span>
          </p>
        </div>
      )}
    </div>
  );
}
