'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter, useParams } from 'next/navigation'
import { apiClient } from '@/services/api-client'
import { Badge } from '@/components/ui'
import { Button } from '@/components/ui'
import {
  ArrowLeft, AlertCircle, CheckCircle, XCircle, ChevronLeft, ChevronRight,
  ExternalLink, Users, Calendar, Coins, Image as ImageIcon, Link as LinkIcon, Download, Eye, FileText, X
} from 'lucide-react'

interface Task {
  id: number
  title: string
  description: string
  banner: string | null
  targetUrl: string
  timeline: string
  numberOfUsersNeeded: number
  amount: number
  taskType: string
  targetPlatform: string
  adminContact: string | null
  status: string
  approvedCount: number
  createdBy: string
}

interface UserInfo {
  id: number
  name: string
  username: string
}

interface Submission {
  id: number
  taskId: number
  username: string
  proof: string
  proofType: string
  textResponse: string | null
  numberResponse: string | null
  status: string
  rejectionReason: string | null
  deductedAmount: number
  createdAt: string
  user: UserInfo | null
  userBalance: number
}

interface SubmissionsResponse {
  success: boolean
  task: Task
  submissions: Submission[]
}

interface RejectModal {
  subId: number
  username: string
  balance: number
  mode: 'reject' | 'correction'
}

function formatAmount(n: number) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(n)
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function statusVariant(s: string) {
  if (s === 'approved') return 'success'
  if (s === 'rejected') return 'danger'
  return 'warning'
}

