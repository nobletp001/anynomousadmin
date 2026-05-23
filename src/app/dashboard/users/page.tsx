'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api-client'
import { Badge } from '@/components/ui'
import { Button } from '@/components/ui'
import { Users, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'

interface User {
  id: number
  name: string
  username: string
  email: string | null
  role: string
  createdAt: string
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

export default function UsersPage() {
  const [page, setPage] = useState(1)

  const { data, isLoading, error, refetch } = useQuery<UsersResponse>({
    queryKey: ['admin-users', page],
    queryFn: () => apiClient.get(`/admin/users?page=${page}&limit=20`) as any,
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/40">
                  {data?.data.length ? data.data.map((user) => (
                    <tr key={user.id} className="hover:bg-zinc-800/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-xs font-bold text-purple-400 shrink-0">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-zinc-100">{user.name}</span>
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
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center text-zinc-500">
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
    </div>
  )
}
