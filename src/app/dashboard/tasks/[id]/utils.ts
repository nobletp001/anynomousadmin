import { Submission } from "./types";

export function formatAmount(n: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(n);
}

export function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function statusVariant(s: string) {
  if (s === "approved") return "success";
  if (s === "rejected") return "danger";
  return "warning";
}

export function getDownloadUrl(url: string) {
  if (url.includes("cloudinary.com") && url.includes("image/upload/")) {
    return url.replace("image/upload/", "image/upload/fl_attachment/");
  }
  return url;
}

export function getImagesList(proof: string): string[] {
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

export function toggle(arr: string[], val: string) {
  return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
}

export function getDuplicateWarning(sub: Submission, submissions: Submission[]) {
  if (!sub.proof || sub.proofType === "text") return null;
  const duplicate = submissions.find(
    (s) => s.id !== sub.id && s.username !== sub.username && s.proof === sub.proof && s.proofType === sub.proofType
  );
  if (duplicate) {
    return `Duplicate proof matching @${duplicate.username}`;
  }
  return null;
}

export function getIpWarning(sub: Submission, submissions: Submission[]) {
  if (!sub.ipAddress) return null;
  const duplicate = submissions.find((s) => s.id !== sub.id && s.username !== sub.username && s.ipAddress === sub.ipAddress);
  if (duplicate) {
    return `Same IP address as @${duplicate.username}`;
  }
  return null;
}

export function getDeviceWarning(sub: Submission, submissions: Submission[]) {
  if (!sub.deviceId) return null;
  const duplicate = submissions.find((s) => s.id !== sub.id && s.username !== sub.username && s.deviceId === sub.deviceId);
  if (duplicate) {
    return `Same Device ID as @${duplicate.username}`;
  }
  return null;
}

export function getBankWarning(sub: Submission, submissions: Submission[]) {
  const subBank = (sub.user as any)?.accountNumber;
  if (!subBank) return null;
  const duplicate = submissions.find(
    (s) => s.id !== sub.id && s.username !== sub.username && (s.user as any)?.accountNumber === subBank
  );
  if (duplicate) {
    return `Same Bank Account as @${duplicate.username}`;
  }
  return null;
}

