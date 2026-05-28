import { useState } from "react";
import { StatusFilter } from "../types";

export function useTasksState() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [confirmDelete, setConfirmDelete] = useState<{ id: number; title: string } | null>(null);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);

  return {
    statusFilter,
    setStatusFilter,
    confirmDelete,
    setConfirmDelete,
    confirmDeleteAll,
    setConfirmDeleteAll,
  };
}
