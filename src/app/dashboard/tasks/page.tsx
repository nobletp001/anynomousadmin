'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/services/api-client'
import { authQueryKey, authQueryFn } from '@/lib/auth'
import { Badge } from '@/components/ui'
import { Button } from '@/components/ui'
import {
  ClipboardList, AlertCircle, Plus, Trash2, Users,
  Calendar, Coins, ChevronRight, Infinity, X, UserCircle2,
} from 'lucide-react'

interface Task {
  id: number
  title: string
  description: string
  banner: string | null
  timeline: string | null
  lifeline: boolean
  numberOfUsersNeeded: number
  amount: number
  taskType: string
  targetPlatform: string
  proofType: string
  adminContact: string | null
  status: string
  approvedCount: number
  createdBy: string
  createdAt: string
  submissionCount: number
}

interface TasksResponse {
  success: boolean
  data: Task[]
}

const PLATFORM_COLORS: Record<string, string> = {
  whatsapp: 'bg-green-500/10 text-green-400 border-green-500/20',
  tiktok: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  facebook: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  x: 'bg-zinc-500/10 text-zinc-300 border-zinc-500/20',
  instagram: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  youtube: 'bg-red-500/10 text-red-400 border-red-500/20',
  other: 'bg-zinc-800/60 text-zinc-400 border-zinc-700/60',
}

function platformLabel(p: string) {
  return ({ x: 'X (Twitter)', youtube: 'YouTube', other: 'Other' } as Record<string, string>)[p] ?? p.charAt(0).toUpperCase() + p.slice(1)
}

function taskTypeLabel(t: string) {
  const map: Record<string, string> = {
    follow: 'Follow', like: 'Like', comment: 'Comment', subscribe: 'Subscribe',
    share: 'Share', 'post-content': 'Post Content', views: 'Views', download: 'Download',
    signup: 'Sign Up', review: 'Review', message: 'Message', watch: 'Watch',
    'use-app': 'Use App', jetpot: 'Jetpot',
  }
  return map[t] ?? t
}

function formatAmount(n: number) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(n)
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function isExpired(task: Task) {
  if (task.lifeline || !task.timeline) return false
  return new Date(task.timeline) < new Date()
}

function getDateLabel(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const taskDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diffDays = Math.round((today.getTime() - taskDay.getTime()) / 86_400_000)

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays === 2) return '2 Days Ago'
  if (diffDays === 3) return '3 Days Ago'
  if (diffDays === 4) return '4 Days Ago'
  if (diffDays === 5) return '5 Days Ago'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function groupByDate(tasks: Task[]): { label: string; tasks: Task[] }[] {
  const map = new Map<string, Task[]>()
  const order: string[] = []
  for (const t of tasks) {
    const label = getDateLabel(t.createdAt)
    if (!map.has(label)) { map.set(label, []); order.push(label) }
    map.get(label)!.push(t)
  }
  return order.map(label => ({ label, tasks: map.get(label)! }))
}

type StatusFilter = 'all' | 'active' | 'completed' | 'paused'

