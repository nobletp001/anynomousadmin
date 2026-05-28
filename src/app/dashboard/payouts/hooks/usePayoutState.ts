import { useState } from "react";

export type DateFilterType = "all" | "today" | "yesterday" | "3days" | "4days" | "5days" | "custom";

export function usePayoutState() {
  const [tab, setTab] = useState<"requests" | "history">("requests");
  const [dateFilter, setDateFilter] = useState<DateFilterType>("all");
  const [customDate, setCustomDate] = useState<string>("");
  const [actionError, setActionError] = useState<string | null>(null);

  return {
    tab,
    setTab,
    dateFilter,
    setDateFilter,
    customDate,
    setCustomDate,
    actionError,
    setActionError,
  };
}

export type PayoutState = ReturnType<typeof usePayoutState>;
