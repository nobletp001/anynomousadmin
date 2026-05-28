import { useState, useEffect } from "react";

export function useUsersState() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  // Admin action states
  const [actionType, setActionType] = useState("warning");
  const [actionMessage, setActionMessage] = useState("");
  const [actionAmount, setActionAmount] = useState("");
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Reset admin action states when selected user changes
  useEffect(() => {
    setActionType("warning");
    setActionMessage("");
    setActionAmount("");
    setActionError("");
    setActionSuccess("");
  }, [selectedUser]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  return {
    page, setPage,
    search, setSearch,
    debouncedSearch,
    selectedUser, setSelectedUser,
    actionType, setActionType,
    actionMessage, setActionMessage,
    actionAmount, setActionAmount,
    actionSubmitting, setActionSubmitting,
    actionError, setActionError,
    actionSuccess, setActionSuccess,
    copiedId, setCopiedId,
  };
}

export type UsersState = ReturnType<typeof useUsersState>;
