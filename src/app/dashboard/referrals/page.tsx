"use client";

import React, { useState } from "react";
import { useReferralsQueries } from "./hooks/useReferralsQueries";
import { ReferralsTable } from "./components/ReferralsTable";
import { SkeletonRows } from "./components/SkeletonRows";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui";

export default function ReferralsPage() {
  const [page, setPage] = useState(1);
  const { referralsQuery } = useReferralsQueries(page);

  const data = referralsQuery.data;
  const totalPages = data ? Math.ceil(data.total / data.limit) : 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-100 tracking-tight">Referrals</h1>
        <p className="text-zinc-400 text-sm mt-1">All referral relationships on the platform</p>
      </div>

      <div className="backdrop-blur-md bg-zinc-900/30 border border-zinc-800/80 rounded-2xl shadow-xl overflow-hidden">
        {referralsQuery.isLoading ? (
          <SkeletonRows />
        ) : referralsQuery.isError ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <AlertCircle className="w-10 h-10 text-red-400" />
            <p className="text-zinc-400 text-sm">Failed to load referrals</p>
            <Button variant="outline" size="sm" onClick={() => referralsQuery.refetch()}>
              Retry
            </Button>
          </div>
        ) : (
          <ReferralsTable
            referrals={data?.data || []}
            total={data?.total || 0}
            page={page}
            setPage={setPage}
            totalPages={totalPages}
          />
        )}
      </div>
    </div>
  );
}
