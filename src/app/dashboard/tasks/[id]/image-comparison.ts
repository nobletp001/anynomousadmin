export type ImageComparisonDetails = {
  combinedScore?: number;
  phashSim?: number;
  rawSim?: number;
  ocrSim?: number;
  metaSim?: number;
  calculationBreakdown?: string;
};

export type ImageComparisonSummary = {
  status?: string;
  bestMatchScore?: number;
  bestMatchSubmission?: number;
  bestMatchUsername?: string;
  bestMatchStatus?: string;
  matchCount?: number;
  checkedCount?: number;
  riskLevel?: string;
  details?: ImageComparisonDetails;
  matches?: Array<{
    submissionId: number;
    username: string;
    status?: string;
    score: number;
    riskLevel?: string;
    details?: ImageComparisonDetails;
  }>;
};

export function parseImageComparison(imageMetadata?: string | null): ImageComparisonSummary {
  if (!imageMetadata) return { status: "pending" };
  try {
    const parsed = JSON.parse(imageMetadata);
    return parsed.comparison ?? { status: parsed.analysisStatus ?? "confirmed", bestMatchScore: 0 };
  } catch {
    return { status: "failed" };
  }
}

export function imageComparisonLabel(summary: ImageComparisonSummary) {
  if (summary.status === "failed") return "Image process failed";
  if (summary.status === "processing" || summary.status === "pending") return "Image verifying...";
  return "Image process confirmed";
}

export function imageComparisonDecisionLabel(summary: ImageComparisonSummary) {
  const score = summary.bestMatchScore ?? 0;
  if (summary.status === "failed") return "Check failed - review manually";
  if (summary.status === "processing" || summary.status === "pending") return "Still processing";
  if (score >= 85) return "High image match - review before approving";
  if (score >= 70) return "Possible image match - compare first";
  return "Safe to approve";
}

export function imageComparisonTone(summary: ImageComparisonSummary) {
  const score = summary.bestMatchScore ?? 0;
  if (summary.status === "failed") return "danger";
  if (summary.status === "processing" || summary.status === "pending") return "pending";
  if (score >= 85) return "danger";
  if (score >= 70) return "warning";
  return "safe";
}
