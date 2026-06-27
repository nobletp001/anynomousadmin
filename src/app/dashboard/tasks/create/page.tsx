"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiClient } from "@/services/api-client";
import { Button } from "@/components/ui";
import { ArrowLeft } from "lucide-react";
import { useCreateTaskState } from "./hooks/useCreateTaskState";
import { useCreateTaskMutations } from "./hooks/useCreateTaskMutations";
import { useCreateTaskSubmit } from "./hooks/useCreateTaskSubmit";
import { AIAssistant } from "./components/AIAssistant";
import { QuickPresets } from "./components/QuickPresets";
import { TaskAssignment } from "./components/TaskAssignment";
import { TaskDetailsForm } from "./components/TaskDetailsForm";
import { InstructionsForm } from "./components/InstructionsForm";
import { TaskConfigForm } from "./components/TaskConfigForm";
import { TargetAudienceForm } from "./components/TargetAudienceForm";
import { RewardTimelineForm } from "./components/RewardTimelineForm";
import { SlotUserPicker } from "../components/SlotUserPicker";
import { applyPresetToState } from "./utils";

export default function CreateTaskPage() {
  const router = useRouter();
  const state = useCreateTaskState();
  const mutations = useCreateTaskMutations();
  const { handleSubmit, isPending, canSubmit } = useCreateTaskSubmit(state, mutations);

  const { data: officersData } = useQuery<any>({
    queryKey: ["task-officers"],
    queryFn: () => apiClient.get("/tasks/task-officers"),
  });
  const officers = officersData?.success ? officersData.data : [];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-100 tracking-tight">Create Task</h1>
          <p className="text-zinc-400 text-sm mt-0.5">Set up a new social engagement or referral task</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <AIAssistant state={state} />

        <QuickPresets onApplyPreset={(val) => applyPresetToState(val, state)} />

        <TaskAssignment
          assignedOfficer={state.assignedOfficer}
          setAssignedOfficer={state.setAssignedOfficer}
          officers={officers}
        />

        <TaskDetailsForm
          title={state.title}
          setTitle={state.setTitle}
          description={state.description}
          setDescription={state.setDescription}
          caption={state.caption}
          setCaption={state.setCaption}
          captionMode={state.captionMode}
          setCaptionMode={state.setCaptionMode}
          link={state.link}
          setLink={state.setLink}
          images={state.images}
          setImages={state.setImages}
          uploadError={state.uploadError}
          setUploadError={state.setUploadError}
        />

        <InstructionsForm
          instructions={state.instructions}
          setInstructions={state.setInstructions}
          draggedIdx={state.draggedIdx}
          setDraggedIdx={state.setDraggedIdx}
        />

        <TaskConfigForm
          taskType={state.taskType}
          setTaskType={state.setTaskType}
          targetPlatform={state.targetPlatform}
          setTargetPlatform={state.setTargetPlatform}
          proofType={state.proofType}
          setProofType={state.setProofType}
          acceptText={state.acceptText}
          setAcceptText={state.setAcceptText}
          textLabel={state.textLabel}
          setTextLabel={state.setTextLabel}
          acceptNumber={state.acceptNumber}
          setAcceptNumber={state.setAcceptNumber}
          numberLabel={state.numberLabel}
          setNumberLabel={state.setNumberLabel}
          acceptMultipleImages={state.acceptMultipleImages}
          setAcceptMultipleImages={state.setAcceptMultipleImages}
          isTobeIncludereferralCount={state.isTobeIncludereferralCount}
          setIsTobeIncludereferralCount={state.setIsTobeIncludereferralCount}
          targetCount={state.targetCount}
          setTargetCount={state.setTargetCount}
          adminContact={state.adminContact}
          setAdminContact={state.setAdminContact}
          prompts={state.prompts}
          setPrompts={state.setPrompts}
          requirePromptSelection={state.requirePromptSelection}
          setRequirePromptSelection={state.setRequirePromptSelection}
          marketingText={state.marketingText}
          setMarketingText={state.setMarketingText}
          collectUserName={state.collectUserName}
          setCollectUserName={state.setCollectUserName}
          targetUsername={state.targetUsername}
          setTargetUsername={state.setTargetUsername}
          isSecureSpotTask={state.isSecureSpotTask}
          setIsSecureSpotTask={state.setIsSecureSpotTask}
          secureSpotIntervalType={state.secureSpotIntervalType}
          setSecureSpotIntervalType={state.setSecureSpotIntervalType}
          secureSpotInterval={state.secureSpotInterval}
          setSecureSpotInterval={state.setSecureSpotInterval}
          secureSpotConstantDelay={state.secureSpotConstantDelay}
          setSecureSpotConstantDelay={state.setSecureSpotConstantDelay}
          additionalSlots={state.additionalSlots}
          setAdditionalSlots={state.setAdditionalSlots}
          blockSameDevice={state.blockSameDevice}
          setBlockSameDevice={state.setBlockSameDevice}
        />

        {state.isSecureSpotTask && (
          <SlotUserPicker
            selectedUsers={state.initialSlotSelectedUsers}
            onChange={state.setInitialSlotSelectedUsers}
            bulkUsers={state.initialSlotBulkUsers}
            onBulkChange={state.setInitialSlotBulkUsers}
          />
        )}

        <TargetAudienceForm
          enableTargeting={state.enableTargeting}
          setEnableTargeting={state.setEnableTargeting}
          audience={state.audience}
          setAudience={state.setAudience}
        />

        <RewardTimelineForm
          amount={state.amount}
          setAmount={state.setAmount}
          numberOfUsersNeeded={state.numberOfUsersNeeded}
          setNumberOfUsersNeeded={state.setNumberOfUsersNeeded}
          maxPerHour={state.maxPerHour}
          setMaxPerHour={state.setMaxPerHour}
          noExpiry={state.noExpiry}
          setNoExpiry={state.setNoExpiry}
          timelineMs={state.timelineMs}
          setTimelineMs={state.setTimelineMs}
          isPayFluenceTask={state.isPayFluenceTask}
          setIsPayFluenceTask={state.setIsPayFluenceTask}
          volutterPayFluenceTaskPerformNumber={state.volutterPayFluenceTaskPerformNumber}
          setVolutterPayFluenceTaskPerformNumber={state.setVolutterPayFluenceTaskPerformNumber}
          scheduledAt={state.scheduledAt}
          setScheduledAt={state.setScheduledAt}
          isPinned={state.isPinned}
          setIsPinned={state.setIsPinned}
        />

        {mutations.createTask.error && (
          <p className="text-sm text-red-400 px-1">
            {(mutations.createTask.error as any)?.response?.data?.error ?? "Failed to create task"}
          </p>
        )}

        <div className="flex items-center justify-end gap-3 pb-4">
          <Button variant="outline" size="md" type="button" onClick={() => router.back()} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="primary" size="md" type="submit" isLoading={isPending} disabled={!canSubmit}>
            {mutations.uploadImage.isPending
              ? "Uploading images…"
              : mutations.createTask.isPending
                ? "Creating task…"
                : "Create Task"}
          </Button>
        </div>
      </form>
    </div>
  );
}
