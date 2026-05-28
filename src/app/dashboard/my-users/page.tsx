"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiClient } from "@/services/api-client";
import { authQueryKey, authQueryFn } from "@/lib/auth";
import { Search } from "lucide-react";
import { MyUsersTable } from "./components/MyUsersTable";

interface User {
  id: number;
  name: string;
  username: string;
  email: string | null;
  role: string;
  createdAt: string;
  disabled: boolean;
  rating: number | null;
}

interface UsersResponse {
  success: boolean;
  data: User[];
  total: number;
  page: number;
  limit: number;
}

export default function MyUsersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const { data: currentUser } = useQuery({
    queryKey: authQueryKey,
    queryFn: authQueryFn,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  const { data, isLoading, error } = useQuery<UsersResponse>({
    queryKey: ["my-users", page, debouncedSearch],
    queryFn: () =>
      apiClient.get(`/admin/my-users?page=${page}&search=${encodeURIComponent(debouncedSearch)}`) as any,
    enabled: !!currentUser,
  });

  const totalPages = data ? Math.ceil(data.total / (data.limit || 20)) : 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-100 tracking-tight">My Users</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Users assigned to you
            {currentUser?.name ? ` — ${currentUser.name}` : ""}
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-550 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, @username, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-purple-500/50 transition-colors"
          />
        </div>
      </div>

      <MyUsersTable
        isLoading={isLoading || !currentUser}
        users={data?.data || []}
        page={page}
        setPage={setPage}
        totalPages={totalPages}
        total={data?.total || 0}
        limit={data?.limit || 20}
        debouncedSearch={debouncedSearch}
        onClearSearch={() => setSearch("")}
        onViewProfile={(username) => router.push(`/dashboard/users?search=${encodeURIComponent(username)}`)}
      />
    </div>
  );
}
