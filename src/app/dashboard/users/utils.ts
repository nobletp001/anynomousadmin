export function formatAmount(n: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(n);
}

export function roleBadgeVariant(role: string): "purple" | "info" | "success" | "warning" | "default" {
  if (role === "super-admin") return "purple";
  if (role === "admin") return "info";
  if (role === "accountant") return "success";
  if (role === "task-officer") return "warning";
  return "default";
}

export function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
