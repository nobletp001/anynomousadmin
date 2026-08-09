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
    return normalizeImageComparison(
      parsed.comparison ?? { status: parsed.analysisStatus ?? "confirmed", bestMatchScore: 0 }
    );
  } catch {
    return { status: "failed" };
  }
}

function normalizeImageComparison(summary: ImageComparisonSummary): ImageComparisonSummary {
  const matches = (summary.matches ?? [])
    .map((match) => ({
      ...match,
      score: effectiveComparisonScore(match.score, match.details),
    }))
    .filter((match) => match.score >= 70)
    .sort((a, b) => b.score - a.score);
  const detailScore = effectiveComparisonScore(summary.bestMatchScore ?? 0, summary.details);
  const bestFromMatches = matches[0];
  const bestMatchScore = bestFromMatches?.score ?? detailScore;
  return {
    ...summary,
    bestMatchScore,
    bestMatchSubmission:
      bestFromMatches?.submissionId ?? (bestMatchScore >= 70 ? summary.bestMatchSubmission : undefined),
    bestMatchUsername: bestFromMatches?.username ?? (bestMatchScore >= 70 ? summary.bestMatchUsername : undefined),
    bestMatchStatus: bestFromMatches?.status ?? (bestMatchScore >= 70 ? summary.bestMatchStatus : undefined),
    matchCount: matches.length,
    matches,
  };
}

function effectiveComparisonScore(score: number, details?: ImageComparisonDetails) {
  if (!details) return score;
  if (score === 100 || details.phashSim === 100) return 100;
  const weighted =
    Math.round((details.phashSim ?? 0) * 0.45) +
    Math.round((details.rawSim ?? details.phashSim ?? 0) * 0.15) +
    Math.round((details.ocrSim ?? 0) * 0.3) +
    Math.round((details.metaSim ?? 0) * 0.1);
  return Math.max(0, Math.min(100, weighted));
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
