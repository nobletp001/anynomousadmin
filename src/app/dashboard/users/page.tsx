'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/services/api-client'
import { Badge } from '@/components/ui'
import { Button } from '@/components/ui'
import { Users, AlertCircle, ChevronLeft, ChevronRight, ShieldOff, Ban, CreditCard, ClipboardX, X, Copy, Check, AlertTriangle } from 'lucide-react'

function formatAmount(n: number) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(n)
}

interface User {
  id: number
  name: string
  username: string
  email: string | null
  role: string
  createdAt: string
  disabled: boolean
  withdrawalDisabled: boolean
  taskDisabled: boolean
}

interface UsersResponse {
  success: boolean
  data: User[]
  total: number
  page: number
  limit: number
}

function roleBadgeVariant(role: string) {
  if (role === 'super-admin') return 'purple'
  if (role === 'admin') return 'info'
  if (role === 'accountant') return 'success'
  if (role === 'task-officer') return 'warning'
  return 'default'
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

function formatDateTime(d: string) {
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

interface AdminAction {
  id: number
  username: string
  actionType: 'warning' | 'deducted' | 'additional' | 'strike' | 'not_supported'
  message: string
  amount: number
  referenceId: string
  createdAt: string
}

function Toggle({
  checked,
  onChange,
  disabled,
  label,
  color = 'red',
}: {
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
  label: string
  color?: 'red' | 'amber' | 'orange'
}) {
  const activeColors = {
    red: 'bg-red-500',
    amber: 'bg-amber-500',
    orange: 'bg-orange-500',
  }
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative w-9 h-5 rounded-full transition-all shrink-0 ${
        disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
      } ${checked ? activeColors[color] : 'bg-zinc-700'}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

export default function UsersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const queryClient = useQueryClient()

  // Admin action states
  const [actionType, setActionType] = useState('warning')
  const [actionMessage, setActionMessage] = useState('')
  const [actionAmount, setActionAmount] = useState('')
  const [actionSubmitting, setActionSubmitting] = useState(false)
  const [actionError, setActionError] = useState('')
  const [actionSuccess, setActionSuccess] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Reset admin action states when selected user changes
  React.useEffect(() => {
    setActionType('warning')
    setActionMessage('')
    setActionAmount('')
    setActionError('')
    setActionSuccess('')
  }, [selectedUser])

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 400)
    return () => clearTimeout(handler)
  }, [search])

  const { data, isLoading, error, refetch } = useQuery<UsersResponse>({
    queryKey: ['admin-users', page, debouncedSearch],
    queryFn: () => apiClient.get(`/admin/users?page=${page}&limit=20&search=${encodeURIComponent(debouncedSearch)}`) as any,
  })

  const { data: userDetail, isLoading: isLoadingDetail } = useQuery({
    queryKey: ['admin-user-detail', selectedUser],
    queryFn: () => apiClient.get(`/admin/users/${selectedUser}`) as any,
    enabled: !!selectedUser,
  })

  const { data: topUsersData } = useQuery<{ success: boolean; data: Array<{ username: string; name: string; tasksCount: number; averageRating: number }> }>({
    queryKey: ['admin-top-performing-users'],
    queryFn: () => apiClient.get('/admin/users/top-performing') as any,
  })

  const updateFlags = useMutation({
    mutationFn: ({ id, flags }: { id: number; flags: Partial<Pick<User, 'disabled' | 'withdrawalDisabled' | 'taskDisabled'>> }) =>
      apiClient.patch(`/admin/users/${id}/flags`, flags) as any,
    onMutate: async ({ id, flags }) => {
      await queryClient.cancelQueries({ queryKey: ['admin-users', page] })
      const previous = queryClient.getQueryData<UsersResponse>(['admin-users', page])
      queryClient.setQueryData<UsersResponse>(['admin-users', page], old => {
        if (!old) return old
        return {
          ...old,
          data: old.data.map(u => {
            if (u.id !== id) return u
            const next = { ...u, ...flags }
            if (flags.disabled) {
              next.withdrawalDisabled = true
              next.taskDisabled = true
            }
            return next
          }),
        }
      })
      return { previous }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(['admin-users', page], ctx.previous)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users', page] })
    },
  })

  const handleSendAction = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return
    if (!actionMessage.trim()) {
      setActionError('Message is required')
      return
    }
    const amountVal = actionAmount ? parseFloat(actionAmount) : 0
    if ((actionType === 'deducted' || actionType === 'additional') && (isNaN(amountVal) || amountVal <= 0)) {
      setActionError('A valid positive amount is required for deductions or additions.')
      return
    }

    try {
      setActionSubmitting(true)
      setActionError('')
      setActionSuccess('')
      await apiClient.post(`/admin/users/${selectedUser}/actions`, {
        actionType,
        message: actionMessage.trim(),
        amount: amountVal,
      })
      setActionSuccess('Action recorded successfully!')
      setActionMessage('')
      setActionAmount('')
      // Invalidate the query to refresh user details
      queryClient.invalidateQueries({ queryKey: ['admin-user-detail', selectedUser] })
      // Invalidate the users list so statistics/available balances match
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    } catch (err: any) {
      console.error(err)
      setActionError(err.response?.data?.error || err.message || 'Failed to submit action')
    } finally {
      setActionSubmitting(false)
    }
  }

  const handleCopyRef = (refId: string) => {
    navigator.clipboard.writeText(refId)
    setCopiedId(refId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const totalPages = data ? Math.ceil(data.total / data.limit) : 1

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-100 tracking-tight">Users</h1>
          <p className="text-zinc-400 text-sm mt-1">All registered accounts — newest first</p>
        </div>
        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Search by name, @username, or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-purple-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Top 5 Performing Users monthly leaderboard */}
      {topUsersData?.data && topUsersData.data.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 px-1">
            <svg className="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            Top Performers (This Month)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {topUsersData.data.map((user, idx) => (
              <div
                key={user.username}
                onClick={() => setSelectedUser(user.username)}
                className="relative overflow-hidden backdrop-blur-md bg-zinc-900/30 hover:bg-zinc-800/40 border border-zinc-800/80 hover:border-purple-500/30 rounded-2xl p-4 cursor-pointer transition-all hover:scale-[1.02] group"
              >
                {/* Decorative background rank number */}
                <div className="absolute -right-2 -bottom-6 text-7xl font-extrabold text-purple-500/5 select-none font-sans group-hover:text-purple-500/10 transition-colors">
                  #{idx + 1}
                </div>
                
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-full border flex items-center justify-center text-[10px] font-black shrink-0 ${
                    idx === 0 ? 'bg-amber-400/10 border-amber-400/20 text-amber-400' :
                    idx === 1 ? 'bg-zinc-300/10 border-zinc-300/20 text-zinc-300' :
                    idx === 2 ? 'bg-amber-600/10 border-amber-600/20 text-amber-600' :
                    'bg-zinc-800/20 border-zinc-800/40 text-zinc-500'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-zinc-200 truncate group-hover:text-purple-400 transition-colors">{user.name}</p>
                    <p className="text-[10px] text-zinc-500 truncate">@{user.username}</p>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center justify-between border-t border-zinc-800/60 pt-3">
                  <div>
                    <p className="text-[9px] text-zinc-500 uppercase font-semibold">Completed</p>
                    <p className="text-[11px] font-bold text-emerald-450 mt-0.5">{user.tasksCount} tasks</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-zinc-500 uppercase font-semibold">Avg Rating</p>
                    <div className="flex items-center gap-1 mt-0.5 justify-end">
                      <span className="text-[11px] font-bold text-amber-450 font-mono">{Number(user.averageRating).toFixed(1)}</span>
                      <span className="text-[10px] text-amber-450 leading-none">★</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="backdrop-blur-md bg-zinc-900/30 border border-zinc-800/80 rounded-2xl shadow-xl overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-zinc-800/50">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex gap-4 px-6 py-4 animate-pulse">
                <div className="h-4 bg-zinc-800 rounded w-32" />
                <div className="h-4 bg-zinc-800 rounded w-28" />
                <div className="h-4 bg-zinc-800 rounded w-40" />
                <div className="h-4 bg-zinc-800 rounded w-20" />
                <div className="h-4 bg-zinc-800 rounded w-24" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <AlertCircle className="w-10 h-10 text-red-400" />
            <p className="text-zinc-400 text-sm">Failed to load users</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : (
          <>
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
                  {data?.data.length ? data.data.map((user) => (
                    <tr
                      key={user.id}
                      onClick={() => setSelectedUser(user.username)}
                      className={`transition-colors cursor-pointer ${user.disabled ? 'bg-red-500/5' : 'hover:bg-zinc-800/20'}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 ${
                            user.disabled
                              ? 'bg-zinc-900 border-zinc-700 text-zinc-600'
                              : 'bg-zinc-800 border-zinc-700/60 text-purple-400'
                          }`}>
                            {user.disabled
                              ? <Ban className="w-3.5 h-3.5" />
                              : user.name.charAt(0).toUpperCase()
                            }
                          </div>
                          <span className={`font-medium ${user.disabled ? 'text-zinc-500 line-through' : 'text-zinc-100'}`}>
                            {user.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-zinc-400">@{user.username}</td>
                      <td className="px-6 py-4 text-zinc-400">
                        {user.email ?? <span className="text-zinc-600">—</span>}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={roleBadgeVariant(user.role) as any} dot>{user.role}</Badge>
                      </td>
                      <td className="px-6 py-4 text-zinc-500 text-xs">{formatDate(user.createdAt)}</td>
                      <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-4">
                          {/* Disable account */}
                          <div className="flex items-center gap-1.5 group relative">
                            <Toggle
                              checked={user.disabled}
                              onChange={v => updateFlags.mutate({ id: user.id, flags: { disabled: v } })}
                              color="red"
                              label="Disable account"
                            />
                            <ShieldOff className={`w-3.5 h-3.5 transition-colors ${user.disabled ? 'text-red-400' : 'text-zinc-600'}`} />
                            <span className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-zinc-800 text-zinc-300 text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-zinc-700/60 z-10">
                              Account {user.disabled ? 'disabled' : 'active'}
                            </span>
                          </div>

                          <div className={`w-px h-4 bg-zinc-800 shrink-0`} />

                          {/* Disable withdrawal */}
                          <div className="flex items-center gap-1.5 group relative">
                            <Toggle
                              checked={user.withdrawalDisabled}
                              onChange={v => updateFlags.mutate({ id: user.id, flags: { withdrawalDisabled: v } })}
                              disabled={user.disabled}
                              color="amber"
                              label="Disable withdrawal"
                            />
                            <CreditCard className={`w-3.5 h-3.5 transition-colors ${user.withdrawalDisabled ? 'text-amber-400' : 'text-zinc-600'}`} />
                            <span className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-zinc-800 text-zinc-300 text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-zinc-700/60 z-10">
                              Withdrawal {user.withdrawalDisabled ? 'off' : 'on'}
                            </span>
                          </div>

                          <div className="w-px h-4 bg-zinc-800 shrink-0" />

                          {/* Disable task perform */}
                          <div className="flex items-center gap-1.5 group relative">
                            <Toggle
                              checked={user.taskDisabled}
                              onChange={v => updateFlags.mutate({ id: user.id, flags: { taskDisabled: v } })}
                              disabled={user.disabled}
                              color="orange"
                              label="Disable tasks"
                            />
                            <ClipboardX className={`w-3.5 h-3.5 transition-colors ${user.taskDisabled ? 'text-orange-400' : 'text-zinc-600'}`} />
                            <span className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-zinc-800 text-zinc-300 text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-zinc-700/60 z-10">
                              Tasks {user.taskDisabled ? 'off' : 'on'}
                            </span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )) : (
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
              <span className="text-xs text-zinc-500">
                Page {page} of {totalPages} · {data?.total ?? 0} total users
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline" size="sm"
                  onClick={() => setPage(p => p - 1)}
                  disabled={page === 1}
                  leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
                >Prev</Button>
                <Button
                  variant="outline" size="sm"
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= totalPages}
                  rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                >Next</Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-[11px] text-zinc-600 px-1">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500" /><ShieldOff className="w-3 h-3" /> Account disabled (all blocked)</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-amber-500" /><CreditCard className="w-3 h-3" /> Withdrawal blocked</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-orange-500" /><ClipboardX className="w-3 h-3" /> Tasks blocked</div>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-zinc-100">User Profile Details</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Full profile overview and earnings statistics</p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {isLoadingDetail ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-20 bg-zinc-800/40 rounded-xl" />
                  <div className="h-40 bg-zinc-800/40 rounded-xl" />
                </div>
              ) : !userDetail?.data ? (
                <p className="text-zinc-500 text-center py-6 text-sm">Failed to load user details.</p>
              ) : (
                (() => {
                  const { user, profile, bankDetails, stats, actions } = userDetail.data as {
                    user: User
                    profile: any
                    bankDetails: any
                    actions: AdminAction[]
                    stats: any
                  }
                  return (
                    <div className="space-y-6">
                      {/* Top Header details */}
                      <div className="flex items-center gap-4 bg-zinc-800/20 border border-zinc-800/60 p-4 rounded-xl">
                        <div className="w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-lg font-bold text-purple-400">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-zinc-100">{user.name}</h4>
                          <p className="text-sm text-zinc-400">@{user.username} · {user.email || 'No email'}</p>
                          <p className="text-xs text-zinc-650 mt-0.5">Joined {formatDate(user.createdAt)}</p>
                        </div>
                      </div>

                      {/* Stats cards grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-zinc-900 border border-zinc-800/60 p-3 rounded-xl text-center">
                          <p className="text-[10px] text-zinc-500 font-semibold uppercase">Pending Tasks</p>
                          <p className="text-lg font-bold text-amber-400 mt-1">{stats.submissions.pending}</p>
                        </div>
                        <div className="bg-zinc-950/20 border border-zinc-800/60 p-3 rounded-xl text-center">
                          <p className="text-[10px] text-zinc-500 font-semibold uppercase">Completed Tasks</p>
                          <p className="text-lg font-bold text-emerald-400 mt-1">{stats.submissions.approved}</p>
                        </div>
                        <div className="bg-zinc-950/20 border border-zinc-800/60 p-3 rounded-xl text-center">
                          <p className="text-[10px] text-zinc-500 font-semibold uppercase">Rejected Tasks</p>
                          <p className="text-lg font-bold text-red-400 mt-1">{stats.submissions.rejected}</p>
                        </div>
                        <div className="bg-zinc-950/20 border border-zinc-800/60 p-3 rounded-xl text-center">
                          <p className="text-[10px] text-zinc-500 font-semibold uppercase">Current Balance</p>
                          <p className="text-lg font-bold text-purple-400 mt-1">{formatAmount(stats.availableBalance)}</p>
                        </div>
                      </div>

                      {/* Financial Detail Breakdown */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-550">Financial breakdown</h4>
                        <div className="border border-zinc-800 rounded-xl bg-zinc-900/40 p-4 space-y-2.5 text-sm">
                          <div className="flex justify-between">
                            <span className="text-zinc-400">Task Earnings</span>
                            <span className="text-zinc-200 font-medium">{formatAmount(stats.taskEarnings)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-400">Referral Commissions</span>
                            <span className="text-zinc-200 font-medium">{formatAmount(stats.referralEarnings)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-400 text-red-400">Rejection Penalties</span>
                            <span className="text-red-400 font-medium">−{formatAmount(stats.taskDeductions)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-400">Total Claimed/Withdrawn</span>
                            <span className="text-zinc-200 font-medium">−{formatAmount(stats.totalClaimed)}</span>
                          </div>
                          <div className="h-px bg-zinc-800/60 my-2" />
                          <div className="flex justify-between font-semibold">
                            <span className="text-purple-300">Available Balance</span>
                            <span className="text-purple-300">{formatAmount(stats.availableBalance)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Demographic details */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-550">Demographics</h4>
                          <div className="border border-zinc-800 rounded-xl bg-zinc-900/40 p-4 space-y-2.5 text-xs">
                            <div className="flex justify-between">
                              <span className="text-zinc-500">Age / Gender:</span>
                              <span className="text-zinc-200 capitalize">
                                {profile?.age ? `${profile.age} yrs` : '—'} / {profile?.gender ? (profile.gender === 'male' ? 'Male' : profile.gender === 'female' ? 'Female' : 'Other') : '—'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-zinc-500">State:</span>
                              <span className="text-zinc-200">{profile?.state || '—'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-zinc-500">LGA / Town:</span>
                              <span className="text-zinc-200">
                                {profile?.lga || '—'} / {profile?.town || '—'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-zinc-500">Education:</span>
                              <span className="text-zinc-200 capitalize">{profile?.educationLevel || '—'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-zinc-500">Employment:</span>
                              <span className="text-zinc-200 capitalize">{profile?.employmentStatus || '—'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Bank Details */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-550">Bank details</h4>
                          <div className="border border-zinc-800 rounded-xl bg-zinc-900/40 p-4 space-y-2.5 text-xs">
                            <div className="flex justify-between">
                              <span className="text-zinc-500">Bank Name:</span>
                              <span className="text-zinc-200">{bankDetails?.bankName || '—'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-zinc-550">Account Name:</span>
                              <span className="text-zinc-200">{bankDetails?.accountName || '—'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-zinc-550">Account Number:</span>
                              <span className="text-zinc-200 font-mono tracking-wider">{bankDetails?.accountNumber || '—'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-zinc-550">WhatsApp:</span>
                              <span className="text-zinc-200">{bankDetails?.whatsappNumber || '—'}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="h-px bg-zinc-800 my-4" />

                      {/* Admin Actions Section */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                        {/* History Log */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Admin Actions History</h4>
                          <div className="border border-zinc-800 rounded-xl bg-zinc-950/20 p-4 space-y-4 max-h-[320px] overflow-y-auto">
                            {!actions || actions.length === 0 ? (
                              <p className="text-zinc-500 text-xs text-center py-8">No admin actions recorded for this user.</p>
                            ) : (
                              actions.map((act) => (
                                <div key={act.id} className="border border-zinc-800/60 bg-zinc-900/30 rounded-lg p-3 space-y-2 text-xs">
                                  <div className="flex items-center justify-between gap-2">
                                    <Badge
                                      variant={
                                        act.actionType === 'warning' ? 'warning' :
                                        act.actionType === 'strike' ? 'danger' :
                                        act.actionType === 'deducted' ? 'danger' :
                                        act.actionType === 'additional' ? 'success' : 'default'
                                      }
                                    >
                                      {act.actionType === 'warning' ? 'Warning' :
                                       act.actionType === 'strike' ? 'Strike' :
                                       act.actionType === 'deducted' ? 'Penalty Deduction' :
                                       act.actionType === 'additional' ? 'Bonus Addition' : 'Support Notice'}
                                    </Badge>
                                    <span className="text-[10px] text-zinc-550 font-mono">{formatDateTime(act.createdAt)}</span>
                                  </div>

                                  <p className="text-zinc-300 leading-relaxed break-words">{act.message}</p>

                                  {act.amount > 0 && (
                                    <div className="text-[11px] font-bold">
                                      {act.actionType === 'deducted' ? (
                                        <span className="text-red-400">Deduction: -{formatAmount(act.amount)}</span>
                                      ) : (
                                        <span className="text-emerald-400">Addition: +{formatAmount(act.amount)}</span>
                                      )}
                                    </div>
                                  )}

                                  <div className="flex items-center justify-between border-t border-zinc-800/40 pt-2 text-[10px] text-zinc-550 font-mono">
                                    <span>ID: {act.referenceId}</span>
                                    <button
                                      onClick={() => handleCopyRef(act.referenceId)}
                                      className="p-1 hover:text-zinc-350 rounded hover:bg-zinc-800 transition-colors"
                                      title="Copy Reference ID"
                                    >
                                      {copiedId === act.referenceId ? (
                                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                                      ) : (
                                        <Copy className="w-3.5 h-3.5" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        {/* Send New Action Form */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Send Action / Penalty</h4>
                          <form onSubmit={handleSendAction} className="border border-zinc-800 rounded-xl bg-zinc-900/40 p-4 space-y-3.5 text-xs">
                            {actionError && (
                              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-2.5 rounded-lg flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 shrink-0" />
                                <span>{actionError}</span>
                              </div>
                            )}

                            {actionSuccess && (
                              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-2.5 rounded-lg">
                                {actionSuccess}
                              </div>
                            )}

                            <div className="space-y-1.5">
                              <label className="text-zinc-400 font-semibold">Action Type</label>
                              <select
                                value={actionType}
                                onChange={e => {
                                  setActionType(e.target.value)
                                  setActionError('')
                                }}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 focus:outline-none focus:border-purple-500/50 transition-colors"
                              >
                                <option value="warning">Warning Notice</option>
                                <option value="strike">Account Strike</option>
                                <option value="deducted">Deduct Penalty Funds</option>
                                <option value="additional">Add Bonus Funds</option>
                                <option value="not_supported">Not Supported (Contact CEO)</option>
                              </select>
                            </div>

                            {(actionType === 'deducted' || actionType === 'additional') && (
                              <div className="space-y-1.5">
                                <label className="text-zinc-400 font-semibold">Amount (NGN)</label>
                                <input
                                  type="number"
                                  min="1"
                                  placeholder="e.g. 500"
                                  value={actionAmount}
                                  onChange={e => {
                                    setActionAmount(e.target.value)
                                    setActionError('')
                                  }}
                                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 font-mono focus:outline-none focus:border-purple-500/50 transition-colors"
                                  required
                                />
                              </div>
                            )}

                            <div className="space-y-1.5">
                              <label className="text-zinc-400 font-semibold">Message Description</label>
                              <textarea
                                placeholder={
                                  actionType === 'warning' ? "Explain what rule was violated..." :
                                  actionType === 'strike' ? "Provide details for the strike..." :
                                  actionType === 'deducted' ? "Explain the penalty / deduction reasoning..." :
                                  actionType === 'additional' ? "Explain the bonus reason..." :
                                  "Provide contact instructions or details for this support request..."
                                }
                                value={actionMessage}
                                onChange={e => {
                                  setActionMessage(e.target.value)
                                  setActionError('')
                                }}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 focus:outline-none focus:border-purple-500/50 transition-colors min-h-[70px] resize-none"
                                required
                              />
                            </div>

                            <Button
                              type="submit"
                              size="sm"
                              variant={actionType === 'additional' ? 'primary' : actionType === 'deducted' || actionType === 'strike' ? 'danger' : 'secondary'}
                              isLoading={actionSubmitting}
                              fullWidth
                            >
                              Submit Action
                            </Button>
                          </form>
                        </div>
                      </div>
                    </div>
                  )
                })()
              )}
            </div>

            <div className="p-6 border-t border-zinc-800 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setSelectedUser(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
