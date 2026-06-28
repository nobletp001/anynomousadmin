import { useState, useEffect } from "react";
import { Submission, RejectModal } from "../types";

export function useTaskState() {
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

  // Draggable states for Modals
  const [rejectPos, setRejectPos] = useState({ x: 0, y: 0 });
  const [isDraggingReject, setIsDraggingReject] = useState(false);
  const [dragStartReject, setDragStartReject] = useState({ x: 0, y: 0 });

  const [detailsPos, setDetailsPos] = useState({ x: 0, y: 0 });
  const [isDraggingDetails, setIsDraggingDetails] = useState(false);
  const [dragStartDetails, setDragStartDetails] = useState({ x: 0, y: 0 });

  // Reset positions when modals close
  useEffect(() => {
    if (!rejectModal) setRejectPos({ x: 0, y: 0 });
  }, [rejectModal]);

  useEffect(() => {
    if (!viewingSub) setDetailsPos({ x: 0, y: 0 });
  }, [viewingSub]);

  // Debounce search filter
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchFilter.trim());
    }, 400);
    return () => clearTimeout(handler);
  }, [searchFilter]);

  // Reset detail sub-state when viewed submission changes
  useEffect(() => {
    if (viewingSub) {
      setRating(null);
      setFeedback("");
      setActiveImageIndex(null);
      setActiveImagesList([]);
      setShowReportForm(false);
      setReportDeductAmount("");
      setReportReason("");
    }
  }, [viewingSub]);

  return {
    rejectModal,
    setRejectModal,
    deductAmount,
    setDeductAmount,
    rejectReason,
    setRejectReason,
    statusFilter,
    setStatusFilter,
    searchFilter,
    setSearchFilter,
    debouncedSearch,
    setDebouncedSearch,
    viewingSub,
    setViewingSub,
    rating,
    setRating,
    feedback,
    setFeedback,
    activeImageIndex,
    setActiveImageIndex,
    activeImagesList,
    setActiveImagesList,
    selectedIds,
    setSelectedIds,
    bulkRating,
    setBulkRating,
    bulkRejectReason,
    setBulkRejectReason,
    bulkMode,
    setBulkMode,
    showReportForm,
    setShowReportForm,
    reportDeductAmount,
    setReportDeductAmount,
    reportReason,
    setReportReason,
    rejectPos,
    setRejectPos,
    isDraggingReject,
    setIsDraggingReject,
    dragStartReject,
    setDragStartReject,
    detailsPos,
    setDetailsPos,
    isDraggingDetails,
    setIsDraggingDetails,
    dragStartDetails,
    setDragStartDetails,
  };
}

export type TaskState = ReturnType<typeof useTaskState>;
