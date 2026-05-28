export function roleBadgeVariant(role: string): "purple" | "info" | "success" | "warning" | "default" {
  if (role === "super-admin") return "purple";
  if (role === "admin") return "info";
  if (role === "accountant") return "success";
  if (role === "task-officer") return "warning";
  return "default";
}
