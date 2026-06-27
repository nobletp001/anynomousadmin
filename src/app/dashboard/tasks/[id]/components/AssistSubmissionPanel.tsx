"use client";

import React from "react";
import { UploadCloud } from "lucide-react";
import { Task } from "../types";

function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ base64: String(reader.result), mimeType: file.type || "image/png" });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

interface AssistSubmissionPanelProps {
  task: Task;
  isPending: boolean;
  onSubmit: (payload: Record<string, unknown>) => void;
}

export function AssistSubmissionPanel({ task, isPending, onSubmit }: AssistSubmissionPanelProps) {
  const [username, setUsername] = React.useState("");
  const [proofUrl, setProofUrl] = React.useState("");
  const [textResponse, setTextResponse] = React.useState("");
  const [numberResponse, setNumberResponse] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);
  const [error, setError] = React.useState("");

  const submit = async () => {
    setError("");
    if (!username.trim()) {
      setError("Enter one username or email.");
      return;
    }
    const payload: Record<string, unknown> = {
      username: username.trim(),
      textResponse: textResponse.trim() || undefined,
      numberResponse: numberResponse.trim() || undefined,
    };
    if (task.proofType === "url") {
      if (!proofUrl.trim()) {
        setError("Enter the proof URL.");
        return;
      }
      payload.proofUrl = proofUrl.trim();
    } else if (file) {
      const encoded = await fileToBase64(file);
      payload.proofBase64 = encoded.base64;
      payload.proofMimeType = encoded.mimeType;
    } else if (!textResponse.trim() && !numberResponse.trim()) {
      setError("Upload proof or enter required details.");
      return;
    }
    onSubmit(payload);
    setUsername("");
    setProofUrl("");
    setTextResponse("");
    setNumberResponse("");
    setFile(null);
  };

  return (
    <div className="backdrop-blur-md bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-4 shadow-xl">
      <div className="mb-3">
        <h2 className="text-sm font-extrabold text-zinc-200 uppercase tracking-wider">Help User Submit Proof</h2>
        <p className="mt-1 text-xs text-zinc-500">
          Submit proof for one user only. It enters pending review and uses normal approval/payment flow.
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <input
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="Username or email"
          className="rounded-xl border border-zinc-700/70 bg-zinc-800/70 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-555 focus:border-purple-500/50 focus:outline-none"
        />
        {task.proofType === "url" ? (
          <input
            value={proofUrl}
            onChange={(event) => setProofUrl(event.target.value)}
            placeholder="Proof URL"
            className="rounded-xl border border-zinc-700/70 bg-zinc-800/70 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-555 focus:border-purple-500/50 focus:outline-none"
          />
        ) : (
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-700 bg-zinc-800/50 px-3 py-2.5 text-xs font-bold text-zinc-400 hover:border-purple-500/50 hover:text-zinc-200">
            <UploadCloud className="h-4 w-4" />
            {file ? file.name : "Upload proof image"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
          </label>
        )}
        {task.acceptText && (
          <input
            value={textResponse}
            onChange={(event) => setTextResponse(event.target.value)}
            placeholder={task.textLabel || "Text response"}
            className="rounded-xl border border-zinc-700/70 bg-zinc-800/70 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-555 focus:border-purple-500/50 focus:outline-none"
          />
        )}
        {task.acceptNumber && (
          <input
            value={numberResponse}
            onChange={(event) => setNumberResponse(event.target.value)}
            placeholder={task.numberLabel || "Number response"}
            className="rounded-xl border border-zinc-700/70 bg-zinc-800/70 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-555 focus:border-purple-500/50 focus:outline-none"
          />
        )}
      </div>
      {error && <p className="mt-2 text-xs font-semibold text-red-400">{error}</p>}
      <button
        type="button"
        disabled={isPending}
        onClick={submit}
        className="mt-3 rounded-xl bg-purple-500 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-black hover:bg-purple-400 disabled:opacity-50"
      >
        {isPending ? "Submitting..." : "Submit Proof For User"}
      </button>
    </div>
  );
}
