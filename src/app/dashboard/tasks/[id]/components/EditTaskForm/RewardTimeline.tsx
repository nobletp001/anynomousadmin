import React from "react";
import { Infinity as InfinityIcon } from "lucide-react";
import { FieldLabel } from "./FieldLabel";

const inputCls =
  "w-full bg-zinc-800/60 border border-zinc-700/60 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-colors";

interface RewardTimelineProps {
  taskApprovedCount: number;
  editNumberOfUsers: string;
  setEditNumberOfUsers: (v: string) => void;
  editAmount: string;
  setEditAmount: (v: string) => void;
  editMaxPerHour: string;
  setEditMaxPerHour: (v: string) => void;
  editNoExpiry: boolean;
  setEditNoExpiry: React.Dispatch<React.SetStateAction<boolean>>;
  editTimeline: string;
  setEditTimeline: (v: string) => void;
  editAssignedOfficer: string;
  setEditAssignedOfficer: (v: string) => void;
  officers: any[];
  editScheduledAt: string;
  setEditScheduledAt: (v: string) => void;
  editIsPinned: boolean;
  setEditIsPinned: (v: boolean) => void;
}

export function RewardTimeline({
  taskApprovedCount,
  editNumberOfUsers,
  setEditNumberOfUsers,
  editAmount,
  setEditAmount,
  editMaxPerHour,
  setEditMaxPerHour,
  editNoExpiry,
  setEditNoExpiry,
  editTimeline,
  setEditTimeline,
  editAssignedOfficer,
  setEditAssignedOfficer,
  officers,
  editScheduledAt,
  setEditScheduledAt,
  editIsPinned,
  setEditIsPinned,
}: RewardTimelineProps) {
  const [scheduleDate, setScheduleDate] = React.useState("");
  const [scheduleTime, setScheduleTime] = React.useState("");

  React.useEffect(() => {
    if (editScheduledAt) {
      const parts = editScheduledAt.split(/[T ]/);
      const date = parts[0] || "";
      const time = parts[1] ? parts[1].slice(0, 5) : "";
      setScheduleDate(date);
      setScheduleTime(time);
    } else {
      setScheduleDate("");
      setScheduleTime("");
    }
  }, [editScheduledAt]);

  const handleDateTimeChange = (dateVal: string, timeVal: string) => {
    setScheduleDate(dateVal);
    setScheduleTime(timeVal);
    if (dateVal) {
      const t = timeVal || "12:00";
      setEditScheduledAt(`${dateVal}T${t}`);
    } else {
      setEditScheduledAt("");
    }
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
    <div className="backdrop-blur-md bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-5 space-y-4">
      <h2 className="text-sm font-semibold text-zinc-300 pb-2 border-b border-zinc-800/60">Reward &amp; Timeline</h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel required>Capacity (Users Needed)</FieldLabel>
          <input
            type="number"
            min={taskApprovedCount}
            value={editNumberOfUsers}
            onChange={(e) => setEditNumberOfUsers(e.target.value)}
            className={inputCls}
          />
          <p className="text-[10px] text-zinc-500 mt-1">Must be at least the approved count ({taskApprovedCount})</p>
        </div>

        <div>
          <FieldLabel required>Reward Amount (₦)</FieldLabel>
          <input
            type="number"
            min="1"
            value={editAmount}
            onChange={(e) => setEditAmount(e.target.value)}
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <FieldLabel>
          Hourly Completion Limit <span className="text-zinc-650 font-normal">(optional)</span>
        </FieldLabel>
        <input
          type="number"
          min="1"
          value={editMaxPerHour}
          onChange={(e) => setEditMaxPerHour(e.target.value)}
          placeholder="Unlimited"
          className={inputCls}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <FieldLabel>Task Duration</FieldLabel>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <span
              className={`text-xs font-semibold transition-colors ${editNoExpiry ? "text-violet-400" : "text-zinc-500"}`}
            >
              No expiry
            </span>
            <div
              onClick={() => setEditNoExpiry(!editNoExpiry)}
              className={`relative w-9 h-5 rounded-full transition-all ${editNoExpiry ? "bg-violet-500" : "bg-zinc-700"}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-all shadow ${editNoExpiry ? "translate-x-4" : "translate-x-0"}`}
              />
            </div>
            <InfinityIcon
              className={`w-4 h-4 transition-colors ${editNoExpiry ? "text-violet-400" : "text-zinc-600"}`}
            />
          </label>
        </div>
        {!editNoExpiry && (
          <input
            type="date"
            value={editTimeline}
            onChange={(e) => setEditTimeline(e.target.value)}
            className={inputCls}
          />
        )}
      </div>

      <div>
        <FieldLabel>
          Schedule Task Start <span className="text-zinc-650 font-normal">(optional — future start time)</span>
        </FieldLabel>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-[10px] font-medium text-zinc-500 mb-1 block">Start Date</span>
            <input
              type="date"
              value={scheduleDate}
              onChange={(e) => handleDateTimeChange(e.target.value, scheduleTime)}
              min={getLocalMinDateTime().split("T")[0]}
              className={inputCls}
            />
          </div>
          <div>
            <span className="text-[10px] font-medium text-zinc-500 mb-1 block">Start Time</span>
            <input
              type="time"
              value={scheduleTime}
              onChange={(e) => handleDateTimeChange(scheduleDate, e.target.value)}
              className={inputCls}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <FieldLabel>Pin Task to Top</FieldLabel>
        <div
          className="flex items-center gap-2 cursor-pointer select-none"
          onClick={() => setEditIsPinned(!editIsPinned)}
        >
          <span
            className={`text-xs font-semibold transition-colors ${editIsPinned ? "text-amber-400" : "text-zinc-500"}`}
          >
            {editIsPinned ? "Pinned" : "Not Pinned"}
          </span>
          <div
            className={`relative w-9 h-5 rounded-full transition-all ${editIsPinned ? "bg-amber-500" : "bg-zinc-700"}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-all shadow ${editIsPinned ? "translate-x-4" : "translate-x-0"}`}
            />
          </div>
        </div>
      </div>

      <div>
        <FieldLabel>Auditor (Assigned Officer)</FieldLabel>
        <select
          value={editAssignedOfficer}
          onChange={(e) => setEditAssignedOfficer(e.target.value)}
          className={inputCls}
        >
          <option value="">Auto-distribute to available officers</option>
          {officers.map((off: any) => (
            <option key={off.username} value={off.username}>
              {off.name} (@{off.username})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
