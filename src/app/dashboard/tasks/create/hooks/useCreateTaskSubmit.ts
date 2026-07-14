import React from "react";
import { CreateTaskState } from "./useCreateTaskState";
import { useCreateTaskMutations } from "./useCreateTaskMutations";

export function useCreateTaskSubmit(state: CreateTaskState, mutations: ReturnType<typeof useCreateTaskMutations>) {
  const { uploadImage, createTask } = mutations;

  const canSubmit =
    state.title.trim() &&
    state.description.trim() &&
    state.targetPlatform.trim() &&
    (state.isPayFluenceTask ? state.amount === "" || Number(state.amount) >= 0 : Number(state.amount) > 0) &&
    Number(state.numberOfUsersNeeded) > 0 &&
    (state.taskType !== "views" || Number(state.targetCount) > 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    let uploadedUrls: string[] = [];

    if (state.images.length > 0) {
      try {
        const results = await Promise.all(
          state.images.map(({ preview }) => {
            const [header, base64] = preview.split(",");
            const mimeType = header.match(/:(.*?);/)?.[1] ?? "image/jpeg";
            return uploadImage.mutateAsync({ base64, mimeType });
          })
        );
        uploadedUrls = results.map((r: any) => r.url);
      } catch {
        state.setUploadError("One or more image uploads failed. Please try again.");
        return;
      }
    }

    const timeline = state.noExpiry
      ? undefined
      : state.customTimelineDate
        ? new Date(`${state.customTimelineDate}T23:59:59.999`).toISOString()
        : new Date(Date.now() + state.timelineMs).toISOString();
    const filteredInstructions = state.instructions.map((s) => s.trim()).filter(Boolean);

    createTask.mutate({
      title: state.title.trim(),
      description: state.description.trim(),
      caption: state.caption.trim() || undefined,
      link: state.link.trim() || undefined,
      instructions: filteredInstructions.length ? filteredInstructions : undefined,
      images: uploadedUrls.length ? uploadedUrls : undefined,
      taskType: state.taskType,
      targetPlatform: state.targetPlatform,
      proofType: state.proofType,
      acceptText: state.acceptText,
      textLabel: state.acceptText ? state.textLabel.trim() : undefined,
      acceptNumber: state.acceptNumber,
      numberLabel: state.acceptNumber ? state.numberLabel.trim() : undefined,
      acceptMultipleImages: state.acceptMultipleImages,
      lifeline: state.noExpiry,
      amount: state.isPayFluenceTask && !state.amount ? "0" : state.amount,
      numberOfUsersNeeded: state.numberOfUsersNeeded,
      timeline,
      targetCount: state.targetCount.trim() ? state.targetCount : undefined,
      adminContact: state.adminContact.trim() || undefined,
      assignedOfficer: state.assignedOfficer || undefined,
      prompts: state.prompts.trim()
        ? JSON.stringify(
            ((): string[] => {
              const rawText = state.prompts.trim();
              if (/(?:^|\n)\d+\./.test(rawText)) {
                return rawText
                  .split(/(?:^|\r?\n)(?=\d+\.)/)
                  .map((p) => p.trim())
                  .filter(Boolean);
              }
              return rawText
                .split("\n\n")
                .map((p) => p.trim())
                .filter(Boolean);
            })()
          )
        : undefined,
      requirePromptSelection: state.requirePromptSelection,
      marketingText: state.marketingText.trim() || undefined,
      isPayFluenceTask: state.isPayFluenceTask,
      isTobeIncludereferralCount: state.isTobeIncludereferralCount,
      scheduledAt: state.scheduledAt ? new Date(state.scheduledAt).toISOString() : undefined,
      isPinned: state.isPinned,
      collectUserName: state.collectUserName,
      targetUsername: state.collectUserName ? state.targetUsername.trim() || undefined : undefined,
      volutterPayFluenceTaskPerformNumber: state.volutterPayFluenceTaskPerformNumber.trim()
        ? parseInt(state.volutterPayFluenceTaskPerformNumber)
        : undefined,
      isSecureSpotTask: state.isSecureSpotTask,
      secureSpotIntervalType: state.isSecureSpotTask ? state.secureSpotIntervalType : undefined,
      secureSpotInterval:
        state.isSecureSpotTask && state.secureSpotIntervalType !== "constant" && state.secureSpotInterval.trim()
          ? parseInt(state.secureSpotInterval)
          : undefined,
      secureSpotConstantDelay:
        state.isSecureSpotTask && state.secureSpotConstantDelay.trim()
          ? parseInt(state.secureSpotConstantDelay)
          : undefined,
      secureSpotIsExactDays:
        state.isSecureSpotTask && state.secureSpotIntervalType === "days" ? state.secureSpotIsExactDays : undefined,
      secureSpotIsPerDay:
        state.isSecureSpotTask && state.secureSpotIntervalType === "days" ? state.secureSpotIsPerDay : undefined,
      secureSpotNumberPerDay:
        state.isSecureSpotTask &&
        state.secureSpotIntervalType === "days" &&
        state.secureSpotIsPerDay &&
        state.secureSpotNumberPerDay.trim()
          ? parseInt(state.secureSpotNumberPerDay)
          : undefined,
      additionalSlots:
        state.isSecureSpotTask && state.additionalSlots.trim() ? parseInt(state.additionalSlots) : undefined,
      blockSameDevice: state.blockSameDevice,
      initialSlotUsers: state.isSecureSpotTask
        ? [...state.initialSlotSelectedUsers, state.initialSlotBulkUsers].filter(Boolean)
        : undefined,
      hasClientRequestReview: state.hasClientRequestReview,
      clientRequestReviews: state.hasClientRequestReview
        ? state.clientRequestReviews.map((r) => r.trim()).filter(Boolean)
        : undefined,
      targetAudience: state.enableTargeting
        ? {
            ...(state.audience.gender.length ? { gender: state.audience.gender } : {}),
            ...(state.audience.employmentStatus.length ? { employmentStatus: state.audience.employmentStatus } : {}),
            ...(state.audience.educationLevel.length ? { educationLevel: state.audience.educationLevel } : {}),
            ...(state.audience.state.length ? { state: state.audience.state } : {}),
            ...(state.audience.minAge ? { minAge: Number(state.audience.minAge) } : {}),
            ...(state.audience.maxAge ? { maxAge: Number(state.audience.maxAge) } : {}),
          }
        : undefined,
    });
  };

  const isPending = uploadImage.isPending || createTask.isPending;

  return {
    handleSubmit,
    isPending,
    canSubmit,
  };
}
