import React from "react";
import { Badge } from "@/components/ui";
import { EmailActivityItem } from "../types";
import { formatDateTime } from "../utils";

interface NewUserEmailActivityProps {
  email: string;
  rows: EmailActivityItem[];
  loading: boolean;
  error: string;
  onRefresh: () => void;
}

function getActivityBadgeVariant(status: string) {
  const normalized = status.toLowerCase();
  if (["delivered", "sent", "completed", "success"].includes(normalized)) return "success";
  if (["failed", "bounced", "blocked"].includes(normalized)) return "danger";
  if (["processing", "retry"].includes(normalized)) return "warning";
  return "default";
}

export function NewUserEmailActivity({ email, rows, loading, error, onRefresh }: NewUserEmailActivityProps) {
  return (
    <tr className="bg-zinc-950/70">
      <td colSpan={7} className="px-6 py-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">Email activity</p>
              <p className="mt-1 text-sm font-semibold text-zinc-200">{email}</p>
            </div>
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-bold text-zinc-300 transition hover:bg-zinc-800 disabled:opacity-50"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <p className="text-sm text-zinc-500">Loading email activity...</p>
          ) : error ? (
            <p className="text-sm font-semibold text-red-400">{error}</p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-zinc-500">No email activity found for this address.</p>
          ) : (
            <div className="space-y-2">
              {rows.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-bold text-zinc-200">{item.jobType}</p>
                    <p className="text-xs text-zinc-500">
                      Created {formatDateTime(item.createdAt)} · Updated {formatDateTime(item.updatedAt)}
                    </p>
                    {item.lastError ? (
                      <p className="mt-1 text-xs font-semibold text-red-300">{item.lastError}</p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getActivityBadgeVariant(item.status)} dot>
                      {item.status}
                    </Badge>
                    <span className="text-xs font-semibold text-zinc-500">
                      {item.attempts}/{item.maxAttempts}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}
