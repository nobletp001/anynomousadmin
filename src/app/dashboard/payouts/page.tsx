'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/services/api-client'
import { Badge } from '@/components/ui'
import { Button } from '@/components/ui'
import {
  AlertCircle, ChevronLeft, ChevronRight,
  CheckCircle, XCircle, Wallet, Building2,
  Phone, Copy, TrendingUp, Receipt, Hash, CalendarDays,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface BankDetail {
  accountName: string
  accountNumber: string
  bankName: string
  whatsappNumber: string
}

interface Redeemer {
  username: string
  totalAmount: number
  bankDetail: BankDetail | null
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
}

interface PayoutsResponse {
  success: boolean
  data: PayoutClaim[]
  total: number
  filteredAmount: number
  allTimePaidOut: number
  page: number
  limit: number
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency', currency: 'NGN', minimumFractionDigits: 0,
  }).format(n)
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

function statusVariant(s: string) {
  if (s === 'completed') return 'success'
  if (s === 'in review') return 'warning'
  if (s === 'rejected') return 'danger'
  return 'default'
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
      className="text-zinc-600 hover:text-zinc-300 transition-colors"
    >
      {copied
        ? <CheckCircle className="w-3 h-3 text-emerald-400" />
        : <Copy className="w-3 h-3" />}
    </button>
  )
}

// ─── Redeem Tab ───────────────────────────────────────────────────────────────

