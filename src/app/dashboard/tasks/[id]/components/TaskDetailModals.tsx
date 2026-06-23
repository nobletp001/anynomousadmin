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
  editState: EditTaskState;
  state: any;
  mutations: any;
  reverseModal: any;
  setReverseModal: (v: any) => void;
  officers: any[];
  closeRejectModal: () => void;
  openCorrectionModal: (sub: Submission) => void;
  openRejectModal: (sub: Submission) => void;
  handleWatchUser: (username: string) => void;
}

export function TaskDetailModals({
  task,
  submissions,
  editState,
  state,
  mutations,
  reverseModal,
  setReverseModal,
  officers,
  closeRejectModal,
  openCorrectionModal,
  openRejectModal,
  handleWatchUser,
}: TaskDetailModalsProps) {
  return (
    <>
      {state.viewingSub &&
        (() => {
          const currentIdx = submissions.findIndex((s) => s.id === state.viewingSub!.id);
          const hasPrev = currentIdx > 0;
          const hasNext = currentIdx !== -1 && currentIdx < submissions.length - 1;
          return (
            <SubmissionDetailsModal
              sub={state.viewingSub}
              submissions={submissions}
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
              onApprove={() =>
                mutations.approveSubmission.mutate({
                  subId: state.viewingSub!.id,
                  rating: state.rating || 5,
                  feedback: state.feedback,
                })
              }
              onCorrectionClick={() => openCorrectionModal(state.viewingSub!)}
              onRejectClick={() => openRejectModal(state.viewingSub!)}
              isApprovePending={mutations.approveSubmission.isPending}
              onWatchUser={handleWatchUser}
              currentIndex={currentIdx}
              totalCount={submissions.length}
              onPrev={hasPrev ? () => state.setViewingSub(submissions[currentIdx - 1]) : undefined}
              onNext={hasNext ? () => state.setViewingSub(submissions[currentIdx + 1]) : undefined}
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
          onSubmitReject={() =>
            mutations.rejectSubmission.mutate({
              subId: state.rejectModal!.subId,
              reason: state.rejectReason,
              deducted: Number(state.deductAmount) || 0,
            })
          }
          onSubmitCorrection={() =>
            mutations.requestCorrection.mutate({ subId: state.rejectModal!.subId, reason: state.rejectReason })
          }
          isPending={mutations.rejectSubmission.isPending || mutations.requestCorrection.isPending}
          error={mutations.rejectSubmission.error || mutations.requestCorrection.error}
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
