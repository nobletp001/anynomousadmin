import React from "react";
import { Image as ImageIcon, Link as LinkIcon } from "lucide-react";
import { FieldLabel } from "./FieldLabel";
import { TASK_TYPES, PLATFORMS } from "../../types";
import { RichTextEditor } from "@/components/ui";

const inputCls =
  "w-full bg-zinc-800/60 border border-zinc-700/60 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-650 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-colors";

interface ConfigProps {
  editTaskType: string;
  setEditTaskType: (v: string) => void;
  editTargetPlatform: string;
  setEditTargetPlatform: (v: string) => void;
  editProofType: "banner" | "url";
  setEditProofType: (v: "banner" | "url") => void;
  editAcceptText: boolean;
  setEditAcceptText: React.Dispatch<React.SetStateAction<boolean>>;
  editTextLabel: string;
  setEditTextLabel: (v: string) => void;
  editAcceptNumber: boolean;
  setEditAcceptNumber: React.Dispatch<React.SetStateAction<boolean>>;
  editNumberLabel: string;
  setEditNumberLabel: (v: string) => void;
  editAcceptMultipleImages: boolean;
  setEditAcceptMultipleImages: React.Dispatch<React.SetStateAction<boolean>>;
  editIsTobeIncludereferralCount: boolean;
  setEditIsTobeIncludereferralCount: React.Dispatch<React.SetStateAction<boolean>>;
  editTargetCount: string;
  setEditTargetCount: (v: string) => void;
  editAdminContact: string;
  setEditAdminContact: (v: string) => void;
  editPrompts: string;
  setEditPrompts: (v: string) => void;
  editRequirePromptSelection: boolean;
  setEditRequirePromptSelection: React.Dispatch<React.SetStateAction<boolean>>;
  editMarketingText: string;
  setEditMarketingText: (v: string) => void;
  editCollectUserName: boolean;
  setEditCollectUserName: (v: boolean) => void;
  editTargetUsername: string;
  setEditTargetUsername: (v: string) => void;
  editIsSecureSpotTask: boolean;
  setEditIsSecureSpotTask: (v: boolean) => void;
  editSecureSpotIntervalType: "constant" | "minutes" | "days";
  setEditSecureSpotIntervalType: (v: "constant" | "minutes" | "days") => void;
  editSecureSpotInterval: string;
  setEditSecureSpotInterval: (v: string) => void;
  editSecureSpotConstantDelay: string;
  setEditSecureSpotConstantDelay: (v: string) => void;
}

