import { Task, Submission } from "./types";

function escapeCell(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function tableHtml(rows: unknown[][]) {
  return `<table>${rows
    .map((row) => `<tr>${row.map((cell) => `<td>${escapeCell(cell)}</td>`).join("")}</tr>`)
    .join("")}</table>`;
}

function downloadWorkbook(filename: string, sheets: { name: string; rows: unknown[][] }[]) {
  const html = `<!doctype html><html><head><meta charset="utf-8" /></head><body>${sheets
    .map((sheet) => `<h2>${escapeCell(sheet.name)}</h2>${tableHtml(sheet.rows)}`)
    .join("<br />")}</body></html>`;
  const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

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

  // ── Sheet 2: Participants ─────────────────────────────────────
  const headers = [
    "S/N",
    "Full Name",
    "Username",
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
      statusLabel,
      proofType,
      proofDetail,
      sub.textResponse || "",
      sub.numberResponse ?? "",
      stars,
      new Date(sub.createdAt).toLocaleString("en-NG", { timeZone: "Africa/Lagos" }),
    ];
  });

  const safeTitle = task.title
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "_")
    .slice(0, 40);
  downloadWorkbook(`TASK-${task.id}_${safeTitle}.xls`, [
    { name: "Summary", rows: summaryRows },
    { name: "Participants", rows: [headers, ...dataRows] },
  ]);
}
