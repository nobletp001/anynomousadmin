'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api-client'
import { Button } from '@/components/ui'
import { GitMerge, AlertCircle, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'

interface Referral {
  id: number
  referrerUsername: string
  referredUsername: string
  createdAt: string
}

interface ReferralsResponse {
  success: boolean
  data: Referral[]
  total: number
  page: number
  limit: number
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function ReferralsPage() {
  const [page, setPage] = useState(1)

  const { data, isLoading, error, refetch } = useQuery<ReferralsResponse>({
    queryKey: ['admin-referrals', page],
    queryFn: () => apiClient.get(`/admin/referrals?page=${page}&limit=20`) as any,
  })

  const totalPages = data ? Math.ceil(data.total / data.limit) : 1

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-100 tracking-tight">Referrals</h1>
        <p className="text-zinc-400 text-sm mt-1">All referral relationships on the platform</p>
      </div>

      <div className="backdrop-blur-md bg-zinc-900/30 border border-zinc-800/80 rounded-2xl shadow-xl overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-zinc-800/50">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex gap-4 px-6 py-4 animate-pulse">
                <div className="h-4 bg-zinc-800 rounded w-32" />
                <div className="h-4 bg-zinc-800 rounded w-6" />
                <div className="h-4 bg-zinc-800 rounded w-32" />
                <div className="h-4 bg-zinc-800 rounded w-36 ml-auto" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <AlertCircle className="w-10 h-10 text-red-400" />
            <p className="text-zinc-400 text-sm">Failed to load referrals</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-semibold">Referrer</th>
                    <th className="px-6 py-4 font-semibold"></th>
                    <th className="px-6 py-4 font-semibold">Referred User</th>
                    <th className="px-6 py-4 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/40">
                  {data?.data.length ? data.data.map((ref) => (
                    <tr key={ref.id} className="hover:bg-zinc-800/20 transition-colors">
                      <td className="px-6 py-4 font-medium text-zinc-100">@{ref.referrerUsername}</td>
                      <td className="px-6 py-4 text-zinc-600">
                        <ArrowRight className="w-4 h-4" />
                      </td>
                      <td className="px-6 py-4 text-zinc-300">@{ref.referredUsername}</td>
                      <td className="px-6 py-4 text-zinc-500 text-xs whitespace-nowrap">{formatDate(ref.createdAt)}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-16 text-center text-zinc-500">
                        <GitMerge className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        No referrals found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800/60">
                <span className="text-xs text-zinc-500">
                  Page {page} of {totalPages} · {data?.total} total
                </span>
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