export function Config({
  editTaskType,
  setEditTaskType,
  editTargetPlatform,
  setEditTargetPlatform,
  editProofType,
  setEditProofType,
  editAcceptText,
  setEditAcceptText,
  editTextLabel,
  setEditTextLabel,
  editAcceptNumber,
  setEditAcceptNumber,
  editNumberLabel,
  setEditNumberLabel,
  editAcceptMultipleImages,
  setEditAcceptMultipleImages,
  editIsTobeIncludereferralCount,
  setEditIsTobeIncludereferralCount,
  editTargetCount,
  setEditTargetCount,
  editAdminContact,
  setEditAdminContact,
  editPrompts,
  setEditPrompts,
  editRequirePromptSelection,
  setEditRequirePromptSelection,
  editMarketingText,
  setEditMarketingText,
  editCollectUserName,
  setEditCollectUserName,
  editTargetUsername,
  setEditTargetUsername,
  editIsSecureSpotTask,
  setEditIsSecureSpotTask,
  editSecureSpotIntervalType,
  setEditSecureSpotIntervalType,
  editSecureSpotInterval,
  setEditSecureSpotInterval,
  editSecureSpotConstantDelay,
  setEditSecureSpotConstantDelay,
}: ConfigProps) {
  const isUseApp = editTaskType === "use-app";

  return (
    <div className="backdrop-blur-md bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-5 space-y-4">
      <h2 className="text-sm font-semibold text-zinc-300 pb-2 border-b border-zinc-800/60">Task Configuration</h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel required>Task Type</FieldLabel>
          <select
            value={editTaskType}
            onChange={(e) => {
              setEditTaskType(e.target.value);
              setEditTargetPlatform(e.target.value === "use-app" ? "" : "instagram");
            }}
            className={inputCls}
          >
            {TASK_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          {isUseApp ? (
            <>
              <FieldLabel required>App Name</FieldLabel>
              <input
                value={editTargetPlatform}
                onChange={(e) => setEditTargetPlatform(e.target.value)}
                placeholder="e.g. Kena, OPay..."
                className={inputCls}
              />
            </>
          ) : (
            <>
              <FieldLabel required>Target Platform</FieldLabel>
              <select
                value={editTargetPlatform}
                onChange={(e) => setEditTargetPlatform(e.target.value)}
                className={inputCls}
              >
                {PLATFORMS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>
      </div>

      <div>
        <FieldLabel>Proof Method</FieldLabel>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setEditProofType("banner")}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
              editProofType === "banner"
                ? "bg-purple-500/10 border-purple-500/40 text-purple-300"
                : "bg-zinc-800/40 border-zinc-700/60 text-zinc-500 hover:border-zinc-600"
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 shrink-0" />
            <span className="font-bold text-[10px]">Screenshot</span>
          </button>
          <button
            type="button"
            onClick={() => setEditProofType("url")}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
              editProofType === "url"
                ? "bg-blue-500/10 border-blue-500/40 text-blue-300"
                : "bg-zinc-800/40 border-zinc-700/60 text-zinc-500 hover:border-zinc-600"
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5 shrink-0" />
            <span className="font-bold text-[10px]">URL / Link</span>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-400 font-medium">Collect Text</p>
            <p className="text-[11px] text-zinc-555 mt-0.5">Ask users to submit a WhatsApp number, username, etc.</p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none shrink-0">
            <span
              className={`text-xs font-semibold transition-colors ${editAcceptText ? "text-emerald-400" : "text-zinc-555"}`}
            >
              {editAcceptText ? "On" : "Off"}
            </span>
            <div
              onClick={() => {
                setEditAcceptText(!editAcceptText);
                if (editAcceptText) setEditTextLabel("");
              }}
              className={`relative w-9 h-5 rounded-full transition-all ${editAcceptText ? "bg-emerald-500" : "bg-zinc-700"}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${editAcceptText ? "translate-x-4" : "translate-x-0"}`}
              />
            </div>
          </label>
        </div>
        {editAcceptText && (
          <input
            value={editTextLabel}
            onChange={(e) => setEditTextLabel(e.target.value)}
            placeholder="e.g. WhatsApp Number, TikTok Username..."
            className={inputCls}
          />
        )}
      </div>

      <div className="space-y-3 pt-3 border-t border-zinc-800/40">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-400 font-medium">Collect Number (Views / Watch Hours)</p>
            <p className="text-[11px] text-zinc-555 mt-0.5">Ask users to submit a numeric value like views count.</p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none shrink-0">
            <span
              className={`text-xs font-semibold transition-colors ${editAcceptNumber ? "text-emerald-400" : "text-zinc-555"}`}
            >
              {editAcceptNumber ? "On" : "Off"}
            </span>
            <div
              onClick={() => {
                setEditAcceptNumber(!editAcceptNumber);
                if (editAcceptNumber) setEditNumberLabel("");
              }}
              className={`relative w-9 h-5 rounded-full transition-all ${editAcceptNumber ? "bg-emerald-500" : "bg-zinc-700"}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${editAcceptNumber ? "translate-x-4" : "translate-x-0"}`}
              />
            </div>
          </label>
        </div>
        {editAcceptNumber && (
          <input
            value={editNumberLabel}
            onChange={(e) => setEditNumberLabel(e.target.value)}
            placeholder="e.g. Number of Views, Watch Hours..."
            className={inputCls}
          />
        )}
      </div>

      <div className="space-y-3 pt-3 border-t border-zinc-800/40">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-400 font-medium">Accept Multiple Screenshot Proofs</p>
            <p className="text-[11px] text-zinc-555 mt-0.5">
              Allow users to upload up to 5 screenshots instead of one.
            </p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none shrink-0">
            <span
              className={`text-xs font-semibold transition-colors ${editAcceptMultipleImages ? "text-emerald-400" : "text-zinc-555"}`}
            >
              {editAcceptMultipleImages ? "On" : "Off"}
            </span>
            <div
              onClick={() => setEditAcceptMultipleImages(!editAcceptMultipleImages)}
              className={`relative w-9 h-5 rounded-full transition-all ${editAcceptMultipleImages ? "bg-emerald-500" : "bg-zinc-700"}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${editAcceptMultipleImages ? "translate-x-4" : "translate-x-0"}`}
              />
            </div>
          </label>
        </div>
      </div>

      <div className="space-y-3 pt-3 border-t border-zinc-800/40">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-400 font-medium">Include in Referral Count</p>
            <p className="text-[11px] text-zinc-555 mt-0.5">
              Release referral bonus to the referrer when users complete this task.
            </p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none shrink-0">
            <span
              className={`text-xs font-semibold transition-colors ${editIsTobeIncludereferralCount ? "text-emerald-400" : "text-zinc-555"}`}
            >
              {editIsTobeIncludereferralCount ? "On" : "Off"}
            </span>
            <div
              onClick={() => setEditIsTobeIncludereferralCount(!editIsTobeIncludereferralCount)}
              className={`relative w-9 h-5 rounded-full transition-all ${
                editIsTobeIncludereferralCount ? "bg-emerald-500" : "bg-zinc-700"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${
                  editIsTobeIncludereferralCount ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </div>
          </label>
        </div>
      </div>

      <div>
        <FieldLabel required={editTaskType === "views"}>
          Minimum View Count {editTaskType !== "views" && <span className="text-zinc-600 font-normal">(optional)</span>}
        </FieldLabel>
        <input
          type="number"
          min="1"
          value={editTargetCount}
          onChange={(e) => setEditTargetCount(e.target.value)}
          placeholder="e.g. 1000 (optional)"
          className={inputCls}
        />
      </div>

      {editTaskType === "jetpot" && (
        <div>
          <FieldLabel>
            Admin WhatsApp <span className="text-zinc-600 font-normal">(buyers message this number)</span>
          </FieldLabel>
          <input
            value={editAdminContact}
            onChange={(e) => setEditAdminContact(e.target.value)}
            placeholder="+2348..."
            className={inputCls}
          />
        </div>
      )}

      <div className="space-y-3 pt-3 border-t border-zinc-800/40">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-400 font-medium">Require Prompt Selection & Copy</p>
            <p className="text-[11px] text-zinc-555 mt-0.5">
              Force users to select and copy a prompt before submission.
            </p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none shrink-0">
            <span
              className={`text-xs font-semibold transition-colors ${editRequirePromptSelection ? "text-emerald-400" : "text-zinc-555"}`}
            >
              {editRequirePromptSelection ? "On" : "Off"}
            </span>
            <div
              onClick={() => setEditRequirePromptSelection(!editRequirePromptSelection)}
              className={`relative w-9 h-5 rounded-full transition-all ${editRequirePromptSelection ? "bg-emerald-500" : "bg-zinc-700"}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${editRequirePromptSelection ? "translate-x-4" : "translate-x-0"}`}
              />
            </div>
          </label>
        </div>
      </div>

      <div className="space-y-3 pt-3 border-t border-zinc-800/40">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-400 font-medium">Collect Target Username (collectUserName)</p>
            <p className="text-[11px] text-zinc-555 mt-0.5">
              Exclude users who have already done a task for this target username.
            </p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none shrink-0">
            <span
              className={`text-xs font-semibold transition-colors ${editCollectUserName ? "text-emerald-400" : "text-zinc-555"}`}
            >
              {editCollectUserName ? "On" : "Off"}
            </span>
            <div
              onClick={() => {
                setEditCollectUserName(!editCollectUserName);
                if (editCollectUserName) setEditTargetUsername("");
              }}
              className={`relative w-9 h-5 rounded-full transition-all ${editCollectUserName ? "bg-emerald-500" : "bg-zinc-700"}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${editCollectUserName ? "translate-x-4" : "translate-x-0"}`}
              />
            </div>
          </label>
        </div>
        {editCollectUserName && (
          <input
            value={editTargetUsername}
            onChange={(e) => setEditTargetUsername(e.target.value)}
            placeholder="Enter target username (e.g. johndoe)..."
            className={inputCls}
          />
        )}
      </div>

      <div>
        <FieldLabel>Client-Suggested Prompts (One per line)</FieldLabel>
        <textarea
          value={editPrompts}
          onChange={(e) => setEditPrompts(e.target.value)}
          placeholder="Paste the prompts or comments here, one per line..."
          rows={4}
          className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded-xl px-4 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-colors resize-none"
        />
      </div>

      <div>
        <FieldLabel>Copywriting / Marketing Text (Modal)</FieldLabel>
        <RichTextEditor value={editMarketingText} onChange={setEditMarketingText} placeholder="Write here..." />
      </div>

      {/* ── Secure-a-Spot ── */}
      <div className="pt-3 border-t border-zinc-800/40">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-300 font-semibold tracking-wide">🎯 Secure-a-Spot</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Users reserve a spot first, then get a unique random submission window for organic timing.
            </p>
          </div>
          <div
            onClick={() => setEditIsSecureSpotTask(!editIsSecureSpotTask)}
            className={`relative w-9 h-5 rounded-full transition-all cursor-pointer ${editIsSecureSpotTask ? "bg-purple-500" : "bg-zinc-700"}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${editIsSecureSpotTask ? "translate-x-4" : "translate-x-0"}`}
            />
          </div>
        </div>

        {editIsSecureSpotTask && (
          <div className="mt-3 space-y-3 rounded-2xl border border-zinc-700 bg-zinc-900/80 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <div>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Delay Mode</p>
              <div className="grid grid-cols-3 gap-2">
                {(["constant", "minutes", "days"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setEditSecureSpotIntervalType(type)}
                    className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                      editSecureSpotIntervalType === type
                        ? "bg-purple-500 text-black shadow-[0_0_12px_rgba(168,85,247,0.4)]"
                        : "bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-750 border border-zinc-700"
                    }`}
                  >
                    {type === "constant" ? "⏸ Fixed" : type === "minutes" ? "⏱ Minutes" : "📅 Days"}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-zinc-500 mt-2 leading-relaxed">
                {editSecureSpotIntervalType === "constant"
                  ? "Everyone waits the exact same fixed time — no randomness, fully predictable."
                  : editSecureSpotIntervalType === "minutes"
                    ? "Each user gets a private random window within the minute range you set."
                    : "Each user's window is scattered across the day span — great for longer campaigns."}
              </p>
            </div>

            {editSecureSpotIntervalType !== "constant" && (
              <div>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Max Window</p>
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    max={editSecureSpotIntervalType === "days" ? 100 : 1440}
                    value={editSecureSpotInterval}
                    onChange={(e) => setEditSecureSpotInterval(e.target.value)}
                    placeholder={editSecureSpotIntervalType === "days" ? "e.g. 7" : "e.g. 60"}
                    className={`${inputCls} pr-14`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-zinc-500">
                    {editSecureSpotIntervalType === "days" ? "days" : "min"}
                  </span>
                </div>
              </div>
            )}

            <div>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                {editSecureSpotIntervalType === "constant" ? "Fixed Wait" : "Min Wait"}
              </p>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  value={editSecureSpotConstantDelay}
                  onChange={(e) => setEditSecureSpotConstantDelay(e.target.value)}
                  placeholder={
                    editSecureSpotIntervalType === "constant"
                      ? "e.g. 60"
                      : editSecureSpotIntervalType === "days"
                        ? "e.g. 2"
                        : "e.g. 10"
                  }
                  className={`${inputCls} pr-14`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-zinc-500">
                  {editSecureSpotIntervalType === "days" ? "hrs" : "min"}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 rounded-xl bg-zinc-800/60 border border-zinc-700/50 px-3 py-2.5">
              <span className="text-purple-400 text-xs mt-px">→</span>
              <p className="text-[10px] text-zinc-400 leading-relaxed">
                {editSecureSpotIntervalType === "constant"
                  ? `All users wait exactly ${editSecureSpotConstantDelay || "X"} min before they can submit.`
                  : editSecureSpotIntervalType === "days"
                    ? `Random between ${editSecureSpotConstantDelay || "0"} hrs and ${editSecureSpotInterval || "N"} days. e.g. min 2 h, max 7 days → window opens somewhere in those 168 hrs.`
                    : `Random between ${editSecureSpotConstantDelay || "0"} min and ${editSecureSpotInterval || "N"} min. Each user gets a different slot.`}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
