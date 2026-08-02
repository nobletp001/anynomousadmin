import React, { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Building2, Search, X } from "lucide-react";
import { apiClient } from "@/services/api-client";
import { FieldLabel } from "./FieldLabel";

interface ClientAssignmentProps {
  editIsForClient: boolean;
  setEditIsForClient: (v: boolean) => void;
  editClientUsername: string;
  setEditClientUsername: (v: string) => void;
}

type UserSuggestion = {
  username: string;
  name?: string;
  email?: string;
};

export function ClientAssignment({
  editIsForClient,
  setEditIsForClient,
  editClientUsername,
  setEditClientUsername,
}: ClientAssignmentProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const search = editClientUsername.trim().replace(/^@/, "");

  const { data: suggestionsData, isFetching } = useQuery<{ data: UserSuggestion[] }>({
    queryKey: ["admin-task-client-search", search],
    queryFn: async () => {
      if (search.length < 2) return { data: [] };
      return apiClient.get(`/admin/users?search=${encodeURIComponent(search)}&page=1`) as any;
    },
    enabled: editIsForClient && search.length >= 2,
  });

  const suggestions = suggestionsData?.data ?? [];

  useEffect(() => setActiveIndex(-1), [suggestions]);

  useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  function selectUsername(username: string) {
    setEditClientUsername(username);
    setShowSuggestions(false);
  }

  function detachClient() {
    setEditIsForClient(false);
    setEditClientUsername("");
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
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      selectUsername(suggestions[activeIndex].username);
    } else if (event.key === "Escape") {
      setShowSuggestions(false);
    }
  }

  return (
    <div className="backdrop-blur-md bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-5 space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-sky-400" /> Client Ownership
        </h4>
        <p className="text-xs text-zinc-400 mt-1">
          Attach this task to a client so it appears in their business dashboard, or remove the client to return it to
          admin ownership.
        </p>
      </div>

      <label className="flex items-start gap-3 rounded-xl border border-sky-500/20 bg-sky-500/10 p-4">
        <input
          type="checkbox"
          checked={editIsForClient}
          onChange={(event) => {
            setEditIsForClient(event.target.checked);
            if (!event.target.checked) setEditClientUsername("");
          }}
          className="mt-1 h-4 w-4 rounded border-zinc-600 bg-zinc-900 text-sky-500"
        />
        <span>
          <span className="block text-sm font-bold text-sky-100">Attach task to client</span>
          <span className="mt-1 block text-xs leading-relaxed text-zinc-400">
            The selected client can manage the task from the business dashboard.
          </span>
        </span>
      </label>

      {editIsForClient && (
        <div ref={containerRef} className="relative space-y-1.5">
          <FieldLabel required>Client username</FieldLabel>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              value={editClientUsername}
              onChange={(event) => {
                setEditClientUsername(event.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={handleKeyDown}
              placeholder="Search username, name, or email"
              className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded-xl pl-10 pr-10 py-2.5 text-sm font-bold text-zinc-100 placeholder:text-zinc-650 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 transition-colors"
            />
            {editClientUsername && (
              <button
                type="button"
                onClick={detachClient}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-zinc-500 hover:bg-zinc-700/80 hover:text-zinc-100"
                title="Remove client"
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
                    <span className="text-[10px] text-zinc-400">{user.name || user.email || "PayFluence user"}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
