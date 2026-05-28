import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/api-client";
import { Trash2, Plus, Users, ShieldAlert } from "lucide-react";
import { FieldLabel } from "./FieldLabel";
import { EditTaskState } from "../../hooks/useEditTaskState";

export function AllowedSubmissions({ editState }: { editState: EditTaskState }) {
  const [username, setUsername] = useState("");
  const [allowedCount, setAllowedCount] = useState(1);
  const [errorMsg, setErrorMsg] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: suggestionsData, isFetching: isSearching } = useQuery<{ data: Array<{ username: string; name: string }> }>({
    queryKey: ["admin-search-users", username],
    queryFn: async () => {
      if (username.trim().length < 2) return { data: [] };
      return apiClient.get(`/admin/users?search=${encodeURIComponent(username.trim())}`) as any;
    },
    enabled: username.trim().length >= 2,
  });

  const suggestions = suggestionsData?.data ?? [];

  useEffect(() => { setActiveIndex(-1); }, [suggestions]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = username.trim();
    if (!cleanUser) return;
    const exists = editState.editAllowedSubmissions.some(item => item.username.toLowerCase() === cleanUser.toLowerCase());
    if (exists) {
      setErrorMsg("Username is already in the list.");
      return;
    }
    setErrorMsg("");
    editState.setEditAllowedSubmissions(prev => [...prev, { username: cleanUser, allowedCount }]);
    setUsername("");
    setAllowedCount(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        e.preventDefault();
        setUsername(suggestions[activeIndex].username);
        setShowSuggestions(false);
      }
    } else if (e.key === "Escape") setShowSuggestions(false);
  };

  return (
    <div className="backdrop-blur-md bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-5 space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
          <Users className="w-4 h-4 text-purple-400" /> Allowed Submissions Config
        </h4>
        <p className="text-xs text-zinc-400 mt-1">Specify dynamic submission counts for particular users.</p>
      </div>

      <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
        <div ref={containerRef} className="space-y-1.5 relative">
          <FieldLabel>Username</FieldLabel>
          <input
            type="text" value={username} onKeyDown={handleKeyDown} placeholder="e.g. Ade"
            onChange={(e) => { setUsername(e.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-colors"
          />
          {showSuggestions && username.trim().length > 0 && (
            <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-zinc-900 border border-zinc-700/80 rounded-xl overflow-hidden shadow-2xl z-50 divide-y divide-zinc-800 max-h-48 overflow-y-auto">
              {username.trim().length < 2 ? (
                <div className="px-4 py-3 text-xs text-zinc-400 italic">Type 2 or more characters...</div>
              ) : isSearching ? (
                <div className="px-4 py-3 text-xs text-zinc-400 italic">Searching...</div>
              ) : suggestions.length === 0 ? (
                <div className="px-4 py-3 text-xs text-zinc-500 italic">No users found</div>
              ) : (
                suggestions.map((u, idx) => (
                  <button
                    key={u.username} type="button" onClick={() => { setUsername(u.username); setShowSuggestions(false); }}
                    className={`w-full text-left px-4 py-2 text-xs transition-colors flex flex-col cursor-pointer ${idx === activeIndex ? "bg-purple-600/30 text-white font-semibold" : "text-zinc-200 hover:bg-zinc-800"}`}
                  >
                    <span className="font-bold">{u.username}</span>
                    {u.name && <span className="text-[10px] text-zinc-400">{u.name}</span>}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
        <div className="space-y-1.5">
          <FieldLabel>Allowed Submissions</FieldLabel>
          <input
            type="number" min={1} value={allowedCount}
            onChange={(e) => setAllowedCount(parseInt(e.target.value) || 1)}
            className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-colors"
          />
        </div>
        <button
          type="submit" disabled={!username.trim()}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-purple-600 text-white hover:bg-purple-500 transition-colors disabled:opacity-40 h-[42px] cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Limit
        </button>
      </form>

      {errorMsg && (
        <div className="flex items-center gap-2 p-3 bg-red-950/20 border border-red-900/30 text-red-400 rounded-xl text-xs">
          <ShieldAlert className="w-4 h-4 shrink-0" /> <span>{errorMsg}</span>
        </div>
      )}

      {editState.editAllowedSubmissions.length === 0 ? (
        <div className="text-xs text-zinc-550 italic py-2">No custom limits configured for this task.</div>
      ) : (
        <div className="border border-zinc-800/60 rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-800/30 border-b border-zinc-800 text-[10px] font-bold text-zinc-400 tracking-wider">
                <th className="px-4 py-2.5">Username</th>
                <th className="px-4 py-2.5">Allowed Count</th>
                <th className="px-4 py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50 text-xs text-zinc-200">
              {editState.editAllowedSubmissions.map((item) => (
                <tr key={item.username} className="hover:bg-zinc-800/10 transition-colors">
                  <td className="px-4 py-3 font-medium text-zinc-300">{item.username}</td>
                  <td className="px-4 py-3">{item.allowedCount}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => editState.setEditAllowedSubmissions(prev => prev.filter(x => x.username !== item.username))}
                      className="text-zinc-500 hover:text-red-400 p-1 rounded transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
