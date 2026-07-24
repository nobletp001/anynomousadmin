import { Task } from "./types";

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDateTime(value?: string | null): string {
  if (!value) return "Not scheduled";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not scheduled";
  return date.toLocaleString("en-NG", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDuration(start?: string | null, end?: string | null): string {
  if (!start || !end) return "Open-ended";
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return "Open-ended";
  const days = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / 86_400_000));
  return `${days} day${days === 1 ? "" : "s"}`;
}

function formatDropSchedule(task: Task): string {
  if (!task.isSecureSpotTask) return "Participants can perform the task while the campaign is active.";
  if (task.secureSpotIsPerDay && task.secureSpotNumberPerDay && task.secureSpotNumberPerDay > 0) {
    const days =
      task.secureSpotIntervalType === "days" && task.secureSpotInterval
        ? ` for ${task.secureSpotInterval} day${task.secureSpotInterval === 1 ? "" : "s"}`
        : "";
    return `${task.secureSpotNumberPerDay} participant slot${task.secureSpotNumberPerDay === 1 ? "" : "s"} per day${days}, distributed between 7:00 AM and 8:00 PM.`;
  }
  if (task.secureSpotIntervalType === "days" && task.secureSpotInterval) {
    return `Participant windows are distributed across ${task.secureSpotInterval} day${task.secureSpotInterval === 1 ? "" : "s"}.`;
  }
  return "Participants reserve a spot and receive an assigned submission window.";
}

export function downloadClientTaskBrief(task: Task) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to download the client brief.");
    return;
  }

  const startTime = task.scheduledAt || null;
  const endTime = task.lifeline ? null : task.timeline || null;
  const generatedAt = new Date().toLocaleString("en-NG", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Client Task Brief - ${escapeHtml(task.title)}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @page { size: auto; margin: 0; }
        body { font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; color: #0f172a; background: #fff; margin: 0; padding: 42px; font-size: 13px; line-height: 1.55; }
        @media print { html, body { margin: 0; } body { padding: 42px; -webkit-print-color-adjust: exact; print-color-adjust: exact; } .no-print { display: none; } }
        .print-actions { display: flex; justify-content: flex-end; margin-bottom: 22px; }
        .btn { border: 0; border-radius: 8px; background: #0284c7; color: #fff; padding: 10px 18px; font-weight: 800; cursor: pointer; }
        .header { display: flex; justify-content: space-between; gap: 24px; border-bottom: 2px solid #e2e8f0; padding-bottom: 18px; margin-bottom: 28px; }
        .brand { font-size: 23px; font-weight: 800; letter-spacing: -0.04em; color: #0284c7; }
        .subtitle { margin-top: 4px; color: #64748b; text-transform: uppercase; letter-spacing: 0.11em; font-size: 11px; font-weight: 800; }
        .meta { text-align: right; color: #64748b; font-size: 11px; }
        h1 { margin: 0 0 10px; font-size: 22px; line-height: 1.25; }
        .desc { color: #334155; margin: 0 0 22px; font-size: 13px; }
        .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; margin-bottom: 22px; }
        .card { border: 1px solid #e2e8f0; background: #f8fafc; border-radius: 10px; padding: 14px; }
        .label { color: #64748b; font-size: 9px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; }
        .value { margin-top: 5px; color: #0f172a; font-size: 14px; font-weight: 800; }
        .section { border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-top: 18px; }
        .section h2 { margin: 0 0 10px; font-size: 15px; }
        .section p { margin: 7px 0; color: #334155; }
        .footer { margin-top: 34px; border-top: 1px solid #e2e8f0; padding-top: 12px; color: #94a3b8; font-size: 10px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="print-actions no-print">
        <button class="btn" onclick="window.print()">Print / Save as PDF</button>
      </div>
      <div class="header">
        <div>
          <div class="brand">PAYFLUENCE</div>
          <div class="subtitle">Client Task Brief</div>
        </div>
        <div class="meta">
          <div>Generated: <strong>${escapeHtml(generatedAt)}</strong></div>
          <div>Task Ref: <strong>#TASK-${task.id}</strong></div>
        </div>
      </div>
      <h1>${escapeHtml(task.title)}</h1>
      <p class="desc">${escapeHtml(task.description)}</p>
      <div class="grid">
        <div class="card"><div class="label">Participants Needed</div><div class="value">${task.numberOfUsersNeeded} participant${task.numberOfUsersNeeded === 1 ? "" : "s"}</div></div>
        <div class="card"><div class="label">Task Category</div><div class="value">${escapeHtml(task.targetPlatform)} · ${escapeHtml(task.taskType)}</div></div>
        <div class="card"><div class="label">Start Time</div><div class="value">${escapeHtml(formatDateTime(startTime))}</div></div>
        <div class="card"><div class="label">End Time</div><div class="value">${escapeHtml(task.lifeline ? "No fixed end date" : formatDateTime(endTime))}</div></div>
      </div>
      <div class="section">
        <h2>Campaign Timing</h2>
        <p><strong>Time frame:</strong> ${escapeHtml(formatDuration(startTime, endTime))}</p>
        <p><strong>Drop schedule:</strong> ${escapeHtml(formatDropSchedule(task))}</p>
        <p><strong>Expected end:</strong> ${escapeHtml(task.lifeline ? "The task remains available until manually closed." : formatDateTime(endTime))}</p>
      </div>
      <div class="footer">Prepared for client review. Participant reward amounts are intentionally excluded.</div>
      <script>window.onload = function() { setTimeout(function() { window.print(); }, 500); }</script>
    </body>
    </html>
  `);
  printWindow.document.close();
}
