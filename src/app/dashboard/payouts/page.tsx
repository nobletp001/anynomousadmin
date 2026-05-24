'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/services/api-client'
import { Button } from '@/components/ui'
import {
  AlertCircle, Wallet, Building2, Phone, Copy, CheckCircle,
  Clock, CircleCheck, XCircle, History,
} from 'lucide-react'

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
      className="text-zinc-600 hover:text-zinc-300 transition-colors"
    >
      {copied
        ? <CheckCircle className="w-3 h-3 text-emerald-400" />
        : <Copy className="w-3 h-3" />}
    </button>
  )
}

function BankCard({ bd }: { bd: BankDetail }) {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-1.5 items-center px-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700/40">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
        <Building2 className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
        {bd.bankName}
      </div>
      <div className="flex items-center gap-1.5 text-xs">
        <span className="font-mono font-bold text-zinc-100 tracking-widest">{bd.accountNumber}</span>
        <CopyBtn text={bd.accountNumber} />
        <span className="text-zinc-600 px-0.5">·</span>
        <span className="text-zinc-400 truncate max-w-40">{bd.accountName}</span>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-zinc-400">
        <Phone className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
        {bd.whatsappNumber}
        <CopyBtn text={bd.whatsappNumber} />
      </div>
    </div>
  )
}

function RedeemTab() {
  const { data, isLoading, error, refetch } = useQuery<{ success: boolean; data: Redeemer[] }>({
    queryKey: ['admin-redeemers'],
    queryFn: () => apiClient.get('/admin/redeemers') as any,
  })

  const redeemers = data?.data ?? []
  const totalOwed = redeemers.reduce((sum, r) => sum + r.totalAmount, 0)

  if (isLoading) {
    return (
      <div className="divide-y divide-zinc-800/40">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-5 px-6 py-5 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-zinc-800 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-zinc-800 rounded w-36" />
              <div className="h-3 bg-zinc-800 rounded w-56" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <AlertCircle className="w-8 h-8 text-red-400" />
        <p className="text-zinc-400 text-sm">Failed to load payouts</p>
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
    <>
      {totalOwed > 0 && (
        <div className="px-6 py-4 border-b border-zinc-800/40 flex items-center justify-between">
          <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Total Owed</span>
          <span className="text-xl font-extrabold text-emerald-400">{fmt(totalOwed)}</span>
        </div>
      )}
      <div className="divide-y divide-zinc-800/40">
        {redeemers.map((r) => (
          <div
            key={r.username}
            className="flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-5 hover:bg-zinc-800/10 transition-colors"
          >
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
            <div className="flex-1 min-w-0">
              {r.bankDetail ? (
                <BankCard bd={r.bankDetail} />
              ) : (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-zinc-700/50">
                  <AlertCircle className="w-4 h-4 text-amber-500/70 shrink-0" />
                  <p className="text-xs text-zinc-500">No bank details on file</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

function HistoryTab() {
  const queryClient = useQueryClient()

  const { data, isLoading, error, refetch } = useQuery<{ success: boolean; data: PayoutClaim[] }>({
    queryKey: ['admin-payout-claims'],
    queryFn: () => apiClient.get('/admin/payouts') as any,
  })

  const markPaid = useMutation({
    mutationFn: (id: number) =>
      apiClient.patch(`/admin/payouts/${id}/status`, { status: 'paid' }) as Promise<any>,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-payout-claims'] }),
  })

  const claims = data?.data ?? []

  if (isLoading) {
    return (
      <div className="divide-y divide-zinc-800/40">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-5 px-6 py-5 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-zinc-800 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-zinc-800 rounded w-36" />
              <div className="h-3 bg-zinc-800 rounded w-48" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <AlertCircle className="w-8 h-8 text-red-400" />
        <p className="text-zinc-400 text-sm">Failed to load claim history</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
      </div>
    )
  }

  if (claims.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center text-zinc-500">
        <History className="w-10 h-10 opacity-20" />
        <p className="text-sm font-medium text-zinc-400">No payout claims yet</p>
        <p className="text-xs">User withdrawal requests will appear here</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-zinc-800/40">
      {claims.map((c) => (
        <div
          key={c.id}
          className="flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-5 hover:bg-zinc-800/10 transition-colors"
        >
          {/* Avatar + name + amount */}
          <div className="flex items-center gap-3 shrink-0 sm:w-52">
            <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-sm font-extrabold text-purple-400 shrink-0">
              {c.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-100">@{c.username}</p>
              <p className="text-base font-extrabold text-emerald-400 leading-tight mt-0.5">
                {fmt(c.amount)}
              </p>
              <p className="text-[10px] text-zinc-600 mt-0.5">
                {new Date(c.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Bank details */}
          <div className="flex-1 min-w-0">
            {c.bankDetail ? (
              <BankCard bd={c.bankDetail} />
            ) : (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-zinc-700/50">
                <AlertCircle className="w-4 h-4 text-amber-500/70 shrink-0" />
                <p className="text-xs text-zinc-500">No bank details on file</p>
              </div>
            )}
          </div>

          {/* Status + action */}
          <div className="flex items-center gap-3 shrink-0">
            {c.status === 'in review' ? (
              <>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2.5 py-1">
                  <Clock className="w-3 h-3" />
                  In Review
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => markPaid.mutate(c.id)}
                  disabled={markPaid.isPending}
                >
                  Mark Paid
                </Button>
              </>
            ) : c.status === 'paid' ? (
              <div className="text-right">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2.5 py-1">
                  <CircleCheck className="w-3 h-3" />
                  Paid
                </span>
                {c.paidBy && (
                  <p className="text-[10px] text-zinc-600 mt-1 text-right">by @{c.paidBy}</p>
                )}
              </div>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-2.5 py-1">
                <XCircle className="w-3 h-3" />
                Rejected
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function PayoutsPage() {
  const [tab, setTab] = useState<'redeem' | 'history'>('redeem')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-100 tracking-tight">Payouts</h1>
        <p className="text-zinc-400 text-sm mt-1">Manage user balances and payout claim requests</p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 bg-zinc-900/60 border border-zinc-800/80 rounded-xl w-fit">
        <button
          onClick={() => setTab('redeem')}
          className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            tab === 'redeem'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Redeem
        </button>
        <button
          onClick={() => setTab('history')}
          className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            tab === 'history'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          History
        </button>
      </div>

      <div className="backdrop-blur-md bg-zinc-900/30 border border-zinc-800/80 rounded-2xl shadow-xl overflow-hidden">
        {tab === 'redeem' ? <RedeemTab /> : <HistoryTab />}
      </div>
    </div>
  )
}
