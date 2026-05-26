'use client'

import React, { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/services/api-client'
import { Button } from '@/components/ui'
import {
  AlertCircle, Wallet, Building2, Phone, Copy, CheckCircle,
  Clock, CircleCheck, XCircle, History, Calendar, DollarSign,
  TrendingUp, Activity
} from 'lucide-react'

interface BankDetail {
  accountName: string
  accountNumber: string
  bankName: string
  whatsappNumber: string
}

interface PayoutClaim {
  id: number
  username: string
  amount: number
  status: string
  paidBy: string | null
  paidByRole: string | null
  paidAt: string | null
  createdAt: string
  bankDetail: BankDetail | null
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency', currency: 'NGN', minimumFractionDigits: 0,
  }).format(n)
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
      className="text-zinc-650 hover:text-zinc-300 transition-colors cursor-pointer"
    >
      {copied
        ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
        : <Copy className="w-3.5 h-3.5" />}
    </button>
  )
}

function BankCard({ bd }: { bd: BankDetail }) {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-1.5 items-center px-4 py-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60">
      <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-300">
        <Building2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
        {bd.bankName}
      </div>
      <div className="flex items-center gap-1.5 text-xs">
        <span className="font-mono font-bold text-zinc-100 tracking-wider bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">{bd.accountNumber}</span>
        <CopyBtn text={bd.accountNumber} />
        <span className="text-zinc-700 px-0.5">|</span>
        <span className="text-zinc-400 truncate max-w-40 font-medium">{bd.accountName}</span>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-zinc-400">
        <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        {bd.whatsappNumber}
        <CopyBtn text={bd.whatsappNumber} />
      </div>
    </div>
  )
}

