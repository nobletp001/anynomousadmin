"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import { apiClient } from "@/services/api-client";

interface SuggestedUser {
  id: number;
  name: string;
  username: string;
  email?: string | null;
}

interface SlotUserPickerProps {
  selectedUsers: string[];
  onChange: (users: string[]) => void;
  bulkUsers: string;
  onBulkChange: (value: string) => void;
}

export function SlotUserPicker({ selectedUsers, onChange, bulkUsers, onBulkChange }: SlotUserPickerProps) {
  const [search, setSearch] = React.useState("");
  const normalizedSelected = React.useMemo(
    () => new Set(selectedUsers.map((username) => username.toLowerCase())),
    [selectedUsers]
  );

  const usersQuery = useQuery<{ success: boolean; data: SuggestedUser[] }>({
    queryKey: ["slot-user-suggestions", search],
    queryFn: () => apiClient.get(`/admin/users?search=${encodeURIComponent(search)}&page=1`) as any,
    enabled: search.trim().length >= 2,
  });

  const addUser = (username: string) => {
    const clean = username.trim();
    if (!clean || normalizedSelected.has(clean.toLowerCase())) return;
    onChange([...selectedUsers, clean]);
    setSearch("");
  };

  const removeUser = (username: string) => {
    onChange(selectedUsers.filter((item) => item.toLowerCase() !== username.toLowerCase()));
  };

  const suggestions = (usersQuery.data?.data ?? []).filter(
    (user) => !normalizedSelected.has(user.username.toLowerCase())
  );

  return (
    <div className="space-y-3 rounded-2xl border border-zinc-700 bg-zinc-900/70 p-4">
      <div>
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Add Users One By One</p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search username, name, or email"
            className="w-full rounded-xl border border-zinc-700/70 bg-zinc-800/70 py-2.5 pl-9 pr-3 text-sm text-zinc-100 placeholder:text-zinc-555 focus:border-purple-500/50 focus:outline-none"
          />
        </div>

        {search.trim().length >= 2 && suggestions.length > 0 && (
          <div className="mt-2 max-h-44 overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-950/90 shadow-xl">
            {suggestions.slice(0, 8).map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => addUser(user.username)}
                className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left hover:bg-zinc-800/80"
              >
                <span>
                  <span className="block text-xs font-bold text-zinc-100">{user.name || user.username}</span>
                  <span className="block text-[10px] text-zinc-500">
                    @{user.username}
                    {user.email ? ` • ${user.email}` : ""}
                  </span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Add</span>
              </button>
            ))}
          </div>
        )}

        {selectedUsers.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedUsers.map((username) => (
              <span
                key={username}
                className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-300"
              >
                @{username}
                <button
                  type="button"
                  onClick={() => removeUser(username)}
                  className="text-emerald-200 hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Bulk Add</p>
        <textarea
          value={bulkUsers}
          onChange={(event) => onBulkChange(event.target.value)}
          rows={3}
          placeholder="Paste usernames or emails separated by comma, semicolon, or new line"
          className="w-full resize-none rounded-xl border border-zinc-700/70 bg-zinc-800/70 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-555 focus:border-purple-500/50 focus:outline-none"
        />
      </div>
    </div>
  );
}