export default function TasksPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [confirmDelete, setConfirmDelete] = useState<{ id: number; title: string } | null>(null)
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false)

  const { data: user } = useQuery({ queryKey: authQueryKey, queryFn: authQueryFn, staleTime: 5 * 60 * 1000, retry: false })

  const { data, isLoading, error, refetch } = useQuery<TasksResponse>({
    queryKey: ['admin-tasks'],
    queryFn: () => apiClient.get('/admin/tasks') as any,
  })

  const deleteTask = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/admin/tasks/${id}`) as any,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tasks'] })
      setConfirmDelete(null)
    },
  })

  const deleteAllTasks = useMutation({
    mutationFn: () => apiClient.delete('/admin/tasks/all') as any,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tasks'] })
      setConfirmDeleteAll(false)
    },
  })

  const canManage = user?.role === 'super-admin' || user?.role === 'admin'
  const isSuperAdmin = user?.role === 'super-admin'

  const allTasks = data?.data ?? []
  const filtered = statusFilter === 'all' ? allTasks : allTasks.filter(t => t.status === statusFilter)
  const groups = groupByDate(filtered)

  const counts = {
    all: allTasks.length,
    active: allTasks.filter(t => t.status === 'active').length,
    completed: allTasks.filter(t => t.status === 'completed').length,
    paused: allTasks.filter(t => t.status === 'paused').length,
  }

  const TABS: { id: StatusFilter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'active', label: 'Active' },
    { id: 'completed', label: 'Completed' },
    { id: 'paused', label: 'Paused' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-100 tracking-tight">Tasks</h1>
          <p className="text-zinc-400 text-sm mt-1">Social engagement &amp; referral tasks — click a card to review submissions</p>
        </div>
        {canManage && (
          <div className="flex items-center gap-2">
            {isSuperAdmin && allTasks.length > 0 && (
              <Button
                variant="outline"
                size="md"
                onClick={() => setConfirmDeleteAll(true)}
                leftIcon={<Trash2 className="w-4 h-4 text-red-400" />}
                className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
              >
                Delete All
              </Button>
            )}
            <Button
              variant="primary"
              size="md"
              onClick={() => router.push('/dashboard/tasks/create')}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Create Task
            </Button>
          </div>
        )}
      </div>

      {/* Status tabs */}
      {!isLoading && !error && (
        <div className="flex items-center gap-1 border-b border-zinc-800">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-all ${
                statusFilter === tab.id
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab.label}
              {counts[tab.id] > 0 && (
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  statusFilter === tab.id ? 'bg-purple-500/20 text-purple-300' : 'bg-zinc-800 text-zinc-500'
                }`}>
                  {counts[tab.id]}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-5 animate-pulse space-y-3">
              <div className="h-4 bg-zinc-800 rounded w-3/4" />
              <div className="h-3 bg-zinc-800 rounded w-full" />
              <div className="h-3 bg-zinc-800 rounded w-1/2" />
              <div className="h-2 bg-zinc-800 rounded-full" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <AlertCircle className="w-10 h-10 text-red-400" />
          <p className="text-zinc-400 text-sm">Failed to load tasks</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center backdrop-blur-md bg-zinc-900/30 border border-zinc-800/80 rounded-2xl">
          <ClipboardList className="w-10 h-10 text-zinc-600" />
          <p className="text-zinc-400 text-sm font-medium">
            {statusFilter === 'all' ? 'No tasks yet' : `No ${statusFilter} tasks`}
          </p>
          {canManage && statusFilter === 'all' && (
            <Button variant="primary" size="sm" onClick={() => router.push('/dashboard/tasks/create')} leftIcon={<Plus className="w-4 h-4" />}>
              Create your first task
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map(({ label, tasks }) => (
            <div key={label} className="space-y-4">
              {/* Date group header */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-extrabold uppercase tracking-widest text-zinc-500">{label}</span>
                <div className="flex-1 h-px bg-zinc-800/80" />
                <span className="text-[10px] font-semibold text-zinc-600 tabular-nums">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {tasks.map((task) => {
                  const progress = task.numberOfUsersNeeded > 0
                    ? Math.min(100, Math.round((task.approvedCount / task.numberOfUsersNeeded) * 100))
                    : 0
                  const expired = isExpired(task)

                  return (
                    <div
                      key={task.id}
                      onClick={() => router.push(`/dashboard/tasks/${task.id}`)}
                      className="group relative backdrop-blur-md bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-5 shadow-xl hover:border-purple-500/30 hover:bg-zinc-900/50 transition-all duration-200 cursor-pointer"
                    >
                      {canManage && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setConfirmDelete({ id: task.id, title: task.title }) }}
                          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100 z-10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}

                      {/* Creator fingerprint */}
                      <div className="flex items-center gap-2 mb-3 px-2.5 py-1.5 rounded-lg bg-zinc-800/50 border border-zinc-700/40 w-fit">
                        <UserCircle2 className="w-3 h-3 text-purple-400 shrink-0" />
                        <span className="text-[10px] font-bold text-purple-300 tracking-wide">@{task.createdBy}</span>
                      </div>

                      <div className="flex items-start gap-3 mb-3 pr-8">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${PLATFORM_COLORS[task.targetPlatform] ?? 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
                              {platformLabel(task.targetPlatform)}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                              {taskTypeLabel(task.taskType)}
                            </span>
                            <Badge variant={task.status === 'active' ? (expired ? 'warning' : 'success') : 'default'} dot>
                              {expired ? 'Expired' : task.status}
                            </Badge>
                          </div>
                          <h3 className="font-semibold text-zinc-100 text-sm leading-snug line-clamp-2">{task.title}</h3>
                        </div>
                      </div>

                      <p className="text-xs text-zinc-500 line-clamp-2 mb-4">{task.description}</p>

                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-zinc-500">Progress</span>
                          <span className="font-semibold text-zinc-300">{task.approvedCount} / {task.numberOfUsersNeeded}</span>
                        </div>
                        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${progress >= 100 ? 'bg-emerald-500' : 'bg-purple-500'}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-zinc-500 border-t border-zinc-800/60 pt-3 mt-3">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 font-semibold text-emerald-400">
                            <Coins className="w-3 h-3" />
                            {formatAmount(task.amount)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {task.submissionCount} submitted
                          </span>
                        </div>
                        <div className={`flex items-center gap-1 ${expired ? 'text-red-400' : 'text-zinc-500'}`}>
                          {task.lifeline ? (
                            <span className="flex items-center gap-1 text-violet-400">
                              <Infinity className="w-3 h-3" />
                              No expiry
                            </span>
                          ) : task.timeline ? (
                            <>
                              <Calendar className="w-3 h-3" />
                              {formatDate(task.timeline)}
                            </>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex items-center justify-end mt-3">
                        <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-purple-400 transition-colors" />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete All modal */}
      {confirmDeleteAll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 space-y-5 animate-fade-up">
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <button onClick={() => setConfirmDeleteAll(false)} className="p-1 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1.5">
              <h2 className="text-base font-bold text-zinc-100">Delete all tasks?</h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                This will permanently delete all{' '}
                <span className="font-semibold text-zinc-200">{allTasks.length} task{allTasks.length !== 1 ? 's' : ''}</span>{' '}
                and all their submissions. This cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDeleteAll(false)} disabled={deleteAllTasks.isPending} className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800/60 py-2.5 text-sm font-semibold text-zinc-300 hover:bg-zinc-800 transition-colors disabled:opacity-40">
                Cancel
              </button>
              <button onClick={() => deleteAllTasks.mutate()} disabled={deleteAllTasks.isPending} className="flex-1 rounded-xl bg-red-500/90 hover:bg-red-500 py-2.5 text-sm font-bold text-white transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
                {deleteAllTasks.isPending ? (
                  <><span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Deleting…</>
                ) : (
                  <><Trash2 className="w-4 h-4" />Yes, Delete All</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete single modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 space-y-5 animate-fade-up">
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <button onClick={() => setConfirmDelete(null)} className="p-1 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1.5">
              <h2 className="text-base font-bold text-zinc-100">Delete task?</h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Are you sure you want to delete{' '}
                <span className="font-semibold text-zinc-200">&ldquo;{confirmDelete.title}&rdquo;</span>?
                This will also remove all submissions. This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} disabled={deleteTask.isPending} className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800/60 py-2.5 text-sm font-semibold text-zinc-300 hover:bg-zinc-800 transition-colors disabled:opacity-40">
                Cancel
              </button>
              <button onClick={() => deleteTask.mutate(confirmDelete.id)} disabled={deleteTask.isPending} className="flex-1 rounded-xl bg-red-500/90 hover:bg-red-500 py-2.5 text-sm font-bold text-white transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
                {deleteTask.isPending ? (
                  <><span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Deleting…</>
                ) : (
                  <><Trash2 className="w-4 h-4" />Yes, Delete</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
