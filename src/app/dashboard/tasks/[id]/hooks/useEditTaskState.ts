import { useState } from "react";
import { AudienceFilter } from "../types";

export function useEditTaskState() {
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [editTimeline, setEditTimeline] = useState("");
  const [editLifeline, setEditLifeline] = useState(false);
  const [editNumberOfUsers, setEditNumberOfUsers] = useState("");
  const [editInstructions, setEditInstructions] = useState<string[]>([]);
  const [editAmount, setEditAmount] = useState("");
  const [editLink, setEditLink] = useState("");
  const [editAssignedOfficer, setEditAssignedOfficer] = useState("");
  const [editCaption, setEditCaption] = useState("");
  const [editCaptionMode, setEditCaptionMode] = useState<"text" | "array">("text");
  const [editTaskType, setEditTaskType] = useState("follow");
  const [editTargetPlatform, setEditTargetPlatform] = useState("instagram");
  const [editProofType, setEditProofType] = useState<"banner" | "url">("banner");
  const [editAcceptText, setEditAcceptText] = useState(false);
  const [editTextLabel, setEditTextLabel] = useState("");
  const [editAcceptNumber, setEditAcceptNumber] = useState(false);
  const [editNumberLabel, setEditNumberLabel] = useState("");
  const [editAcceptMultipleImages, setEditAcceptMultipleImages] = useState(false);
  const [editIsTobeIncludereferralCount, setEditIsTobeIncludereferralCount] = useState(true);
  const [editTargetCount, setEditTargetCount] = useState("");
  const [editAdminContact, setEditAdminContact] = useState("");
  const [editMaxPerHour, setEditMaxPerHour] = useState("");
  const [editNoExpiry, setEditNoExpiry] = useState(false);
  const [editEnableTargeting, setEditEnableTargeting] = useState(false);
  const [editAudience, setEditAudience] = useState<AudienceFilter>({
    gender: [],
    employmentStatus: [],
    educationLevel: [],
    state: [],
    minAge: "",
    maxAge: "",
  });
  const [editImages, setEditImages] = useState<Array<{ url?: string; file?: File; preview?: string }>>([]);
  const [uploadError, setUploadError] = useState("");
  const [editAllowedSubmissions, setEditAllowedSubmissions] = useState<
    Array<{ username: string; allowedCount: number }>
  >([]);
  const [editPrompts, setEditPrompts] = useState("");
  const [editRequirePromptSelection, setEditRequirePromptSelection] = useState(false);
  const [editMarketingText, setEditMarketingText] = useState("");
  const [editScheduledAt, setEditScheduledAt] = useState("");
  const [editIsPinned, setEditIsPinned] = useState(false);
  const [editCollectUserName, setEditCollectUserName] = useState(false);
  const [editTargetUsername, setEditTargetUsername] = useState("");
  const [editIsSecureSpotTask, setEditIsSecureSpotTask] = useState(false);
  const [editSecureSpotIntervalType, setEditSecureSpotIntervalType] = useState<"constant" | "minutes" | "days">(
    "minutes"
  );
  const [editSecureSpotInterval, setEditSecureSpotInterval] = useState("");
  const [editSecureSpotConstantDelay, setEditSecureSpotConstantDelay] = useState("");

  return {
    editScheduledAt,
    setEditScheduledAt,
    editIsPinned,
    setEditIsPinned,
    isEditingTask,
    setIsEditingTask,
    editTimeline,
    setEditTimeline,
    editLifeline,
    setEditLifeline,
    editNumberOfUsers,
    setEditNumberOfUsers,
    editInstructions,
    setEditInstructions,
    editAmount,
    setEditAmount,
    editLink,
    setEditLink,
    editAssignedOfficer,
    setEditAssignedOfficer,
    editCaption,
    setEditCaption,
    editCaptionMode,
    setEditCaptionMode,
    editTaskType,
    setEditTaskType,
    editTargetPlatform,
    setEditTargetPlatform,
    editProofType,
    setEditProofType,
    editAcceptText,
    setEditAcceptText,
    editTextLabel,
    setEditTextLabel,
    editAcceptNumber,
    setEditAcceptNumber,
    editNumberLabel,
    setEditNumberLabel,
    editAcceptMultipleImages,
    setEditAcceptMultipleImages,
    editIsTobeIncludereferralCount,
    setEditIsTobeIncludereferralCount,
    editTargetCount,
    setEditTargetCount,
    editAdminContact,
    setEditAdminContact,
    editMaxPerHour,
    setEditMaxPerHour,
    editNoExpiry,
    setEditNoExpiry,
    editEnableTargeting,
    setEditEnableTargeting,
    editAudience,
    setEditAudience,
    editImages,
    setEditImages,
    uploadError,
    setUploadError,
    editAllowedSubmissions,
    setEditAllowedSubmissions,
    editPrompts,
    setEditPrompts,
    editRequirePromptSelection,
    setEditRequirePromptSelection,
    editMarketingText,
    setEditMarketingText,
    editCollectUserName,
    setEditCollectUserName,
    editTargetUsername,
    setEditTargetUsername,
    editIsSecureSpotTask,
    setEditIsSecureSpotTask,
    editSecureSpotIntervalType,
    setEditSecureSpotIntervalType,
    editSecureSpotInterval,
    setEditSecureSpotInterval,
    editSecureSpotConstantDelay,
    setEditSecureSpotConstantDelay,
  };
}
export type EditTaskState = ReturnType<typeof useEditTaskState>;