export default function TaskSubmissionsPage() {
  const router = useRouter()
  const params = useParams()
  const taskId = params.id as string
  const queryClient = useQueryClient()

  const [rejectModal, setRejectModal] = useState<RejectModal | null>(null)
  const [deductAmount, setDeductAmount] = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [searchFilter, setSearchFilter] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [viewingSub, setViewingSub] = useState<Submission | null>(null)
  const [rating, setRating] = useState<number | null>(null)
  const [feedback, setFeedback] = useState('')
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null)
  const [activeImagesList, setActiveImagesList] = useState<string[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [bulkRating, setBulkRating] = useState<number | null>(null)
  const [bulkRejectReason, setBulkRejectReason] = useState('')
  const [bulkMode, setBulkMode] = useState<'none' | 'approve' | 'reject'>('none')

  React.useEffect(() => {
    if (viewingSub) {
      setRating(null)
      setFeedback('')
      setActiveImageIndex(null)
      setActiveImagesList([])
    }
  }, [viewingSub])

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchFilter)
    }, 400)
    return () => clearTimeout(handler)
  }, [searchFilter])

  const { data, isLoading, error, refetch } = useQuery<SubmissionsResponse>({
    queryKey: ['task-submissions', taskId, statusFilter, debouncedSearch],
    queryFn: () => apiClient.get(`/admin/tasks/${taskId}/submissions?status=${statusFilter}&search=${encodeURIComponent(debouncedSearch)}`) as any,
  })

  const approveSubmission = useMutation({
    mutationFn: ({ subId, rating, feedback }: { subId: number; rating: number; feedback?: string }) =>
      apiClient.patch(`/admin/tasks/${taskId}/submissions/${subId}`, { action: 'approve', rating, feedback }) as any,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['task-submissions', taskId] }),
  })

  const rejectSubmission = useMutation({
    mutationFn: ({ subId, reason, deducted }: { subId: number; reason: string; deducted: number }) =>
      apiClient.patch(`/admin/tasks/${taskId}/submissions/${subId}`, {
        action: 'reject',
        rejectionReason: reason,
        deductedAmount: deducted,
      }) as any,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-submissions', taskId] })
      closeRejectModal()
    },
  })

  const requestCorrection = useMutation({
    mutationFn: ({ subId, reason }: { subId: number; reason: string }) =>
      apiClient.patch(`/admin/tasks/${taskId}/submissions/${subId}`, {
        action: 'needs_correction',
        rejectionReason: reason,
      }) as any,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-submissions', taskId] })
      closeRejectModal()
    },
  })

  const toggleTaskStatus = useMutation({
    mutationFn: (newStatus: 'active' | 'closed') =>
      apiClient.patch(`/admin/tasks/${taskId}/status`, { status: newStatus }) as any,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['task-submissions', taskId] }),
  })

  const bulkAction = useMutation({
    mutationFn: (payload: { ids: number[]; action: string; rating?: number; rejectionReason?: string; deductedAmount?: number }) =>
      apiClient.post(`/admin/tasks/${taskId}/submissions/bulk`, payload) as any,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-submissions', taskId] })
      setSelectedIds(new Set())
      setBulkMode('none')
      setBulkRating(null)
      setBulkRejectReason('')
    },
  })

  const closeRejectModal = () => {
    setRejectModal(null)
    setDeductAmount('')
    setRejectReason('')
  }

  const openRejectModal = (sub: Submission) => {
    setRejectModal({ subId: sub.id, username: sub.username, balance: sub.userBalance, mode: 'reject' })
    setDeductAmount('')
    setRejectReason('')
  }

  const openCorrectionModal = (sub: Submission) => {
    setRejectModal({ subId: sub.id, username: sub.username, balance: sub.userBalance, mode: 'correction' })
    setDeductAmount('')
    setRejectReason('')
  }

  const handleReject = () => {
    if (!rejectModal || !rejectReason.trim()) return
    rejectSubmission.mutate({
      subId: rejectModal.subId,
      reason: rejectReason,
      deducted: Number(deductAmount) || 0,
    })
  }

  const task = data?.task
  const submissions = data?.submissions ?? []

  const progress = task
    ? Math.min(100, Math.round((task.approvedCount / task.numberOfUsersNeeded) * 100))
    : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-100 tracking-tight">Submissions</h1>
          <p className="text-zinc-400 text-sm mt-0.5">Review and action user proof of task completion</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-32 bg-zinc-900/30 border border-zinc-800/80 rounded-2xl" />
          <div className="h-64 bg-zinc-900/30 border border-zinc-800/80 rounded-2xl" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <AlertCircle className="w-10 h-10 text-red-400" />
          <p className="text-zinc-400 text-sm">Failed to load submissions</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
        </div>
      ) : task && (
        <>
          <div className="backdrop-blur-md bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge variant={task.status === 'active' ? 'success' : 'default'} dot>{task.status}</Badge>
                  <span className="text-xs text-zinc-500 capitalize">{task.taskType}</span>
                  <span className="text-zinc-700">·</span>
                  <span className="text-xs text-zinc-500 capitalize">{task.targetPlatform}</span>
                </div>
                <h2 className="text-lg font-bold text-zinc-100">{task.title}</h2>
                <p className="text-sm text-zinc-400 mt-1 line-clamp-2">{task.description}</p>
              </div>
              <div className="flex items-center gap-3 self-start shrink-0">
                <button
                  onClick={() => toggleTaskStatus.mutate(task.status === 'active' ? 'closed' : 'active')}
                  disabled={toggleTaskStatus.isPending}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                    task.status === 'active'
                      ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20 hover:text-red-300'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 hover:text-emerald-300'
                  }`}
                >
                  {toggleTaskStatus.isPending
                    ? 'Updating...'
                    : task.status === 'active'
                    ? 'Close Task'
                    : 'Re-open Task'}
                </button>
                <a
                  href={task.targetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View target
                </a>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-zinc-800/60">
              <div>
                <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-semibold mb-1">Reward</p>
                <p className="text-sm font-bold text-emerald-400">{formatAmount(task.amount)}</p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-semibold mb-1">Capacity</p>
                <p className="text-sm font-bold text-zinc-200">{task.approvedCount} / {task.numberOfUsersNeeded}</p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-semibold mb-1">Deadline</p>
                <p className="text-sm font-bold text-zinc-200">{new Date(task.timeline).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-semibold mb-1">Submissions</p>
                <p className="text-sm font-bold text-zinc-200">{submissions.length}</p>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-zinc-500">Completion</span>
                <span className="font-semibold text-zinc-400">{progress}%</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${progress >= 100 ? 'bg-emerald-500' : 'bg-purple-500'}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="backdrop-blur-md bg-zinc-900/30 border border-zinc-800/80 rounded-2xl shadow-xl overflow-hidden">
            {/* Search and Filters Bar */}
            <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-950/20">
              <div className="w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search by username..."
                  value={searchFilter}
                  onChange={e => setSearchFilter(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-550 focus:outline-none focus:border-purple-500/50 transition-colors"
                />
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span className="text-xs text-zinc-550">Status:</span>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-purple-500/50"
                >
                  <option value="">All Submissions</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
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
                      {(() => {
                        const selectableSubmissions = submissions.filter(s => s.status === 'pending' || s.status === 'needs_correction')
                        if (selectableSubmissions.length === 0) return <th className="px-4 py-4 w-10" />
                        const allSelected = selectableSubmissions.length > 0 && selectableSubmissions.every(s => selectedIds.has(s.id))
                        return (
                          <th className="px-4 py-4 w-10">
                            <input
                              type="checkbox"
                              checked={allSelected}
                              onChange={() => {
                                if (allSelected) {
                                  setSelectedIds(new Set())
                                } else {
                                  setSelectedIds(new Set(selectableSubmissions.map(s => s.id)))
                                }
                              }}
                              className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 accent-purple-500 cursor-pointer"
                            />
                          </th>
                        )
                      })()}
                      <th className="px-6 py-4 font-semibold">User</th>
                      <th className="px-6 py-4 font-semibold">Balance</th>
                      <th className="px-6 py-4 font-semibold">Submission Proof &amp; Inputs</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold">Submitted</th>
                      <th className="px-6 py-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/40">
                    {submissions.map((sub) => (
                      <tr key={sub.id} className={`hover:bg-zinc-800/20 transition-colors ${selectedIds.has(sub.id) ? 'bg-purple-500/5' : ''}`}>
                        <td className="px-4 py-4 w-10">
                          {(sub.status === 'pending' || sub.status === 'needs_correction') ? (
                            <input
                              type="checkbox"
                              checked={selectedIds.has(sub.id)}
                              onChange={() => {
                                setSelectedIds(prev => {
                                  const next = new Set(prev)
                                  if (next.has(sub.id)) next.delete(sub.id)
                                  else next.add(sub.id)
                                  return next
                                })
                              }}
                              className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 accent-purple-500 cursor-pointer"
                            />
                          ) : (
                            <span className="text-zinc-700 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-xs font-bold text-purple-400 shrink-0">
                              {(sub.user?.name ?? sub.username).charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-zinc-100 text-xs">{sub.user?.name ?? '—'}</p>
                              <p className="text-zinc-500 text-[11px]">@{sub.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-emerald-400">
                          {formatAmount(sub.userBalance)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1.5 py-1">
                            {/* Proof URL or Image Gallery link */}
                            {sub.proofType === 'link' ? (
                              <a
                                href={sub.proof}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-blue-450 hover:text-blue-400 text-xs font-bold transition-colors"
                              >
                                <LinkIcon className="w-3.5 h-3.5" />
                                View URL Link
                              </a>
                            ) : (() => {
                              let count = 1;
                              if (sub.proof.startsWith('[')) {
                                try { count = JSON.parse(sub.proof).length; } catch { count = 1; }
                              }
                              return (
                                <button
                                  type="button"
                                  onClick={() => setViewingSub(sub)}
                                  className="inline-flex items-center gap-1.5 text-amber-455 hover:text-amber-400 text-xs font-bold transition-colors cursor-pointer"
                                >
                                  <ImageIcon className="w-3.5 h-3.5" />
                                  View Screenshots ({count})
                                </button>
                              )
                            })()}

                            {/* Additional Text / Number Responses details */}
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {sub.textResponse && (
                                <span
                                  className="inline-block max-w-44 truncate text-[10px] text-zinc-305 bg-zinc-900 border border-zinc-800/80 rounded px-2 py-0.5 font-medium cursor-pointer"
                                  title={sub.textResponse}
                                  onClick={() => setViewingSub(sub)}
                                >
                                  Text: {sub.textResponse}
                                </span>
                              )}
                              {sub.numberResponse && (
                                <span
                                  className="inline-block max-w-44 truncate text-[10px] text-purple-300 bg-purple-950/20 border border-purple-900/30 rounded px-2 py-0.5 font-medium cursor-pointer"
                                  title={sub.numberResponse}
                                  onClick={() => setViewingSub(sub)}
                                >
                                  Num: {sub.numberResponse}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <Badge variant={statusVariant(sub.status)} dot>{sub.status === 'needs_correction' ? 'correction requested' : sub.status}</Badge>
                            {(sub.status === 'rejected' || sub.status === 'needs_correction') && sub.rejectionReason && (
                              <p className="text-[10px] text-zinc-550 mt-0.5 max-w-44 truncate font-medium" title={sub.rejectionReason}>
                                Reason: {sub.rejectionReason}
                              </p>
                            )}
                            {sub.status === 'rejected' && sub.deductedAmount > 0 && (
                              <p className="text-[10px] text-red-400 mt-0.5">−{formatAmount(sub.deductedAmount)}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-zinc-500 text-xs whitespace-nowrap">{formatDate(sub.createdAt)}</td>
                        <td className="px-6 py-4">
                          {(sub.status === 'pending' || sub.status === 'needs_correction') && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setViewingSub(sub)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                Review
                              </button>
                              <button
                                onClick={() => openCorrectionModal(sub)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
                              >
                                <AlertCircle className="w-3.5 h-3.5" />
                                Correction
                              </button>
                              <button
                                onClick={() => openRejectModal(sub)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {selectedIds.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center px-4 pb-4 pointer-events-none">
          <div className="pointer-events-auto w-full max-w-3xl bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl shadow-black/40 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <span className="text-sm font-bold text-zinc-200 shrink-0">{selectedIds.size} selected</span>

            {bulkMode === 'none' && (
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setBulkMode('approve')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                >
                  Bulk Approve
                </button>
                <button
                  onClick={() => setBulkMode('reject')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                >
                  Bulk Reject
                </button>
                <button
                  onClick={() => setSelectedIds(new Set())}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  Clear selection
                </button>
              </div>
            )}

            {bulkMode === 'approve' && (
              <div className="flex flex-1 flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">Rating:</span>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setBulkRating(star)}
                      className={`text-xl transition-all ${bulkRating !== null && star <= bulkRating ? 'text-amber-400 scale-110' : 'text-zinc-600 hover:text-zinc-400'}`}
                    >
                      ★
                    </button>
                  ))}
                  {bulkRating !== null && <span className="text-xs text-zinc-400 font-mono">({bulkRating}.0)</span>}
                </div>
                <button
                  onClick={() => {
                    if (bulkRating === null) return
                    bulkAction.mutate({ ids: Array.from(selectedIds), action: 'approve', rating: bulkRating })
                  }}
                  disabled={bulkRating === null || bulkAction.isPending}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 text-zinc-950 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {bulkAction.isPending ? 'Approving...' : 'Confirm Approve'}
                </button>
                <button
                  onClick={() => { setBulkMode('none'); setBulkRating(null) }}
                  className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}

            {bulkMode === 'reject' && (
              <div className="flex flex-1 flex-wrap items-center gap-3">
                <textarea
                  value={bulkRejectReason}
                  onChange={e => setBulkRejectReason(e.target.value)}
                  placeholder="Rejection reason for all selected..."
                  rows={2}
                  className="flex-1 min-w-48 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-red-500/50 resize-none"
                />
                <button
                  onClick={() => {
                    if (!bulkRejectReason.trim()) return
                    bulkAction.mutate({ ids: Array.from(selectedIds), action: 'reject', rejectionReason: bulkRejectReason })
                  }}
                  disabled={!bulkRejectReason.trim() || bulkAction.isPending}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {bulkAction.isPending ? 'Rejecting...' : 'Confirm Reject'}
                </button>
                <button
                  onClick={() => { setBulkMode('none'); setBulkRejectReason('') }}
                  className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {rejectModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-zinc-800">
              <h3 className="text-base font-bold text-zinc-100">
                {rejectModal.mode === 'reject' ? 'Reject Submission' : 'Request Correction'}
              </h3>
              <p className="text-sm text-zinc-400 mt-0.5">@{rejectModal.username}</p>
            </div>

            <div className="p-6 space-y-4">
              {rejectModal.mode === 'reject' && (
                <>
                  <div className="flex items-center justify-between px-4 py-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                    <div>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Current Balance</p>
                      <p className="text-xl font-bold text-emerald-400 mt-0.5">{formatAmount(rejectModal.balance)}</p>
                    </div>
                    <Coins className="w-8 h-8 text-emerald-500/30" />
                  </div>

                  <div>
                    <label className="block text-xs text-zinc-400 mb-1.5 font-medium">
                      Deduct from balance <span className="text-zinc-600 font-normal">(optional, ₦)</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={rejectModal.balance}
                      value={deductAmount}
                      onChange={e => setDeductAmount(e.target.value)}
                      placeholder="0"
                      className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-colors"
                    />
                    {Number(deductAmount) > 0 && (
                      <p className="text-xs text-red-400 mt-1">
                        New balance after deduction: {formatAmount(rejectModal.balance - Number(deductAmount))}
                      </p>
                    )}
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs text-zinc-400 mb-1.5 font-medium">
                  Quick tags
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {[
                    'Screenshot is blurry/unreadable',
                    'Wrong account/handle shown',
                    rejectModal.mode === 'reject' ? 'No proof of follow/comment action' : 'Please upload a full screenshot showing follow action',
                    'Already completed this task',
                  ].map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setRejectReason(tag)}
                      className="px-2.5 py-1 rounded bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-[10px] transition-colors border border-zinc-700/60"
                    >
                      {tag.split(' ')[0]}... {tag.split(' ').slice(-2).join(' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1.5 font-medium">
                  {rejectModal.mode === 'reject' ? 'Rejection reason' : 'Correction instructions'} <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  placeholder={rejectModal.mode === 'reject' ? "Explain why this submission is being rejected..." : "Explain what the user needs to correct..."}
                  rows={3}
                  className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-650 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-colors resize-none"
                />
              </div>

              {(rejectSubmission.error || requestCorrection.error) && (
                <p className="text-xs text-red-400">
                  {((rejectSubmission.error || requestCorrection.error) as any)?.response?.data?.error ?? 'Action failed'}
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 px-6 pb-6">
              <Button variant="outline" size="md" onClick={closeRejectModal} disabled={rejectSubmission.isPending || requestCorrection.isPending}>
                Cancel
              </Button>
              {rejectModal.mode === 'correction' ? (
                <button
                  type="button"
                  onClick={() => {
                    if (!rejectModal || !rejectReason.trim()) return
                    requestCorrection.mutate({ subId: rejectModal.subId, reason: rejectReason })
                  }}
                  disabled={!rejectReason.trim() || requestCorrection.isPending}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-amber-500 text-zinc-950 hover:bg-amber-400 disabled:opacity-50 transition-colors"
                >
                  {requestCorrection.isPending ? 'Sending...' : 'Send Correction Request'}
                </button>
              ) : (
                <Button
                  variant="danger"
                  size="md"
                  onClick={handleReject}
                  isLoading={rejectSubmission.isPending}
                  disabled={!rejectReason.trim()}
                >
                  Confirm Rejection
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {viewingSub && (() => {
        const getDownloadUrl = (url: string) => {
          if (url.includes('cloudinary.com') && url.includes('image/upload/')) {
            return url.replace('image/upload/', 'image/upload/fl_attachment/');
          }
          return url;
        }

        return (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
              {/* Modal Header */}
              <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/20 shrink-0">
                <div>
                  <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-400" />
                    Submission Details
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Submitted by <span className="font-bold text-white">@{viewingSub.username}</span> ({viewingSub.user?.name || 'No Name'}) · {formatDate(viewingSub.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => setViewingSub(null)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-250 hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Info Panel */}
                <div className="md:col-span-5 space-y-5">
                  <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 space-y-4">
                    <h4 className="text-[10px] font-bold text-zinc-550 uppercase tracking-widest border-b border-zinc-800 pb-1.5">User Details</h4>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-805 border border-zinc-700 flex items-center justify-center font-bold text-purple-400">
                        {(viewingSub.user?.name ?? viewingSub.username).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-zinc-200">{viewingSub.user?.name || '—'}</p>
                        <p className="text-zinc-500 text-xs">@{viewingSub.username}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-zinc-900/60">
                      <div>
                        <p className="text-[10px] text-zinc-500 uppercase font-semibold">Wallet Balance</p>
                        <p className="text-sm font-bold text-emerald-400 mt-0.5">{formatAmount(viewingSub.userBalance)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-zinc-500 uppercase font-semibold">Status</p>
                        <div className="mt-1">
                          <Badge variant={statusVariant(viewingSub.status)} dot>{viewingSub.status}</Badge>
                        </div>
                      </div>
                    </div>
                    {(viewingSub.user as any)?.whatsappNumber && (
                      <div className="pt-2 border-t border-zinc-900/60 flex flex-col gap-0.5">
                        <p className="text-[10px] text-zinc-500 uppercase font-semibold">WhatsApp Contact</p>
                        <a
                          href={`https://wa.me/${(viewingSub.user as any).whatsappNumber.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 mt-0.5"
                        >
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.022-.08-.05-.088-.413-.236-.363-.147-2.145-.92-2.474-1.018-.33-.1-.57-.148-.813.147-.243.295-.94.92-1.154 1.121-.215.203-.43.226-.793.08-.363-.146-1.53-.497-2.915-1.572-1.077-.828-1.805-1.85-2.017-2.016-.215-.164-.022-.253.16-.395.163-.127.363-.377.545-.566.181-.19.242-.324.363-.54.12-.217.06-.407-.03-.556-.09-.15-.813-1.706-1.115-2.311-.295-.623-.596-.538-.814-.548-.21-.01-.451-.01-.692-.01-.24 0-.632.08-.962.403-.33.324-1.262 1.07-1.262 2.612 0 1.543 1.259 3.033 1.433 3.237.174.204 2.477 3.32 6.002 4.606.837.306 1.492.488 2.003.629.84.237 1.607.202 2.213.125.674-.085 2.07-.732 2.362-1.442.29-.71.29-1.319.202-1.443-.088-.124-.29-.204-.653-.352zm2.136-11.007c-2.28-2.28-5.309-3.535-8.532-3.535C5.034 0 0 4.398 0 10.14c0 1.83.522 3.618 1.509 5.167L0 21.6l6.398-1.467c1.488.72 3.149 1.1 4.847 1.1 6.046 0 10.963-4.398 10.963-10.14 0-2.782-1.218-5.4-3.498-7.718z" />
                          </svg>
                          {(viewingSub.user as any).whatsappNumber}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Form responses */}
                  <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 space-y-4">
                    <h4 className="text-[10px] font-bold text-zinc-550 uppercase tracking-widest border-b border-zinc-800 pb-1.5">Collected Input Responses</h4>
                    
                    {/* Text Response */}
                    <div className="space-y-1.5">
                      <p className="text-[10px] text-zinc-500 uppercase font-semibold">Collected Text Details</p>
                      {viewingSub.textResponse ? (
                        <div className="flex items-start gap-2 bg-zinc-900 p-2.5 rounded-lg border border-zinc-800">
                          <p className="text-xs text-zinc-200 flex-1 break-all font-medium select-all">{viewingSub.textResponse}</p>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(viewingSub.textResponse || '');
                            }}
                            className="text-[10px] text-purple-400 hover:text-purple-300 font-bold shrink-0 cursor-pointer"
                          >
                            Copy
                          </button>
                        </div>
                      ) : (
                        <p className="text-xs text-zinc-600 italic">No text details collected</p>
                      )}
                    </div>

                    {/* Number Response */}
                    <div className="space-y-1.5 pt-3 border-t border-zinc-900/60">
                      <p className="text-[10px] text-zinc-500 uppercase font-semibold">Collected Numeric Details</p>
                      {viewingSub.numberResponse ? (
                        <div className="bg-zinc-900 p-2.5 rounded-lg border border-zinc-800">
                          <p className="text-sm font-bold text-purple-300 select-all">{viewingSub.numberResponse}</p>
                        </div>
                      ) : (
                        <p className="text-xs text-zinc-600 italic">No numeric details collected</p>
                      )}
                    </div>
                  </div>

                  {/* Verification Verdict / Rating Input */}
                  {(viewingSub.status === 'pending' || viewingSub.status === 'needs_correction') && (
                    <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 space-y-4">
                      <h4 className="text-[10px] font-bold text-zinc-550 uppercase tracking-widest border-b border-zinc-800 pb-1.5">Action Rating (Required)</h4>
                      <div className="space-y-2">
                        <p className="text-[10px] text-zinc-500 uppercase font-semibold">Select Star Rating</p>
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRating(star)}
                              className={`text-2xl transition-all ${
                                rating !== null && star <= rating ? 'text-amber-400 scale-110' : 'text-zinc-700 hover:text-zinc-400'
                              }`}
                            >
                              ★
                            </button>
                          ))}
                          {rating !== null && <span className="text-xs text-zinc-400 font-mono ml-1.5">({rating}.0)</span>}
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-[10px] text-zinc-500 uppercase font-semibold">Feedback (Optional)</p>
                        <textarea
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          placeholder="Provide performance feedback or verification remarks..."
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-100 placeholder:text-zinc-550 focus:outline-none focus:border-purple-500/50 min-h-[60px]"
                        />
                      </div>
                    </div>
                  )}

                  {/* Read-only rating if already approved */}
                  {viewingSub.status === 'approved' && (viewingSub as any).rating !== undefined && (viewingSub as any).rating !== null && (
                    <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/[0.02] p-4 space-y-3">
                      <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest border-b border-emerald-950 pb-1.5">Approved Verdict</h4>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-zinc-500 uppercase font-semibold">Rating:</span>
                        <div className="flex text-amber-400 text-xs">
                          {"★".repeat((viewingSub as any).rating)}{"☆".repeat(5 - (viewingSub as any).rating)}
                        </div>
                        <span className="text-xs text-zinc-400 font-mono">({(viewingSub as any).rating}.0)</span>
                      </div>
                      {(viewingSub as any).feedback && (
                        <div className="space-y-1">
                          <span className="text-[10px] text-zinc-550 uppercase font-semibold block">Feedback:</span>
                          <p className="text-xs text-zinc-300 italic bg-zinc-950/20 p-2.5 rounded-lg border border-zinc-900/60 leading-relaxed">&ldquo;{(viewingSub as any).feedback}&rdquo;</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Submission Info / Rejection reason */}
                  {(viewingSub.status === 'rejected' || viewingSub.status === 'needs_correction') && viewingSub.rejectionReason && (
                    <div className="rounded-xl border border-red-500/10 bg-red-500/[0.02] p-4 space-y-2">
                      <h4 className="text-[10px] font-bold text-red-400 uppercase tracking-widest flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {viewingSub.status === 'rejected' ? 'Rejection Reason' : 'Correction Instructions'}
                      </h4>
                      <p className="text-xs text-zinc-300 leading-relaxed font-medium">{viewingSub.rejectionReason}</p>
                      {viewingSub.status === 'rejected' && viewingSub.deductedAmount > 0 && (
                        <p className="text-[10px] text-red-400 font-semibold mt-1">Deducted from balance: -{formatAmount(viewingSub.deductedAmount)}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Gallery / Link Panel */}
                <div className="md:col-span-7 space-y-4">
                  <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 h-full flex flex-col min-h-[300px]">
                    <h4 className="text-[10px] font-bold text-zinc-550 uppercase tracking-widest border-b border-zinc-800 pb-1.5 mb-4 shrink-0">Submitted Proof</h4>

                    {viewingSub.proofType === 'link' ? (
                      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-6 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/10">
                        <LinkIcon className="w-10 h-10 text-blue-400" />
                        <div>
                          <p className="font-bold text-sm text-zinc-200">URL Link Proof</p>
                          <p className="text-xs text-zinc-500 mt-1 max-w-sm truncate">{viewingSub.proof}</p>
                        </div>
                        <a
                          href={viewingSub.proof}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-605 hover:bg-blue-500 text-xs font-bold text-white transition-all shadow-lg"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Open Link in New Tab
                        </a>
                      </div>
                    ) : (() => {
                      let imagesList: string[] = [];
                      if (viewingSub.proof.startsWith('[')) {
                        try { imagesList = JSON.parse(viewingSub.proof); } catch { imagesList = [viewingSub.proof]; }
                      } else {
                        imagesList = [viewingSub.proof];
                      }

                      if (imagesList.length === 0) {
                        return (
                          <div className="flex-1 flex items-center justify-center text-xs text-zinc-650 italic">
                            No images submitted
                          </div>
                        )
                      }

                      return (
                        <div className="flex-1 flex flex-col">
                          <div className="grid grid-cols-1 gap-4 overflow-y-auto max-h-[420px] pr-1">
                            {imagesList.map((imgUrl, idx) => (
                              <div key={idx} className="rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 p-2 space-y-3">
                                <div
                                  onClick={() => {
                                    setActiveImagesList(imagesList);
                                    setActiveImageIndex(idx);
                                  }}
                                  className="relative aspect-video w-full overflow-hidden rounded-lg border border-zinc-950 cursor-zoom-in hover:opacity-90 transition-opacity"
                                >
                                  <img
                                    src={imgUrl}
                                    alt={`Screenshot Proof ${idx + 1}`}
                                    className="w-full h-full object-contain bg-black"
                                  />
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Screenshot #{idx + 1} of {imagesList.length}</span>
                                  <div className="flex items-center gap-2">
                                    <a
                                      href={imgUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-[11px] font-semibold text-zinc-400 hover:text-zinc-200 transition"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                      View Full Size
                                    </a>
                                    <a
                                      href={getDownloadUrl(imgUrl)}
                                      download={`proof-${viewingSub.username}-${idx + 1}.jpg`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/20 border border-purple-500/30 hover:bg-purple-600/30 text-[11px] font-bold text-purple-300 transition"
                                    >
                                      <Download className="w-3.5 h-3.5" />
                                      Download
                                    </a>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="p-5 border-t border-zinc-800 flex items-center justify-between bg-zinc-950/20 shrink-0">
                <Button variant="outline" size="md" onClick={() => setViewingSub(null)}>
                  Close Details
                </Button>
                
                {(viewingSub.status === 'pending' || viewingSub.status === 'needs_correction') && (
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => {
                        const sub = viewingSub;
                        setViewingSub(null);
                        openCorrectionModal(sub);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      Request Correction
                    </button>
                    <button
                      onClick={() => {
                        const sub = viewingSub;
                        setViewingSub(null);
                        openRejectModal(sub);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject Submission
                    </button>
                    <button
                      onClick={() => {
                        if (rating === null) return;
                        approveSubmission.mutate({ subId: viewingSub.id, rating, feedback });
                        setViewingSub(null);
                      }}
                      disabled={approveSubmission.isPending || rating === null}
                      className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 text-zinc-950 hover:bg-emerald-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Approve Proof
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })()}

      {activeImageIndex !== null && activeImagesList.length > 0 && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[100] flex flex-col items-center justify-center p-4">
          {/* Close button */}
          <button
            onClick={() => setActiveImageIndex(null)}
            className="absolute top-6 right-6 p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          {/* Image Container */}
          <div className="relative max-w-5xl w-full h-[75vh] flex items-center justify-center">
            {/* Prev Button */}
            {activeImagesList.length > 1 && (
              <button
                onClick={() => setActiveImageIndex((idx) => (idx !== null ? (idx - 1 + activeImagesList.length) % activeImagesList.length : null))}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-300 hover:text-white transition-all shadow-lg hover:scale-105"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            <img
              src={activeImagesList[activeImageIndex]}
              alt={`Fullscreen Proof ${activeImageIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-lg border border-zinc-950 shadow-2xl"
            />

            {/* Next Button */}
            {activeImagesList.length > 1 && (
              <button
                onClick={() => setActiveImageIndex((idx) => (idx !== null ? (idx + 1) % activeImagesList.length : null))}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-300 hover:text-white transition-all shadow-lg hover:scale-105"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>
          
          {/* Controls Footer */}
          <div className="mt-6 flex flex-col items-center gap-2">
            <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider">
              Screenshot {activeImageIndex + 1} of {activeImagesList.length}
            </span>
            <div className="flex gap-2">
              <a
                href={activeImagesList[activeImageIndex]}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white transition"
              >
                <Eye className="w-4 h-4" />
                View Full Size
              </a>
              <a
                href={activeImagesList[activeImageIndex]}
                download={`proof-${viewingSub?.username || 'user'}-${activeImageIndex + 1}.jpg`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600/20 border border-purple-500/30 hover:bg-purple-600/30 text-xs font-bold text-purple-300 transition"
              >
                <Download className="w-4 h-4" />
                Download
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