function RedeemTab() {
  const queryClient = useQueryClient()
  const [payingUser, setPayingUser] = useState<string | null>(null)

  const { data, isLoading, error, refetch } = useQuery<{ success: boolean; data: Redeemer[] }>({
    queryKey: ['admin-redeemers'],
    queryFn: () => apiClient.get('/admin/redeemers') as any,
  })

  const payMutation = useMutation({
    mutationFn: ({ username, amount }: { username: string; amount: number }) =>
      apiClient.post(`/admin/redeemers/${username}/pay`, { amount }) as any,
    onMutate: ({ username }) => setPayingUser(username),
    onSettled: () => setPayingUser(null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-redeemers'] })
      queryClient.invalidateQueries({ queryKey: ['admin-payouts'] })
    },
  })

  const redeemers = data?.data ?? []

  if (isLoading) {
    return (
      <div className="divide-y divide-zinc-800/40">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-5 px-6 py-5 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-zinc-800 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-zinc-800 rounded w-36" />
              <div className="h-3 bg-zinc-800 rounded w-56" />
            </div>
            <div className="h-9 bg-zinc-800 rounded-xl w-20 shrink-0" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-14 text-center">
        <AlertCircle className="w-8 h-8 text-red-400" />
        <p className="text-zinc-400 text-sm">Failed to load</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
      </div>
    )
  }

  if (redeemers.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center text-zinc-500">
        <Wallet className="w-10 h-10 opacity-20" />
        <p className="text-sm font-medium text-zinc-400">No pending balances</p>
        <p className="text-xs">All users have been paid out</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-zinc-800/40">
      {redeemers.map((r) => (
        <div
          key={r.username}
          className="flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-5 hover:bg-zinc-800/10 transition-colors"
        >
          {/* Avatar + name + amount */}
          <div className="flex items-center gap-3 shrink-0 sm:w-52">
            <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-sm font-extrabold text-purple-400 shrink-0">
              {r.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-100">@{r.username}</p>
              <p className="text-base font-extrabold text-emerald-400 leading-tight mt-0.5">
                {fmt(r.totalAmount)}
              </p>
            </div>
          </div>

          {/* Bank details */}
          <div className="flex-1 min-w-0">
            {r.bankDetail ? (
              <div className="flex flex-wrap gap-x-5 gap-y-1.5 items-center px-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700/40">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
                  <Building2 className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  {r.bankDetail.bankName}
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="font-mono font-bold text-zinc-100 tracking-widest">
                    {r.bankDetail.accountNumber}
                  </span>
                  <CopyBtn text={r.bankDetail.accountNumber} />
                  <span className="text-zinc-600 px-0.5">·</span>
                  <span className="text-zinc-400 truncate max-w-40">
                    {r.bankDetail.accountName}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <Phone className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  {r.bankDetail.whatsappNumber}
                  <CopyBtn text={r.bankDetail.whatsappNumber} />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-zinc-700/50">
                <AlertCircle className="w-4 h-4 text-amber-500/70 shrink-0" />
                <p className="text-xs text-zinc-500">No bank details on file</p>
              </div>
            )}
          </div>

          {/* Pay button */}
          <button
            onClick={() => payMutation.mutate({ username: r.username, amount: r.totalAmount })}
            disabled={payingUser === r.username}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0 min-w-20"
          >
            <CheckCircle className="w-4 h-4" />
            {payingUser === r.username ? 'Paying…' : 'Pay'}
          </button>
        </div>
      ))}
    </div>
  )
}

// ─── History Tab ──────────────────────────────────────────────────────────────

type QuickFilter = 'all' | 'last-month' | 'last-2-months' | 'date-range'

function getDateRange(filter: QuickFilter, customFrom: string, customTo: string) {
  const today = new Date()
  if (filter === 'last-month') {
    const start = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    const end = new Date(today.getFullYear(), today.getMonth(), 0)
    return { startDate: toISO(start), endDate: toISO(end) }
  }
  if (filter === 'last-2-months') {
    const start = new Date(today.getFullYear(), today.getMonth() - 2, 1)
    const end = new Date(today.getFullYear(), today.getMonth(), 0)
    return { startDate: toISO(start), endDate: toISO(end) }
  }
  if (filter === 'date-range') {
    return { startDate: customFrom || undefined, endDate: customTo || undefined }
  }
  return { startDate: undefined, endDate: undefined }
}

function toISO(d: Date) {
  return d.toISOString().split('T')[0]
}

function periodLabel(filter: QuickFilter, customFrom: string, customTo: string) {
  if (filter === 'last-month') return 'Last month'
  if (filter === 'last-2-months') return 'Last 2 months'
  if (filter === 'date-range' && customFrom && customTo) return `${customFrom} → ${customTo}`
  if (filter === 'date-range' && customFrom) return `From ${customFrom}`
  return 'All time'
}

function HistoryTab() {
  const [page, setPage] = useState(1)
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const queryClient = useQueryClient()

  const { startDate, endDate } = getDateRange(quickFilter, customFrom, customTo)

  const { data, isLoading, error, refetch } = useQuery<PayoutsResponse>({
    queryKey: ['admin-payouts', page, quickFilter, customFrom, customTo],
    queryFn: () => {
      const p = new URLSearchParams({ page: String(page), limit: '20' })
      if (startDate) p.set('startDate', startDate)
      if (endDate) p.set('endDate', endDate)
      return apiClient.get(`/admin/payouts?${p}`) as any
    },
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      apiClient.patch(`/admin/payouts/${id}/status`, { status }) as any,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-payouts'] })
      queryClient.invalidateQueries({ queryKey: ['admin-redeemers'] })
    },
  })

  const totalPages = data ? Math.ceil(data.total / data.limit) : 1

  const QUICK_FILTERS: { id: QuickFilter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'last-month', label: 'Last Month' },
    { id: 'last-2-months', label: 'Last 2 Months' },
    { id: 'date-range', label: 'Date Range' },
  ]

  function handleQuickFilter(f: QuickFilter) {
    setQuickFilter(f)
    setPage(1)
    if (f !== 'date-range') { setCustomFrom(''); setCustomTo('') }
  }

  return (
    <div>
      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 px-6 py-5 border-b border-zinc-800/60">
        <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-zinc-800/40 border border-zinc-700/30">
          <div className="p-2 rounded-lg bg-emerald-500/10">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Total Paid Out</p>
            <p className="text-lg font-extrabold text-emerald-400">{fmt(data?.allTimePaidOut ?? 0)}</p>
            <p className="text-[10px] text-zinc-600">all time · completed</p>
          </div>
        </div>

        <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-zinc-800/40 border border-zinc-700/30">
          <div className="p-2 rounded-lg bg-purple-500/10">
            <Receipt className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Period Amount</p>
            <p className="text-lg font-extrabold text-purple-400">{fmt(data?.filteredAmount ?? 0)}</p>
            <p className="text-[10px] text-zinc-600">{periodLabel(quickFilter, customFrom, customTo)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-zinc-800/40 border border-zinc-700/30">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <Hash className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Claims</p>
            <p className="text-lg font-extrabold text-blue-400">{data?.total ?? 0}</p>
            <p className="text-[10px] text-zinc-600">{periodLabel(quickFilter, customFrom, customTo)}</p>
          </div>
        </div>
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-2 px-6 py-4 border-b border-zinc-800/60">
        <CalendarDays className="w-4 h-4 text-zinc-500 shrink-0" />
        {QUICK_FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => handleQuickFilter(f.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              quickFilter === f.id
                ? 'bg-purple-600 text-white shadow-sm shadow-purple-500/20'
                : 'bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/60 border border-zinc-700/40'
            }`}
          >
            {f.label}
          </button>
        ))}

        {/* Date range inputs — shown only when Date Range is selected */}
        {quickFilter === 'date-range' && (
          <div className="flex items-center gap-2 ml-1">
            <input
              type="date"
              value={customFrom}
              onChange={(e) => { setCustomFrom(e.target.value); setPage(1) }}
              className="bg-zinc-800/60 border border-zinc-700/60 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-colors scheme-dark"
            />
            <span className="text-zinc-600 text-xs font-bold">→</span>
            <input
              type="date"
              value={customTo}
              min={customFrom || undefined}
              onChange={(e) => { setCustomTo(e.target.value); setPage(1) }}
              className="bg-zinc-800/60 border border-zinc-700/60 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-colors scheme-dark"
            />
            {(customFrom || customTo) && (
              <button
                onClick={() => { setCustomFrom(''); setCustomTo(''); setPage(1) }}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="divide-y divide-zinc-800/50">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4 px-6 py-4 animate-pulse">
              <div className="h-4 bg-zinc-800 rounded w-28" />
              <div className="h-4 bg-zinc-800 rounded w-24" />
              <div className="h-4 bg-zinc-800 rounded w-20" />
              <div className="h-4 bg-zinc-800 rounded w-32 ml-auto" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-3 py-14 text-center">
          <AlertCircle className="w-8 h-8 text-red-400" />
          <p className="text-zinc-400 text-sm">Failed to load history</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-3.5 font-semibold">User</th>
                  <th className="px-6 py-3.5 font-semibold">Amount</th>
                  <th className="px-6 py-3.5 font-semibold">Status</th>
                  <th className="px-6 py-3.5 font-semibold">Date</th>
                  <th className="px-6 py-3.5 font-semibold">Paid By</th>
                  <th className="px-6 py-3.5 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40">
                {data?.data.length ? data.data.map((claim) => (
                  <tr key={claim.id} className="hover:bg-zinc-800/20 transition-colors">
                    <td className="px-6 py-3.5 font-medium text-zinc-200 text-xs">@{claim.username}</td>
                    <td className="px-6 py-3.5 font-bold text-zinc-100">{fmt(claim.amount)}</td>
                    <td className="px-6 py-3.5">
                      <Badge variant={statusVariant(claim.status)} dot>{claim.status}</Badge>
                    </td>
                    <td className="px-6 py-3.5 text-zinc-500 text-xs whitespace-nowrap">{fmtDate(claim.createdAt)}</td>
                    <td className="px-6 py-3.5">
                      {claim.paidBy ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-medium text-zinc-200">@{claim.paidBy}</span>
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded w-fit ${
                            claim.paidByRole === 'super-admin'
                              ? 'bg-purple-500/15 text-purple-400'
                              : claim.paidByRole === 'accountant'
                              ? 'bg-blue-500/15 text-blue-400'
                              : 'bg-zinc-700/60 text-zinc-400'
                          }`}>
                            {claim.paidByRole}
                          </span>
                        </div>
                      ) : (
                        <span className="text-zinc-700 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-3.5">
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
                    <td colSpan={6} className="px-6 py-14 text-center text-zinc-500 text-sm">
                      No payout records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800/60">
              <span className="text-xs text-zinc-500">Page {page} of {totalPages} · {data?.total} records</span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 1} leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}>Prev</Button>
                <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page === totalPages} rightIcon={<ChevronRight className="w-3.5 h-3.5" />}>Next</Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Tab = 'redeem' | 'history'

const TABS: { id: Tab; label: string; icon: React.ComponentType<any> }[] = [
  { id: 'redeem', label: 'Redeem', icon: Wallet },
  { id: 'history', label: 'History', icon: Receipt },
]

export default function PayoutsPage() {
  const [tab, setTab] = useState<Tab>('redeem')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-100 tracking-tight">Payout Claims</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Pay pending balances and review payout history
        </p>
      </div>

      <div className="backdrop-blur-md bg-zinc-900/30 border border-zinc-800/80 rounded-2xl shadow-xl overflow-hidden">
        {/* Tab bar */}
        <div className="flex border-b border-zinc-800/80 bg-zinc-900/20">
          {TABS.map((t) => {
            const Icon = t.icon
            const active = tab === t.id
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2.5 px-7 py-4 text-sm font-semibold transition-all border-b-2 ${
                  active
                    ? 'border-purple-500 text-purple-300 bg-purple-500/5'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30'
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            )
          })}
        </div>

        {tab === 'redeem' ? <RedeemTab /> : <HistoryTab />}
      </div>
    </div>
  )
}
