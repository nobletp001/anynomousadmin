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
  const [editTaskType, setEditTaskType] = useState("follow");
  const [editTargetPlatform, setEditTargetPlatform] = useState("instagram");
  const [editProofType, setEditProofType] = useState<"banner" | "url">("banner");
  const [editAcceptText, setEditAcceptText] = useState(false);
  const [editTextLabel, setEditTextLabel] = useState("");
  const [editAcceptNumber, setEditAcceptNumber] = useState(false);
  const [editNumberLabel, setEditNumberLabel] = useState("");
  const [editAcceptMultipleImages, setEditAcceptMultipleImages] = useState(false);
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
  const [editAllowedSubmissions, setEditAllowedSubmissions] = useState<Array<{ username: string; allowedCount: number }>>([]);

  return {
    isEditingTask, setIsEditingTask,
    editTimeline, setEditTimeline,
    editLifeline, setEditLifeline,
    editNumberOfUsers, setEditNumberOfUsers,
    editInstructions, setEditInstructions,
    editAmount, setEditAmount,
    editLink, setEditLink,
    editAssignedOfficer, setEditAssignedOfficer,
    editCaption, setEditCaption,
    editTaskType, setEditTaskType,
    editTargetPlatform, setEditTargetPlatform,
    editProofType, setEditProofType,
    editAcceptText, setEditAcceptText,
    editTextLabel, setEditTextLabel,
    editAcceptNumber, setEditAcceptNumber,
    editNumberLabel, setEditNumberLabel,
    editAcceptMultipleImages, setEditAcceptMultipleImages,
    editTargetCount, setEditTargetCount,
    editAdminContact, setEditAdminContact,
    editMaxPerHour, setEditMaxPerHour,
    editNoExpiry, setEditNoExpiry,
    editEnableTargeting, setEditEnableTargeting,
    editAudience, setEditAudience,
    editImages, setEditImages,
    uploadError, setUploadError,
    editAllowedSubmissions, setEditAllowedSubmissions,
  };
}
export type EditTaskState = ReturnType<typeof useEditTaskState>;
