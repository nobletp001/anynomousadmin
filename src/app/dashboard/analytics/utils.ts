export function formatAmount(n: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(n);
}

export function formatShortDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatShortWeek(w: string) {
  return new Date(w).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export const chartTooltipStyle = {
  backgroundColor: "#18181b",
  border: "1px solid #3f3f46",
  borderRadius: "12px",
  color: "#e4e4e7",
  fontSize: 12,
  fontWeight: 600,
};

export const CARD_CLASS = "backdrop-blur-md bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-6";