export default function PayoutsPage() {
  const [tab, setTab] = useState<'requests' | 'history'>('requests')
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'yesterday' | '3days' | '4days' | '5days' | 'custom'>('all')
  const [customDate, setCustomDate] = useState<string>('')
  const [actionError, setActionError] = useState<string | null>(null)

  const queryClient = useQueryClient()

  const { data, isLoading, error, refetch } = useQuery<{ success: boolean; data: PayoutClaim[] }>({
    queryKey: ['admin-payout-claims'],
    queryFn: () => apiClient.get('/admin/payouts') as any,
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'paid' | 'rejected' }) =>
      apiClient.patch(`/admin/payouts/${id}/status`, { status }) as Promise<any>,
    onSuccess: () => {
      setActionError(null)
      queryClient.invalidateQueries({ queryKey: ['admin-payout-claims'] })
    },
    onError: (err: any) => {
      setActionError(err?.message || 'Failed to update status')
    }
  })

  const claims = data?.data ?? []

  // Filter requests (status is 'in review')
  const requests = claims.filter(c => c.status === 'in review')

  // Date boundary helper calculations
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  // Filter paid payouts (status is 'paid')
  const paidHistory = claims.filter((c) => {
    if (c.status !== 'paid') return false
    if (!c.paidAt) return false
    
    const paidDate = new Date(c.paidAt)
    
    if (dateFilter === 'today') {
      return paidDate >= startOfToday
    }
    if (dateFilter === 'yesterday') {
      const startOfYesterday = new Date(startOfToday)
      startOfYesterday.setDate(startOfYesterday.getDate() - 1)
      return paidDate >= startOfYesterday && paidDate < startOfToday
    }
    if (dateFilter === '3days') {
      const limit = new Date(startOfToday)
      limit.setDate(limit.getDate() - 2)
      return paidDate >= limit
    }
    if (dateFilter === '4days') {
      const limit = new Date(startOfToday)
      limit.setDate(limit.getDate() - 3)
      return paidDate >= limit
    }
    if (dateFilter === '5days') {
      const limit = new Date(startOfToday)
      limit.setDate(limit.getDate() - 4)
      return paidDate >= limit
    }
    if (dateFilter === 'custom') {
      if (!customDate) return true
      const [y, m, d] = customDate.split('-').map(Number)
      const targetDate = new Date(y, m - 1, d)
      const targetDateEnd = new Date(y, m - 1, d + 1)
      return paidDate >= targetDate && paidDate < targetDateEnd
    }
    return true // 'all'
  })

  // Calculate statistics metrics based on filtered history
  const totalPaid = paidHistory.reduce((sum, c) => sum + c.amount, 0)
  const payoutCount = paidHistory.length
  const avgPayout = payoutCount > 0 ? totalPaid / payoutCount : 0
  const maxPayout = paidHistory.length > 0 ? Math.max(...paidHistory.map((c) => c.amount)) : 0

  const handleAction = (id: number, status: 'paid' | 'rejected') => {
    setActionError(null)
    updateStatus.mutate({ id, status })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-2">
          <div className="h-8 bg-zinc-800 rounded w-48" />
          <div className="h-4 bg-zinc-800 rounded w-72" />
        </div>
        <div className="flex gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-xl w-fit animate-pulse">
          <div className="h-8 w-24 bg-zinc-800 rounded-lg" />
          <div className="h-8 w-24 bg-zinc-800 rounded-lg" />
        </div>
        <div className="border border-zinc-800/80 rounded-2xl bg-zinc-900/10 overflow-hidden divide-y divide-zinc-800/40">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-5 px-6 py-5 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-zinc-800 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-zinc-800 rounded w-36" />
                <div className="h-3.5 bg-zinc-800 rounded w-64" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <AlertCircle className="w-10 h-10 text-red-500" />
        <h3 className="text-sm font-bold text-zinc-200">Failed to load payout data</h3>
        <p className="text-zinc-550 text-xs max-w-sm">Please check your network connection and try again.</p>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2">Retry</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-100 tracking-tight">Payouts</h1>
          <p className="text-zinc-400 text-sm mt-1">Manage user balances and payout claim requests</p>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 p-1 bg-zinc-900/60 border border-zinc-800/80 rounded-xl">
          <button
            onClick={() => setTab('requests')}
            className={`px-5 py-2 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
              tab === 'requests'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                : 'text-zinc-400 hover:text-zinc-250'
            }`}
          >
            Requests ({requests.length})
          </button>
          <button
            onClick={() => setTab('history')}
            className={`px-5 py-2 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
              tab === 'history'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                : 'text-zinc-400 hover:text-zinc-250'
            }`}
          >
            History
          </button>
        </div>
      </div>

      {actionError && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-red-500/20 bg-red-500/5 text-xs text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {tab === 'requests' ? (
        /* PENDING REQUESTS PANEL */
        <div className="backdrop-blur-md bg-zinc-900/30 border border-zinc-800/80 rounded-2xl shadow-xl overflow-hidden">
          {requests.length === 0 ? (
            <div className="flex flex-col items-center gap-3.5 py-24 text-center text-zinc-500">
              <div className="h-12 w-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
                <Wallet className="w-5 h-5 opacity-40" />
              </div>
              <div>
                <p className="text-sm font-extrabold text-zinc-300">No pending payout requests</p>
                <p className="text-xs text-zinc-500 mt-1">All creator withdrawal claims have been processed.</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/40">
              {requests.map((r) => (
                <div
                  key={r.id}
                  className="flex flex-col md:flex-row md:items-center gap-4 px-6 py-5 hover:bg-zinc-800/10 transition-colors"
                >
                  {/* User info & amount */}
                  <div className="flex items-center gap-3 shrink-0 md:w-56">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-sm font-extrabold text-purple-400 shrink-0">
                      {r.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-100">@{r.username}</p>
                      <p className="text-base font-black text-emerald-400 leading-tight mt-0.5">
                        {fmt(r.amount)}
                      </p>
                      <p className="text-[10px] text-zinc-650 mt-1">
                        Requested: {new Date(r.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  {/* Bank info */}
                  <div className="flex-1 min-w-0">
                    {r.bankDetail ? (
                      <BankCard bd={r.bankDetail} />
                    ) : (
                      <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-zinc-800/80 bg-zinc-950/20">
                        <AlertCircle className="w-4 h-4 text-amber-500/70 shrink-0" />
                        <p className="text-xs text-zinc-500">No bank details linked yet</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2.5 shrink-0 md:justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAction(r.id, 'paid')}
                      disabled={updateStatus.isPending}
                      className="border-emerald-500/30 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500 hover:text-white"
                    >
                      Mark Paid
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAction(r.id, 'rejected')}
                      disabled={updateStatus.isPending}
                      className="border-red-500/30 text-red-400 bg-red-500/5 hover:bg-red-500 hover:text-white"
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* PAID HISTORY PANEL WITH FILTERS & STATISTICS */
        <div className="space-y-6">
          
          {/* Filters controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-md">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-bold text-zinc-550 uppercase tracking-wider mr-2 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Date Filter:
              </span>
              {[
                { val: 'all', label: 'All Time' },
                { val: 'today', label: 'Today' },
                { val: 'yesterday', label: 'Yesterday' },
                { val: '3days', label: '3 Days' },
                { val: '4days', label: '4 Days' },
                { val: '5days', label: '5 Days' },
                { val: 'custom', label: 'Custom Date' }
              ].map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => setDateFilter(opt.val as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    dateFilter === opt.val
                      ? 'bg-zinc-800 text-purple-400 border border-zinc-700/60'
                      : 'bg-zinc-950/20 text-zinc-400 border border-transparent hover:text-zinc-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {dateFilter === 'custom' && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-zinc-500 uppercase">Select Date:</span>
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-zinc-100 focus:outline-none focus:border-purple-500/60"
                />
              </div>
            )}
          </div>

          {/* Statistics metrics card grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-zinc-900/40 border border-zinc-850 p-5 rounded-2xl backdrop-blur-md hover:border-zinc-800 transition duration-200">
              <div className="flex justify-between items-start">
                <p className="text-[10px] text-zinc-500 uppercase font-black tracking-wider">Total Paid</p>
                <div className="h-7 w-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                  <DollarSign className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-2xl font-black text-emerald-400 mt-2">{fmt(totalPaid)}</p>
              <p className="text-[9px] text-zinc-550 mt-1 font-semibold">Active filter earnings</p>
            </div>

            <div className="bg-zinc-900/40 border border-zinc-850 p-5 rounded-2xl backdrop-blur-md hover:border-zinc-800 transition duration-200">
              <div className="flex justify-between items-start">
                <p className="text-[10px] text-zinc-500 uppercase font-black tracking-wider">Payout Count</p>
                <div className="h-7 w-7 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
                  <Activity className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-2xl font-black text-purple-400 mt-2">{payoutCount}</p>
              <p className="text-[9px] text-zinc-550 mt-1 font-semibold">Claims paid out</p>
            </div>

            <div className="bg-zinc-900/40 border border-zinc-850 p-5 rounded-2xl backdrop-blur-md hover:border-zinc-800 transition duration-200">
              <div className="flex justify-between items-start">
                <p className="text-[10px] text-zinc-500 uppercase font-black tracking-wider">Average Payout</p>
                <div className="h-7 w-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-2xl font-black text-blue-400 mt-2">{fmt(avgPayout)}</p>
              <p className="text-[9px] text-zinc-550 mt-1 font-semibold">Average claim volume</p>
            </div>

            <div className="bg-zinc-900/40 border border-zinc-850 p-5 rounded-2xl backdrop-blur-md hover:border-zinc-800 transition duration-200">
              <div className="flex justify-between items-start">
                <p className="text-[10px] text-zinc-500 uppercase font-black tracking-wider">Max Payout</p>
                <div className="h-7 w-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
                  <Wallet className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-2xl font-black text-amber-400 mt-2">{fmt(maxPayout)}</p>
              <p className="text-[9px] text-zinc-550 mt-1 font-semibold">Largest paid settlement</p>
            </div>
          </div>

          {/* History list content */}
          <div className="backdrop-blur-md bg-zinc-900/30 border border-zinc-800/80 rounded-2xl shadow-xl overflow-hidden">
            {paidHistory.length === 0 ? (
              <div className="flex flex-col items-center gap-3.5 py-24 text-center text-zinc-500">
                <div className="h-12 w-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
                  <History className="w-5 h-5 opacity-40" />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-zinc-300">No payout records found</p>
                  <p className="text-xs text-zinc-500 mt-1">No claims match the active date filter criteria.</p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-zinc-800/40">
                {paidHistory.map((c) => (
                  <div
                    key={c.id}
                    className="flex flex-col lg:flex-row lg:items-center gap-4 px-6 py-5 hover:bg-zinc-800/10 transition-colors"
                  >
                    {/* User profile details */}
                    <div className="flex items-center gap-3 shrink-0 lg:w-56">
                      <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-sm font-extrabold text-purple-400 shrink-0">
                        {c.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-100">@{c.username}</p>
                        <p className="text-base font-black text-emerald-400 leading-tight mt-0.5">
                          {fmt(c.amount)}
                        </p>
                        {c.paidAt && (
                          <p className="text-[10px] text-zinc-600 mt-1">
                            Paid: {new Date(c.paidAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Bank account details */}
                    <div className="flex-1 min-w-0">
                      {c.bankDetail ? (
                        <BankCard bd={c.bankDetail} />
                      ) : (
                        <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-zinc-800 bg-zinc-950/20">
                          <AlertCircle className="w-4 h-4 text-amber-500/70 shrink-0" />
                          <p className="text-xs text-zinc-500 font-medium">No bank details recorded</p>
                        </div>
                      )}
                    </div>

                    {/* Payer audit info */}
                    <div className="flex items-center gap-3 shrink-0 lg:justify-end">
                      <div className="text-left lg:text-right">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2.5 py-1">
                          <CircleCheck className="w-3.5 h-3.5" />
                          Paid
                        </span>
                        {c.paidBy ? (
                          <p className="text-[10px] text-zinc-500 mt-1.5 font-medium leading-none">
                            by <span className="text-zinc-300 font-bold">@{c.paidBy}</span> ({c.paidByRole || 'Admin'})
                          </p>
                        ) : (
                          <p className="text-[10px] text-zinc-600 mt-1.5 font-medium leading-none">
                            by unknown admin
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
