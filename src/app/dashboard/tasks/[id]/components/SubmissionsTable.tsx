import React from "react";
import { Users } from "lucide-react";
import { Submission } from "../types";
import { SubmissionRow } from "./SubmissionRow";
import { isActionableSubmissionStatus } from "../utils";

interface SubmissionsTableProps {
  submissions: Submission[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
  };
  onPageChange: (page: number) => void;
  isFetching?: boolean;
  selectedIds: Set<number>;
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<number>>>;
  viewingSub: Submission | null;
  setViewingSub: (sub: Submission | null) => void;
  searchFilter: string;
  setSearchFilter: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  openCorrectionModal: (sub: Submission) => void;
  openRejectModal: (sub: Submission) => void;
  openReverseModal: (sub: Submission) => void;
  onRemoveSubmission: (sub: Submission) => void;
}

export function SubmissionsTable({
  submissions,
  pagination,
  onPageChange,
  isFetching = false,
  selectedIds,
  setSelectedIds,
  viewingSub,
  setViewingSub,
  searchFilter,
  setSearchFilter,
  statusFilter,
  setStatusFilter,
  openCorrectionModal,
  openRejectModal,
  openReverseModal,
  onRemoveSubmission,
}: SubmissionsTableProps) {
  const selectableSubmissions = submissions.filter((s) => isActionableSubmissionStatus(s.status));
  const page = pagination?.page ?? 1;
  const limit = pagination?.limit ?? 50;
  const total = pagination?.total ?? submissions.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const firstItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const lastItem = Math.min(total, (page - 1) * limit + submissions.length);

  const allSelected = selectableSubmissions.length > 0 && selectableSubmissions.every((s) => selectedIds.has(s.id));

  const handleSelectAllChange = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(selectableSubmissions.map((s) => s.id)));
    }
  };

  const handleRowSelect = (subId: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(subId)) next.delete(subId);
      else next.add(subId);
      return next;
    });
  };

  return (
    <div className="lg:col-span-12">
      <div className="backdrop-blur-md bg-zinc-900/30 border border-zinc-800/80 rounded-2xl shadow-xl overflow-hidden">
        {/* Search and Filters Bar */}
        <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-950/20">
          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Search by username..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-550 focus:outline-none focus:border-purple-500/50 transition-colors"
            />
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs text-zinc-555">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-purple-500/50"
            >
              <option value="">All Submissions</option>
              <option value="pending">Pending</option>
              <option value="fraud_detect">Fraud Alert</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="needs_correction">Correction Requested</option>
              <option value="removed">Removed</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-b border-zinc-800 bg-zinc-950/10 px-4 py-3 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Showing {firstItem}-{lastItem} of {total} submission{total === 1 ? "" : "s"}
            {isFetching ? " · Refreshing..." : ""}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => onPageChange(Math.max(1, page - 1))}
              className="rounded-lg border border-zinc-800 px-3 py-1.5 font-semibold text-zinc-300 transition-colors hover:border-zinc-700 hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <span className="min-w-20 text-center font-semibold text-zinc-400">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              className="rounded-lg border border-zinc-800 px-3 py-1.5 font-semibold text-zinc-300 transition-colors hover:border-zinc-700 hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>

        {submissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center text-zinc-500">
            <Users className="w-8 h-8 opacity-40" />
            <p className="text-sm">No submissions yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
                  <th className="px-4 py-4 w-10">
                    {selectableSubmissions.length > 0 ? (
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={handleSelectAllChange}
                        className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 accent-purple-500 cursor-pointer"
                      />
                    ) : (
                      <span className="text-zinc-700 text-xs">—</span>
                    )}
                  </th>
                  <th className="px-6 py-4 font-semibold text-xs">User</th>
                  <th className="px-6 py-4 font-semibold text-xs">Balance</th>
                  <th className="px-6 py-4 font-semibold text-xs">Submission Proof &amp; Inputs</th>
                  <th className="px-6 py-4 font-semibold text-xs">Status</th>
                  <th className="px-6 py-4 font-semibold text-xs">Submitted</th>
                  <th className="px-6 py-4 font-semibold text-xs">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40">
                {submissions.map((sub) => (
                  <SubmissionRow
                    key={sub.id}
                    sub={sub}
                    submissions={submissions}
                    selectedIds={selectedIds}
                    onSelect={handleRowSelect}
                    isViewing={viewingSub?.id === sub.id}
                    onReview={() => setViewingSub(sub)}
                    onCorrection={() => openCorrectionModal(sub)}
                    onReject={() => openRejectModal(sub)}
                    onReverseReject={() => openReverseModal(sub)}
                    onRemove={() => onRemoveSubmission(sub)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
