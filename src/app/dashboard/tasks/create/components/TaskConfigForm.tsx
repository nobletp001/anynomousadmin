import React from "react";
import { Image as ImageIcon, Link as LinkIcon } from "lucide-react";
import { FieldLabel } from "./FieldLabel";
import { TASK_TYPES, PLATFORMS } from "../constants/base";
import { RichTextEditor } from "@/components/ui";

interface TaskConfigFormProps {
  taskType: string;
  setTaskType: (v: string) => void;
  targetPlatform: string;
  setTargetPlatform: (v: string) => void;
  proofType: "banner" | "url";
  setProofType: (v: "banner" | "url") => void;
  acceptText: boolean;
  setAcceptText: (v: boolean) => void;
  textLabel: string;
  setTextLabel: (v: string) => void;
  acceptNumber: boolean;
  setAcceptNumber: (v: boolean) => void;
  numberLabel: string;
  setNumberLabel: (v: string) => void;
  acceptMultipleImages: boolean;
  setAcceptMultipleImages: React.Dispatch<React.SetStateAction<boolean>>;
  isTobeIncludereferralCount: boolean;
  setIsTobeIncludereferralCount: (v: boolean) => void;
  targetCount: string;
  setTargetCount: (v: string) => void;
  adminContact: string;
  setAdminContact: (v: string) => void;
  prompts: string;
  setPrompts: (v: string) => void;
  requirePromptSelection: boolean;
  setRequirePromptSelection: (v: boolean) => void;
  marketingText: string;
  setMarketingText: (v: string) => void;
  collectUserName: boolean;
  setCollectUserName: (v: boolean) => void;
  targetUsername: string;
  setTargetUsername: (v: string) => void;
  isSecureSpotTask: boolean;
  setIsSecureSpotTask: (v: boolean) => void;
  secureSpotIntervalType: "constant" | "minutes" | "days";
  setSecureSpotIntervalType: (v: "constant" | "minutes" | "days") => void;
  secureSpotInterval: string;
  setSecureSpotInterval: (v: string) => void;
  secureSpotConstantDelay: string;
  setSecureSpotConstantDelay: (v: string) => void;
  additionalSlots: string;
  setAdditionalSlots: (v: string) => void;
  blockSameDevice: boolean;
  setBlockSameDevice: (v: boolean) => void;
}

