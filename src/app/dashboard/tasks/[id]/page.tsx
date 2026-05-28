"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import { apiClient } from "@/services/api-client";
import { Badge } from "@/components/ui";
import { Button } from "@/components/ui";
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Users,
  Coins,
  Image as ImageIcon,
  Link as LinkIcon,
  Download,
  Eye,
  FileText,
  X,
  Move,
  Trash2,
  Mic,
  Sparkles,
  Loader2,
  GripVertical,
  Upload,
  Plus,
  Infinity as InfinityIcon,
  Info,
} from "lucide-react";

const TASK_TYPES = [
  { value: "follow", label: "Follow (Follow an account)" },
  { value: "like", label: "Like (Like a post or page)" },
  { value: "comment", label: "Comment (Comment on a post)" },
  { value: "subscribe", label: "Subscribe (Subscribe to a channel)" },
  { value: "share", label: "Share (Share a post)" },
  { value: "post-content", label: "Post Content (Post on your profile/status)" },
  { value: "views", label: "Views (Get views on a post)" },
  { value: "download", label: "Download (Download an app or file)" },
  { value: "signup", label: "Sign Up (Register / create account)" },
  { value: "review", label: "Review (Leave a rating or review)" },
  { value: "message", label: "Message (Chat or DM someone)" },
  { value: "watch", label: "Watch (Watch a video to completion)" },
  { value: "use-app", label: "Use App (Use a feature or service)" },
  { value: "jetpot", label: "Jetpot (Bring buyers / sales referral)" },
];

const PLATFORMS = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "tiktok", label: "TikTok" },
  { value: "facebook", label: "Facebook" },
  { value: "x", label: "X (Twitter)" },
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "YouTube" },
  { value: "other", label: "Other" },
];

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

const TIMELINE_OPTIONS = [
  ...Array.from({ length: 48 }, (_, i) => ({
    label: i === 0 ? "1 hour" : `${i + 1} hours`,
    ms: (i + 1) * HOUR_MS,
  })),
  { label: "3 days", ms: 3 * DAY_MS },
  { label: "5 days", ms: 5 * DAY_MS },
  { label: "6 days", ms: 6 * DAY_MS },
  { label: "7 days", ms: 7 * DAY_MS },
];

const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT - Abuja",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

const MAX_IMAGES = 5;

type AudienceFilter = {
  gender: string[];
  employmentStatus: string[];
  educationLevel: string[];
  state: string[];
  minAge: string;
  maxAge: string;
};

const inputCls =
  "w-full bg-zinc-800/60 border border-zinc-700/60 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-colors";

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs text-zinc-400 mb-1.5 font-medium">
      {children}
      {required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  );
}

function toggle(arr: string[], val: string) {
  return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
}

interface Task {
  id: number;
  title: string;
  description: string;
  caption: string | null;
  banner: string | null;
  link: string | null;
  instructions: string | null;
  timeline: string | null;
  lifeline: boolean;
  numberOfUsersNeeded: number;
  amount: number;
  taskType: string;
  targetPlatform: string;
  adminContact: string | null;
  status: string;
  approvedCount: number;
  createdBy: string;
  assignedOfficer: string | null;
}

interface UserInfo {
  id: number;
  name: string;
  username: string;
}

interface Submission {
  id: number;
  taskId: number;
  username: string;
  proof: string;
  proofType: string;
  textResponse: string | null;
  numberResponse: string | null;
  status: string;
  rejectionReason: string | null;
  deductedAmount: number;
  createdAt: string;
  user: UserInfo | null;
  userBalance: number;
  rating?: number | null;
  feedback?: string | null;
  ipAddress?: string | null;
  deviceId?: string | null;
}

interface SubmissionsResponse {
  success: boolean;
  task: Task;
  submissions: Submission[];
}

interface RejectModal {
  subId: number;
  username: string;
  balance: number;
  mode: "reject" | "correction";
}

