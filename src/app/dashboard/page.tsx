'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api-client'
import { motion, type Variants } from 'framer-motion'
import { Button, Badge } from '@/components/ui'
import {
  Users,
  MessageSquare,
  GitMerge,
  CreditCard,
  TrendingUp,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'

interface StatsResponse {
  success: boolean
  stats: {
    totalUsers: number
    totalMessages: number
    totalReferrals: number
    pendingPayouts: number
  }
  recentPayouts: Array<{
    id: number
    username: string
    amount: number
    status: string
    createdAt: string
  }>
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: 'easeOut' as const,
    },
  }),
}

export default function DashboardPage() {
  const { data, isLoading, error, refetch, isRefetching } = useQuery<StatsResponse>({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/stats')
      return response as unknown as StatsResponse
    },
    retry: 1,
    refetchOnWindowFocus: true,
  })

  const formatAmount = (num: number) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(num)

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-100 tracking-tight">Overview</h1>
          <p className="text-zinc-400 text-sm mt-1">Real-time statistics and activity hub</p>
        </div>
        <Button
          variant="outline"
          size="md"
          onClick={() => refetch()}
          disabled={isLoading || isRefetching}
          leftIcon={<RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />}
        >
          Refresh Data
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-32 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center max-w-xl mx-auto gap-3">
          <AlertCircle className="w-12 h-12 text-red-400" />
          <h3 className="text-lg font-bold text-zinc-100">Failed to load statistics</h3>
          <p className="text-sm text-zinc-400">{error.message || 'Please check your connection.'}</p>
          <Button variant="danger" size="md" onClick={() => refetch()} className="mt-2">
            Retry Connection
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              custom={0}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              className="backdrop-blur-md bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-purple-500/30 transition-all duration-300"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl group-hover:bg-purple-500/10 transition-all duration-300" />
              <div className="flex items-center justify-between mb-4">
                <span className="text-zinc-500 text-sm font-semibold tracking-wide uppercase">Total Users</span>
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <span className="text-3xl font-extrabold text-zinc-100 tracking-tight block">
                {data?.stats.totalUsers}
              </span>
              <span className="text-xs text-purple-400 font-medium flex items-center gap-1 mt-2">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Active platform members</span>
              </span>
            </motion.div>

            <motion.div
              custom={1}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              className="backdrop-blur-md bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-blue-500/30 transition-all duration-300"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-all duration-300" />
              <div className="flex items-center justify-between mb-4">
                <span className="text-zinc-500 text-sm font-semibold tracking-wide uppercase">Messages Sent</span>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <MessageSquare className="w-5 h-5" />
                </div>
              </div>
              <span className="text-3xl font-extrabold text-zinc-100 tracking-tight block">
                {data?.stats.totalMessages}
              </span>
              <span className="text-xs text-blue-400 font-medium flex items-center gap-1 mt-2">
                <span>Anonymous logs recorded</span>
              </span>
            </motion.div>

            <motion.div
              custom={2}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              className="backdrop-blur-md bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-all duration-300" />
              <div className="flex items-center justify-between mb-4">
                <span className="text-zinc-500 text-sm font-semibold tracking-wide uppercase">Referrals</span>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <GitMerge className="w-5 h-5" />
                </div>
              </div>
              <span className="text-3xl font-extrabold text-zinc-100 tracking-tight block">
                {data?.stats.totalReferrals}
              </span>
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1 mt-2">
                <span>User invites completed</span>
              </span>
            </motion.div>

            <motion.div
              custom={3}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              className="backdrop-blur-md bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-amber-500/30 transition-all duration-300"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition-all duration-300" />
              <div className="flex items-center justify-between mb-4">
                <span className="text-zinc-500 text-sm font-semibold tracking-wide uppercase">Pending Payouts</span>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <CreditCard className="w-5 h-5" />
                </div>
              </div>
              <span className="text-3xl font-extrabold text-zinc-100 tracking-tight block">
                {data?.stats.pendingPayouts}
              </span>
              <span className="text-xs text-amber-400 font-medium flex items-center gap-1 mt-2">
                <span>Awaiting administrator action</span>
              </span>
            </motion.div>
          </div>

          <div className="backdrop-blur-md bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-6 shadow-xl">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-zinc-100">Recent Payout Claims</h3>
              <p className="text-xs text-zinc-500 mt-1">Review the latest requests submitted by referrers</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 font-semibold">
                    <th className="pb-3.5 font-semibold text-xs uppercase tracking-wider">User</th>
                    <th className="pb-3.5 font-semibold text-xs uppercase tracking-wider">Amount</th>
                    <th className="pb-3.5 font-semibold text-xs uppercase tracking-wider">Status</th>
                    <th className="pb-3.5 font-semibold text-xs uppercase tracking-wider">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {data?.recentPayouts?.length ? (
                    data.recentPayouts.map((claim) => (
                      <tr key={claim.id} className="text-zinc-300 hover:bg-zinc-800/20 transition-colors">
                        <td className="py-4 font-medium text-zinc-100">@{claim.username}</td>
                        <td className="py-4 font-semibold text-zinc-200">{formatAmount(claim.amount)}</td>
                        <td className="py-4">
                          <Badge
                            variant={
                              claim.status === 'completed'
                                ? 'success'
                                : claim.status === 'in review' || claim.status === 'pending'
                                ? 'warning'
                                : 'danger'
                            }
                            dot
                          >
                            {claim.status}
                          </Badge>
                        </td>
                        <td className="py-4 text-zinc-500 text-xs">{formatDate(claim.createdAt)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-zinc-500 text-sm">
                        No recent payout claims found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
