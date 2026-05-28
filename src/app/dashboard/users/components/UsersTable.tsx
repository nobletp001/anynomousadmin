import React from "react";
import { Ban, ShieldOff, CreditCard, ClipboardX, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { Badge, Button } from "@/components/ui";
import { User } from "../types";
import { Toggle } from "./Toggle";
import { formatDate, roleBadgeVariant } from "../utils";

interface UsersTableProps {
  users: User[];
  onSelectUser: (username: string) => void;
  onUpdateFlags: (id: number, flags: Partial<Pick<User, "disabled" | "withdrawalDisabled" | "taskDisabled">>) => void;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
  totalUsers: number;
}

export function UsersTable({
  users,
  onSelectUser,
  onUpdateFlags,
  page,
  setPage,
  totalPages,
  totalUsers,
}: UsersTableProps) {
  return (
    <div className="backdrop-blur-md bg-zinc-900/30 border border-zinc-800/80 rounded-2xl shadow-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-semibold">Name</th>
              <th className="px-6 py-4 font-semibold">Username</th>
              <th className="px-6 py-4 font-semibold">Email</th>
              <th className="px-6 py-4 font-semibold">Role</th>
              <th className="px-6 py-4 font-semibold">Joined</th>
              <th className="px-6 py-4 font-semibold">Restrictions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40">
            {users.length ? (
              users.map((user) => (
                <tr
                  key={user.id}
                  onClick={() => onSelectUser(user.username)}
                  className={`transition-colors cursor-pointer ${user.disabled ? "bg-red-500/5" : "hover:bg-zinc-800/20"}`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 ${
                          user.disabled
                            ? "bg-zinc-900 border-zinc-700 text-zinc-650"
                            : "bg-zinc-800 border-zinc-700/60 text-purple-400"
                        }`}
                      >
                        {user.disabled ? <Ban className="w-3.5 h-3.5" /> : user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className={`font-medium ${user.disabled ? "text-zinc-500 line-through" : "text-zinc-100"}`}>
                        {user.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-400">@{user.username}</td>
                  <td className="px-6 py-4 text-zinc-400">
                    {user.email ?? <span className="text-zinc-600">—</span>}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={roleBadgeVariant(user.role) as any} dot>
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-zinc-500 text-xs">{formatDate(user.createdAt)}</td>
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-4">
                      {/* Disable account */}
                      <div className="flex items-center gap-1.5 group relative">
                        <Toggle
                          checked={user.disabled}
                          onChange={(v) => onUpdateFlags(user.id, { disabled: v })}
                          color="red"
                          label="Disable account"
                        />
                        <ShieldOff className={`w-3.5 h-3.5 ${user.disabled ? "text-red-400" : "text-zinc-600"}`} />
                      </div>

                      <div className="w-px h-4 bg-zinc-800 shrink-0" />

                      {/* Disable withdrawal */}
                      <div className="flex items-center gap-1.5 group relative">
                        <Toggle
                          checked={user.withdrawalDisabled}
                          onChange={(v) => onUpdateFlags(user.id, { withdrawalDisabled: v })}
                          disabled={user.disabled}
                          color="amber"
                          label="Disable withdrawal"
                        />
                        <CreditCard className={`w-3.5 h-3.5 ${user.withdrawalDisabled ? "text-amber-400" : "text-zinc-600"}`} />
                      </div>

                      <div className="w-px h-4 bg-zinc-800 shrink-0" />

                      {/* Disable tasks */}
                      <div className="flex items-center gap-1.5 group relative">
                        <Toggle
                          checked={user.taskDisabled}
                          onChange={(v) => onUpdateFlags(user.id, { taskDisabled: v })}
                          disabled={user.disabled}
                          color="orange"
                          label="Disable tasks"
                        />
                        <ClipboardX className={`w-3.5 h-3.5 ${user.taskDisabled ? "text-orange-400" : "text-zinc-600"}`} />
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center text-zinc-500">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800/60">
        <span className="text-xs text-zinc-550">
          Page {page} of {totalPages} · {totalUsers} total users
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 1}
            leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
          >
            Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages}
            rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
