import { useState } from "react";
import { StatusFilter } from "../types";

export function useTasksState() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<{ id: number; title: string } | null>(null);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);

  return {
    statusFilter,
    setStatusFilter,
    page,
    setPage,
    searchInput,
    setSearchInput,
    submittedSearch,
    setSubmittedSearch,
    confirmDelete,
    setConfirmDelete,
    confirmDeleteAll,
    setConfirmDeleteAll,
  };
}
