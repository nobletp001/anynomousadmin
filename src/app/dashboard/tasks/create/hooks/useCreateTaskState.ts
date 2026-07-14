import { useState } from "react";
import { AudienceFilter, ImageEntry } from "../types";

export function useCreateTaskState() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [caption, setCaption] = useState("");
  const [link, setLink] = useState("");
  const [assignedOfficer, setAssignedOfficer] = useState("");
  const [instructions, setInstructions] = useState<string[]>([""]);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [taskType, setTaskType] = useState("follow");
  const [targetPlatform, setTargetPlatform] = useState("instagram");
  const [timelineMs, setTimelineMs] = useState(24 * 60 * 60 * 1000);
  const [customTimelineDate, setCustomTimelineDate] = useState("");
  const [amount, setAmount] = useState("");
  const [numberOfUsersNeeded, setNumberOfUsersNeeded] = useState("");
  const [adminContact, setAdminContact] = useState("");
  const [targetCount, setTargetCount] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [aiError, setAiError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showPromptRepo, setShowPromptRepo] = useState(false);
  const [images, setImages] = useState<ImageEntry[]>([]);
  const [uploadError, setUploadError] = useState("");
  const [proofType, setProofType] = useState<"banner" | "url">("banner");
  const [acceptText, setAcceptText] = useState(false);
  const [textLabel, setTextLabel] = useState("");
  const [acceptNumber, setAcceptNumber] = useState(false);
  const [numberLabel, setNumberLabel] = useState("");
  const [acceptMultipleImages, setAcceptMultipleImages] = useState(false);
  const [noExpiry, setNoExpiry] = useState(false);
  const [prompts, setPrompts] = useState("");
  const [requirePromptSelection, setRequirePromptSelection] = useState(false);
  const [marketingText, setMarketingText] = useState("");
  const [isPayFluenceTask, setIsPayFluenceTask] = useState(false);
  const [volutterPayFluenceTaskPerformNumber, setVolutterPayFluenceTaskPerformNumber] = useState("");
  const [isTobeIncludereferralCount, setIsTobeIncludereferralCount] = useState(true);
  const [enableTargeting, setEnableTargeting] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [collectUserName, setCollectUserName] = useState(false);
  const [targetUsername, setTargetUsername] = useState("");
  const [isSecureSpotTask, setIsSecureSpotTask] = useState(false);
  const [secureSpotIntervalType, setSecureSpotIntervalType] = useState<"constant" | "minutes" | "days">("minutes");
  const [secureSpotInterval, setSecureSpotInterval] = useState("");
  const [secureSpotConstantDelay, setSecureSpotConstantDelay] = useState("");
  const [secureSpotIsExactDays, setSecureSpotIsExactDays] = useState(false);
  const [secureSpotIsPerDay, setSecureSpotIsPerDay] = useState(false);
  const [secureSpotNumberPerDay, setSecureSpotNumberPerDay] = useState("");
  const [additionalSlots, setAdditionalSlots] = useState("5");
  const [blockSameDevice, setBlockSameDevice] = useState(true);
  const [initialSlotSelectedUsers, setInitialSlotSelectedUsers] = useState<string[]>([]);
  const [initialSlotBulkUsers, setInitialSlotBulkUsers] = useState("");
  const [audience, setAudience] = useState<AudienceFilter>({
    gender: [],
    employmentStatus: [],
    educationLevel: [],
    state: [],
    minAge: "",
    maxAge: "",
  });

  return {
    scheduledAt,
    setScheduledAt,
    isPinned,
    setIsPinned,
    title,
    setTitle,
    description,
    setDescription,
    caption,
    setCaption,
    link,
    setLink,
    assignedOfficer,
    setAssignedOfficer,
    instructions,
    setInstructions,
    draggedIdx,
    setDraggedIdx,
    taskType,
    setTaskType,
    targetPlatform,
    setTargetPlatform,
    timelineMs,
    setTimelineMs,
    customTimelineDate,
    setCustomTimelineDate,
    amount,
    setAmount,
    numberOfUsersNeeded,
    setNumberOfUsersNeeded,
    adminContact,
    setAdminContact,
    targetCount,
    setTargetCount,
    aiPrompt,
    setAiPrompt,
    isListening,
    setIsListening,
    isParsing,
    setIsParsing,
    aiError,
    setAiError,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    showPromptRepo,
    setShowPromptRepo,
    images,
    setImages,
    uploadError,
    setUploadError,
    proofType,
    setProofType,
    acceptText,
    setAcceptText,
    textLabel,
    setTextLabel,
    acceptNumber,
    setAcceptNumber,
    numberLabel,
    setNumberLabel,
    acceptMultipleImages,
    setAcceptMultipleImages,
    noExpiry,
    setNoExpiry,
    enableTargeting,
    setEnableTargeting,
    audience,
    setAudience,
    prompts,
    setPrompts,
    requirePromptSelection,
    setRequirePromptSelection,
    marketingText,
    setMarketingText,
    isPayFluenceTask,
    setIsPayFluenceTask,
    volutterPayFluenceTaskPerformNumber,
    setVolutterPayFluenceTaskPerformNumber,
    isTobeIncludereferralCount,
    setIsTobeIncludereferralCount,
    collectUserName,
    setCollectUserName,
    targetUsername,
    setTargetUsername,
    isSecureSpotTask,
    setIsSecureSpotTask,
    secureSpotIntervalType,
    setSecureSpotIntervalType,
    secureSpotInterval,
    setSecureSpotInterval,
    secureSpotConstantDelay,
    setSecureSpotConstantDelay,
    secureSpotIsExactDays,
    setSecureSpotIsExactDays,
    secureSpotIsPerDay,
    setSecureSpotIsPerDay,
    secureSpotNumberPerDay,
    setSecureSpotNumberPerDay,
    additionalSlots,
    setAdditionalSlots,
    blockSameDevice,
    setBlockSameDevice,
    initialSlotSelectedUsers,
    setInitialSlotSelectedUsers,
    initialSlotBulkUsers,
    setInitialSlotBulkUsers,
  };
}

export type CreateTaskState = ReturnType<typeof useCreateTaskState>;
