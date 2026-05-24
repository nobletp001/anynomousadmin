'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/services/api-client'
import { Badge } from '@/components/ui'
import { Button } from '@/components/ui'
import { Users, AlertCircle, ChevronLeft, ChevronRight, ShieldOff, Ban, CreditCard, ClipboardX } from 'lucide-react'

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
  const queryClient = useQueryClient()

  const { data, isLoading, error, refetch } = useQuery<UsersResponse>({
    queryKey: ['admin-users', page],
    queryFn: () => apiClient.get(`/admin/users?page=${page}&limit=20`) as any,
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

  const totalPages = data ? Math.ceil(data.total / data.limit) : 1

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-100 tracking-tight">Users</h1>
        <p className="text-zinc-400 text-sm mt-1">All registered accounts — newest first</p>
      </div>

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
                    <tr key={user.id} className={`transition-colors ${user.disabled ? 'bg-red-500/5' : 'hover:bg-zinc-800/20'}`}>
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
                      <td className="px-6 py-4">
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
    </div>
  )
}