function formatAmount(n: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(n);
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusVariant(s: string) {
  if (s === "approved") return "success";
  if (s === "rejected") return "danger";
  return "warning";
}

function getDownloadUrl(url: string) {
  if (url.includes("cloudinary.com") && url.includes("image/upload/")) {
    return url.replace("image/upload/", "image/upload/fl_attachment/");
  }
  return url;
}

function getImagesList(proof: string): string[] {
  if (!proof) return [];
  if (proof.startsWith("[")) {
    try {
      return JSON.parse(proof);
    } catch {
      return [proof];
    }
  }
  return [proof];
}

export default function TaskSubmissionsPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;
  const queryClient = useQueryClient();

  const [rejectModal, setRejectModal] = useState<RejectModal | null>(null);
  const [deductAmount, setDeductAmount] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [viewingSub, setViewingSub] = useState<Submission | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
  const [activeImagesList, setActiveImagesList] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkRating, setBulkRating] = useState<number | null>(null);
  const [bulkRejectReason, setBulkRejectReason] = useState("");
  const [bulkMode, setBulkMode] = useState<"none" | "approve" | "reject">("none");

  // Violation reporting states
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportDeductAmount, setReportDeductAmount] = useState("");
  const [reportReason, setReportReason] = useState("");

  // Task editing states
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
  const editFileRef = React.useRef<HTMLInputElement>(null);

  function handleEditFiles(files: FileList | File[]) {
    const arr = Array.from(files);
    const remaining = MAX_IMAGES - editImages.length;
    if (remaining <= 0) return;
    setUploadError("");

    const toAdd = arr.slice(0, remaining);
    const oversized = toAdd.find((f) => f.size > 10 * 1024 * 1024);
    if (oversized) {
      setUploadError("Each image must be under 10 MB.");
      return;
    }

    toAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setEditImages((prev) => [...prev, { file, preview: ev.target?.result as string }]);
      };
      reader.readAsDataURL(file);
    });
  }

  function removeEditImage(idx: number) {
    setEditImages((prev) => prev.filter((_, i) => i !== idx));
    setUploadError("");
  }

  // Draggable states for Modals
  const [rejectPos, setRejectPos] = useState({ x: 0, y: 0 });
  const [isDraggingReject, setIsDraggingReject] = useState(false);
  const [dragStartReject, setDragStartReject] = useState({ x: 0, y: 0 });

  const [detailsPos, setDetailsPos] = useState({ x: 0, y: 0 });
  const [isDraggingDetails, setIsDraggingDetails] = useState(false);
  const [dragStartDetails, setDragStartDetails] = useState({ x: 0, y: 0 });

  // Reset positions when modals close
  useEffect(() => {
    if (!rejectModal) {
      setRejectPos({ x: 0, y: 0 });
    }
  }, [rejectModal]);

  useEffect(() => {
    if (!viewingSub) {
      setDetailsPos({ x: 0, y: 0 });
    }
  }, [viewingSub]);

  const handleMouseDownReject = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("input") || target.closest("textarea")) return;
    setIsDraggingReject(true);
    setDragStartReject({
      x: e.clientX - rejectPos.x,
      y: e.clientY - rejectPos.y,
    });
  };

  const handleMouseDownDetails = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("input") || target.closest("textarea") || target.closest("a"))
      return;
    setIsDraggingDetails(true);
    setDragStartDetails({
      x: e.clientX - detailsPos.x,
      y: e.clientY - detailsPos.y,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingReject) {
        setRejectPos({
          x: e.clientX - dragStartReject.x,
          y: e.clientY - dragStartReject.y,
        });
      }
      if (isDraggingDetails) {
        setDetailsPos({
          x: e.clientX - dragStartDetails.x,
          y: e.clientY - dragStartDetails.y,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDraggingReject(false);
      setIsDraggingDetails(false);
    };

    if (isDraggingReject || isDraggingDetails) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingReject, dragStartReject, isDraggingDetails, dragStartDetails]);

  React.useEffect(() => {
    if (viewingSub) {
      setRating(null);
      setFeedback("");
      setActiveImageIndex(null);
      setActiveImagesList([]);
    }
  }, [viewingSub]);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchFilter);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchFilter]);

  const { data, isLoading, error, refetch } = useQuery<SubmissionsResponse>({
    queryKey: ["task-submissions", taskId, statusFilter, debouncedSearch],
    queryFn: () =>
      apiClient.get(
        `/admin/tasks/${taskId}/submissions?status=${statusFilter}&search=${encodeURIComponent(debouncedSearch)}`
      ) as any,
  });

  const task = data?.task;
  const submissions = data?.submissions ?? [];

  const advanceToNextPending = (currentSubId: number) => {
    const pendings = submissions.filter((s) => s.status === "pending" || s.status === "needs_correction");
    const currentIdx = pendings.findIndex((s) => s.id === currentSubId);
    if (currentIdx !== -1 && currentIdx < pendings.length - 1) {
      setViewingSub(pendings[currentIdx + 1]);
    } else {
      setViewingSub(null);
    }
  };

  const approveSubmission = useMutation({
    mutationFn: ({ subId, rating, feedback }: { subId: number; rating: number; feedback?: string }) =>
      apiClient.patch(`/admin/tasks/${taskId}/submissions/${subId}`, { action: "approve", rating, feedback }) as any,
    onSuccess: (_res, variables) => {
      queryClient.invalidateQueries({ queryKey: ["task-submissions", taskId] });
      advanceToNextPending(variables.subId);
    },
  });

  const rejectSubmission = useMutation({
    mutationFn: ({ subId, reason, deducted }: { subId: number; reason: string; deducted: number }) =>
      apiClient.patch(`/admin/tasks/${taskId}/submissions/${subId}`, {
        action: "reject",
        rejectionReason: reason,
        deductedAmount: deducted,
      }) as any,
    onSuccess: (_res, variables) => {
      queryClient.invalidateQueries({ queryKey: ["task-submissions", taskId] });
      closeRejectModal();
      advanceToNextPending(variables.subId);
    },
  });

  const requestCorrection = useMutation({
    mutationFn: ({ subId, reason }: { subId: number; reason: string }) =>
      apiClient.patch(`/admin/tasks/${taskId}/submissions/${subId}`, {
        action: "needs_correction",
        rejectionReason: reason,
      }) as any,
    onSuccess: (_res, variables) => {
      queryClient.invalidateQueries({ queryKey: ["task-submissions", taskId] });
      closeRejectModal();
      advanceToNextPending(variables.subId);
    },
  });

  const toggleTaskStatus = useMutation({
    mutationFn: (newStatus: "active" | "closed") =>
      apiClient.patch(`/admin/tasks/${taskId}/status`, { status: newStatus }) as any,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["task-submissions", taskId] }),
  });

  const bulkAction = useMutation({
    mutationFn: (payload: {
      ids: number[];
      action: string;
      rating?: number;
      rejectionReason?: string;
      deductedAmount?: number;
    }) => apiClient.post(`/admin/tasks/${taskId}/submissions/bulk`, payload) as any,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-submissions", taskId] });
      setSelectedIds(new Set());
      setBulkMode("none");
      setBulkRating(null);
      setBulkRejectReason("");
    },
  });

  const reportSubmission = useMutation({
    mutationFn: ({
      subId,
      deductedAmount,
      rejectionReason,
    }: {
      subId: number;
      deductedAmount: number;
      rejectionReason: string;
    }) =>
      apiClient.patch(`/admin/tasks/${taskId}/submissions/${subId}/report`, { deductedAmount, rejectionReason }) as any,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-submissions", taskId] });
      setViewingSub(null);
      setShowReportForm(false);
      setReportDeductAmount("");
      setReportReason("");
    },
  });

  const updateTask = useMutation({
    mutationFn: (payload: Record<string, any>) => apiClient.patch(`/admin/tasks/${taskId}`, payload) as any,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-submissions", taskId] });
      setIsEditingTask(false);
    },
  });

  const uploadImage = useMutation({
    mutationFn: ({ base64, mimeType }: { base64: string; mimeType: string }) =>
      apiClient.post("/admin/upload", { base64, mimeType }) as any,
  });

  const { data: officersData } = useQuery({
    queryKey: ["task-officers"],
    queryFn: () => apiClient.get("/tasks/task-officers") as any,
  });
  const officers = (officersData as any)?.data || [];

  const closeRejectModal = () => {
    setRejectModal(null);
    setDeductAmount("");
    setRejectReason("");
  };

  const openRejectModal = (sub: Submission) => {
    setRejectModal({ subId: sub.id, username: sub.username, balance: sub.userBalance, mode: "reject" });
    setDeductAmount("");
    setRejectReason("");
  };

  const openCorrectionModal = (sub: Submission) => {
    setRejectModal({ subId: sub.id, username: sub.username, balance: sub.userBalance, mode: "correction" });
    setDeductAmount("");
    setRejectReason("");
  };

  const handleReject = () => {
    if (!rejectModal || !rejectReason.trim()) return;
    rejectSubmission.mutate({
      subId: rejectModal.subId,
      reason: rejectReason,
      deducted: Number(deductAmount) || 0,
    });
  };

  const getDuplicateWarning = (sub: Submission) => {
    if (!sub.proof || sub.proofType === "text") return null;
    const duplicate = submissions.find(
      (s) => s.id !== sub.id && s.proof === sub.proof && s.proofType === sub.proofType
    );
    if (duplicate) {
      return `Duplicate proof matching @${duplicate.username}`;
    }
    return null;
  };

  const getIpWarning = (sub: Submission) => {
    if (!sub.ipAddress) return null;
    const duplicate = submissions.find((s) => s.id !== sub.id && s.ipAddress === sub.ipAddress);
    if (duplicate) {
      return `Same IP address as @${duplicate.username}`;
    }
    return null;
  };

  const getDeviceWarning = (sub: Submission) => {
    if (!sub.deviceId) return null;
    const duplicate = submissions.find((s) => s.id !== sub.id && s.deviceId === sub.deviceId);
    if (duplicate) {
      return `Same Device ID as @${duplicate.username}`;
    }
    return null;
  };

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!viewingSub) return;

      const activeEl = document.activeElement;
      const isInput = activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA");

      if (e.key === "Escape") {
        e.preventDefault();
        if (rejectModal) {
          closeRejectModal();
        } else {
          setViewingSub(null);
        }
        return;
      }

      if (isInput) return;

      if (["1", "2", "3", "4", "5"].includes(e.key)) {
        e.preventDefault();
        setRating(parseInt(e.key));
        return;
      }

      if (e.key.toLowerCase() === "a") {
        e.preventDefault();
        const targetRating = rating || 5;
        approveSubmission.mutate({ subId: viewingSub.id, rating: targetRating, feedback });
        return;
      }

      if (e.key.toLowerCase() === "r") {
        e.preventDefault();
        openRejectModal(viewingSub);
        return;
      }

      if (e.key.toLowerCase() === "c") {
        e.preventDefault();
        openCorrectionModal(viewingSub);
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        const pendings = submissions.filter((s) => s.status === "pending" || s.status === "needs_correction");
        const currentIdx = pendings.findIndex((s) => s.id === viewingSub.id);
        if (currentIdx !== -1 && currentIdx < pendings.length - 1) {
          setViewingSub(pendings[currentIdx + 1]);
        }
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        const pendings = submissions.filter((s) => s.status === "pending" || s.status === "needs_correction");
        const currentIdx = pendings.findIndex((s) => s.id === viewingSub.id);
        if (currentIdx > 0) {
          setViewingSub(pendings[currentIdx - 1]);
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [viewingSub, rating, feedback, submissions, rejectModal]);

  const handleDownloadPDF = () => {
    if (!task) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to download the PDF report.");
      return;
    }

    const totalCount = submissions.length;
    const approvedCount = submissions.filter((s) => s.status === "approved").length;
    const rejectedCount = submissions.filter((s) => s.status === "rejected").length;
    const pendingCount = submissions.filter((s) => s.status === "pending").length;
    const correctionCount = submissions.filter((s) => s.status === "needs_correction").length;
    const approvalRate = totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0;

    const rowsHtml = submissions
      .map((sub, index) => {
        const dateStr = new Date(sub.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        let proofLabel = "Screenshot";
        let proofDetail = "";
        if (sub.proofType === "link") {
          proofLabel = "URL Link";
          proofDetail = sub.proof;
        } else {
          if (sub.textResponse) {
            proofDetail += `Text: ${sub.textResponse}`;
          }
          if (sub.numberResponse) {
            if (proofDetail) proofDetail += " | ";
            proofDetail += `Num: ${sub.numberResponse}`;
          }
          if (!proofDetail) {
            proofDetail = "Screenshot Uploaded";
          }
        }

        const statusBadgeClass =
          sub.status === "approved"
            ? "status-approved"
            : sub.status === "rejected"
              ? "status-rejected"
              : sub.status === "needs_correction"
                ? "status-correction"
                : "status-pending";

        const statusText = sub.status === "needs_correction" ? "Correction Requested" : sub.status.toUpperCase();
        const stars =
          sub.status === "approved" && typeof sub.rating === "number"
            ? "★".repeat(sub.rating) + "☆".repeat(5 - sub.rating)
            : "—";

        return `
        <tr>
          <td>${index + 1}</td>
          <td>
            <div class="user-name">${sub.user?.name || "—"}</div>
            <div class="user-username">@${sub.username}</div>
          </td>
          <td>${(sub.user as any)?.whatsappNumber || "—"}</td>
          <td>
            <span class="status-badge ${statusBadgeClass}">${statusText}</span>
          </td>
          <td>
            <div class="proof-type">${proofLabel}</div>
            <div class="proof-desc">${proofDetail}</div>
          </td>
          <td>${dateStr}</td>
          <td>${stars}</td>
        </tr>
      `;
      })
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Task Summary Report - ${task.title}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
          
          body {
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            color: #1c1917;
            background-color: #ffffff;
            margin: 0;
            padding: 40px;
            font-size: 13px;
            line-height: 1.5;
          }

          @media print {
            body {
              padding: 0;
            }
            .no-print {
              display: none;
            }
          }

          .header-container {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }

          .brand-logo {
            font-weight: 800;
            font-size: 24px;
            color: #7c3aed;
            letter-spacing: -0.05em;
          }

          .report-title {
            font-size: 14px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #64748b;
            margin-top: 4px;
          }

          .report-meta {
            text-align: right;
            font-size: 12px;
            color: #64748b;
          }

          .meta-date {
            font-weight: 600;
            color: #0f172a;
          }

          .task-info-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 30px;
          }

          .task-title {
            font-size: 18px;
            font-weight: 700;
            color: #0f172a;
            margin: 0 0 10px 0;
          }

          .task-desc {
            color: #475569;
            margin: 0 0 15px 0;
            font-size: 13px;
          }

          .grid-info {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
          }

          .info-block {
            display: flex;
            flex-direction: column;
          }

          .info-label {
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            color: #94a3b8;
            letter-spacing: 0.05em;
          }

          .info-val {
            font-size: 14px;
            font-weight: 700;
            color: #334155;
            margin-top: 4px;
          }

          .stats-grid {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 15px;
            margin-bottom: 35px;
          }

          .stat-card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 15px;
            text-align: center;
          }

          .stat-card.primary {
            background: #f5f3ff;
            border-color: #ddd6fe;
          }

          .stat-num {
            font-size: 20px;
            font-weight: 800;
            color: #0f172a;
          }

          .stat-card.primary .stat-num {
            color: #6d28d9;
          }

          .stat-label {
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            color: #64748b;
            margin-top: 5px;
            letter-spacing: 0.05em;
          }

          .table-container {
            margin-bottom: 30px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
          }

          th {
            background: #f1f5f9;
            color: #475569;
            font-weight: 700;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            padding: 12px 10px;
            border-bottom: 2px solid #e2e8f0;
          }

          td {
            padding: 12px 10px;
            border-bottom: 1px solid #f1f5f9;
            vertical-align: middle;
          }

          tr:nth-child(even) td {
            background-color: #fafafa;
          }

          .user-name {
            font-weight: 600;
            color: #0f172a;
          }

          .user-username {
            font-size: 11px;
            color: #64748b;
            font-family: monospace;
          }

          .status-badge {
            display: inline-flex;
            align-items: center;
            font-size: 9px;
            font-weight: 700;
            padding: 3px 8px;
            border-radius: 9999px;
            text-transform: uppercase;
          }

          .status-approved {
            background: #dcfce7;
            color: #15803d;
          }

          .status-rejected {
            background: #fee2e2;
            color: #b91c1c;
          }

          .status-pending {
            background: #fef9c3;
            color: #a16207;
          }

          .status-correction {
            background: #ffedd5;
            color: #c2410c;
          }

          .proof-type {
            font-weight: 600;
            font-size: 11px;
            color: #334155;
          }

          .proof-desc {
            font-size: 11px;
            color: #64748b;
            max-width: 250px;
            word-break: break-word;
          }

          .footer {
            margin-top: 50px;
            border-top: 1px solid #e2e8f0;
            padding-top: 15px;
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            color: #94a3b8;
          }

          .print-btn-container {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 20px;
          }

          .btn {
            background: #7c3aed;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 13px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 4px 6px -1px rgba(124, 58, 237, 0.1), 0 2px 4px -1px rgba(124, 58, 237, 0.06);
            transition: all 0.2s;
          }

          .btn:hover {
            background: #6d28d9;
            transform: translateY(-1px);
          }
        </style>
      </head>
      <body>
        <div class="print-btn-container no-print">
          <button class="btn" onclick="window.print()">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2m-2 0v4H8v-4m8 0H8"></path>
            </svg>
            Print / Save as PDF
          </button>
        </div>

        <div class="header-container">
          <div>
            <div class="brand-logo">PAYFLUENCE</div>
            <div class="report-title">Task Completion Summary Report</div>
          </div>
          <div class="report-meta">
            <div>Report Generated: <span class="meta-date">${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span></div>
            <div>Task Reference: <span class="meta-date">#TASK-${task.id}</span></div>
          </div>
        </div>

        <div class="task-info-card">
          <div class="task-title">${task.title}</div>
          <div class="task-desc">${task.description}</div>
          
          <div class="grid-info">
            <div class="info-block">
              <span class="info-label">Platform / Type</span>
              <span class="info-val" style="text-transform: capitalize;">${task.targetPlatform} · ${task.taskType}</span>
            </div>
            <div class="info-block">
              <span class="info-label">Pay Per User</span>
              <span class="info-val">${new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(task.amount)}</span>
            </div>
            <div class="info-block">
              <span class="info-label">Target Capacity</span>
              <span class="info-val">${task.numberOfUsersNeeded} spots</span>
            </div>
            <div class="info-block">
              <span class="info-label">Status</span>
              <span class="info-val" style="text-transform: capitalize; color: ${task.status === "active" ? "#16a34a" : "#475569"}">${task.status}</span>
            </div>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-card primary">
            <div class="stat-num">${totalCount}</div>
            <div class="stat-label">Total Submissions</div>
          </div>
          <div class="stat-card">
            <div class="stat-num" style="color: #16a34a;">${approvedCount}</div>
            <div class="stat-label">Approved</div>
          </div>
          <div class="stat-card">
            <div class="stat-num" style="color: #dc2626;">${rejectedCount}</div>
            <div class="stat-label">Rejected</div>
          </div>
          <div class="stat-card">
            <div class="stat-num" style="color: #ca8a04;">${pendingCount + correctionCount}</div>
            <div class="stat-label">Pending / Correction</div>
          </div>
          <div class="stat-card">
            <div class="stat-num">${approvalRate}%</div>
            <div class="stat-label">Approval Rate</div>
          </div>
        </div>

        <div class="table-container">
          <h3 style="margin-top: 0; margin-bottom: 15px; font-size: 15px; font-weight: 700; color: #0f172a;">User Participant List</h3>
          <table>
            <thead>
              <tr>
                <th style="width: 40px;">S/N</th>
                <th>Participant</th>
                <th>WhatsApp Contact</th>
                <th>Status</th>
                <th>Collected Proof</th>
                <th>Submission Date</th>
                <th>Rating</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml || '<tr><td colspan="7" style="text-align: center; color: #94a3b8; padding: 30px;">No participants found matching the current filters.</td></tr>'}
            </tbody>
          </table>
        </div>

        <div class="footer">
          <div>Payfluence Auditor Panel &copy; ${new Date().getFullYear()}</div>
          <div>Report generated securely under audit protocol.</div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const progress = task ? Math.min(100, Math.round((task.approvedCount / task.numberOfUsersNeeded) * 100)) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-100 tracking-tight">Submissions</h1>
          <p className="text-zinc-400 text-sm mt-0.5">Review and action user proof of task completion</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-32 bg-zinc-900/30 border border-zinc-800/80 rounded-2xl" />
          <div className="h-64 bg-zinc-900/30 border border-zinc-800/80 rounded-2xl" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <AlertCircle className="w-10 h-10 text-red-400" />
          <p className="text-zinc-400 text-sm">Failed to load submissions</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : (
        task && (
          <>
            <div className="backdrop-blur-md bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Badge variant={task.status === "active" ? "success" : "default"} dot>
                      {task.status}
                    </Badge>
                    <span className="text-xs text-zinc-500 capitalize">{task.taskType}</span>
                    <span className="text-zinc-700">·</span>
                    <span className="text-xs text-zinc-500 capitalize">{task.targetPlatform}</span>
                  </div>
                  <h2 className="text-lg font-bold text-zinc-100">{task.title}</h2>
                  <p className="text-sm text-zinc-400 mt-1 line-clamp-2">{task.description}</p>
                </div>
                <div className="flex items-center gap-3 self-start shrink-0">
                  <button
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-600/20 border border-purple-500/30 text-purple-300 hover:bg-purple-600/30 hover:text-white transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export PDF Report
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingTask(true);
                      setEditTimeline(task.timeline ? task.timeline.split("T")[0] : "");
                      setEditLifeline(!!task.lifeline);
                      setEditNumberOfUsers(String(task.numberOfUsersNeeded));
                      setEditAmount(String(task.amount));
                      setEditLink(task.link || "");
                      setEditAssignedOfficer(task.assignedOfficer || "");
                      try {
                        setEditInstructions(task.instructions ? JSON.parse(task.instructions) : []);
                      } catch {
                        setEditInstructions(task.instructions ? [task.instructions] : []);
                      }
                      setEditCaption(task.caption || "");
                      setEditTaskType((task as any).taskType || "follow");
                      setEditTargetPlatform((task as any).targetPlatform || "instagram");
                      setEditProofType(((task as any).proofType === "url" ? "url" : "banner") as "banner" | "url");
                      setEditAcceptText(!!(task as any).acceptText);
                      setEditTextLabel((task as any).textLabel || "");
                      setEditAcceptNumber(!!(task as any).acceptNumber);
                      setEditNumberLabel((task as any).numberLabel || "");
                      setEditAcceptMultipleImages(!!(task as any).acceptMultipleImages);
                      setEditTargetCount(String((task as any).targetCount ?? ""));
                      setEditAdminContact((task as any).adminContact || "");
                      setEditMaxPerHour(String((task as any).maxPerHour ?? ""));
                      setEditNoExpiry(!!task.lifeline);

                      // Target audience
                      let aud: AudienceFilter = {
                        gender: [],
                        employmentStatus: [],
                        educationLevel: [],
                        state: [],
                        minAge: "",
                        maxAge: "",
                      };
                      let hasTargeting = false;
                      if ((task as any).targetAudience) {
                        try {
                          const parsed = JSON.parse((task as any).targetAudience);
                          aud = {
                            gender: parsed.gender || [],
                            employmentStatus: parsed.employmentStatus || [],
                            educationLevel: parsed.educationLevel || [],
                            state: parsed.state || [],
                            minAge: String(parsed.minAge ?? ""),
                            maxAge: String(parsed.maxAge ?? ""),
                          };
                          if (
                            aud.gender.length ||
                            aud.employmentStatus.length ||
                            aud.educationLevel.length ||
                            aud.state.length ||
                            aud.minAge ||
                            aud.maxAge
                          ) {
                            hasTargeting = true;
                          }
                        } catch (e) {
                          console.error(e);
                        }
                      }
                      setEditAudience(aud);
                      setEditEnableTargeting(hasTargeting);

                      // Images
                      const initialImages = [];
                      if ((task as any).images) {
                        try {
                          const parsed = JSON.parse((task as any).images);
                          if (Array.isArray(parsed)) {
                            initialImages.push(...parsed.map((url: string) => ({ url })));
                          }
                        } catch {
                          if (typeof (task as any).images === "string" && (task as any).images.trim()) {
                            initialImages.push({ url: (task as any).images });
                          }
                        }
                      }
                      setEditImages(initialImages);
                      setUploadError("");
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-750 hover:text-white transition-colors"
                  >
                    Edit Task
                  </button>
                  <button
                    onClick={() => toggleTaskStatus.mutate(task.status === "active" ? "closed" : "active")}
                    disabled={toggleTaskStatus.isPending}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                      task.status === "active"
                        ? "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20 hover:text-red-300"
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 hover:text-emerald-300"
                    }`}
                  >
                    {toggleTaskStatus.isPending
                      ? "Updating..."
                      : task.status === "active"
                        ? "Close Task"
                        : "Re-open Task"}
                  </button>
                  {task.link && (
                    <a
                      href={task.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      View target
                    </a>
                  )}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-4 pt-4 border-t border-zinc-800/60">
                <div>
                  <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-semibold mb-1">Reward</p>
                  <p className="text-sm font-bold text-emerald-400">{formatAmount(task.amount)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-semibold mb-1">Capacity</p>
                  <p className="text-sm font-bold text-zinc-200">
                    {task.approvedCount} / {task.numberOfUsersNeeded}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-semibold mb-1">Deadline</p>
                  <p className="text-sm font-bold text-zinc-200">
                    {task.timeline ? new Date(task.timeline).toLocaleDateString() : "No Expiry / Lifeline"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-semibold mb-1">Submissions</p>
                  <p className="text-sm font-bold text-zinc-200">{submissions.length}</p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-semibold mb-1">Officer</p>
                  <p className="text-sm font-bold text-zinc-200 truncate" title={task.assignedOfficer || "Auto"}>
                    @{task.assignedOfficer || "Auto"}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-zinc-500">Completion</span>
                  <span className="font-semibold text-zinc-400">{progress}%</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${progress >= 100 ? "bg-emerald-500" : "bg-purple-500"}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-12">
                <div className="backdrop-blur-md bg-zinc-900/30 border border-zinc-800/80 rounded-2xl shadow-xl overflow-hidden">
                  {/* Search and Filters Bar */}
                  <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-950/20">
                    <div className="w-full sm:w-64">
                      <input
                        type="text"
                        placeholder="Search by username..."
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-550 focus:outline-none focus:border-purple-500/50 transition-colors"
                      />
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <span className="text-xs text-zinc-550">Status:</span>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-purple-500/50"
                      >
                        <option value="">All Submissions</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>

                  {submissions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center text-zinc-500">
                      <Users className="w-8 h-8 opacity-40" />
                      <p className="text-sm">No submissions yet</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead>
                          <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
                            {(() => {
                              const selectableSubmissions = submissions.filter(
                                (s) => s.status === "pending" || s.status === "needs_correction"
                              );
                              if (selectableSubmissions.length === 0) return <th className="px-4 py-4 w-10" />;
                              const allSelected =
                                selectableSubmissions.length > 0 &&
                                selectableSubmissions.every((s) => selectedIds.has(s.id));
                              return (
                                <th className="px-4 py-4 w-10">
                                  <input
                                    type="checkbox"
                                    checked={allSelected}
                                    onChange={() => {
                                      if (allSelected) {
                                        setSelectedIds(new Set());
                                      } else {
                                        setSelectedIds(new Set(selectableSubmissions.map((s) => s.id)));
                                      }
                                    }}
                                    className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 accent-purple-500 cursor-pointer"
                                  />
                                </th>
                              );
                            })()}
                            <th className="px-6 py-4 font-semibold text-xs">User</th>
                            <th className="px-6 py-4 font-semibold text-xs">Balance</th>
                            <th className="px-6 py-4 font-semibold text-xs">Submission Proof &amp; Inputs</th>
                            <th className="px-6 py-4 font-semibold text-xs">Status</th>
                            <th className="px-6 py-4 font-semibold text-xs">Submitted</th>
                            <th className="px-6 py-4 font-semibold text-xs">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/40">
                          {submissions.map((sub) => (
                            <tr
                              key={sub.id}
                              onClick={() => setViewingSub(sub)}
                              className={`hover:bg-zinc-800/20 transition-colors cursor-pointer ${
                                viewingSub?.id === sub.id
                                  ? "bg-purple-500/10 border-l-2 border-l-purple-500"
                                  : selectedIds.has(sub.id)
                                    ? "bg-purple-500/5"
                                    : ""
                              }`}
                            >
                              <td className="px-4 py-4 w-10" onClick={(e) => e.stopPropagation()}>
                                {sub.status === "pending" || sub.status === "needs_correction" ? (
                                  <input
                                    type="checkbox"
                                    checked={selectedIds.has(sub.id)}
                                    onChange={() => {
                                      setSelectedIds((prev) => {
                                        const next = new Set(prev);
                                        if (next.has(sub.id)) next.delete(sub.id);
                                        else next.add(sub.id);
                                        return next;
                                      });
                                    }}
                                    className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 accent-purple-500 cursor-pointer"
                                  />
                                ) : (
                                  <span className="text-zinc-700 text-xs">—</span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-xs font-bold text-purple-400 shrink-0">
                                    {(sub.user?.name ?? sub.username).charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="font-medium text-zinc-100 text-xs">{sub.user?.name ?? "—"}</p>
                                    <p className="text-zinc-550 text-[11px]">@{sub.username}</p>

                                    {/* WhatsApp Contact Button */}
                                    {(sub.user as any)?.whatsappNumber && (
                                      <a
                                        href={`https://wa.me/${(sub.user as any).whatsappNumber.replace(/[^0-9]/g, "")}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="inline-flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300 transition-colors mt-1 font-semibold"
                                      >
                                        <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                                          <path d="M17.472 14.382c-.022-.08-.05-.088-.413-.236-.363-.147-2.145-.92-2.474-1.018-.33-.1-.57-.148-.813.147-.243.295-.94.92-1.154 1.121-.215.203-.43.226-.793.08-.363-.146-1.53-.497-2.915-1.572-1.077-.828-1.805-1.85-2.017-2.016-.215-.164-.022-.253.16-.395.163-.127.363-.377.545-.566.181-.19.242-.324.363-.54.12-.217.06-.407-.03-.556-.09-.15-.813-1.706-1.115-2.311-.295-.623-.596-.538-.814-.548-.21-.01-.451-.01-.692-.01-.24 0-.632.08-.962.403-.33.324-1.262 1.07-1.262 2.612 0 1.543 1.259 3.033 1.433 3.237.174.204 2.477 3.32 6.002 4.606.837.306 1.492.488 2.003.629.84.237 1.607.202 2.213.125.674-.085 2.07-.732 2.362-1.442.29-.71.29-1.319.202-1.443-.088-.124-.29-.204-.653-.352zm2.136-11.007c-2.28-2.28-5.309-3.535-8.532-3.535C5.034 0 0 4.398 0 10.14c0 1.83.522 3.618 1.509 5.167L0 21.6l6.398-1.467c1.488.72 3.149 1.1 4.847 1.1 6.046 0 10.963-4.398 10.963-10.14 0-2.782-1.218-5.4-3.498-7.718z" />
                                        </svg>
                                        Chat with User
                                      </a>
                                    )}

                                    {/* Fraud/Security Alerts */}
                                    <div className="flex flex-col gap-1 mt-1">
                                      {getDuplicateWarning(sub) && (
                                        <span className="inline-flex items-center gap-1 text-[9px] text-red-400 bg-red-955/20 border border-red-900/30 rounded px-1.5 py-0.5 w-fit font-semibold uppercase tracking-wider">
                                          <AlertCircle className="w-2.5 h-2.5 shrink-0" />
                                          Duplicate Proof
                                        </span>
                                      )}
                                      {getIpWarning(sub) && (
                                        <span className="inline-flex items-center gap-1 text-[9px] text-amber-400 bg-amber-955/20 border border-amber-900/30 rounded px-1.5 py-0.5 w-fit font-semibold uppercase tracking-wider">
                                          <AlertCircle className="w-2.5 h-2.5 shrink-0" />
                                          Same IP
                                        </span>
                                      )}
                                      {getDeviceWarning(sub) && (
                                        <span className="inline-flex items-center gap-1 text-[9px] text-yellow-500 bg-yellow-955/20 border border-yellow-900/30 rounded px-1.5 py-0.5 w-fit font-semibold uppercase tracking-wider">
                                          <AlertCircle className="w-2.5 h-2.5 shrink-0" />
                                          Same Device
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-xs font-semibold text-emerald-400">
                                {formatAmount(sub.userBalance)}
                              </td>
                              <td className="px-6 py-4">
                                <div className="space-y-1.5 py-1">
                                  {sub.proofType === "link" ? (
                                    <a
                                      href={sub.proof}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="inline-flex items-center gap-1.5 text-blue-450 hover:text-blue-400 text-xs font-bold transition-colors"
                                    >
                                      <LinkIcon className="w-3.5 h-3.5" />
                                      View URL Link
                                    </a>
                                  ) : (
                                    (() => {
                                      let count = 1;
                                      if (sub.proof.startsWith("[")) {
                                        try {
                                          count = JSON.parse(sub.proof).length;
                                        } catch {
                                          count = 1;
                                        }
                                      }
                                      return (
                                        <span className="inline-flex items-center gap-1.5 text-amber-455 hover:text-amber-400 text-xs font-bold transition-colors">
                                          <ImageIcon className="w-3.5 h-3.5" />
                                          Screenshots ({count})
                                        </span>
                                      );
                                    })()
                                  )}

                                  <div className="flex flex-wrap gap-1.5 mt-1">
                                    {sub.textResponse && (
                                      <span
                                        className="inline-block max-w-44 truncate text-[10px] text-zinc-305 bg-zinc-900 border border-zinc-800/80 rounded px-2 py-0.5 font-medium"
                                        title={sub.textResponse}
                                      >
                                        Text: {sub.textResponse}
                                      </span>
                                    )}
                                    {sub.numberResponse && (
                                      <span
                                        className="inline-block max-w-44 truncate text-[10px] text-purple-300 bg-purple-950/20 border border-purple-900/30 rounded px-2 py-0.5 font-medium"
                                        title={sub.numberResponse}
                                      >
                                        Num: {sub.numberResponse}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div>
                                  <Badge variant={statusVariant(sub.status)} dot>
                                    {sub.status === "needs_correction" ? "correction requested" : sub.status}
                                  </Badge>
                                  {(sub.status === "rejected" || sub.status === "needs_correction") &&
                                    sub.rejectionReason && (
                                      <p
                                        className="text-[10px] text-zinc-550 mt-0.5 max-w-44 truncate font-medium"
                                        title={sub.rejectionReason}
                                      >
                                        Reason: {sub.rejectionReason}
                                      </p>
                                    )}
                                  {sub.status === "rejected" && sub.deductedAmount > 0 && (
                                    <p className="text-[10px] text-red-400 mt-0.5">
                                      −{formatAmount(sub.deductedAmount)}
                                    </p>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-zinc-500 text-xs whitespace-nowrap">
                                {formatDate(sub.createdAt)}
                              </td>
                              <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                {(sub.status === "pending" || sub.status === "needs_correction") && (
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => setViewingSub(sub)}
                                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                                    >
                                      <CheckCircle className="w-3.5 h-3.5" />
                                      Review
                                    </button>
                                    <button
                                      onClick={() => openCorrectionModal(sub)}
                                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
                                    >
                                      <AlertCircle className="w-3.5 h-3.5" />
                                      Correction
                                    </button>
                                    <button
                                      onClick={() => openRejectModal(sub)}
                                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                                    >
                                      <XCircle className="w-3.5 h-3.5" />
                                      Reject
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* Submission Review Modal */}
              {viewingSub && (
                <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div
                    style={{ transform: `translate(${detailsPos.x}px, ${detailsPos.y}px)` }}
                    className="bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden relative"
                  >
                    {/* Header */}
                    <div
                      onMouseDown={handleMouseDownDetails}
                      className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/20 cursor-move select-none shrink-0"
                    >
                      <div>
                        <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-purple-400" />
                          <span>Submission Details</span>
                          <span className="inline-flex items-center gap-1 text-[10px] text-zinc-500 bg-zinc-800 border border-zinc-700 rounded px-1.5 py-0.5 font-normal select-none">
                            <Move className="w-2.5 h-2.5" /> Drag
                          </span>
                        </h3>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          Submitted by <span className="font-bold text-white">@{viewingSub.username}</span> (
                          {viewingSub.user?.name || "No Name"}) · {formatDate(viewingSub.createdAt)}
                          {task?.assignedOfficer && (
                            <>
                              {" "}
                              ·{" "}
                              <span className="inline-flex items-center gap-1 text-[10px] text-purple-303 bg-purple-950/40 border border-purple-900/30 rounded-full px-2 py-0.5 font-semibold">
                                <Users className="w-3 h-3" />
                                Auditor: @{task.assignedOfficer}
                              </span>
                            </>
                          )}
                        </p>
                      </div>
                      <button
                        onClick={() => setViewingSub(null)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-250 hover:bg-zinc-800 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Modal Body */}
                    <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-12 gap-6">
                      {/* Info Panel */}
                      <div className="md:col-span-5 space-y-5">
                        <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 space-y-4">
                          <h4 className="text-[10px] font-bold text-zinc-550 uppercase tracking-widest border-b border-zinc-800 pb-1.5">
                            User Details
                          </h4>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-purple-400">
                              {(viewingSub.user?.name ?? viewingSub.username).charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-sm text-zinc-200">{viewingSub.user?.name || "—"}</p>
                              <p className="text-zinc-550 text-xs">@{viewingSub.username}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-zinc-900/60">
                            <div>
                              <p className="text-[10px] text-zinc-500 uppercase font-semibold">Wallet Balance</p>
                              <p className="text-sm font-bold text-emerald-400 mt-0.5">
                                {formatAmount(viewingSub.userBalance)}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] text-zinc-500 uppercase font-semibold">Status</p>
                              <div className="mt-1">
                                <Badge variant={statusVariant(viewingSub.status)} dot>
                                  {viewingSub.status}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          {/* Fraud & Security Warning Flags */}
                          {(getDuplicateWarning(viewingSub) ||
                            getIpWarning(viewingSub) ||
                            getDeviceWarning(viewingSub)) && (
                            <div className="space-y-1.5 pt-2 border-t border-zinc-900/60">
                              <p className="text-[10px] text-zinc-500 uppercase font-semibold">Security Alerts</p>
                              <div className="flex flex-col gap-1.5">
                                {getDuplicateWarning(viewingSub) && (
                                  <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/20 border border-red-900/30 rounded-lg px-3 py-2">
                                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                                    <span className="font-medium">{getDuplicateWarning(viewingSub)}</span>
                                  </div>
                                )}
                                {getIpWarning(viewingSub) && (
                                  <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-955/20 border border-amber-900/30 rounded-lg px-3 py-2">
                                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                                    <span className="font-medium">
                                      {getIpWarning(viewingSub)} (IP: {viewingSub.ipAddress})
                                    </span>
                                  </div>
                                )}
                                {getDeviceWarning(viewingSub) && (
                                  <div className="flex items-center gap-2 text-xs text-yellow-500 bg-yellow-955/20 border border-yellow-900/30 rounded-lg px-3 py-2">
                                    <AlertCircle className="w-4 h-4 shrink-0 text-yellow-500" />
                                    <span className="font-medium">
                                      {getDeviceWarning(viewingSub)} (Device: {viewingSub.deviceId?.substring(0, 8)}...)
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {(viewingSub.user as any)?.whatsappNumber && (
                            <div className="pt-2 border-t border-zinc-900/60 flex flex-col gap-0.5">
                              <p className="text-[10px] text-zinc-500 uppercase font-semibold">WhatsApp Contact</p>
                              <a
                                href={`https://wa.me/${(viewingSub.user as any).whatsappNumber.replace(/[^0-9]/g, "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 mt-0.5"
                              >
                                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                  <path d="M17.472 14.382c-.022-.08-.05-.088-.413-.236-.363-.147-2.145-.92-2.474-1.018-.33-.1-.57-.148-.813.147-.243.295-.94.92-1.154 1.121-.215.203-.43.226-.793.08-.363-.146-1.53-.497-2.915-1.572-1.077-.828-1.805-1.85-2.017-2.016-.215-.164-.022-.253.16-.395.163-.127.363-.377.545-.566.181-.19.242-.324.363-.54.12-.217.06-.407-.03-.556-.09-.15-.813-1.706-1.115-2.311-.295-.623-.596-.538-.814-.548-.21-.01-.451-.01-.692-.01-.24 0-.632.08-.962.403-.33.324-1.262 1.07-1.262 2.612 0 1.543 1.259 3.033 1.433 3.237.174.204 2.477 3.32 6.002 4.606.837.306 1.492.488 2.003.629.84.237 1.607.202 2.213.125.674-.085 2.07-.732 2.362-1.442.29-.71.29-1.319.202-1.443-.088-.124-.29-.204-.653-.352zm2.136-11.007c-2.28-2.28-5.309-3.535-8.532-3.535C5.034 0 0 4.398 0 10.14c0 1.83.522 3.618 1.509 5.167L0 21.6l6.398-1.467c1.488.72 3.149 1.1 4.847 1.1 6.046 0 10.963-4.398 10.963-10.14 0-2.782-1.218-5.4-3.498-7.718z" />
                                </svg>
                                {(viewingSub.user as any).whatsappNumber}
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Form responses */}
                        <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 space-y-4">
                          <h4 className="text-[10px] font-bold text-zinc-550 uppercase tracking-widest border-b border-zinc-800 pb-1.5">
                            Collected Input Responses
                          </h4>

                          {/* Text Response */}
                          <div className="space-y-1.5">
                            <p className="text-[10px] text-zinc-500 uppercase font-semibold">Collected Text Details</p>
                            {viewingSub.textResponse ? (
                              <div className="flex items-start gap-2 bg-zinc-900 p-2.5 rounded-lg border border-zinc-800">
                                <p className="text-xs text-zinc-200 flex-1 break-all font-medium select-all">
                                  {viewingSub.textResponse}
                                </p>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(viewingSub.textResponse || "");
                                  }}
                                  className="text-[10px] text-purple-400 hover:text-purple-300 font-bold shrink-0 cursor-pointer"
                                >
                                  Copy
                                </button>
                              </div>
                            ) : (
                              <p className="text-xs text-zinc-600 italic">No text details collected</p>
                            )}
                          </div>

                          {/* Number Response */}
                          <div className="space-y-1.5 pt-3 border-t border-zinc-900/60">
                            <p className="text-[10px] text-zinc-500 uppercase font-semibold">
                              Collected Numeric Details
                            </p>
                            {viewingSub.numberResponse ? (
                              <div className="bg-zinc-900 p-2.5 rounded-lg border border-zinc-800">
                                <p className="text-sm font-bold text-purple-300 select-all">
                                  {viewingSub.numberResponse}
                                </p>
                              </div>
                            ) : (
                              <p className="text-xs text-zinc-600 italic">No numeric details collected</p>
                            )}
                          </div>
                        </div>

                        {/* Verification Verdict / Rating Input */}
                        {(viewingSub.status === "pending" || viewingSub.status === "needs_correction") && (
                          <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 space-y-4">
                            <h4 className="text-[10px] font-bold text-zinc-550 uppercase tracking-widest border-b border-zinc-800 pb-1.5">
                              Action Rating (Required)
                            </h4>
                            <div className="space-y-2">
                              <p className="text-[10px] text-zinc-500 uppercase font-semibold">Select Star Rating</p>
                              <div className="flex items-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className={`text-2xl transition-all ${
                                      rating !== null && star <= rating
                                        ? "text-amber-400 scale-110"
                                        : "text-zinc-700 hover:text-zinc-400"
                                    }`}
                                  >
                                    ★
                                  </button>
                                ))}
                                {rating !== null && (
                                  <span className="text-xs text-zinc-400 font-mono ml-1.5">({rating}.0)</span>
                                )}
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <p className="text-[10px] text-zinc-500 uppercase font-semibold">Feedback (Optional)</p>
                              <textarea
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                placeholder="Provide performance feedback or verification remarks..."
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-100 placeholder:text-zinc-550 focus:outline-none focus:border-purple-500/50 min-h-[60px]"
                              />
                            </div>

                            {/* Keyboard Shortcuts Legend */}
                            <div className="pt-3 border-t border-zinc-900/60 space-y-1.5">
                              <p className="text-[10px] text-zinc-500 uppercase font-semibold">Keyboard Shortcuts</p>
                              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-zinc-400 font-medium">
                                <div>
                                  <kbd className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-[10px] mr-1 font-mono">
                                    1-5
                                  </kbd>{" "}
                                  Set Rating
                                </div>
                                <div>
                                  <kbd className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-[10px] mr-1 font-mono">
                                    A
                                  </kbd>{" "}
                                  Approve
                                </div>
                                <div>
                                  <kbd className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-[10px] mr-1 font-mono">
                                    R
                                  </kbd>{" "}
                                  Reject
                                </div>
                                <div>
                                  <kbd className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-[10px] mr-1 font-mono">
                                    C
                                  </kbd>{" "}
                                  Correction
                                </div>
                                <div className="col-span-2">
                                  <kbd className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-[10px] mr-1 font-mono">
                                    ↑ / ↓
                                  </kbd>{" "}
                                  Navigate List
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Read-only rating if already approved */}
                        {viewingSub.status === "approved" &&
                          (viewingSub as any).rating !== undefined &&
                          (viewingSub as any).rating !== null && (
                            <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/[0.02] p-4 space-y-3">
                              <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest border-b border-emerald-950 pb-1.5">
                                Approved Verdict
                              </h4>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-zinc-500 uppercase font-semibold">Rating:</span>
                                <div className="flex text-amber-400 text-xs">
                                  {"★".repeat((viewingSub as any).rating)}
                                  {"☆".repeat(5 - (viewingSub as any).rating)}
                                </div>
                                <span className="text-xs text-zinc-400 font-mono">
                                  ({(viewingSub as any).rating}.0)
                                </span>
                              </div>
                              {(viewingSub as any).feedback && (
                                <div className="space-y-1">
                                  <span className="text-[10px] text-zinc-550 uppercase font-semibold block">
                                    Feedback:
                                  </span>
                                  <p className="text-xs text-zinc-300 italic bg-zinc-950/20 p-2.5 rounded-lg border border-zinc-900/60 leading-relaxed">
                                    &ldquo;{(viewingSub as any).feedback}&rdquo;
                                  </p>
                                </div>
                              )}

                              {!showReportForm ? (
                                <button
                                  type="button"
                                  onClick={() => setShowReportForm(true)}
                                  className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
                                >
                                  <AlertCircle className="w-3.5 h-3.5" />
                                  Log Violation / Revoke Earning
                                </button>
                              ) : (
                                <div className="mt-3 border-t border-zinc-800/80 pt-3 space-y-3">
                                  <h5 className="text-[10px] font-bold text-red-400 uppercase tracking-widest">
                                    Revocation & Violation Report
                                  </h5>
                                  <div className="space-y-1.5">
                                    <label className="text-[10px] text-zinc-500 uppercase font-semibold">
                                      Penalty / Deduction Amount (₦)
                                    </label>
                                    <input
                                      type="number"
                                      min="0"
                                      placeholder="e.g. 200 (optional)"
                                      value={reportDeductAmount}
                                      onChange={(e) => setReportDeductAmount(e.target.value)}
                                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 text-xs focus:outline-none focus:border-red-500/50"
                                    />
                                    {task && (
                                      <p className="text-[9px] text-zinc-500">
                                        The approved task reward (₦{task.amount}) will be revoked automatically. Enter
                                        any additional penalty here.
                                      </p>
                                    )}
                                  </div>
                                  <div className="space-y-1.5">
                                    <label className="text-[10px] text-zinc-500 uppercase font-semibold">
                                      Violation Reason / Admin Review (Required)
                                    </label>
                                    <textarea
                                      placeholder="Explain the violation details..."
                                      value={reportReason}
                                      onChange={(e) => setReportReason(e.target.value)}
                                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-200 text-xs focus:outline-none focus:border-red-500/50 min-h-[60px]"
                                    />
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (!reportReason.trim()) return;
                                        reportSubmission.mutate({
                                          subId: viewingSub.id,
                                          deductedAmount: reportDeductAmount ? Number(reportDeductAmount) : 0,
                                          rejectionReason: reportReason.trim(),
                                        });
                                      }}
                                      disabled={!reportReason.trim() || reportSubmission.isPending}
                                      className="flex-1 px-3 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white disabled:opacity-40 transition-colors"
                                    >
                                      {reportSubmission.isPending ? "Submitting..." : "Confirm & Submit Report"}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setShowReportForm(false);
                                        setReportDeductAmount("");
                                        setReportReason("");
                                      }}
                                      className="px-3 py-2 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                        {/* Submission Info / Rejection reason */}
                        {(viewingSub.status === "rejected" || viewingSub.status === "needs_correction") &&
                          viewingSub.rejectionReason && (
                            <div className="rounded-xl border border-red-500/10 bg-red-500/[0.02] p-4 space-y-2">
                              <h4 className="text-[10px] font-bold text-red-400 uppercase tracking-widest flex items-center gap-1.5">
                                <AlertCircle className="w-3.5 h-3.5" />
                                {viewingSub.status === "rejected" ? "Rejection Reason" : "Correction Instructions"}
                              </h4>
                              <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                                {viewingSub.rejectionReason}
                              </p>
                              {viewingSub.status === "rejected" && viewingSub.deductedAmount > 0 && (
                                <p className="text-[10px] text-red-400 font-semibold mt-1">
                                  Deducted from balance: -{formatAmount(viewingSub.deductedAmount)}
                                </p>
                              )}
                            </div>
                          )}
                      </div>

                      {/* Gallery / Link Panel */}
                      <div className="md:col-span-7 space-y-4">
                        <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 h-full flex flex-col min-h-[300px]">
                          <h4 className="text-[10px] font-bold text-zinc-550 uppercase tracking-widest border-b border-zinc-800 pb-1.5 mb-4 shrink-0">
                            Submitted Proof
                          </h4>

                          {viewingSub.proofType === "link" ? (
                            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-6 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/10">
                              <LinkIcon className="w-10 h-10 text-blue-400" />
                              <div>
                                <p className="font-bold text-sm text-zinc-200">URL Link Proof</p>
                                <p className="text-xs text-zinc-500 mt-1 max-w-sm truncate">{viewingSub.proof}</p>
                              </div>
                              <a
                                href={viewingSub.proof}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition-all shadow-lg"
                              >
                                <ExternalLink className="w-4 h-4" />
                                Open Link in New Tab
                              </a>
                            </div>
                          ) : getImagesList(viewingSub.proof).length === 0 ? (
                            <div className="flex-1 flex items-center justify-center text-xs text-zinc-650 italic">
                              No images submitted
                            </div>
                          ) : (
                            <div className="flex-1 flex flex-col">
                              <div className="grid grid-cols-1 gap-4 overflow-y-auto max-h-[420px] pr-1">
                                {getImagesList(viewingSub.proof).map((imgUrl, idx) => {
                                  const imagesList = getImagesList(viewingSub.proof);
                                  return (
                                    <div
                                      key={idx}
                                      className="rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 p-2 space-y-3"
                                    >
                                      <div
                                        onClick={() => {
                                          setActiveImagesList(imagesList);
                                          setActiveImageIndex(idx);
                                        }}
                                        className="relative aspect-video w-full overflow-hidden rounded-lg border border-zinc-950 cursor-zoom-in hover:opacity-90 transition-opacity"
                                      >
                                        <img
                                          src={imgUrl}
                                          alt={`Screenshot Proof ${idx + 1}`}
                                          className="w-full h-full object-contain bg-black"
                                        />
                                      </div>
                                      <div className="flex items-center justify-between gap-3">
                                        <span className="text-[10px] font-bold text-zinc-550 uppercase tracking-wider">
                                          Screenshot #{idx + 1} of {imagesList.length}
                                        </span>
                                        <div className="flex items-center gap-2">
                                          <a
                                            href={imgUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-[11px] font-semibold text-zinc-400 hover:text-zinc-200 transition"
                                          >
                                            <Eye className="w-3.5 h-3.5" />
                                            View Full Size
                                          </a>
                                          <a
                                            href={getDownloadUrl(imgUrl)}
                                            download={`proof-${viewingSub.username}-${idx + 1}.jpg`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/20 border border-purple-500/30 hover:bg-purple-600/30 text-[11px] font-bold text-purple-300 transition"
                                          >
                                            <Download className="w-3.5 h-3.5" />
                                            Download
                                          </a>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Modal Actions Footer */}
                    <div className="p-5 border-t border-zinc-800 flex items-center justify-between bg-zinc-950/20 shrink-0">
                      <Button variant="outline" size="md" onClick={() => setViewingSub(null)}>
                        Close Details
                      </Button>

                      {(viewingSub.status === "pending" || viewingSub.status === "needs_correction") && (
                        <div className="flex items-center gap-2.5">
                          <button
                            onClick={() => {
                              openCorrectionModal(viewingSub);
                            }}
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
                          >
                            <AlertCircle className="w-3.5 h-3.5" />
                            Request Correction
                          </button>
                          <button
                            onClick={() => {
                              openRejectModal(viewingSub);
                            }}
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Reject Submission
                          </button>
                          <button
                            onClick={() => {
                              const targetRating = rating || 5;
                              approveSubmission.mutate({ subId: viewingSub.id, rating: targetRating, feedback });
                            }}
                            disabled={approveSubmission.isPending}
                            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 text-zinc-950 hover:bg-emerald-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Approve Proof
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {selectedIds.size > 0 && (
              <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center px-4 pb-4 pointer-events-none">
                <div className="pointer-events-auto w-full max-w-3xl bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl shadow-black/40 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <span className="text-sm font-bold text-zinc-200 shrink-0">{selectedIds.size} selected</span>

                  {bulkMode === "none" && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => setBulkMode("approve")}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                      >
                        Bulk Approve
                      </button>
                      <button
                        onClick={() => setBulkMode("reject")}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                      >
                        Bulk Reject
                      </button>
                      <button
                        onClick={() => setSelectedIds(new Set())}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
                      >
                        Clear selection
                      </button>
                    </div>
                  )}

                  {bulkMode === "approve" && (
                    <div className="flex flex-1 flex-wrap items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">
                          Rating:
                        </span>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setBulkRating(star)}
                            className={`text-xl transition-all ${bulkRating !== null && star <= bulkRating ? "text-amber-400 scale-110" : "text-zinc-600 hover:text-zinc-400"}`}
                          >
                            ★
                          </button>
                        ))}
                        {bulkRating !== null && (
                          <span className="text-xs text-zinc-400 font-mono">({bulkRating}.0)</span>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          if (bulkRating === null) return;
                          bulkAction.mutate({ ids: Array.from(selectedIds), action: "approve", rating: bulkRating });
                        }}
                        disabled={bulkRating === null || bulkAction.isPending}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-zinc-950 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        {bulkAction.isPending ? "Approving..." : "Confirm Approve"}
                      </button>
                      <button
                        onClick={() => {
                          setBulkMode("none");
                          setBulkRating(null);
                        }}
                        className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {bulkMode === "reject" && (
                    <div className="flex flex-1 flex-wrap items-center gap-3">
                      <textarea
                        value={bulkRejectReason}
                        onChange={(e) => setBulkRejectReason(e.target.value)}
                        placeholder="Rejection reason for all selected..."
                        rows={2}
                        className="flex-1 min-w-48 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-105 placeholder:text-zinc-600 focus:outline-none focus:border-red-500/50 resize-none"
                      />
                      <button
                        onClick={() => {
                          if (!bulkRejectReason.trim()) return;
                          bulkAction.mutate({
                            ids: Array.from(selectedIds),
                            action: "reject",
                            rejectionReason: bulkRejectReason,
                          });
                        }}
                        disabled={!bulkRejectReason.trim() || bulkAction.isPending}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-505/10 text-red-400 border border-red-550/20 hover:bg-red-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        {bulkAction.isPending ? "Rejecting..." : "Confirm Reject"}
                      </button>
                      <button
                        onClick={() => {
                          setBulkMode("none");
                          setBulkRejectReason("");
                        }}
                        className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {rejectModal && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div
                  style={{ transform: `translate(${rejectPos.x}px, ${rejectPos.y}px)` }}
                  className="bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl w-full max-w-md relative select-none"
                >
                  <div
                    onMouseDown={handleMouseDownReject}
                    className="p-6 border-b border-zinc-800 cursor-move select-none flex items-center justify-between"
                  >
                    <div>
                      <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                        <span>{rejectModal.mode === "reject" ? "Reject Submission" : "Request Correction"}</span>
                        <span className="inline-flex items-center gap-1 text-[10px] text-zinc-550 bg-zinc-800 border border-zinc-700 rounded px-1.5 py-0.5 font-normal select-none">
                          <Move className="w-2.5 h-2.5" /> Drag
                        </span>
                      </h3>
                      <p className="text-sm text-zinc-400 mt-0.5">@{rejectModal.username}</p>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    {rejectModal.mode === "reject" && (
                      <>
                        <div className="flex items-center justify-between px-4 py-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                          <div>
                            <p className="text-[10px] text-zinc-550 uppercase tracking-wider font-semibold">
                              Current Balance
                            </p>
                            <p className="text-xl font-bold text-emerald-400 mt-0.5">
                              {formatAmount(rejectModal.balance)}
                            </p>
                          </div>
                          <Coins className="w-8 h-8 text-emerald-500/30" />
                        </div>

                        <div>
                          <label className="block text-xs text-zinc-400 mb-1.5 font-medium">
                            Deduct from balance <span className="text-zinc-650 font-normal">(optional, ₦)</span>
                          </label>
                          <input
                            type="number"
                            min="0"
                            max={rejectModal.balance}
                            value={deductAmount}
                            onChange={(e) => setDeductAmount(e.target.value)}
                            placeholder="0"
                            className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-colors"
                          />
                          {Number(deductAmount) > 0 && (
                            <p className="text-xs text-red-400 mt-1">
                              New balance after deduction: {formatAmount(rejectModal.balance - Number(deductAmount))}
                            </p>
                          )}
                        </div>
                      </>
                    )}

                    <div>
                      <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Quick tags</label>
                      <div className="flex flex-wrap gap-1.5 mb-2.5">
                        {[
                          "Screenshot is blurry/unreadable",
                          "Wrong account/handle shown",
                          rejectModal.mode === "reject"
                            ? "No proof of follow/comment action"
                            : "Please upload a full screenshot showing follow action",
                          "Already completed this task",
                        ].map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => setRejectReason(tag)}
                            className="px-2.5 py-1 rounded bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-[10px] transition-colors border border-zinc-700/60"
                          >
                            {tag.split(" ")[0]}... {tag.split(" ").slice(-2).join(" ")}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-zinc-400 mb-1.5 font-medium">
                        {rejectModal.mode === "reject" ? "Rejection reason" : "Correction instructions"}{" "}
                        <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder={
                          rejectModal.mode === "reject"
                            ? "Explain why this submission is being rejected..."
                            : "Explain what the user needs to correct..."
                        }
                        rows={3}
                        className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-650 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-colors resize-none"
                      />
                    </div>

                    {(rejectSubmission.error || requestCorrection.error) && (
                      <p className="text-xs text-red-400">
                        {((rejectSubmission.error || requestCorrection.error) as any)?.response?.data?.error ??
                          "Action failed"}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2.5 px-6 pb-6">
                    <Button
                      variant="outline"
                      size="md"
                      onClick={closeRejectModal}
                      disabled={rejectSubmission.isPending || requestCorrection.isPending}
                    >
                      Cancel
                    </Button>
                    {rejectModal.mode === "correction" ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (!rejectModal || !rejectReason.trim()) return;
                          requestCorrection.mutate({ subId: rejectModal.subId, reason: rejectReason });
                        }}
                        disabled={!rejectReason.trim() || requestCorrection.isPending}
                        className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-amber-500 text-zinc-950 hover:bg-amber-400 disabled:opacity-50 transition-colors"
                      >
                        {requestCorrection.isPending ? "Sending..." : "Send Correction Request"}
                      </button>
                    ) : (
                      <Button
                        variant="danger"
                        size="md"
                        onClick={handleReject}
                        isLoading={rejectSubmission.isPending}
                        disabled={!rejectReason.trim()}
                      >
                        Confirm Rejection
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )
      )}

      {activeImageIndex !== null && activeImagesList.length > 0 && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[100] flex flex-col items-center justify-center p-4">
          {/* Close button */}
          <button
            onClick={() => setActiveImageIndex(null)}
            className="absolute top-6 right-6 p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Image Container */}
          <div className="relative max-w-5xl w-full h-[75vh] flex items-center justify-center">
            {/* Prev Button */}
            {activeImagesList.length > 1 && (
              <button
                onClick={() =>
                  setActiveImageIndex((idx) =>
                    idx !== null ? (idx - 1 + activeImagesList.length) % activeImagesList.length : null
                  )
                }
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-300 hover:text-white transition-all shadow-lg hover:scale-105"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            <img
              src={activeImagesList[activeImageIndex]}
              alt={`Fullscreen Proof ${activeImageIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-lg border border-zinc-950 shadow-2xl"
            />

            {/* Next Button */}
            {activeImagesList.length > 1 && (
              <button
                onClick={() =>
                  setActiveImageIndex((idx) => (idx !== null ? (idx + 1) % activeImagesList.length : null))
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-300 hover:text-white transition-all shadow-lg hover:scale-105"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Controls Footer */}
          <div className="mt-6 flex flex-col items-center gap-2">
            <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider">
              Screenshot {activeImageIndex + 1} of {activeImagesList.length}
            </span>
            <div className="flex gap-2">
              <a
                href={activeImagesList[activeImageIndex]}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white transition"
              >
                <Eye className="w-4 h-4" />
                View Full Size
              </a>
              <a
                href={activeImagesList[activeImageIndex]}
                download={`proof-${viewingSub?.username || "user"}-${activeImageIndex + 1}.jpg`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600/20 border border-purple-500/30 hover:bg-purple-600/30 text-xs font-bold text-purple-300 transition"
              >
                <Download className="w-4 h-4" />
                Download
              </a>
            </div>
          </div>
        </div>
      )}

      {isEditingTask && task && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden relative">
            {/* Header */}
            <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/20 shrink-0">
              <div>
                <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                  <span>Edit Task Configuration</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Update task requirements and configurations. Redlocked fields cannot be modified.
                </p>
              </div>
              <button
                onClick={() => setIsEditingTask(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-250 hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              {/* Disabled / Locked Fields */}
              <div className="space-y-3 bg-red-950/5 border border-red-900/10 rounded-xl p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-red-400">
                  <span>🔒 Disabled Fields (Not Editable)</span>
                </div>
                <div className="grid grid-cols-1 gap-3 text-xs mt-1.5">
                  <div>
                    <FieldLabel>Title</FieldLabel>
                    <input
                      type="text"
                      value={task.title}
                      disabled
                      className="w-full bg-zinc-950/60 border border-zinc-800/80 rounded-lg px-3 py-2 text-zinc-500 cursor-not-allowed select-none"
                    />
                  </div>
                  <div>
                    <FieldLabel>Description</FieldLabel>
                    <textarea
                      value={task.description}
                      disabled
                      rows={2}
                      className="w-full bg-zinc-950/60 border border-zinc-800/80 rounded-lg p-2 text-zinc-500 cursor-not-allowed select-none resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Task Details */}
              <div className="backdrop-blur-md bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-5 space-y-4">
                <h2 className="text-sm font-semibold text-zinc-300 pb-2 border-b border-zinc-800/60">Task Details</h2>
                <div>
                  <FieldLabel>
                    Caption <span className="text-zinc-650 font-normal">(optional — text users copy and post)</span>
                  </FieldLabel>
                  <textarea
                    value={editCaption}
                    onChange={(e) => setEditCaption(e.target.value)}
                    placeholder="Paste the exact caption users should copy to their post or status..."
                    rows={3}
                    className={`${inputCls} resize-none`}
                  />
                </div>

                <div>
                  <FieldLabel>
                    Link <span className="text-zinc-655 font-normal">(optional — profile, post, or page to act on)</span>
                  </FieldLabel>
                  <input
                    value={editLink}
                    onChange={(e) => setEditLink(e.target.value)}
                    placeholder="https://..."
                    type="url"
                    className={inputCls}
                  />
                </div>

                {/* Multi-image upload */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <FieldLabel>
                      Images <span className="text-zinc-650 font-normal">(optional — up to {MAX_IMAGES})</span>
                    </FieldLabel>
                    {editImages.length > 0 && (
                      <span className="text-[11px] text-zinc-500">
                        {editImages.length} / {MAX_IMAGES}
                      </span>
                    )}
                  </div>

                  {editImages.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      {editImages.map((img, idx) => (
                        <div
                          key={idx}
                          className="relative rounded-xl overflow-hidden border border-zinc-700/60 group aspect-video"
                        >
                          <img
                            src={img.url || img.preview}
                            alt={`Image ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeEditImage(idx)}
                            className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-black/60 text-zinc-300 hover:text-red-400 hover:bg-red-500/20 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {editImages.length < MAX_IMAGES && (
                    <div
                      onClick={() => editFileRef.current?.click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (e.dataTransfer.files) handleEditFiles(e.dataTransfer.files);
                      }}
                      className="flex flex-col items-center justify-center gap-1.5 h-20 rounded-xl border border-dashed border-zinc-700/60 bg-zinc-800/30 cursor-pointer hover:border-purple-500/40 hover:bg-zinc-800/50 transition-colors"
                    >
                      <Upload className="w-4 h-4 text-zinc-500" />
                      <p className="text-xs text-zinc-500 font-medium">Click or drag to add images</p>
                    </div>
                  )}

                  <input
                    ref={editFileRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) handleEditFiles(e.target.files);
                      e.target.value = "";
                    }}
                  />
                  {uploadError && <p className="text-xs text-red-400 mt-1">{uploadError}</p>}
                </div>
              </div>

              {/* Instructions */}
              <div className="backdrop-blur-md bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800/60 flex-wrap gap-2">
                  <h2 className="text-sm font-semibold text-zinc-300">Step-by-step Instructions</h2>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setEditInstructions([
                          "Click the target link to visit the platform page or profile.",
                          "Perform the designated action (follow, like, subscribe, post status, or download).",
                          "Take a clear screenshot showing the completed action (following state, liked post, status views, or downloaded app).",
                          "Submit the correct proof because our system automatically audits submissions, and fake/duplicate proofs lead to immediate account suspension.",
                          "Enter any requested text info (like your username or WhatsApp phone number) in the text box below.",
                          "Do not undo the action (e.g., unfollowing, unliking, or deleting status post) because automated account audits run daily.",
                          "Wait for review. Funds will be credited directly to your available balance upon validation.",
                        ]);
                      }}
                      className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Load 7 Rules
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditInstructions((prev) => [...prev, ""])}
                      className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Step
                    </button>
                  </div>
                </div>

                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {editInstructions.map((step, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <span className="text-[10px] text-zinc-500 font-mono w-4 text-right shrink-0">{idx + 1}.</span>
                      <input
                        type="text"
                        value={step}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditInstructions((prev) => {
                            const next = [...prev];
                            next[idx] = val;
                            return next;
                          });
                        }}
                        className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-zinc-200 text-xs focus:outline-none focus:border-purple-500/50"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setEditInstructions((prev) => prev.filter((_, i) => i !== idx));
                        }}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {editInstructions.length === 0 && (
                    <p className="text-zinc-650 text-xs italic text-center py-2">No instructions defined.</p>
                  )}
                </div>
              </div>

              {/* Task Config */}
              <div className="backdrop-blur-md bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-5 space-y-4">
                <h2 className="text-sm font-semibold text-zinc-300 pb-2 border-b border-zinc-800/60">Task Configuration</h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FieldLabel required>Task Type</FieldLabel>
                    <select
                      value={editTaskType}
                      onChange={(e) => {
                        const t = e.target.value;
                        setEditTaskType(t);
                        setEditTargetPlatform(t === "use-app" ? "" : "instagram");
                      }}
                      className={inputCls}
                    >
                      {TASK_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    {editTaskType === "use-app" ? (
                      <>
                        <FieldLabel required>App Name</FieldLabel>
                        <input
                          value={editTargetPlatform}
                          onChange={(e) => setEditTargetPlatform(e.target.value)}
                          placeholder="e.g. Kena, OPay..."
                          className={inputCls}
                        />
                      </>
                    ) : (
                      <>
                        <FieldLabel required>Target Platform</FieldLabel>
                        <select
                          value={editTargetPlatform}
                          onChange={(e) => setEditTargetPlatform(e.target.value)}
                          className={inputCls}
                        >
                          {PLATFORMS.map((p) => (
                            <option key={p.value} value={p.value}>
                              {p.label}
                            </option>
                          ))}
                        </select>
                      </>
                    )}
                  </div>
                </div>

                {/* Proof method */}
                <div>
                  <FieldLabel>Proof Method</FieldLabel>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setEditProofType("banner")}
                      className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        editProofType === "banner"
                          ? "bg-amber-500/10 border-amber-500/40 text-amber-300"
                          : "bg-zinc-800/40 border-zinc-700/60 text-zinc-500 hover:border-zinc-600"
                      }`}
                    >
                      <ImageIcon className="w-3.5 h-3.5 shrink-0" />
                      <div className="text-left">
                        <p className="text-xs font-bold">Image / Screenshot</p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditProofType("url")}
                      className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        editProofType === "url"
                          ? "bg-blue-500/10 border-blue-500/40 text-blue-300"
                          : "bg-zinc-800/40 border-zinc-700/60 text-zinc-500 hover:border-zinc-600"
                      }`}
                    >
                      <LinkIcon className="w-3.5 h-3.5 shrink-0" />
                      <div className="text-left">
                        <p className="text-xs font-bold">URL / Link</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Collect additional text */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-zinc-400 font-medium">Collect Text</p>
                      <p className="text-[11px] text-zinc-550 mt-0.5">
                        Ask users to submit a WhatsApp number, username, etc.
                      </p>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer select-none shrink-0">
                      <span
                        className={`text-xs font-semibold transition-colors ${editAcceptText ? "text-emerald-400" : "text-zinc-550"}`}
                      >
                        {editAcceptText ? "On" : "Off"}
                      </span>
                      <div
                        onClick={() => {
                          setEditAcceptText((v) => !v);
                          if (!editAcceptText === false) setEditTextLabel("");
                        }}
                        className={`relative w-9 h-5 rounded-full transition-all ${editAcceptText ? "bg-emerald-500" : "bg-zinc-700"}`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${editAcceptText ? "translate-x-4" : "translate-x-0"}`}
                        />
                      </div>
                    </label>
                  </div>
                  {editAcceptText && (
                    <input
                      value={editTextLabel}
                      onChange={(e) => setEditTextLabel(e.target.value)}
                      placeholder="e.g. WhatsApp Number, TikTok Username..."
                      className={inputCls}
                    />
                  )}
                </div>

                {/* Collect additional number */}
                <div className="space-y-3 pt-3 border-t border-zinc-800/40">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-zinc-400 font-medium">Collect Number (Views / Watch Hours)</p>
                      <p className="text-[11px] text-zinc-550 mt-0.5">
                        Ask users to submit a numeric value like views count.
                      </p>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer select-none shrink-0">
                      <span
                        className={`text-xs font-semibold transition-colors ${editAcceptNumber ? "text-emerald-400" : "text-zinc-550"}`}
                      >
                        {editAcceptNumber ? "On" : "Off"}
                      </span>
                      <div
                        onClick={() => {
                          setEditAcceptNumber((v) => !v);
                          if (!editAcceptNumber === false) setEditNumberLabel("");
                        }}
                        className={`relative w-9 h-5 rounded-full transition-all ${editAcceptNumber ? "bg-emerald-500" : "bg-zinc-700"}`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${editAcceptNumber ? "translate-x-4" : "translate-x-0"}`}
                        />
                      </div>
                    </label>
                  </div>
                  {editAcceptNumber && (
                    <input
                      value={editNumberLabel}
                      onChange={(e) => setEditNumberLabel(e.target.value)}
                      placeholder="e.g. Number of Views, Watch Hours..."
                      className={inputCls}
                    />
                  )}
                </div>

                {/* Accept multiple images */}
                <div className="space-y-3 pt-3 border-t border-zinc-800/40">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-zinc-400 font-medium">Accept Multiple Screenshot Proofs</p>
                      <p className="text-[11px] text-zinc-550 mt-0.5">
                        Allow users to upload up to 5 screenshots instead of one.
                      </p>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer select-none shrink-0">
                      <span
                        className={`text-xs font-semibold transition-colors ${editAcceptMultipleImages ? "text-emerald-400" : "text-zinc-550"}`}
                      >
                        {editAcceptMultipleImages ? "On" : "Off"}
                      </span>
                      <div
                        onClick={() => setEditAcceptMultipleImages((v) => !v)}
                        className={`relative w-9 h-5 rounded-full transition-all ${editAcceptMultipleImages ? "bg-emerald-500" : "bg-zinc-700"}`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${editAcceptMultipleImages ? "translate-x-4" : "translate-x-0"}`}
                        />
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <FieldLabel required={editTaskType === "views"}>
                    Minimum View Count {editTaskType !== "views" && <span className="text-zinc-650 font-normal">(optional)</span>}
                  </FieldLabel>
                  <input
                    type="number"
                    min="1"
                    value={editTargetCount}
                    onChange={(e) => setEditTargetCount(e.target.value)}
                    placeholder="e.g. 1000 (optional)"
                    className={inputCls}
                  />
                </div>

                {editTaskType === "jetpot" && (
                  <div>
                    <FieldLabel>
                      Admin WhatsApp <span className="text-zinc-600 font-normal">(buyers message this number)</span>
                    </FieldLabel>
                    <input
                      value={editAdminContact}
                      onChange={(e) => setEditAdminContact(e.target.value)}
                      placeholder="+2348..."
                      className={inputCls}
                    />
                  </div>
                )}
              </div>

              {/* Target Audience */}
              <div className="backdrop-blur-md bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-zinc-300">Target Audience</h2>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      Restrict this task to specific users based on their profile
                    </p>
                  </div>
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <span
                      className={`text-xs font-semibold transition-colors ${editEnableTargeting ? "text-purple-400" : "text-zinc-500"}`}
                    >
                      {editEnableTargeting ? "Enabled" : "Disabled"}
                    </span>
                    <div
                      onClick={() => setEditEnableTargeting((v) => !v)}
                      className={`relative w-10 h-5 rounded-full transition-all ${editEnableTargeting ? "bg-purple-500" : "bg-zinc-700"}`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${editEnableTargeting ? "translate-x-5" : "translate-x-0"}`}
                      />
                    </div>
                  </label>
                </div>

                {editEnableTargeting && (
                  <div className="border border-zinc-700/60 rounded-xl bg-zinc-800/30 p-4 space-y-4">
                    <div>
                      <FieldLabel>Age Range</FieldLabel>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={editAudience.minAge}
                          onChange={(e) => setEditAudience((a) => ({ ...a, minAge: e.target.value }))}
                          placeholder="Min age"
                          className={`${inputCls} flex-1`}
                        />
                        <span className="text-zinc-650 font-bold shrink-0">→</span>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={editAudience.maxAge}
                          onChange={(e) => setEditAudience((a) => ({ ...a, maxAge: e.target.value }))}
                          placeholder="Max age"
                          className={`${inputCls} flex-1`}
                        />
                      </div>
                    </div>

                    <div>
                      <FieldLabel>Gender</FieldLabel>
                      <div className="flex flex-wrap gap-2">
                        {[
                          ["male", "👨 Male"],
                          ["female", "👩 Female"],
                          ["prefer_not_to_say", "🤔 Prefer not to say"],
                        ].map(([val, label]) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setEditAudience((a) => ({ ...a, gender: toggle(a.gender, val) }))}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${editAudience.gender.includes(val) ? "bg-purple-500/15 border-purple-500/50 text-purple-300" : "bg-zinc-800/50 border-zinc-700/50 text-zinc-450 hover:text-zinc-300"}`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <FieldLabel>Employment Status</FieldLabel>
                      <div className="flex flex-wrap gap-2">
                        {[
                          ["student", "🎓 Student"],
                          ["working", "💼 Working"],
                          ["self_employed", "🧑‍💻 Self-employed"],
                          ["unemployed", "🔍 Unemployed"],
                        ].map(([val, label]) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setEditAudience((a) => ({ ...a, employmentStatus: toggle(a.employmentStatus, val) }))}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${editAudience.employmentStatus.includes(val) ? "bg-blue-500/15 border-blue-500/50 text-blue-300" : "bg-zinc-800/50 border-zinc-700/50 text-zinc-450 hover:text-zinc-300"}`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <FieldLabel>Education Level</FieldLabel>
                      <div className="flex flex-wrap gap-2">
                        {[
                          ["ssce", "SSCE"],
                          ["university", "University"],
                          ["polytechnic", "Polytechnic"],
                          ["college", "College"],
                        ].map(([val, label]) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setEditAudience((a) => ({ ...a, educationLevel: toggle(a.educationLevel, val) }))}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${editAudience.educationLevel.includes(val) ? "bg-amber-500/15 border-amber-500/50 text-amber-300" : "bg-zinc-800/50 border-zinc-700/50 text-zinc-450 hover:text-zinc-300"}`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <FieldLabel>State of Residence</FieldLabel>
                      <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                        {NIGERIAN_STATES.map((state) => (
                          <button
                            key={state}
                            type="button"
                            onClick={() => setEditAudience((a) => ({ ...a, state: toggle(a.state, state) }))}
                            className={`px-2 py-1 rounded-lg text-[10px] font-semibold border transition-all ${editAudience.state.includes(state) ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-300" : "bg-zinc-800/50 border-zinc-700/40 text-zinc-550 hover:text-zinc-300"}`}
                          >
                            {state}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Reward & Timeline */}
              <div className="backdrop-blur-md bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-5 space-y-4">
                <h2 className="text-sm font-semibold text-zinc-300 pb-2 border-b border-zinc-800/60">Reward &amp; Timeline</h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FieldLabel required>Capacity (Users Needed)</FieldLabel>
                    <input
                      type="number"
                      min={task.approvedCount}
                      value={editNumberOfUsers}
                      onChange={(e) => setEditNumberOfUsers(e.target.value)}
                      className={inputCls}
                    />
                    <p className="text-[10px] text-zinc-500 mt-1">
                      Must be at least the approved count ({task.approvedCount})
                    </p>
                  </div>

                  <div>
                    <FieldLabel required>Reward Amount (₦)</FieldLabel>
                    <input
                      type="number"
                      min="1"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                </div>

                <div>
                  <FieldLabel>
                    Hourly Completion Limit <span className="text-zinc-650 font-normal">(optional)</span>
                  </FieldLabel>
                  <input
                    type="number"
                    min="1"
                    value={editMaxPerHour}
                    onChange={(e) => setEditMaxPerHour(e.target.value)}
                    placeholder="Unlimited"
                    className={inputCls}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <FieldLabel>Task Duration</FieldLabel>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <span
                        className={`text-xs font-semibold transition-colors ${editNoExpiry ? "text-violet-400" : "text-zinc-500"}`}
                      >
                        No expiry
                      </span>
                      <div
                        onClick={() => setEditNoExpiry((v) => !v)}
                        className={`relative w-9 h-5 rounded-full transition-all ${editNoExpiry ? "bg-violet-500" : "bg-zinc-700"}`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-all shadow ${editNoExpiry ? "translate-x-4" : "translate-x-0"}`}
                        />
                      </div>
                      <InfinityIcon className={`w-4 h-4 transition-colors ${editNoExpiry ? "text-violet-400" : "text-zinc-600"}`} />
                    </label>
                  </div>
                  {!editNoExpiry && (
                    <input
                      type="date"
                      value={editTimeline}
                      onChange={(e) => setEditTimeline(e.target.value)}
                      className={inputCls}
                    />
                  )}
                </div>

                <div>
                  <FieldLabel>Auditor (Assigned Officer)</FieldLabel>
                  <select
                    value={editAssignedOfficer}
                    onChange={(e) => setEditAssignedOfficer(e.target.value)}
                    className={inputCls}
                  >
                    <option value="">Auto-distribute to available officers</option>
                    {officers.map((off: any) => (
                      <option key={off.username} value={off.username}>
                        {off.name} (@{off.username})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="p-5 border-t border-zinc-800 flex items-center justify-between bg-zinc-950/20 shrink-0">
              <Button variant="outline" size="md" onClick={() => setIsEditingTask(false)}>
                Cancel
              </Button>
              <button
                onClick={async () => {
                  const numUsersVal = parseInt(editNumberOfUsers);
                  if (isNaN(numUsersVal) || numUsersVal < task.approvedCount) {
                    alert(`Capacity must be at least ${task.approvedCount}`);
                    return;
                  }

                  let uploadedUrls: string[] = [];
                  if (editImages.length > 0) {
                    try {
                      const results = await Promise.all(
                        editImages.map((img) => {
                          if (img.url) {
                            return Promise.resolve({ url: img.url });
                          } else {
                            const [header, base64] = img.preview!.split(",");
                            const mimeType = header.match(/:(.*?);/)?.[1] ?? "image/jpeg";
                            return uploadImage.mutateAsync({ base64, mimeType });
                          }
                        })
                      );
                      uploadedUrls = results.map((r: any) => r.url);
                    } catch {
                      setUploadError("One or more image uploads failed. Please try again.");
                      return;
                    }
                  }

                  const filteredInstructions = editInstructions.map((s) => s.trim()).filter(Boolean);

                  updateTask.mutate({
                    timeline: editNoExpiry ? null : editTimeline ? new Date(editTimeline).toISOString() : null,
                    lifeline: editNoExpiry,
                    numberOfUsersNeeded: numUsersVal,
                    instructions: filteredInstructions.length ? filteredInstructions : undefined,
                    amount: editAmount ? Number(editAmount) : undefined,
                    link: editLink.trim() || null,
                    assignedOfficer: editAssignedOfficer || null,
                    caption: editCaption.trim() || null,
                    images: uploadedUrls.length ? uploadedUrls : null,
                    taskType: editTaskType,
                    targetPlatform: editTargetPlatform,
                    proofType: editProofType,
                    acceptText: editAcceptText,
                    textLabel: editAcceptText ? editTextLabel.trim() : null,
                    acceptNumber: editAcceptNumber,
                    numberLabel: editAcceptNumber ? editNumberLabel.trim() : null,
                    acceptMultipleImages: editAcceptMultipleImages,
                    targetCount: editTargetCount.trim() ? editTargetCount : null,
                    adminContact: editAdminContact.trim() || null,
                    maxPerHour: editMaxPerHour.trim() ? parseInt(editMaxPerHour) : null,
                    targetAudience: editEnableTargeting
                      ? {
                          ...(editAudience.gender.length ? { gender: editAudience.gender } : {}),
                          ...(editAudience.employmentStatus.length ? { employmentStatus: editAudience.employmentStatus } : {}),
                          ...(editAudience.educationLevel.length ? { educationLevel: editAudience.educationLevel } : {}),
                          ...(editAudience.state.length ? { state: editAudience.state } : {}),
                          ...(editAudience.minAge ? { minAge: parseInt(editAudience.minAge) } : {}),
                          ...(editAudience.maxAge ? { maxAge: parseInt(editAudience.maxAge) } : {}),
                        }
                      : null,
                  });
                }}
                disabled={updateTask.isPending || uploadImage.isPending}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-purple-600 text-white hover:bg-purple-500 transition-colors disabled:opacity-40"
              >
                {uploadImage.isPending ? "Uploading..." : updateTask.isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Hidden helper handlers inside main component */}
      <input
        ref={editFileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleEditFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
