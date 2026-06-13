import { CreditCard, Eye, ShieldOff, X, ExternalLink, Star } from "lucide-react";
import { formatDate } from "../utils";
import { SubmissionItem } from "./SubmissionItem";

interface AccountColumnProps {
  user: any;
  bankDetails: any;
  submissions: any[];
  onToggleWatch: (username: string, monitored: boolean) => void;
  onToggleDisable: (id: number, disabled: boolean) => void;
  onToggleTaskDisabled: (id: number, disabled: boolean) => void;
  onToggleWithdrawalDisabled: (id: number, disabled: boolean) => void;
  onZoom: (img: string, index: number, allImages: string[]) => void;
}

export function AccountColumn({
  user,
  bankDetails,
  submissions,
  onToggleWatch,
  onToggleDisable,
  onToggleTaskDisabled,
  onToggleWithdrawalDisabled,
  onZoom,
}: AccountColumnProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-5 flex flex-col h-full">
      {/* Header Info */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-violet-500/15 border border-violet-500/20 flex items-center justify-center font-bold text-violet-400 text-base shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-bold text-zinc-200 truncate">{user.name}</p>
              {user.monitored && (
                <span className="px-1.5 py-0.5 rounded bg-violet-500/15 text-violet-400 border border-violet-500/30 text-[9px] font-bold uppercase shrink-0">
                  Watched
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 truncate">
              @{user.username} · {user.email}
            </p>
            <div className="text-[10px] text-zinc-650 mt-0.5 flex items-center gap-1 flex-wrap">
              <span>Joined: {formatDate(user.createdAt)}</span>
              <span>·</span>
              <span className="flex items-center gap-0.5">
                Rating: <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400 shrink-0" />
                {user.rating}
              </span>
            </div>
          </div>
        </div>
        <div className="shrink-0">
          <span
            className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${user.disabled ? "bg-red-500/15 text-red-400 border-red-500/30" : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"}`}
          >
            {user.disabled ? "Disabled" : "Active"}
          </span>
        </div>
      </div>

      {/* Network metadata */}
      <div className="grid grid-cols-2 gap-3 text-xs bg-zinc-950/30 p-3 rounded-xl border border-zinc-800/60 font-mono">
        <div className="min-w-0">
          <p className="text-zinc-600 font-bold text-[9px] uppercase tracking-wider">Reg IP</p>
          <p className="text-zinc-300 truncate mt-0.5">{user.registerIp || "N/A"}</p>
        </div>
        <div className="min-w-0">
          <p className="text-zinc-600 font-bold text-[9px] uppercase tracking-wider">Reg Device</p>
          <p className="text-zinc-300 truncate mt-0.5" title={user.deviceId}>
            {user.deviceId ? `${user.deviceId.substring(0, 12)}...` : "N/A"}
          </p>
        </div>
      </div>

      {/* Bank info */}
      {bankDetails ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-800/60 pb-1.5">
            <CreditCard className="w-3.5 h-3.5 text-amber-400" />
            Bank Details
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-zinc-600 text-[10px]">Bank Name</p>
              <p className="text-zinc-300 font-semibold">{bankDetails.bankName}</p>
            </div>
            <div>
              <p className="text-zinc-600 text-[10px]">Account Number</p>
              <p className="text-zinc-300 font-mono font-semibold">{bankDetails.accountNumber}</p>
            </div>
            <div className="col-span-2">
              <p className="text-zinc-600 text-[10px]">Account Name</p>
              <p className="text-zinc-300 font-semibold">{bankDetails.accountName}</p>
            </div>
            <div className="col-span-2">
              <p className="text-zinc-600 text-[10px]">WhatsApp Number</p>
              <a
                href={`https://wa.me/${bankDetails.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-400 font-semibold hover:text-violet-300 transition-colors inline-flex items-center gap-1 mt-0.5"
              >
                {bankDetails.whatsappNumber}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/20 p-4 text-center text-xs text-zinc-650 italic">
          No bank details registered
        </div>
      )}

      {/* Actions */}
      <div className="space-y-2">
        <p className="text-[10px] font-bold text-zinc-550 uppercase tracking-wider">Account Control Decisions</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onToggleWatch(user.username, user.monitored)}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${user.monitored ? "bg-violet-600 text-white border-violet-500 hover:bg-violet-500" : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-750"}`}
          >
            <Eye className="w-3.5 h-3.5" />
            {user.monitored ? "Stop Monitoring" : "Watch User"}
          </button>
          <button
            onClick={() => onToggleDisable(user.id, user.disabled)}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${user.disabled ? "bg-red-600 text-white border-red-500 hover:bg-red-500" : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-755"}`}
          >
            <ShieldOff className="w-3.5 h-3.5" />
            {user.disabled ? "Enable Account" : "Disable Account"}
          </button>
          <button
            onClick={() => onToggleTaskDisabled(user.id, user.taskDisabled)}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${user.taskDisabled ? "bg-amber-600 text-white border-amber-500 hover:bg-amber-500" : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-755"}`}
          >
            <X className="w-3.5 h-3.5" />
            {user.taskDisabled ? "Enable Tasks" : "Disable Tasks"}
          </button>
          <button
            onClick={() => onToggleWithdrawalDisabled(user.id, user.withdrawalDisabled)}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${user.withdrawalDisabled ? "bg-orange-600 text-white border-orange-500 hover:bg-orange-500" : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-755"}`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            {user.withdrawalDisabled ? "Enable Cashout" : "Disable Cashout"}
          </button>
        </div>
      </div>

      {/* Submissions list */}
      <div className="flex-1 flex flex-col min-h-[300px]">
        <div className="border-b border-zinc-800 pb-2 mb-3">
          <p className="text-xs font-bold text-zinc-300">Task Submission History ({submissions.length})</p>
        </div>
        {submissions.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-xs text-zinc-650 italic py-12">
            No submissions recorded
          </div>
        ) : (
          <div className="space-y-3 overflow-y-auto max-h-[500px] pr-1 scrollbar-thin">
            {submissions.map((sub) => (
              <SubmissionItem key={sub.id} sub={sub} onZoom={onZoom} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
