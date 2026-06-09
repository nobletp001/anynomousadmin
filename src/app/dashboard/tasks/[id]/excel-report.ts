import * as XLSX from "xlsx";
import { Task, Submission } from "./types";

export function downloadExcelReport(task: Task, submissions: Submission[]) {
  const approvedCount = submissions.filter((s) => s.status === "approved").length;
  const rejectedCount = submissions.filter((s) => s.status === "rejected").length;
  const pendingCount = submissions.filter((s) => s.status === "pending").length;
  const correctionCount = submissions.filter((s) => s.status === "needs_correction").length;
  const approvalRate = submissions.length > 0 ? Math.round((approvedCount / submissions.length) * 100) : 0;

  // ── Sheet 1: Summary ─────────────────────────────────────────
  const summaryRows = [
    ["PAYFLUENCE — Task Summary Report"],
    ["Generated", new Date().toLocaleString("en-NG", { timeZone: "Africa/Lagos" })],
    ["Task Ref", `#TASK-${task.id}`],
    [],
    ["Task Title", task.title],
    ["Description", task.description],
    ["Platform / Type", `${task.targetPlatform} · ${task.taskType}`],
    ["Reward per User", `₦${task.amount}`],
    ["Capacity", task.numberOfUsersNeeded],
    ["Status", task.status],
    ["Deadline", task.timeline ? new Date(task.timeline).toLocaleDateString() : "No Expiry"],
    ["Assigned Officer", task.assignedOfficer || "Auto"],
    [],
    ["SUBMISSION STATS"],
    ["Total Submissions", submissions.length],
    ["Approved", approvedCount],
    ["Rejected", rejectedCount],
    ["Pending", pendingCount],
    ["Needs Correction", correctionCount],
    ["Approval Rate", `${approvalRate}%`],
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryRows);
  summarySheet["!cols"] = [{ wch: 24 }, { wch: 60 }];

  // ── Sheet 2: Participants ─────────────────────────────────────
  const headers = [
    "S/N",
    "Full Name",
    "Username",
    "WhatsApp",
    "Status",
    "Proof Type",
    "Proof / URL",
    "Text Response",
    "Number Response",
    "Rating",
    "Submission Date",
  ];

  const dataRows = submissions.map((sub, i) => {
    const statusLabel =
      sub.status === "needs_correction" ? "Needs Correction" : sub.status.charAt(0).toUpperCase() + sub.status.slice(1);

    const proofType = sub.proofType === "link" ? "URL Link" : "Screenshot";
    const proofDetail = sub.proofType === "link" ? sub.proof : "";
    const stars = sub.status === "approved" && typeof sub.rating === "number" ? `${sub.rating}/5` : "";

    return [
      i + 1,
      sub.user?.name || "",
      `@${sub.username}`,
      (sub.user as any)?.whatsappNumber || "",
      statusLabel,
      proofType,
      proofDetail,
      sub.textResponse || "",
      sub.numberResponse ?? "",
      stars,
      new Date(sub.createdAt).toLocaleString("en-NG", { timeZone: "Africa/Lagos" }),
    ];
  });

  const participantSheet = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);
  participantSheet["!cols"] = [
    { wch: 5 }, // S/N
    { wch: 24 }, // Full Name
    { wch: 18 }, // Username
    { wch: 16 }, // WhatsApp
    { wch: 16 }, // Status
    { wch: 12 }, // Proof Type
    { wch: 50 }, // Proof / URL
    { wch: 30 }, // Text Response
    { wch: 16 }, // Number Response
    { wch: 8 }, // Rating
    { wch: 22 }, // Date
  ];

  // ── Workbook ──────────────────────────────────────────────────
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");
  XLSX.utils.book_append_sheet(wb, participantSheet, "Participants");

  const safeTitle = task.title
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "_")
    .slice(0, 40);
  XLSX.writeFile(wb, `TASK-${task.id}_${safeTitle}.xlsx`);
}