export function TaskConfigForm({
  taskType,
  setTaskType,
  targetPlatform,
  setTargetPlatform,
  proofType,
  setProofType,
  acceptText,
  setAcceptText,
  textLabel,
  setTextLabel,
  acceptNumber,
  setAcceptNumber,
  numberLabel,
  setNumberLabel,
  acceptMultipleImages,
  setAcceptMultipleImages,
  isTobeIncludereferralCount,
  setIsTobeIncludereferralCount,
  targetCount,
  setTargetCount,
  adminContact,
  setAdminContact,
  prompts,
  setPrompts,
  requirePromptSelection,
  setRequirePromptSelection,
  marketingText,
  setMarketingText,
  collectUserName,
  setCollectUserName,
  targetUsername,
  setTargetUsername,
  isSecureSpotTask,
  setIsSecureSpotTask,
  secureSpotIntervalType,
  setSecureSpotIntervalType,
  secureSpotInterval,
  setSecureSpotInterval,
  secureSpotConstantDelay,
  setSecureSpotConstantDelay,
  additionalSlots,
  setAdditionalSlots,
  blockSameDevice,
  setBlockSameDevice,
}: TaskConfigFormProps) {
  const isJetpot = taskType === "jetpot";
  const isViews = taskType === "views";
  const inputCls =
    "w-full bg-zinc-800/60 border border-zinc-700/60 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-colors";

  return (
    <div className="backdrop-blur-md bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-6 space-y-4">
      <h2 className="text-sm font-semibold text-zinc-300 pb-2 border-b border-zinc-800">Task Configuration</h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel required>Task Type</FieldLabel>
          <select
            value={taskType}
            onChange={(e) => {
              const t = e.target.value;
              setTaskType(t);
              setTargetPlatform(t === "use-app" ? "" : "instagram");
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
          {taskType === "use-app" ? (
            <>
              <FieldLabel required>App Name</FieldLabel>
              <input
                value={targetPlatform}
                onChange={(e) => setTargetPlatform(e.target.value)}
                placeholder="e.g. Kena, Moniass, OPay..."
                className={inputCls}
              />
            </>
          ) : (
            <>
              <FieldLabel required>Target Platform</FieldLabel>
              <select value={targetPlatform} onChange={(e) => setTargetPlatform(e.target.value)} className={inputCls}>
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
        <FieldLabel>Proof method</FieldLabel>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setProofType("banner")}
            className={`flex items-center gap-2 px-3 py-3 rounded-xl border text-sm font-semibold transition-all ${
              proofType === "banner"
                ? "bg-purple-500/10 border-purple-500/40 text-purple-300"
                : "bg-zinc-800/40 border-zinc-700/60 text-zinc-550 hover:border-zinc-655"
            }`}
          >
            <ImageIcon className="w-4 h-4 shrink-0" />
            <div className="text-left">
              <p className="text-xs font-bold">Screenshot</p>
              <p className="text-[10px] font-normal opacity-70">User uploads image</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setProofType("url")}
            className={`flex items-center gap-2 px-3 py-3 rounded-xl border text-sm font-semibold transition-all ${
              proofType === "url"
                ? "bg-blue-500/10 border-blue-500/40 text-blue-300"
                : "bg-zinc-800/40 border-zinc-700/60 text-zinc-550 hover:border-zinc-655"
            }`}
          >
            <LinkIcon className="w-4 h-4 shrink-0" />
            <div className="text-left">
              <p className="text-xs font-bold">URL / Link</p>
              <p className="text-[10px] font-normal opacity-70">User pastes URL</p>
            </div>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-400 font-medium">Collect Text</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Ask users to also submit a WhatsApp number, username, or details.
            </p>
          </div>
          <div
            onClick={() => {
              setAcceptText(!acceptText);
              if (acceptText) setTextLabel("");
            }}
            className={`relative w-9 h-5 rounded-full transition-all cursor-pointer ${
              acceptText ? "bg-emerald-500" : "bg-zinc-700"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${
                acceptText ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </div>
        </div>
        {acceptText && (
          <input
            value={textLabel}
            onChange={(e) => setTextLabel(e.target.value)}
            placeholder="e.g. WhatsApp Number, TikTok Username..."
            className={inputCls}
          />
        )}
      </div>

      <div className="space-y-3 pt-3 border-t border-zinc-800/40">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-400 font-medium">Collect Number (Views / Watch Hours)</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">Ask users to submit a numeric value like views count.</p>
          </div>
          <div
            onClick={() => {
              setAcceptNumber(!acceptNumber);
              if (acceptNumber) setNumberLabel("");
            }}
            className={`relative w-9 h-5 rounded-full transition-all cursor-pointer ${acceptNumber ? "bg-emerald-500" : "bg-zinc-700"}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${acceptNumber ? "translate-x-4" : "translate-x-0"}`}
            />
          </div>
        </div>
        {acceptNumber && (
          <input
            value={numberLabel}
            onChange={(e) => setNumberLabel(e.target.value)}
            placeholder="e.g. Number of Views, Watch Hours..."
            className={inputCls}
          />
        )}
      </div>

      <div className="space-y-3 pt-3 border-t border-zinc-800/40">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-400 font-medium">Accept Multiple Screenshot Proofs</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Allow users to upload up to 5 screenshots instead of just one.
            </p>
          </div>
          <div
            onClick={() => {
              setAcceptMultipleImages(!acceptMultipleImages);
            }}
            className={`relative w-9 h-5 rounded-full transition-all cursor-pointer ${
              acceptMultipleImages ? "bg-emerald-500" : "bg-zinc-700"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${
                acceptMultipleImages ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-3 border-t border-zinc-800/40">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-400 font-medium">Include in Referral Count</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Release referral bonus to the referrer when users complete this task.
            </p>
          </div>
          <div
            onClick={() => setIsTobeIncludereferralCount(!isTobeIncludereferralCount)}
            className={`relative w-9 h-5 rounded-full transition-all cursor-pointer ${
              isTobeIncludereferralCount ? "bg-emerald-500" : "bg-zinc-700"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${
                isTobeIncludereferralCount ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </div>
        </div>
      </div>

      <div>
        <FieldLabel required={isViews}>
          Minimum View Count {!isViews && <span className="text-zinc-650 font-normal">(optional)</span>}
        </FieldLabel>
        <input
          type="number"
          min="1"
          value={targetCount}
          onChange={(e) => setTargetCount(e.target.value)}
          placeholder={isViews ? "e.g. 1000 (required)" : "e.g. 50 (optional)"}
          className={inputCls}
        />
      </div>

      {isJetpot && (
        <div>
          <FieldLabel>
            Admin WhatsApp <span className="text-zinc-600 font-normal">(buyers message this number)</span>
          </FieldLabel>
          <input
            value={adminContact}
            onChange={(e) => setAdminContact(e.target.value)}
            placeholder="+2348..."
            className={inputCls}
          />
        </div>
      )}

      <div className="space-y-3 pt-3 border-t border-zinc-800/40">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-400 font-medium">Require Prompt Selection & Copy</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Force users to select and copy a prompt before submission.
            </p>
          </div>
          <div
            onClick={() => setRequirePromptSelection(!requirePromptSelection)}
            className={`relative w-9 h-5 rounded-full transition-all cursor-pointer ${requirePromptSelection ? "bg-emerald-500" : "bg-zinc-700"}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${requirePromptSelection ? "translate-x-4" : "translate-x-0"}`}
            />
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-3 border-t border-zinc-800/40">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-400 font-medium">Collect Target Username (collectUserName)</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Exclude users who have already done a task for this target username.
            </p>
          </div>
          <div
            onClick={() => {
              setCollectUserName(!collectUserName);
              if (collectUserName) setTargetUsername("");
            }}
            className={`relative w-9 h-5 rounded-full transition-all cursor-pointer ${collectUserName ? "bg-emerald-500" : "bg-zinc-700"}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${collectUserName ? "translate-x-4" : "translate-x-0"}`}
            />
          </div>
        </div>
        {collectUserName && (
          <input
            value={targetUsername}
            onChange={(e) => setTargetUsername(e.target.value)}
            placeholder="Enter target username (e.g. johndoe)..."
            className={inputCls}
          />
        )}
      </div>

      <div>
        <FieldLabel>Client-Suggested Prompts (One per line)</FieldLabel>
        <textarea
          value={prompts}
          onChange={(e) => setPrompts(e.target.value)}
          placeholder="Paste the prompts or comments here, one per line..."
          rows={4}
          className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded-xl px-4 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-colors resize-none"
        />
      </div>

      <div>
        <FieldLabel>Copywriting / Marketing Text (Modal)</FieldLabel>
        <RichTextEditor value={marketingText} onChange={setMarketingText} placeholder="Write here..." />
      </div>

      <div className="space-y-3 pt-3 border-t border-zinc-800/40">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-400 font-medium">Block Same-Device Submissions</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Prevent a device that has already submitted proof for this task from submitting again under a different
              account.
            </p>
          </div>
          <div
            onClick={() => setBlockSameDevice(!blockSameDevice)}
            className={`relative w-9 h-5 rounded-full transition-all cursor-pointer ${blockSameDevice ? "bg-emerald-500" : "bg-zinc-700"}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${blockSameDevice ? "translate-x-4" : "translate-x-0"}`}
            />
          </div>
        </div>
      </div>

      {/* ── Secure-a-Spot Section ── */}
      <div className="pt-3 border-t border-zinc-800/40">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-300 font-semibold tracking-wide">🎯 Secure-a-Spot</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Users reserve a spot first, then get a unique random submission window for organic timing.
            </p>
          </div>
          <div
            onClick={() => setIsSecureSpotTask(!isSecureSpotTask)}
            className={`relative w-9 h-5 rounded-full transition-all cursor-pointer ${isSecureSpotTask ? "bg-purple-500" : "bg-zinc-700"}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${isSecureSpotTask ? "translate-x-4" : "translate-x-0"}`}
            />
          </div>
        </div>

        {isSecureSpotTask && (
          <div className="mt-3 space-y-3 rounded-2xl border border-zinc-700 bg-zinc-900/80 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            {/* Mode selector */}
            <div>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Delay Mode</p>
              <div className="grid grid-cols-3 gap-2">
                {(["constant", "minutes", "days"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSecureSpotIntervalType(type)}
                    className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                      secureSpotIntervalType === type
                        ? "bg-purple-500 text-black shadow-[0_0_12px_rgba(168,85,247,0.4)]"
                        : "bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-750 border border-zinc-700"
                    }`}
                  >
                    {type === "constant" ? "⏸ Fixed" : type === "minutes" ? "⏱ Minutes" : "📅 Days"}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-zinc-500 mt-2 leading-relaxed">
                {secureSpotIntervalType === "constant"
                  ? "Everyone waits the exact same fixed time — no randomness, fully predictable."
                  : secureSpotIntervalType === "minutes"
                    ? "Each user gets a private random window within the minute range you set."
                    : "Each user's window is scattered across the day span — great for longer campaigns."}
              </p>
            </div>

            {/* Inputs */}
            {secureSpotIntervalType !== "constant" && (
              <div>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                  {secureSpotIntervalType === "days" ? "Max Window" : "Max Window"}
                </p>
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    max={secureSpotIntervalType === "days" ? 100 : 1440}
                    value={secureSpotInterval}
                    onChange={(e) => setSecureSpotInterval(e.target.value)}
                    placeholder={secureSpotIntervalType === "days" ? "e.g. 7" : "e.g. 60"}
                    className={`${inputCls} pr-14`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-zinc-500">
                    {secureSpotIntervalType === "days" ? "days" : "min"}
                  </span>
                </div>
              </div>
            )}

            <div>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                {secureSpotIntervalType === "constant"
                  ? "Fixed Wait"
                  : secureSpotIntervalType === "days"
                    ? "Min Wait"
                    : "Min Wait"}
              </p>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  value={secureSpotConstantDelay}
                  onChange={(e) => setSecureSpotConstantDelay(e.target.value)}
                  placeholder={
                    secureSpotIntervalType === "constant"
                      ? "e.g. 60"
                      : secureSpotIntervalType === "days"
                        ? "e.g. 2"
                        : "e.g. 10"
                  }
                  className={`${inputCls} pr-14`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-zinc-500">
                  {secureSpotIntervalType === "days" ? "hrs" : "min"}
                </span>
              </div>
            </div>

            {/* Example callout */}
            <div className="flex items-start gap-2.5 rounded-xl bg-zinc-800/60 border border-zinc-700/50 px-3 py-2.5">
              <span className="text-purple-400 text-xs mt-px">→</span>
              <p className="text-[10px] text-zinc-400 leading-relaxed">
                {secureSpotIntervalType === "constant"
                  ? `All users wait exactly ${secureSpotConstantDelay || "X"} min before they can submit.`
                  : secureSpotIntervalType === "days"
                    ? `Random between ${secureSpotConstantDelay || "0"} hrs and ${secureSpotInterval ? Math.round((Number(secureSpotInterval) / 3) * 24) : "N"} hrs (${secureSpotInterval || "N"} days ÷ 3). e.g. 3 days, 5 hr min → window is 5–24 hrs.`
                    : `Random between ${secureSpotConstantDelay || "0"} min and ${secureSpotInterval || "N"} min. Each user gets a different slot.`}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                Additional Buffer Slots
              </p>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  max={10000}
                  value={additionalSlots}
                  onChange={(e) => setAdditionalSlots(e.target.value)}
                  placeholder="e.g. 5"
                  className={`${inputCls} pr-16`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-zinc-500">
                  slots
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 mt-1.5 leading-relaxed">
                Extra spots shown beyond the task capacity so users can still secure a slot. Default 5.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
