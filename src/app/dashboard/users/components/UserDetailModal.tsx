import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui";
import { UserStatsGrid } from "./UserStatsGrid";
import { FinancialBreakdown } from "./FinancialBreakdown";
import { DemographicsAndBank } from "./DemographicsAndBank";
import { AdminActionsHistory } from "./AdminActionsHistory";
import { AdminActionForm } from "./AdminActionForm";
import { formatDate } from "../utils";

interface UserDetailModalProps {
  selectedUser: string;
  onClose: () => void;
  userDetail: any;
  isLoadingDetail: boolean;
  actionType: string;
  setActionType: (type: string) => void;
  actionAmount: string;
  setActionAmount: (amt: string) => void;
  actionMessage: string;
  setActionMessage: (msg: string) => void;
  actionError: string;
  actionSuccess: string;
  actionSubmitting: boolean;
  handleSendAction: (e: React.FormEvent) => void;
  copiedId: string | null;
  handleCopyRef: (refId: string) => void;
}

export function UserDetailModal({
  selectedUser,
  onClose,
  userDetail,
  isLoadingDetail,
  actionType, setActionType,
  actionAmount, setActionAmount,
  actionMessage, setActionMessage,
  actionError,
  actionSuccess,
  actionSubmitting,
  handleSendAction,
  copiedId,
  handleCopyRef,
}: UserDetailModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-zinc-100">User Profile Details</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Full profile overview and earnings statistics</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {isLoadingDetail ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-20 bg-zinc-800/40 rounded-xl" />
              <div className="h-40 bg-zinc-800/40 rounded-xl" />
            </div>
          ) : !userDetail?.data ? (
            <p className="text-zinc-500 text-center py-6 text-sm">Failed to load user details.</p>
          ) : (
            (() => {
              const { user, profile, bankDetails, stats, actions } = userDetail.data;
              return (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 bg-zinc-800/20 border border-zinc-800/60 p-4 rounded-xl">
                    <div className="w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-lg font-bold text-purple-400">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-zinc-100">{user.name}</h4>
                      <p className="text-sm text-zinc-400">
                        @{user.username} · {user.email || "No email"}
                      </p>
                      <p className="text-xs text-zinc-650 mt-0.5">Joined {formatDate(user.createdAt)}</p>
                    </div>
                  </div>

                  <UserStatsGrid stats={stats} />

                  <FinancialBreakdown stats={stats} />

                  <DemographicsAndBank profile={profile} bankDetails={bankDetails} />

                  <div className="h-px bg-zinc-800 my-4" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <AdminActionsHistory actions={actions} onCopyRef={handleCopyRef} copiedId={copiedId} />

                    <AdminActionForm
                      actionType={actionType} setActionType={setActionType}
                      actionAmount={actionAmount} setActionAmount={setActionAmount}
                      actionMessage={actionMessage} setActionMessage={setActionMessage}
                      actionError={actionError} actionSuccess={actionSuccess}
                      isSubmitting={actionSubmitting} onSubmit={handleSendAction}
                    />
                  </div>
                </div>
              );
            })()
          )}
        </div>

        <div className="p-6 border-t border-zinc-800 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
