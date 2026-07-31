import { useState } from "react";
import { OwnerFilter, StatusFilter } from "../types";

export function useTasksState() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [ownerFilter, setOwnerFilter] = useState<OwnerFilter>("all");
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<{ id: number; title: string } | null>(null);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);

  return {
    statusFilter,
    setStatusFilter,
    ownerFilter,
    setOwnerFilter,
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
