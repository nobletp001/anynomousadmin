"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { authQueryKey, authQueryFn } from "@/lib/auth";
import { ProfileDetails } from "./components/ProfileDetails";

export default function SettingsPage() {
  const { data: user } = useQuery({
    queryKey: authQueryKey,
    queryFn: authQueryFn,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-100 tracking-tight">Settings</h1>
        <p className="text-zinc-400 text-sm mt-1">Manage your admin account</p>
      </div>

      <ProfileDetails user={user} />
    </div>
  );
}
