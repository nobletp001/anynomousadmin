import React from "react";
import { Users, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui";
import { formatDate } from "../utils";

interface UserReferralsTableProps {
  referralsData: any;
  loadingRefs: boolean;
  refPage: number;
  setRefPage: React.Dispatch<React.SetStateAction<number>>;
  refTotalPages: number;
  handleToggleShaved: (username: string, shaved: boolean) => void;
}

export function UserReferralsTable({
  referralsData,
  loadingRefs,
  refPage,
  setRefPage,
  refTotalPages,
  handleToggleShaved,
}: UserReferralsTableProps) {
  return (
    <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl shadow-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-extrabold text-zinc-200 uppercase tracking-wider">Referred Users List</h3>
        </div>
        <span className="text-xs text-zinc-500 font-semibold">{referralsData ? referralsData.total : 0} referrals</span>
      </div>

      {loadingRefs ? (
        <div className="h-32 rounded bg-zinc-800/25 animate-pulse" />
      ) : !referralsData?.data?.length ? (
        <p className="text-xs text-zinc-500 py-6 text-center">No referrals registered for this user.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800/60 text-zinc-500 uppercase font-bold tracking-wider">
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Username</th>
                <th className="py-3 px-4">Joined Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40 text-zinc-300">
              {referralsData.data.map((ref: any) => (
                <tr key={ref.referredUsername} className="hover:bg-zinc-800/10 transition">
                  <td className="py-3 px-4 font-semibold text-zinc-250">{ref.referredName}</td>
                  <td className="py-3 px-4 text-zinc-400">@{ref.referredUsername}</td>
                  <td className="py-3 px-4 text-zinc-500">{formatDate(ref.createdAt)}</td>
                  <td className="py-3 px-4">
                    {ref.disabled ? (
                      <span className="text-red-400 font-semibold uppercase text-[10px]">Disabled</span>
                    ) : (
                      <span className="text-emerald-400 font-semibold uppercase text-[10px]">Active</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleToggleShaved(ref.referredUsername, ref.shaved)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded transition cursor-pointer ${
                        ref.shaved
                          ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400"
                          : "bg-zinc-800 hover:bg-zinc-700 text-zinc-400"
                      }`}
                    >
                      {ref.shaved ? "Shaved (Hidden)" : "Visible"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Referrals Pagination */}
      {refTotalPages > 1 && (
        <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 text-xs">
          <span className="text-zinc-500">
            Page {refPage} of {refTotalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRefPage((p) => p - 1)}
              disabled={refPage === 1}
              leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
            >
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRefPage((p) => p + 1)}
              disabled={refPage >= refTotalPages}
              rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
