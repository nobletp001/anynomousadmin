import { useEffect, useRef } from "react";
import { Submission, RejectModal } from "../types";
import { isActionableSubmissionStatus } from "../utils";

interface ShortcutProps {
  viewingSub: Submission | null;
  rejectModal: RejectModal | null;
  onCloseReject: () => void;
  onCloseDetails: () => void;
  rating: number | null;
  setRating: (rating: number | null) => void;
  feedback: string;
  submissions: Submission[];
  setViewingSub: (sub: Submission | null) => void;
  onApprove: (rating: number, feedback: string) => void;
  onRejectClick: (sub: Submission) => void;
  onCorrectionClick: (sub: Submission) => void;
}

export function useKeyboardShortcuts({
  viewingSub,
  rejectModal,
  onCloseReject,
  onCloseDetails,
  rating,
  setRating,
  feedback,
  submissions,
  setViewingSub,
  onApprove,
  onRejectClick,
  onCorrectionClick,
}: ShortcutProps) {
  const latestProps = useRef({
    viewingSub,
    rejectModal,
    onCloseReject,
    onCloseDetails,
    rating,
    setRating,
    feedback,
    submissions,
    setViewingSub,
    onApprove,
    onRejectClick,
    onCorrectionClick,
  });

  useEffect(() => {
    latestProps.current = {
      viewingSub,
      rejectModal,
      onCloseReject,
      onCloseDetails,
      rating,
      setRating,
      feedback,
      submissions,
      setViewingSub,
      onApprove,
      onRejectClick,
      onCorrectionClick,
    };
  });

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const {
        viewingSub,
        rejectModal,
        onCloseReject,
        onCloseDetails,
        rating,
        setRating,
        feedback,
        submissions,
        setViewingSub,
        onApprove,
        onRejectClick,
        onCorrectionClick,
      } = latestProps.current;

      if (!viewingSub) return;

      const activeEl = document.activeElement;
      const isInput = activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA");

      if (e.key === "Escape") {
        e.preventDefault();
        if (rejectModal) onCloseReject();
        else onCloseDetails();
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
        onApprove(rating || 5, feedback);
        return;
      }

      if (e.key.toLowerCase() === "r") {
        e.preventDefault();
        onRejectClick(viewingSub);
        return;
      }

      if (e.key.toLowerCase() === "c") {
        e.preventDefault();
        onCorrectionClick(viewingSub);
        return;
      }

      const pendings = submissions.filter((s) => isActionableSubmissionStatus(s.status));
      const currentIdx = pendings.findIndex((s) => s.id === viewingSub.id);

      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (currentIdx !== -1 && currentIdx < pendings.length - 1) {
          setViewingSub(pendings[currentIdx + 1]);
        }
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (currentIdx > 0) {
          setViewingSub(pendings[currentIdx - 1]);
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
}
