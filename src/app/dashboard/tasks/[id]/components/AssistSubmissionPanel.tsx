"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, UploadCloud, X } from "lucide-react";
import { apiClient } from "@/services/api-client";
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

interface SuggestedUser {
  id: number;
  name: string;
  username: string;
  email?: string | null;
}

export function AssistSubmissionPanel({ task, isPending, onSubmit }: AssistSubmissionPanelProps) {
  const [userSearch, setUserSearch] = React.useState("");
  const [selectedUser, setSelectedUser] = React.useState<SuggestedUser | null>(null);
  const [proofUrl, setProofUrl] = React.useState("");
  const [textResponse, setTextResponse] = React.useState("");
  const [numberResponse, setNumberResponse] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);
  const [error, setError] = React.useState("");

  const usersQuery = useQuery<{ success: boolean; data: SuggestedUser[] }>({
    queryKey: ["assist-submission-user-suggestions", userSearch],
    queryFn: () => apiClient.get(`/admin/users?search=${encodeURIComponent(userSearch.trim())}&page=1`) as any,
    enabled: userSearch.trim().length >= 2 && !selectedUser,
  });

  const suggestions = usersQuery.data?.data ?? [];

  const selectUser = (user: SuggestedUser) => {
    setSelectedUser(user);
    setUserSearch("");
    setError("");
  };

  const clearSelectedUser = () => {
    setSelectedUser(null);
    setUserSearch("");
  };

  const submit = async () => {
    setError("");
    if (!selectedUser) {
      setError("Select one user from the suggestions first.");
      return;
    }
    const payload: Record<string, unknown> = {
      username: selectedUser.username,
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
    setSelectedUser(null);
    setUserSearch("");
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
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            value={selectedUser ? `@${selectedUser.username}` : userSearch}
            onChange={(event) => {
              setSelectedUser(null);
              setUserSearch(event.target.value);
            }}
            placeholder="Search username, name, or email"
            className="w-full rounded-xl border border-zinc-700/70 bg-zinc-800/70 py-2.5 pl-9 pr-9 text-sm text-zinc-100 placeholder:text-zinc-555 focus:border-purple-500/50 focus:outline-none"
          />
          {(selectedUser || userSearch) && (
            <button
              type="button"
              onClick={clearSelectedUser}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-200"
              aria-label="Clear selected user"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {!selectedUser && userSearch.trim().length >= 2 && (
            <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-56 overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-950/95 shadow-2xl">
              {usersQuery.isFetching ? (
                <div className="px-3 py-3 text-xs text-zinc-500">Searching...</div>
              ) : suggestions.length === 0 ? (
                <div className="px-3 py-3 text-xs text-zinc-500">No users found</div>
              ) : (
                suggestions.slice(0, 8).map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => selectUser(user)}
                    className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left hover:bg-zinc-800/80"
                  >
                    <span>
                      <span className="block text-xs font-bold text-zinc-100">{user.name || user.username}</span>
                      <span className="block text-[10px] text-zinc-500">
                        @{user.username}
                        {user.email ? ` - ${user.email}` : ""}
                      </span>
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">Select</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
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
      {selectedUser && (
        <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-purple-500/20 bg-purple-500/10 px-3 py-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-purple-300">Submitting for</p>
            <p className="text-sm font-bold text-zinc-100">
              {selectedUser.name || selectedUser.username}{" "}
              <span className="text-xs font-semibold text-zinc-400">@{selectedUser.username}</span>
            </p>
            {selectedUser.email && <p className="text-[11px] text-zinc-500">{selectedUser.email}</p>}
          </div>
          <button
            type="button"
            onClick={clearSelectedUser}
            className="rounded-lg border border-zinc-700 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:border-purple-500/50 hover:text-zinc-100"
          >
            Change
          </button>
        </div>
      )}
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
