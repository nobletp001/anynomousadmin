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
}

export function TaskConfigForm({
  taskType, setTaskType,
  targetPlatform, setTargetPlatform,
  proofType, setProofType,
  acceptText, setAcceptText,
  textLabel, setTextLabel,
  acceptNumber, setAcceptNumber,
  numberLabel, setNumberLabel,
  acceptMultipleImages, setAcceptMultipleImages,
  targetCount, setTargetCount,
  adminContact, setAdminContact,
  prompts, setPrompts,
  requirePromptSelection, setRequirePromptSelection,
  marketingText, setMarketingText,
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
              <option key={t.value} value={t.value}>{t.label}</option>
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
                  <option key={p.value} value={p.value}>{p.label}</option>
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
            type="button" onClick={() => setProofType("banner")}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${
              proofType === "banner" ? "bg-amber-500/10 border-amber-500/40 text-amber-300" : "bg-zinc-800/40 border-zinc-700/60 text-zinc-500 hover:border-zinc-650"
            }`}
          >
            <ImageIcon className="w-4 h-4 shrink-0" />
            <div className="text-left">
              <p className="text-xs font-bold">Screenshot</p>
              <p className="text-[10px] font-normal opacity-70">User uploads photo</p>
            </div>
          </button>
          <button
            type="button" onClick={() => setProofType("url")}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${
              proofType === "url" ? "bg-blue-500/10 border-blue-500/40 text-blue-300" : "bg-zinc-800/40 border-zinc-700/60 text-zinc-500 hover:border-zinc-655"
            }`}
          >
            <LinkIcon className="w-4 h-4 shrink-0" />
            <div className="text-left">
              <p className="text-xs font-bold">URL / Link</p>
              <p className="text-[10px] font-normal opacity-70">User pastes link</p>
            </div>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-400 font-medium">Collect Text</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">Ask users to also submit a WhatsApp number, username, etc.</p>
          </div>
          <div
            onClick={() => {
              setAcceptText(!acceptText);
              if (acceptText) setTextLabel("");
            }}
            className={`relative w-9 h-5 rounded-full transition-all cursor-pointer ${acceptText ? "bg-emerald-500" : "bg-zinc-700"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${acceptText ? "translate-x-4" : "translate-x-0"}`} />
          </div>
        </div>
        {acceptText && (
          <input
            value={textLabel} onChange={(e) => setTextLabel(e.target.value)}
            placeholder="e.g. WhatsApp Number, TikTok Username..." className={inputCls}
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
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${acceptNumber ? "translate-x-4" : "translate-x-0"}`} />
          </div>
        </div>
        {acceptNumber && (
          <input
            value={numberLabel} onChange={(e) => setNumberLabel(e.target.value)}
            placeholder="e.g. Number of Views, Watch Hours..." className={inputCls}
          />
        )}
      </div>

      <div className="space-y-3 pt-3 border-t border-zinc-800/40">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-400 font-medium">Accept Multiple Screenshot Proofs</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">Allow users to upload up to 5 screenshots instead of just one.</p>
          </div>
          <div
            onClick={() => setAcceptMultipleImages(!acceptMultipleImages)}
            className={`relative w-9 h-5 rounded-full transition-all cursor-pointer ${acceptMultipleImages ? "bg-emerald-500" : "bg-zinc-700"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${acceptMultipleImages ? "translate-x-4" : "translate-x-0"}`} />
          </div>
        </div>
      </div>

      <div>
        <FieldLabel required={isViews}>Minimum View Count {!isViews && <span className="text-zinc-650 font-normal">(optional)</span>}</FieldLabel>
        <input
          type="number" min="1" value={targetCount} onChange={(e) => setTargetCount(e.target.value)}
          placeholder={isViews ? "e.g. 1000 (required)" : "e.g. 50 (optional)"} className={inputCls}
        />
      </div>

      {isJetpot && (
        <div>
          <FieldLabel>Admin WhatsApp <span className="text-zinc-600 font-normal">(buyers message this number)</span></FieldLabel>
          <input
            value={adminContact} onChange={(e) => setAdminContact(e.target.value)}
            placeholder="+2348..." className={inputCls}
          />
        </div>
      )}

      <div className="space-y-3 pt-3 border-t border-zinc-800/40">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-400 font-medium">Require Prompt Selection & Copy</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">Force users to select and copy a prompt before submission.</p>
          </div>
          <div
            onClick={() => setRequirePromptSelection(!requirePromptSelection)}
            className={`relative w-9 h-5 rounded-full transition-all cursor-pointer ${requirePromptSelection ? "bg-emerald-500" : "bg-zinc-700"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${requirePromptSelection ? "translate-x-4" : "translate-x-0"}`} />
          </div>
        </div>
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
        <RichTextEditor
          value={marketingText}
          onChange={setMarketingText}
          placeholder="Write here..."
        />
      </div>
    </div>
  );
}
