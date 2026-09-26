import React from "react";
import { RejectModal } from "./RejectModal";
import { ReverseSubmissionModal } from "./ReverseSubmissionModal";
import { FullscreenImageZoom } from "./FullscreenImageZoom";
import { EditTaskModal } from "./EditTaskModal";
import { SubmissionDetailsModal } from "./SubmissionDetailsModal";
import { Task, Submission } from "../types";
import { EditTaskState } from "../hooks/useEditTaskState";

interface TaskDetailModalsProps {
  task: Task;
  submissions: Submission[];
  reviewSubmissions?: Submission[];
  editState: EditTaskState;
  state: any;
  mutations: any;
  reverseModal: any;
  setReverseModal: (v: any) => void;
  officers: any[];
  closeRejectModal: () => void;
  openCorrectionModal: (sub: Submission) => void;
  openRejectModal: (sub: Submission) => void;
  onRewindSubmission: (sub: Submission) => void;
  handleWatchUser: (username: string) => void;
}

export function TaskDetailModals({
  task,
  submissions,
  reviewSubmissions = [],
  editState,
  state,
  mutations,
  reverseModal,
  setReverseModal,
  officers,
  closeRejectModal,
  openCorrectionModal,
  openRejectModal,
  onRewindSubmission,
  handleWatchUser,
}: TaskDetailModalsProps) {
  return (
    <>
      {state.viewingSub &&
        (() => {
          const isReview = Boolean(state.viewingSub.isAppReviewSubmission || state.viewingSub.appReviewRequest);
          const activeList = isReview && reviewSubmissions.length > 0 ? reviewSubmissions : submissions;
          const currentIdx = activeList.findIndex((s) => s.id === state.viewingSub!.id);
          const hasPrev = currentIdx > 0;
          const hasNext = currentIdx !== -1 && currentIdx < activeList.length - 1;
          return (
            <SubmissionDetailsModal
              sub={state.viewingSub}
              submissions={activeList}
              task={task}
              rating={state.rating}
              setRating={state.setRating}
              feedback={state.feedback}
              setFeedback={state.setFeedback}
              showReportForm={state.showReportForm}
              setShowReportForm={state.setShowReportForm}
              reportDeductAmount={state.reportDeductAmount}
              setReportDeductAmount={state.setReportDeductAmount}
              reportReason={state.reportReason}
              setReportReason={state.setReportReason}
              isReportPending={mutations.reportSubmission.isPending}
              onSubmitReport={() =>
                mutations.reportSubmission.mutate({
                  subId: state.viewingSub!.id,
                  deductedAmount: Number(state.reportDeductAmount) || 0,
                  rejectionReason: state.reportReason,
                })
              }
              onZoomImage={(imgs, idx) => {
                state.setActiveImagesList(imgs);
                state.setActiveImageIndex(idx);
              }}
              onClose={() => state.setViewingSub(null)}
              onApprove={() => {
                const request = state.viewingSub!.appReviewRequest;
                if (request) {
                  mutations.decideBusinessReview.mutate({ requestId: request.id, action: "approve" });
                  return;
                }
                mutations.approveSubmission.mutate({
                  subId: state.viewingSub!.id,
                  rating: state.rating || 5,
                  feedback: state.feedback,
                });
              }}
              onCorrectionClick={() => openCorrectionModal(state.viewingSub!)}
              onRejectClick={() => openRejectModal(state.viewingSub!)}
              onRewindClick={() => onRewindSubmission(state.viewingSub!)}
              isApprovePending={mutations.approveSubmission.isPending}
              isRewindPending={mutations.rewindSubmission.isPending}
              onWatchUser={handleWatchUser}
              currentIndex={currentIdx}
              totalCount={activeList.length}
              onPrev={hasPrev ? () => state.setViewingSub(activeList[currentIdx - 1]) : undefined}
              onNext={hasNext ? () => state.setViewingSub(activeList[currentIdx + 1]) : undefined}
            />
          );
        })()}

      {state.rejectModal && (
        <RejectModal
          rejectModal={state.rejectModal}
          deductAmount={state.deductAmount}
          setDeductAmount={state.setDeductAmount}
          rejectReason={state.rejectReason}
          setRejectReason={state.setRejectReason}
          onClose={closeRejectModal}
          onSubmitReject={() => {
            const activeRequest =
              state.rejectModal?.appReviewRequest ??
              (state.viewingSub?.id === state.rejectModal?.subId ? state.viewingSub?.appReviewRequest : null);
            if (activeRequest) {
              mutations.decideBusinessReview.mutate({
                requestId: activeRequest.id,
                action: "dispute",
                reason: state.rejectReason,
              });
              closeRejectModal();
              return;
            }
            mutations.rejectSubmission.mutate({
              subId: state.rejectModal!.subId,
              reason: state.rejectReason,
              deducted:
                state.rejectModal!.mode === "app_testing_reject" || state.rejectModal!.mode === "app_review_reject"
                  ? 0
                  : Number(state.deductAmount) || 0,
            });
          }}
          onSubmitCorrection={() => {
            const activeRequest =
              state.rejectModal?.appReviewRequest ??
              (state.viewingSub?.id === state.rejectModal?.subId ? state.viewingSub?.appReviewRequest : null);
            if (activeRequest) {
              mutations.decideBusinessReview.mutate({
                requestId: activeRequest.id,
                action: "needs_correction",
                reason: state.rejectReason,
              });
              closeRejectModal();
              return;
            }
            mutations.requestCorrection.mutate({ subId: state.rejectModal!.subId, reason: state.rejectReason });
          }}
          isPending={
            mutations.rejectSubmission.isPending ||
            mutations.requestCorrection.isPending ||
            mutations.decideBusinessReview.isPending
          }
          error={
            mutations.rejectSubmission.error ||
            mutations.requestCorrection.error ||
            mutations.decideBusinessReview.error
          }
        />
      )}

      {reverseModal && (
        <ReverseSubmissionModal
          username={reverseModal.username}
          deductedAmount={reverseModal.deductedAmount}
          isPending={mutations.reverseSubmission.isPending}
          error={mutations.reverseSubmission.error}
          onClose={() => setReverseModal(null)}
          onConfirm={() =>
            mutations.reverseSubmission.mutate(reverseModal.subId, {
              onSuccess: () => setReverseModal(null),
            })
          }
        />
      )}

      {state.activeImageIndex !== null && state.activeImagesList.length > 0 && (
        <FullscreenImageZoom
          activeIndex={state.activeImageIndex}
          imagesList={state.activeImagesList}
          username={state.viewingSub?.username}
          onClose={() => state.setActiveImageIndex(null)}
          onPrev={() =>
            state.setActiveImageIndex((idx: number | null) =>
              idx !== null ? (idx - 1 + state.activeImagesList.length) % state.activeImagesList.length : null
            )
          }
          onNext={() =>
            state.setActiveImageIndex((idx: number | null) =>
              idx !== null ? (idx + 1) % state.activeImagesList.length : null
            )
          }
        />
      )}

      {editState.isEditingTask && task && (
        <EditTaskModal
          task={task}
          editState={editState}
          officers={officers}
          onClose={() => editState.setIsEditingTask(false)}
          updateTaskMutation={mutations.updateTask}
          uploadImageMutation={mutations.uploadImage}
        />
      )}
    </>
  );
}
