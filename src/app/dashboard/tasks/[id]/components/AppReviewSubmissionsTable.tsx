"use client";

import React from "react";
import { AlertCircle, CheckCircle, ChevronLeft, ChevronRight, Clock, Image as ImageIcon, RotateCcw, Trash2, Undo2, Users, XCircle } from "lucide-react";
import { BusinessReviewRequest, Submission, Task } from "../types";
import { formatAmount, formatDate, getImagesList } from "../utils";

interface AppReviewSubmissionsTableProps {
  requests: BusinessReviewRequest[];
  task: Task;
  onReview: (sub: Submission) => void;
  onCorrection: (sub: Submission) => void;
  onReject: (sub: Submission) => void;
  onRewind: (sub: Submission) => void;
  onRemove: (sub: Submission) => void;
  onWithdraw: (request: BusinessReviewRequest) => void;
  onZoomImage: (images: string[], index: number) => void;
  viewingSubId?: number | null;
  isPending?: boolean;
}

export function reviewRequestToSubmission(request: BusinessReviewRequest): Submission {
  const status =
    request.status === "submitted"
      ? "pending"
      : request.status === "disputed"
        ? "rejected"
        : request.status;
  return {
    id: -request.id,
    taskId: request.taskId,
    username: request.username,
    user: request.user ?? null,
    userBalance: request.userBalance ?? 0,
    proof: request.reviewProof || "",
    proofType: request.reviewProofType || "image",
    textResponse: request.textResponse || null,
    numberResponse: request.numberResponse || null,
    status,
    rejectionReason:
      request.status === "disputed"
        ? "Review rejected."
        : request.status === "needs_correction"
          ? "Correction requested."
          : null,
    deductedAmount: 0,
    createdAt: request.submittedAt || request.createdAt,
    updatedAt: request.reviewedAt || request.submittedAt || request.updatedAt,
    assignedReview: request.reviewText,
    isAppReviewSubmission: true,
    appReviewRequest: request,
  };
}

