import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui";
import { Task } from "../types";
import { EditTaskState } from "../hooks/useEditTaskState";
import { FieldLabel } from "./EditTaskForm/FieldLabel";
import { BasicDetails } from "./EditTaskForm/BasicDetails";
import { Instructions } from "./EditTaskForm/Instructions";
import { Config } from "./EditTaskForm/Config";
import { Targeting } from "./EditTaskForm/Targeting";
import { RewardTimeline } from "./EditTaskForm/RewardTimeline";
import { AllowedSubmissions } from "./EditTaskForm/AllowedSubmissions";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/api-client";

interface EditTaskModalProps {
  task: Task;
  editState: EditTaskState;
  officers: any[];
  onClose: () => void;
  updateTaskMutation: any;
  uploadImageMutation: any;
}

export function EditTaskModal({
  task,
  editState,
  officers,
  onClose,
  updateTaskMutation,
  uploadImageMutation,
}: EditTaskModalProps) {
  const { data: initialAllowedList } = useQuery<any[]>({
    queryKey: ["task-allowed-submissions", task.id],
    queryFn: async () => (await apiClient.get(`/admin/tasks/${task.id}/allowed-submissions`) as any).data,
  });

  React.useEffect(() => {
    if (initialAllowedList) {
      editState.setEditAllowedSubmissions(
        initialAllowedList.map((item) => ({ username: item.username, allowedCount: item.allowedCount }))
      );
    }
  }, [initialAllowedList]);

  const handleSave = async () => {
    const numUsersVal = parseInt(editState.editNumberOfUsers);
    if (isNaN(numUsersVal) || numUsersVal < task.approvedCount) {
      alert(`Capacity must be at least ${task.approvedCount}`);
      return;
    }

    let uploadedUrls: string[] = [];
    if (editState.editImages.length > 0) {
      try {
        const results = await Promise.all(
          editState.editImages.map((img) => {
            if (img.url) return Promise.resolve({ url: img.url });
            const [header, base64] = img.preview!.split(",");
            const mimeType = header.match(/:(.*?);/)?.[1] ?? "image/jpeg";
            return uploadImageMutation.mutateAsync({ base64, mimeType });
          })
        );
        uploadedUrls = results.map((r: any) => r.url);
      } catch {
        editState.setUploadError("One or more image uploads failed. Please try again.");
        return;
      }
    }

    const filteredInstructions = editState.editInstructions.map((s) => s.trim()).filter(Boolean);

    updateTaskMutation.mutate({
      timeline: editState.editNoExpiry ? null : editState.editTimeline ? new Date(editState.editTimeline).toISOString() : null,
      lifeline: editState.editNoExpiry,
      numberOfUsersNeeded: numUsersVal,
      instructions: filteredInstructions.length ? filteredInstructions : undefined,
      amount: editState.editAmount ? Number(editState.editAmount) : undefined,
      link: editState.editLink.trim() || null,
      assignedOfficer: editState.editAssignedOfficer || null,
      caption: editState.editCaption.trim() || null,
      images: uploadedUrls.length ? uploadedUrls : null,
      taskType: editState.editTaskType,
      targetPlatform: editState.editTargetPlatform,
      proofType: editState.editProofType,
      acceptText: editState.editAcceptText,
      textLabel: editState.editAcceptText ? editState.editTextLabel.trim() : null,
      acceptNumber: editState.editAcceptNumber,
      numberLabel: editState.editAcceptNumber ? editState.editNumberLabel.trim() : null,
      acceptMultipleImages: editState.editAcceptMultipleImages,
      targetCount: editState.editTargetCount.trim() ? editState.editTargetCount : null,
      adminContact: editState.editAdminContact.trim() || null,
      maxPerHour: editState.editMaxPerHour.trim() ? parseInt(editState.editMaxPerHour) : null,
      targetAudience: editState.editEnableTargeting
        ? {
            ...(editState.editAudience.gender.length ? { gender: editState.editAudience.gender } : {}),
            ...(editState.editAudience.employmentStatus.length ? { employmentStatus: editState.editAudience.employmentStatus } : {}),
            ...(editState.editAudience.educationLevel.length ? { educationLevel: editState.editAudience.educationLevel } : {}),
            ...(editState.editAudience.state.length ? { state: editState.editAudience.state } : {}),
            ...(editState.editAudience.minAge ? { minAge: parseInt(editState.editAudience.minAge) } : {}),
            ...(editState.editAudience.maxAge ? { maxAge: parseInt(editState.editAudience.maxAge) } : {}),
          }
        : null,
      allowedSubmissions: editState.editAllowedSubmissions,
    });
  };

  const isSaving = updateTaskMutation.isPending || uploadImageMutation.isPending;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden relative">
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-955/20 shrink-0">
          <div>
            <h3 className="text-base font-bold text-zinc-100">Edit Task Configuration</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Update task requirements. Locked fields cannot be modified.</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          <div className="space-y-3 bg-red-955/5 border border-red-900/10 rounded-xl p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-red-400">🔒 Disabled Fields (Not Editable)</div>
            <div className="grid grid-cols-1 gap-3 text-xs mt-1.5">
              <div>
                <FieldLabel>Title</FieldLabel>
                <input type="text" value={task.title} disabled className="w-full bg-zinc-950/60 border border-zinc-805/80 rounded-lg px-3 py-2 text-zinc-500 cursor-not-allowed select-none" />
              </div>
              <div>
                <FieldLabel>Description</FieldLabel>
                <textarea value={task.description} disabled rows={2} className="w-full bg-zinc-950/60 border border-zinc-805/80 rounded-lg p-2 text-zinc-500 cursor-not-allowed select-none resize-none" />
              </div>
            </div>
          </div>

          <BasicDetails
            editCaption={editState.editCaption} setEditCaption={editState.setEditCaption}
            editLink={editState.editLink} setEditLink={editState.setEditLink}
            editImages={editState.editImages} setEditImages={editState.setEditImages}
            uploadError={editState.uploadError} setUploadError={editState.setUploadError}
          />
          <Instructions editInstructions={editState.editInstructions} setEditInstructions={editState.setEditInstructions} />
          <Config
            editTaskType={editState.editTaskType} setEditTaskType={editState.setEditTaskType}
            editTargetPlatform={editState.editTargetPlatform} setEditTargetPlatform={editState.setEditTargetPlatform}
            editProofType={editState.editProofType} setEditProofType={editState.setEditProofType}
            editAcceptText={editState.editAcceptText} setEditAcceptText={editState.setEditAcceptText}
            editTextLabel={editState.editTextLabel} setEditTextLabel={editState.setEditTextLabel}
            editAcceptNumber={editState.editAcceptNumber} setEditAcceptNumber={editState.setEditAcceptNumber}
            editNumberLabel={editState.editNumberLabel} setEditNumberLabel={editState.setEditNumberLabel}
            editAcceptMultipleImages={editState.editAcceptMultipleImages} setEditAcceptMultipleImages={editState.setEditAcceptMultipleImages}
            editTargetCount={editState.editTargetCount} setEditTargetCount={editState.setEditTargetCount}
            editAdminContact={editState.editAdminContact} setEditAdminContact={editState.setEditAdminContact}
          />
          <Targeting editEnableTargeting={editState.editEnableTargeting} setEditEnableTargeting={editState.setEditEnableTargeting} editAudience={editState.editAudience} setEditAudience={editState.setEditAudience} />
          <RewardTimeline
            taskApprovedCount={task.approvedCount}
            editNumberOfUsers={editState.editNumberOfUsers} setEditNumberOfUsers={editState.setEditNumberOfUsers}
            editAmount={editState.editAmount} setEditAmount={editState.setEditAmount}
            editMaxPerHour={editState.editMaxPerHour} setEditMaxPerHour={editState.setEditMaxPerHour}
            editNoExpiry={editState.editNoExpiry} setEditNoExpiry={editState.setEditNoExpiry}
            editTimeline={editState.editTimeline} setEditTimeline={editState.setEditTimeline}
            editAssignedOfficer={editState.editAssignedOfficer} setEditAssignedOfficer={editState.setEditAssignedOfficer}
            officers={officers}
          />
          <AllowedSubmissions editState={editState} />
        </div>

        <div className="p-5 border-t border-zinc-800 flex items-center justify-between bg-zinc-955/20 shrink-0">
          <Button variant="outline" size="md" onClick={onClose}>Cancel</Button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-purple-600 text-white hover:bg-purple-500 transition-colors disabled:opacity-40"
          >
            {uploadImageMutation.isPending ? "Uploading..." : updateTaskMutation.isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
