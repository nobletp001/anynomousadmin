import React from "react";
import { CheckCircle, ChevronLeft, ChevronRight, Copy, Mail, ShieldCheck, UserPlus } from "lucide-react";
import { Badge, Button } from "@/components/ui";
import { NewUser, SignupPurpose } from "../types";
import { formatDateTime, formatRelativeTime } from "../utils";
import { toast } from "sonner";

interface NewUsersTableProps {
  users: NewUser[];
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
  totalUsers: number;
  hasMore?: boolean;
  resendingUsername?: string | null;
  verifyingUsername?: string | null;
  purposeFilter: SignupPurpose | "all";
  onPurposeFilterChange: (value: SignupPurpose | "all") => void;
  onResendOtp: (username: string) => void;
  onManualVerify: (username: string) => void;
}

export function NewUsersTable({
  users,
  page,
  setPage,
  totalPages,
  totalUsers,
  hasMore = false,
  resendingUsername,
  verifyingUsername,
  purposeFilter,
  onPurposeFilterChange,
  onResendOtp,
  onManualVerify,
}: NewUsersTableProps) {
  const canGoNext = hasMore || page < totalPages;
  const copyEmail = (email: string | null) => {
    if (!email) return;
    navigator.clipboard.writeText(email).then(() => {
      toast.success("Email copied.");
    });
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/30 shadow-xl backdrop-blur-md">
      <div className="border-b border-zinc-800 px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-purple-300" />
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-zinc-200">New Users</h2>
            <Badge variant="purple">Last 24 hours</Badge>
          </div>
          <label className="flex items-center gap-2 text-xs font-bold text-zinc-500">
            Purpose
            <select
              value={purposeFilter}
              onChange={(e) => onPurposeFilterChange(e.target.value as SignupPurpose | "all")}
              className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs font-bold text-zinc-200 outline-none transition focus:border-purple-500/60"
            >
              <option value="all">All signups</option>
              <option value="task_creation">Task/Celebrity creation</option>
              <option value="perform_tasks">Perform tasks & earn</option>
            </select>
          </label>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-xs uppercase tracking-wider text-zinc-500">
              <th className="px-6 py-4 font-semibold">User</th>
              <th className="px-6 py-4 font-semibold">Email</th>
              <th className="px-6 py-4 font-semibold">Purpose</th>
              <th className="px-6 py-4 font-semibold">Email Status</th>
              <th className="px-6 py-4 font-semibold">WhatsApp</th>
              <th className="px-6 py-4 font-semibold">Joined</th>
              <th className="px-6 py-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40">
            {users.length ? (
              users.map((user) => {
                const isResending = resendingUsername?.toLowerCase() === user.username.toLowerCase();
                const isVerifying = verifyingUsername?.toLowerCase() === user.username.toLowerCase();
                return (
                  <tr key={user.id} className="transition-colors hover:bg-zinc-800/20">
                    <td className="px-6 py-4">
                      <p className="font-bold text-zinc-100">{user.name}</p>
                      <p className="text-xs text-zinc-500">@{user.username}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="max-w-[240px] truncate text-zinc-300">{user.email || "—"}</span>
                        {user.email && (
                          <button
                            type="button"
                            onClick={() => copyEmail(user.email)}
                            className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
                            title="Copy email"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={user.signupPurpose === "task_creation" ? "purple" : "default"}>
                        {user.signupPurpose === "task_creation" ? "task/celebrity" : "earn"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={user.emailVerified ? "success" : "warning"} dot>
                        {user.emailVerified ? "verified" : "not verified"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={user.whatsappVerified ? "success" : "default"} dot>
                        {user.whatsappVerified ? "verified" : "not verified"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="whitespace-nowrap text-xs font-semibold text-zinc-300">
                          {formatDateTime(user.createdAt)}
                        </span>
                        <span className="w-fit rounded-full border border-zinc-700/80 bg-zinc-800/50 px-2 py-0.5 text-[11px] font-bold text-zinc-400">
                          {formatRelativeTime(user.createdAt)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.emailVerified ? (
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                          <CheckCircle className="h-3.5 w-3.5" />
                          Verified
                        </div>
                      ) : (
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            disabled={!user.email || isResending || isVerifying}
                            onClick={() => onResendOtp(user.username)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-1.5 text-xs font-bold text-sky-300 transition-colors hover:bg-sky-500/20 disabled:opacity-50"
                          >
                            <Mail className="h-3.5 w-3.5" />
                            {isResending ? "Sending..." : "Send OTP"}
                          </button>
                          <button
                            type="button"
                            disabled={!user.email || isResending || isVerifying}
                            onClick={() => {
                              if (window.confirm(`Manually verify email for @${user.username}?`)) {
                                onManualVerify(user.username);
                              }
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-300 transition-colors hover:bg-emerald-500/20 disabled:opacity-50"
                          >
                            <ShieldCheck className="h-3.5 w-3.5" />
                            {isVerifying ? "Verifying..." : "Manual Verify"}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center text-zinc-500">
                  <UserPlus className="mx-auto mb-2 h-8 w-8 opacity-40" />
                  No new users in the last 24 hours
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-zinc-800/60 px-6 py-4">
        <span className="text-xs text-zinc-550">
          Page {page} of {totalPages} · {totalUsers} new user{totalUsers === 1 ? "" : "s"}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 1}
            leftIcon={<ChevronLeft className="h-3.5 w-3.5" />}
          >
            Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={!canGoNext}
            rightIcon={<ChevronRight className="h-3.5 w-3.5" />}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
