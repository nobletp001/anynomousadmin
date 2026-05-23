'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/services/api-client'
import { Badge } from '@/components/ui'
import { Button } from '@/components/ui'
import { CreditCard, AlertCircle, ChevronLeft, ChevronRight, CheckCircle, XCircle } from 'lucide-react'

interface PayoutClaim {
  id: number
  username: string
  amount: number
  status: string
  createdAt: string
  updatedAt: string
}

interface PayoutsResponse {
  success: boolean
  data: PayoutClaim[]
  total: number
  page: number
  limit: number
}

function statusVariant(status: string) {
  if (status === 'completed') return 'success'
  if (status === 'in review') return 'warning'
  if (status === 'rejected') return 'danger'
  return 'default'
}

function formatAmount(n: number) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(n)
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function PayoutsPage() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const queryClient = useQueryClient()

  const { data, isLoading, error, refetch } = useQuery<PayoutsResponse>({
    queryKey: ['admin-payouts', page, statusFilter],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (statusFilter) params.set('status', statusFilter)
      return apiClient.get(`/admin/payouts?${params}`) as any
    },
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      apiClient.patch(`/admin/payouts/${id}/status`, { status }) as any,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-payouts'] }),
  })

  const totalPages = data ? Math.ceil(data.total / data.limit) : 1

  const FILTERS = ['', 'in review', 'completed', 'rejected']

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-100 tracking-tight">Payout Claims</h1>
          <p className="text-zinc-400 text-sm mt-1">Review and action withdrawal requests</p>
        </div>
        <div className="flex items-center gap-2">
          {FILTERS.map((f) => (
            <button
              key={f || 'all'}
              onClick={() => { setStatusFilter(f); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === f
                  ? 'bg-purple-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {f || 'All'}
            </button>
          ))}
        </div>
      </div>

      <div className="backdrop-blur-md bg-zinc-900/30 border border-zinc-800/80 rounded-2xl shadow-xl overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-zinc-800/50">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex gap-4 px-6 py-4 animate-pulse">
                <div className="h-4 bg-zinc-800 rounded w-28" />
                <div className="h-4 bg-zinc-800 rounded w-24" />
                <div className="h-4 bg-zinc-800 rounded w-20" />
                <div className="h-4 bg-zinc-800 rounded w-32" />
                <div className="h-4 bg-zinc-800 rounded w-28 ml-auto" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <AlertCircle className="w-10 h-10 text-red-400" />
            <p className="text-zinc-400 text-sm">Failed to load payout claims</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-semibold">User</th>
                    <th className="px-6 py-4 font-semibold">Amount</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Submitted</th>
                    <th className="px-6 py-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/40">
                  {data?.data.length ? data.data.map((claim) => (
                    <tr key={claim.id} className="hover:bg-zinc-800/20 transition-colors">
                      <td className="px-6 py-4 font-medium text-zinc-100">@{claim.username}</td>
                      <td className="px-6 py-4 font-semibold text-zinc-200">{formatAmount(claim.amount)}</td>
                      <td className="px-6 py-4">
                        <Badge variant={statusVariant(claim.status)} dot>{claim.status}</Badge>
                      </td>
                      <td className="px-6 py-4 text-zinc-500 text-xs whitespace-nowrap">{formatDate(claim.createdAt)}</td>
                      <td className="px-6 py-4">
                        {claim.status === 'in review' && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateStatus.mutate({ id: claim.id, status: 'completed' })}
                              disabled={updateStatus.isPending}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              Approve
                            </button>
                            <button
                              onClick={() => updateStatus.mutate({ id: claim.id, status: 'rejected' })}
                              disabled={updateStatus.isPending}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center text-zinc-500">
                        <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        No payout claims found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800/60">
                <span className="text-xs text-zinc-500">Page {page} of {totalPages} · {data?.total} total</span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 1} leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}>Prev</Button>
                  <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page === totalPages} rightIcon={<ChevronRight className="w-3.5 h-3.5" />}>Next</Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
