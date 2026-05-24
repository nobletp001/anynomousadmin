'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter, useParams } from 'next/navigation'
import { apiClient } from '@/services/api-client'
import { Badge } from '@/components/ui'
import { Button } from '@/components/ui'
import {
  ArrowLeft, AlertCircle, CheckCircle, XCircle,
  ExternalLink, Users, Calendar, Coins, Image as ImageIcon, Link as LinkIcon,
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

  const { data, isLoading, error, refetch } = useQuery<SubmissionsResponse>({
    queryKey: ['task-submissions', taskId],
    queryFn: () => apiClient.get(`/admin/tasks/${taskId}/submissions`) as any,
  })

  const approveSubmission = useMutation({
    mutationFn: (subId: number) =>
      apiClient.patch(`/admin/tasks/${taskId}/submissions/${subId}`, { action: 'approve' }) as any,
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

  const closeRejectModal = () => {
    setRejectModal(null)
    setDeductAmount('')
    setRejectReason('')
  }

  const openRejectModal = (sub: Submission) => {
    setRejectModal({ subId: sub.id, username: sub.username, balance: sub.userBalance })
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
              <a
                href={task.targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors shrink-0"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View target
              </a>
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
                      <th className="px-6 py-4 font-semibold">User</th>
                      <th className="px-6 py-4 font-semibold">Balance</th>
                      <th className="px-6 py-4 font-semibold">Proof</th>
                      <th className="px-6 py-4 font-semibold">Text</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold">Submitted</th>
                      <th className="px-6 py-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/40">
                    {submissions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-zinc-800/20 transition-colors">
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
                          {sub.textResponse ? (
                            <span className="inline-block max-w-40 truncate text-xs text-zinc-300 bg-zinc-800/60 border border-zinc-700/40 rounded-lg px-2.5 py-1 font-medium" title={sub.textResponse}>
                              {sub.textResponse}
                            </span>
                          ) : (
                            <span className="text-zinc-700 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {sub.proofType === 'link' ? (
                            <a
                              href={sub.proof}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs transition-colors"
                            >
                              <LinkIcon className="w-3.5 h-3.5" />
                              View link
                            </a>
                          ) : (
                            <a
                              href={sub.proof}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-amber-400 hover:text-amber-300 text-xs transition-colors"
                            >
                              <ImageIcon className="w-3.5 h-3.5" />
                              View screenshot
                            </a>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <Badge variant={statusVariant(sub.status)} dot>{sub.status}</Badge>
                            {sub.status === 'rejected' && sub.rejectionReason && (
                              <p className="text-[10px] text-zinc-600 mt-0.5 max-w-35 truncate" title={sub.rejectionReason}>
                                {sub.rejectionReason}
                              </p>
                            )}
                            {sub.status === 'rejected' && sub.deductedAmount > 0 && (
                              <p className="text-[10px] text-red-400 mt-0.5">−{formatAmount(sub.deductedAmount)}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-zinc-500 text-xs whitespace-nowrap">{formatDate(sub.createdAt)}</td>
                        <td className="px-6 py-4">
                          {sub.status === 'pending' && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => approveSubmission.mutate(sub.id)}
                                disabled={approveSubmission.isPending}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                Approve
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

      {rejectModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-zinc-800">
              <h3 className="text-base font-bold text-zinc-100">Reject Submission</h3>
              <p className="text-sm text-zinc-400 mt-0.5">@{rejectModal.username}</p>
            </div>

            <div className="p-6 space-y-4">
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

              <div>
                <label className="block text-xs text-zinc-400 mb-1.5 font-medium">
                  Rejection reason <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  placeholder="Explain why this submission is being rejected..."
                  rows={3}
                  className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-colors resize-none"
                />
              </div>

              {rejectSubmission.error && (
                <p className="text-xs text-red-400">{(rejectSubmission.error as any)?.response?.data?.error ?? 'Failed to reject'}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 px-6 pb-6">
              <Button variant="outline" size="md" onClick={closeRejectModal} disabled={rejectSubmission.isPending}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="md"
                onClick={handleReject}
                isLoading={rejectSubmission.isPending}
                disabled={!rejectReason.trim()}
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