export function AppReviewSubmissionsTable({
  requests,
  task,
  onReview,
  onCorrection,
  onReject,
  onRewind,
  onRemove,
  onWithdraw,
  onZoomImage,
  viewingSubId,
  isPending = false,
}: AppReviewSubmissionsTableProps) {
  const [statusFilter, setStatusFilter] = React.useState<string>("");
  const [searchFilter, setSearchFilter] = React.useState<string>("");
  const [page, setPage] = React.useState<number>(1);
  const pageSize = 20;

  // Status counts across all active requests
  const activeRequests = React.useMemo(
    () => requests.filter((r) => r.status !== "removed" && r.status !== "cancelled"),
    [requests]
  );

  const counts = React.useMemo(() => {
    let pendingCount = 0;
    let correctionCount = 0;
    let requestedCount = 0;
    let approvedCount = 0;
    let disputedCount = 0;

    for (const r of activeRequests) {
      if (r.status === "submitted") pendingCount++;
      else if (r.status === "needs_correction") correctionCount++;
      else if (r.status === "requested") requestedCount++;
      else if (r.status === "approved") approvedCount++;
      else if (r.status === "disputed") disputedCount++;
    }

    return {
      total: activeRequests.length,
      pending: pendingCount,
      correction: correctionCount,
      requested: requestedCount,
      approved: approvedCount,
      disputed: disputedCount,
    };
  }, [activeRequests]);

  // Filtering
  const filteredRequests = React.useMemo(() => {
    return activeRequests.filter((r) => {
      if (statusFilter && r.status !== statusFilter) {
        return false;
      }
      if (searchFilter.trim()) {
        const query = searchFilter.toLowerCase().trim();
        const matchesUsername = r.username.toLowerCase().includes(query);
        const matchesName = r.user?.name?.toLowerCase().includes(query) ?? false;
        if (!matchesUsername && !matchesName) return false;
      }
      return true;
    });
  }, [activeRequests, statusFilter, searchFilter]);

  // Normal Task Flow Sorting: Correction at top, then pending (submitted), then requested, then approved/disputed
  const sortedRequests = React.useMemo(() => {
    return [...filteredRequests].sort((a, b) => {
      const getPriority = (status: string) => {
        switch (status) {
          case "needs_correction":
            return 0; // Correction at the very top!
          case "submitted":
            return 1; // Pending review next
          case "requested":
            return 2; // Awaiting user next
          case "approved":
            return 3;
          case "disputed":
            return 4;
          default:
            return 5;
        }
      };

      const delta = getPriority(a.status) - getPriority(b.status);
      if (delta !== 0) return delta;

      const timeA = new Date(a.submittedAt || a.updatedAt || a.createdAt).getTime();
      const timeB = new Date(b.submittedAt || b.updatedAt || b.createdAt).getTime();
      return timeB - timeA;
    });
  }, [filteredRequests]);

  // Reset page when filters change
  React.useEffect(() => {
    setPage(1);
  }, [statusFilter, searchFilter]);

  const totalPages = Math.max(1, Math.ceil(sortedRequests.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedRequests = sortedRequests.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const firstItem = sortedRequests.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const lastItem = Math.min(sortedRequests.length, currentPage * pageSize);

  return (
    <section className="backdrop-blur-md bg-zinc-900/30 border border-zinc-800/80 rounded-2xl shadow-xl overflow-hidden space-y-0">
      {/* Header & Section Title */}
      <div className="p-5 border-b border-zinc-800/80 bg-zinc-950/40">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                <CheckCircle className="h-4 w-4" />
              </span>
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-zinc-100">
                App Review Requests &amp; Submissions
              </h2>
            </div>
            <p className="mt-1 text-xs text-zinc-400">
              Track follow-up app review tasks requested from users and review submitted proof.
            </p>
          </div>
          <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-300 self-start sm:self-auto">
            {counts.total} total review{counts.total === 1 ? "" : "s"}
          </span>
        </div>

        {/* State Count Badges / Quick Filter Pills */}
        <div className="mt-4 flex flex-wrap gap-2 pt-1 border-t border-zinc-800/60">
          <button
            type="button"
            onClick={() => setStatusFilter("")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === ""
                ? "bg-zinc-100 text-zinc-950 shadow"
                : "bg-zinc-800/80 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
            }`}
          >
            All Reviews
            <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
              statusFilter === "" ? "bg-zinc-900 text-white" : "bg-zinc-700/60 text-zinc-300"
            }`}>
              {counts.total}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("submitted")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === "submitted"
                ? "bg-emerald-500 text-zinc-950 font-bold shadow"
                : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Pending Review
            <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
              statusFilter === "submitted" ? "bg-zinc-950 text-emerald-400" : "bg-emerald-500/20 text-emerald-300"
            }`}>
              {counts.pending}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("needs_correction")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === "needs_correction"
                ? "bg-amber-500 text-zinc-950 font-bold shadow"
                : "bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20"
            }`}
          >
            <AlertCircle className="w-3 h-3" />
            Correction Requested
            <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
              statusFilter === "needs_correction" ? "bg-zinc-950 text-amber-400" : "bg-amber-500/20 text-amber-300"
            }`}>
              {counts.correction}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("requested")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === "requested"
                ? "bg-blue-600 text-white font-bold shadow"
                : "bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20"
            }`}
          >
            <Clock className="w-3 h-3" />
            Awaiting Submission
            <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
              statusFilter === "requested" ? "bg-zinc-950 text-blue-300" : "bg-blue-500/20 text-blue-300"
            }`}>
              {counts.requested}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("approved")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === "approved"
                ? "bg-emerald-600 text-white font-bold shadow"
                : "bg-zinc-800/80 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
            }`}
          >
            Approved
            <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
              statusFilter === "approved" ? "bg-zinc-950 text-emerald-400" : "bg-zinc-700/60 text-zinc-300"
            }`}>
              {counts.approved}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("disputed")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === "disputed"
                ? "bg-red-500 text-white font-bold shadow"
                : "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
            }`}
          >
            Rejected
            <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
              statusFilter === "disputed" ? "bg-zinc-950 text-red-300" : "bg-red-500/20 text-red-300"
            }`}>
              {counts.disputed}
            </span>
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-950/20">
        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Search review by username..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-blue-500/50 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-zinc-500">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-blue-500/50"
          >
            <option value="">All Review Statuses ({counts.total})</option>
            <option value="submitted">Pending Review ({counts.pending})</option>
            <option value="needs_correction">Correction Requested ({counts.correction})</option>
            <option value="requested">Awaiting Submission ({counts.requested})</option>
            <option value="approved">Approved ({counts.approved})</option>
            <option value="disputed">Rejected ({counts.disputed})</option>
          </select>
        </div>
      </div>

      {/* Pagination Bar */}
      <div className="flex flex-col gap-3 border-b border-zinc-800 bg-zinc-950/10 px-4 py-3 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
        <span>
          Showing {firstItem}-{lastItem} of {sortedRequests.length} app review{sortedRequests.length === 1 ? "" : "s"}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-lg border border-zinc-800 px-3 py-1.5 font-semibold text-zinc-300 transition-colors hover:border-zinc-700 hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <span className="min-w-20 text-center font-semibold text-zinc-400">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-lg border border-zinc-800 px-3 py-1.5 font-semibold text-zinc-300 transition-colors hover:border-zinc-700 hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>

      {/* Table Content */}
      {paginatedRequests.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center text-zinc-500">
          <Users className="w-8 h-8 opacity-40" />
          <p className="text-sm">No app review requests or submissions found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold text-xs">User</th>
                <th className="px-6 py-4 font-semibold text-xs">Balance</th>
                <th className="px-6 py-4 font-semibold text-xs">Assigned Review &amp; Proof</th>
                <th className="px-6 py-4 font-semibold text-xs">Status</th>
                <th className="px-6 py-4 font-semibold text-xs">Submitted / Requested</th>
                <th className="px-6 py-4 font-semibold text-xs">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40">
              {paginatedRequests.map((request) => {
                const sub = reviewRequestToSubmission(request);
                const isViewing = viewingSubId === sub.id;
                const proofImages = getImagesList(request.reviewProof || "");
                const isActionable = request.status === "submitted";

                return (
                  <tr
                    key={request.id}
                    onClick={() => {
                      if (request.status !== "requested") {
                        onReview(sub);
                      }
                    }}
                    className={`hover:bg-zinc-800/20 transition-colors ${
                      request.status !== "requested" ? "cursor-pointer" : ""
                    } ${
                      isViewing
                        ? "bg-blue-500/10 border-l-2 border-l-blue-500"
                        : request.status === "needs_correction"
                          ? "bg-amber-500/[0.03]"
                          : ""
                    }`}
                  >
                    {/* User */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-xs font-bold text-blue-400 shrink-0">
                          {(request.user?.name ?? request.username).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-zinc-100 text-xs">{request.user?.name ?? "—"}</p>
                          <p className="text-zinc-400 text-[11px]">@{request.username}</p>
                          <span className="inline-block mt-0.5 rounded border border-zinc-700/60 bg-zinc-800/50 px-1.5 py-0.2 text-[9px] font-bold text-zinc-400 uppercase">
                            {request.sourceType}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Balance */}
                    <td className="px-6 py-4 text-xs font-semibold text-emerald-400">
                      {formatAmount(request.userBalance ?? 0)}
                    </td>

                    {/* Proof & Assigned Review Text */}
                    <td className="px-6 py-4 max-w-md">
                      <div className="space-y-2 py-1">
                        {request.reviewProof ? (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 text-blue-300 text-xs font-bold">
                              <ImageIcon className="w-3.5 h-3.5" />
                              App review proof ({proofImages.length})
                            </span>
                            <div className="flex gap-1.5">
                              {proofImages.map((img, idx) => (
                                <button
                                  key={`${img}-${idx}`}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onZoomImage(proofImages, idx);
                                  }}
                                  className="h-9 w-9 rounded-lg border border-zinc-700 overflow-hidden bg-zinc-900 hover:border-blue-400 transition"
                                >
                                  <img
                                    src={img}
                                    alt={`Proof ${idx + 1}`}
                                    className="h-full w-full object-cover"
                                  />
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-zinc-500 italic">
                            Waiting for user to submit review screenshot
                          </p>
                        )}

                        <div className="rounded-lg bg-zinc-950/60 border border-zinc-800/60 p-2 text-xs text-zinc-300">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-0.5">
                            Assigned Review Instructions:
                          </span>
                          <p className="line-clamp-2 text-[11px] text-zinc-300 font-medium">
                            {request.reviewText}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {request.status === "needs_correction" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                            Correction Requested
                          </span>
                        )}
                        {request.status === "submitted" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Pending Review
                          </span>
                        )}
                        {request.status === "requested" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-xs font-bold text-blue-300">
                            <Clock className="w-3 h-3" />
                            Awaiting Submission
                          </span>
                        )}
                        {request.status === "approved" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-300">
                            <CheckCircle className="w-3 h-3" />
                            Approved
                          </span>
                        )}
                        {request.status === "disputed" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-0.5 text-xs font-bold text-red-400">
                            <XCircle className="w-3 h-3" />
                            Rejected
                          </span>
                        )}

                        <p className="text-[11px] text-zinc-500">
                          App review · user reward{" "}
                          <strong className="text-emerald-400 font-bold">{formatAmount(request.workerAmount)}</strong>
                        </p>
                      </div>
                    </td>

                    {/* Submitted / Requested Date */}
                    <td className="px-6 py-4 text-xs text-zinc-400">
                      {formatDate(request.submittedAt || request.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex flex-col gap-1.5 min-w-32">
                        {isActionable && (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => onReview(sub)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors cursor-pointer"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              Review
                            </button>
                            <button
                              type="button"
                              onClick={() => onCorrection(sub)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors cursor-pointer"
                            >
                              <AlertCircle className="w-3.5 h-3.5" />
                              Correction
                            </button>
                            <button
                              type="button"
                              onClick={() => onReject(sub)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors cursor-pointer"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Reject
                            </button>
                          </div>
                        )}

                        {request.status === "needs_correction" && (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => onReview(sub)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors cursor-pointer"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              Review
                            </button>
                            <button
                              type="button"
                              onClick={() => onRewind(sub)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-violet-500/10 text-violet-300 border border-violet-500/20 hover:bg-violet-500/20 transition-colors cursor-pointer"
                            >
                              <Undo2 className="w-3.5 h-3.5" />
                              Rewind
                            </button>
                            <button
                              type="button"
                              onClick={() => onRemove(sub)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/30 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Remove
                            </button>
                          </div>
                        )}

                        {request.status === "requested" && (
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => onWithdraw(request)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-amber-500/10 hover:text-amber-300 hover:border-amber-500/30 transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            <Undo2 className="w-3.5 h-3.5" />
                            Withdraw review
                          </button>
                        )}

                        {(request.status === "approved" || request.status === "disputed") && (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => onRewind(sub)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-violet-500/10 text-violet-300 border border-violet-500/20 hover:bg-violet-500/20 transition-colors cursor-pointer"
                            >
                              <Undo2 className="w-3.5 h-3.5" />
                              Rewind
                            </button>
                            <button
                              type="button"
                              onClick={() => onRemove(sub)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/30 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
