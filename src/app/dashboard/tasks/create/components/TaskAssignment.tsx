import React, { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import { apiClient } from "@/services/api-client";
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
  officers: TaskOfficer[];
}

type TaskOfficer = {
  username: string;
  name: string;
};

type UserSuggestion = {
  username: string;
  name?: string;
  email?: string;
};

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
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const search = clientUsername.trim().replace(/^@/, "");

  const { data: suggestionsData, isFetching } = useQuery<{ data: UserSuggestion[] }>({
    queryKey: ["admin-task-client-search", search],
    queryFn: async () => {
      if (search.length < 2) return { data: [] };
      return apiClient.get(`/admin/users?search=${encodeURIComponent(search)}&page=1`) as Promise<{
        data: UserSuggestion[];
      }>;
    },
    enabled: isForClient && search.length >= 2,
  });

  const suggestions = suggestionsData?.data ?? [];

  useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  function selectUsername(username: string) {
    setClientUsername(username);
    setShowSuggestions(false);
  }

  function clearClientUsername() {
    setClientUsername("");
    setShowSuggestions(false);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!showSuggestions || suggestions.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((prev) => (prev + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (event.key === "Enter" && activeIndex >= 0 && activeIndex < suggestions.length) {
      event.preventDefault();
      selectUsername(suggestions[activeIndex].username);
    } else if (event.key === "Escape") {
      setShowSuggestions(false);
    }
  }

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
            <div ref={containerRef} className="relative space-y-1.5">
              <FieldLabel required>Client username</FieldLabel>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input
                  value={clientUsername}
                  onChange={(event) => {
                    setClientUsername(event.target.value);
                    setShowSuggestions(true);
                    setActiveIndex(-1);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search username, name, or email"
                  className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded-xl pl-10 pr-10 py-2.5 text-sm font-bold text-zinc-100 placeholder:text-zinc-650 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 transition-colors"
                />
                {clientUsername && (
                  <button
                    type="button"
                    onClick={clearClientUsername}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-zinc-500 hover:bg-zinc-700/80 hover:text-zinc-100"
                    title="Clear client username"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              {showSuggestions && (
                <div className="absolute top-[calc(100%+4px)] left-0 z-50 max-h-56 w-full overflow-y-auto rounded-xl border border-zinc-700/80 bg-zinc-900 shadow-2xl divide-y divide-zinc-800">
                  {search.length < 2 ? (
                    <div className="px-4 py-3 text-xs italic text-zinc-400">Type 2 or more characters...</div>
                  ) : isFetching ? (
                    <div className="px-4 py-3 text-xs italic text-zinc-400">Searching...</div>
                  ) : suggestions.length === 0 ? (
                    <div className="px-4 py-3 text-xs italic text-zinc-500">No users found</div>
                  ) : (
                    suggestions.map((user, index) => (
                      <button
                        key={user.username}
                        type="button"
                        onClick={() => selectUsername(user.username)}
                        className={`flex w-full flex-col px-4 py-2 text-left text-xs transition-colors ${
                          index === activeIndex ? "bg-sky-600/30 text-white" : "text-zinc-200 hover:bg-zinc-800"
                        }`}
                      >
                        <span className="font-bold">@{user.username}</span>
                        <span className="text-[10px] text-zinc-400">
                          {user.name || user.email || "PayFluence user"}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
              <p className="text-[11px] text-zinc-550 mt-1.5 leading-relaxed">
                Use the client&apos;s PayFluence username. Admin remains the verifier on the task record.
              </p>
            </div>
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
            officers.map((off) => (
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
