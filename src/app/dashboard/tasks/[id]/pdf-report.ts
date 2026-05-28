import { Task, Submission } from "./types";

export function downloadPDFReport(task: Task, submissions: Submission[]) {
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
        month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
      });

      let proofLabel = "Screenshot";
      let proofDetail = "";
      if (sub.proofType === "link") {
        proofLabel = "URL Link";
        proofDetail = sub.proof;
      } else {
        if (sub.textResponse) proofDetail += `Text: ${sub.textResponse}`;
        if (sub.numberResponse) {
          if (proofDetail) proofDetail += " | ";
          proofDetail += `Num: ${sub.numberResponse}`;
        }
        if (!proofDetail) proofDetail = "Screenshot Uploaded";
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
      const stars = sub.status === "approved" && typeof sub.rating === "number"
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
        <td><span class="status-badge ${statusBadgeClass}">${statusText}</span></td>
        <td>
          <div class="proof-type">${proofLabel}</div>
          <div class="proof-desc">${proofDetail}</div>
        </td>
        <td>${dateStr}</td>
        <td>${stars}</td>
      </tr>`;
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
          font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
          color: #1c1917; background-color: #ffffff; margin: 0; padding: 40px; font-size: 13px; line-height: 1.5;
        }
        @media print { body { padding: 0; } .no-print { display: none; } }
        .header-container { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
        .brand-logo { font-weight: 800; font-size: 24px; color: #7c3aed; letter-spacing: -0.05em; }
        .report-title { font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; margin-top: 4px; }
        .report-meta { text-align: right; font-size: 12px; color: #64748b; }
        .meta-date { font-weight: 600; color: #0f172a; }
        .task-info-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 30px; }
        .task-title { font-size: 18px; font-weight: 700; color: #0f172a; margin: 0 0 10px 0; }
        .task-desc { color: #475569; margin: 0 0 15px 0; font-size: 13px; }
        .grid-info { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
        .info-block { display: flex; flex-direction: column; }
        .info-label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.05em; }
        .info-val { font-size: 14px; font-weight: 700; color: #334155; margin-top: 4px; }
        .stats-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 15px; margin-bottom: 35px; }
        .stat-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px; text-align: center; }
        .stat-card.primary { background: #f5f3ff; border-color: #ddd6fe; }
        .stat-num { font-size: 20px; font-weight: 800; color: #0f172a; }
        .stat-card.primary .stat-num { color: #6d28d9; }
        .stat-label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-top: 5px; letter-spacing: 0.05em; }
        table { width: 100%; border-collapse: collapse; text-align: left; }
        th { background: #f1f5f9; color: #475569; font-weight: 700; font-size: 11px; text-transform: uppercase; padding: 12px 10px; border-bottom: 2px solid #e2e8f0; }
        td { padding: 12px 10px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
        tr:nth-child(even) td { background-color: #fafafa; }
        .user-name { font-weight: 600; color: #0f172a; }
        .user-username { font-size: 11px; color: #64748b; font-family: monospace; }
        .status-badge { display: inline-flex; align-items: center; font-size: 9px; font-weight: 700; padding: 3px 8px; border-radius: 9999px; text-transform: uppercase; }
        .status-approved { background: #dcfce7; color: #15803d; }
        .status-rejected { background: #fee2e2; color: #b91c1c; }
        .status-pending { background: #fef9c3; color: #a16207; }
        .status-correction { background: #ffedd5; color: #c2410c; }
        .proof-type { font-weight: 600; font-size: 11px; color: #334155; }
        .proof-desc { font-size: 11px; color: #64748b; max-width: 250px; word-break: break-word; }
        .footer { margin-top: 50px; border-top: 1px solid #e2e8f0; padding-top: 15px; display: flex; justify-content: space-between; font-size: 11px; color: #94a3b8; }
        .print-btn-container { display: flex; justify-content: flex-end; margin-bottom: 20px; }
        .btn { background: #7c3aed; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s; }
        .btn:hover { background: #6d28d9; transform: translateY(-1px); }
      </style>
    </head>
    <body>
      <div class="print-btn-container no-print">
        <button class="btn" onclick="window.print()">Print / Save as PDF</button>
      </div>
      <div class="header-container">
        <div>
          <div class="brand-logo">PAYFLUENCE</div>
          <div class="report-title">Task Completion Summary Report</div>
        </div>
        <div class="report-meta">
          <div>Generated: <span class="meta-date">${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span></div>
          <div>Task Ref: <span class="meta-date">#TASK-${task.id}</span></div>
        </div>
      </div>
      <div class="task-info-card">
        <div class="task-title">${task.title}</div>
        <div class="task-desc">${task.description}</div>
        <div class="grid-info">
          <div class="info-block"><span class="info-label">Platform / Type</span><span class="info-val" style="text-transform: capitalize;">${task.targetPlatform} · ${task.taskType}</span></div>
          <div class="info-block"><span class="info-label">Pay Per User</span><span class="info-val">₦${task.amount}</span></div>
          <div class="info-block"><span class="info-label">Capacity</span><span class="info-val">${task.numberOfUsersNeeded} spots</span></div>
          <div class="info-block"><span class="info-label">Status</span><span class="info-val" style="text-transform: capitalize; color: ${task.status === "active" ? "#16a34a" : "#475569"}">${task.status}</span></div>
        </div>
      </div>
      <div class="stats-grid">
        <div class="stat-card primary"><div class="stat-num">${totalCount}</div><div class="stat-label">Total Submissions</div></div>
        <div class="stat-card"><div class="stat-num" style="color: #16a34a;">${approvedCount}</div><div class="stat-label">Approved</div></div>
        <div class="stat-card"><div class="stat-num" style="color: #dc2626;">${rejectedCount}</div><div class="stat-label">Rejected</div></div>
        <div class="stat-card"><div class="stat-num" style="color: #ca8a04;">${pendingCount + correctionCount}</div><div class="stat-label">Pending / Correction</div></div>
        <div class="stat-card"><div class="stat-num">${approvalRate}%</div><div class="stat-label">Approval Rate</div></div>
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
        window.onload = function() { setTimeout(function() { window.print(); }, 500); }
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
}
