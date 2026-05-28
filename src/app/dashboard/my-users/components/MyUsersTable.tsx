import React from "react";
import { ChevronLeft, ChevronRight, ExternalLink, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui";
import { StarRating } from "./StarRating";
import { SkeletonRows } from "./SkeletonRows";

interface User {
  id: number;
  name: string;
  username: string;
  email: string | null;
  role: string;
  createdAt: string;
  disabled: boolean;
  rating: number | null;
}

interface MyUsersTableProps {
  isLoading: boolean;
  users: User[];
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
  total: number;
  limit: number;
  debouncedSearch: string;
  onClearSearch: () => void;
  onViewProfile: (username: string) => void;
}

export function MyUsersTable({
  isLoading,
  users,
  page,
  setPage,
  totalPages,
  total,
  limit,
  debouncedSearch,
  onClearSearch,
  onViewProfile,
}: MyUsersTableProps) {
  const formatDate = (d: string) => {
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const limitVal = limit || 20;

  return (
    <div className="backdrop-blur-md bg-zinc-900/30 border border-zinc-800/80 rounded-2xl shadow-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-semibold">User</th>
              <th className="px-6 py-4 font-semibold">Email</th>
              <th className="px-6 py-4 font-semibold">Rating</th>
              <th className="px-6 py-4 font-semibold">Joined</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40">
            {isLoading ? (
              <SkeletonRows />
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-zinc-800/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-xs font-bold text-purple-400 shrink-0">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-zinc-100 text-xs">{user.name}</p>
                        <p className="text-zinc-500 text-[11px]">@{user.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-zinc-400">
                    {user.email || <span className="text-zinc-650 italic">No email</span>}
                  </td>
                  <td className="px-6 py-4">
                    <StarRating rating={user.rating} />
                  </td>
                  <td className="px-6 py-4 text-xs text-zinc-550 whitespace-nowrap">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={user.disabled ? "danger" : "success"} dot>
                      {user.disabled ? "Suspended" : "Active"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => onViewProfile(user.username)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 hover:text-purple-300 transition-colors whitespace-nowrap"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      View Profile
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!isLoading && users.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center text-zinc-500">
          <UserCheck className="w-10 h-10 opacity-30" />
          <p className="text-sm font-medium">
            {debouncedSearch ? "No users match your search" : "No users assigned to you yet"}
          </p>
          {debouncedSearch && (
            <button onClick={onClearSearch} className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
              Clear search
            </button>
          )}
        </div>
      )}

      {!isLoading && total > limitVal && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800/60 bg-zinc-950/20">
          <p className="text-xs text-zinc-500">
            Showing {(page - 1) * limitVal + 1}–{Math.min(page * limitVal, total)} of{" "}
            <span className="font-semibold text-zinc-300">{total}</span> users
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-zinc-405 font-medium px-2">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
              className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
