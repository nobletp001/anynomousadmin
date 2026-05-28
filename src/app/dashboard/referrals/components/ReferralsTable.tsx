import React from "react";
import { ArrowRight, GitMerge, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui";
import { Referral } from "../types";
import { formatDate } from "../utils";

interface ReferralsTableProps {
  referrals: Referral[];
  total: number;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
}

export function ReferralsTable({
  referrals,
  total,
  page,
  setPage,
  totalPages,
}: ReferralsTableProps) {
  return (
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
            {referrals.length ? (
              referrals.map((ref) => (
                <tr key={ref.id} className="hover:bg-zinc-800/20 transition-colors">
                  <td className="px-6 py-4 font-medium text-zinc-100">@{ref.referrerUsername}</td>
                  <td className="px-6 py-4 text-zinc-600">
                    <ArrowRight className="w-4 h-4" />
                  </td>
                  <td className="px-6 py-4 text-zinc-305">@{ref.referredUsername}</td>
                  <td className="px-6 py-4 text-zinc-500 text-xs whitespace-nowrap">
                    {formatDate(ref.createdAt)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-16 text-center text-zinc-550">
                  <GitMerge className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  No referrals found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800/60 bg-zinc-950/20">
          <span className="text-xs text-zinc-500">
            Page {page} of {totalPages} · {total} total
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
            >
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
