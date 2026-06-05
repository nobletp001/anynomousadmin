"use client";

import React, { useState, useEffect } from "react";
import { Search, Settings, Coins, RefreshCw, X, Check, AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Input, Button } from "@/components/ui";
import { apiClient } from "@/services/api-client";

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
}

export function PayoutControls() {
  // General Minimum States
  const [generalMin, setGeneralMin] = useState<number>(500);
  const [generalInput, setGeneralInput] = useState<string>("");
  const [generalLoading, setGeneralLoading] = useState<boolean>(false);
  const [generalSuccess, setGeneralSuccess] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Custom User Minimum States
  const [userQuery, setUserQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [customInput, setCustomInput] = useState<string>("");
  const [customLoading, setCustomLoading] = useState<boolean>(false);
  const [customSuccess, setCustomSuccess] = useState<string | null>(null);
  const [customError, setCustomError] = useState<string | null>(null);
  const [searchFocused, setSearchFocused] = useState<boolean>(false);

  // Fetch Payout Settings
  const fetchSettings = async () => {
    try {
      const res = (await apiClient.get("/admin/payouts/settings")) as any;
      if (res?.success) {
        setGeneralMin(res.minPayoutAmount);
        setGeneralInput(res.minPayoutAmount.toString());
      }
    } catch (err: any) {
      console.error("Failed to load settings:", err);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // User Search logic
  useEffect(() => {
    if (!userQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = (await apiClient.get(`/admin/users?search=${encodeURIComponent(userQuery)}`)) as any;
        if (res?.success) {
          setSearchResults(res.data || []);
        }
      } catch (err) {
        console.error("Error searching users:", err);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [userQuery]);

  // Handle General Minimum Payout update
  const handleUpdateGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralSuccess(null);
    setGeneralError(null);
    const amount = parseInt(generalInput);
    if (isNaN(amount) || amount < 0) {
      setGeneralError("Please enter a valid positive number");
      return;
    }
    setGeneralLoading(true);
    try {
      const res = (await apiClient.post("/admin/payouts/general-minimum", {
        amount,
      })) as any;
      if (res?.success) {
        setGeneralMin(amount);
        setGeneralSuccess("General minimum payout successfully updated!");
        setTimeout(() => setGeneralSuccess(null), 4000);
      }
    } catch (err: any) {
      setGeneralError(err.message || "Failed to update general minimum limit");
    } finally {
      setGeneralLoading(false);
    }
  };

  // Handle Custom User limit request
  const handleSetCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    setCustomSuccess(null);
    setCustomError(null);
    if (!selectedUser) {
      setCustomError("Please search and select a user first");
      return;
    }
    const amount = parseInt(customInput);
    if (isNaN(amount) || amount < 0) {
      setCustomError("Please enter a valid positive number");
      return;
    }
    setCustomLoading(true);
    try {
      const res = (await apiClient.post("/admin/payouts/custom-minimum", {
        username: selectedUser.username,
        amount,
      })) as any;
      if (res?.success) {
        setCustomSuccess(
          `Successfully set one-time limit of ₦${amount.toLocaleString()} for @${selectedUser.username}!`
        );
        setSelectedUser(null);
        setCustomInput("");
        setUserQuery("");
        setTimeout(() => setCustomSuccess(null), 5000);
      }
    } catch (err: any) {
      setCustomError(err.message || "Failed to set custom minimum limit");
    } finally {
      setCustomLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 animate-fade-in">
      {/* CARD 1: One-time Custom Limit */}
      <Card className="relative overflow-visible" accentColor="purple">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-purple-400" />
            <CardTitle>Request Fund / Custom Limit</CardTitle>
          </div>
          <CardDescription>Override minimum payout limit for a user for a single request</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 overflow-visible">
          <form onSubmit={handleSetCustom} className="space-y-4">
            <div className="relative overflow-visible">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Search User</label>
              {selectedUser ? (
                <div className="flex items-center justify-between mt-1.5 p-3 rounded-xl bg-purple-500/10 border border-purple-500/25">
                  <div className="text-sm">
                    <p className="font-bold text-white">{selectedUser.name}</p>
                    <p className="text-xs text-purple-300">@{selectedUser.username}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedUser(null)}
                    className="p-1 rounded-full hover:bg-purple-500/20 text-purple-300 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="relative mt-1.5">
                  <Input
                    placeholder="Search by username, name, or email..."
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                    leftIcon={<Search className="w-4 h-4" />}
                    fullWidth
                  />
                  {searchFocused && searchResults.length > 0 && (
                    <div className="absolute left-0 right-0 mt-2 max-h-56 overflow-y-auto bg-zinc-950/95 border border-zinc-800 rounded-xl shadow-2xl z-50 divide-y divide-zinc-800/50 backdrop-blur-md">
                      {searchResults.map((u) => (
                        <div
                          key={u.id}
                          onClick={() => {
                            setSelectedUser(u);
                            setSearchResults([]);
                          }}
                          className="px-4 py-2.5 text-left hover:bg-purple-600/20 cursor-pointer transition"
                        >
                          <p className="text-xs font-bold text-white">{u.name}</p>
                          <p className="text-[10px] text-zinc-400">
                            @{u.username} • {u.email}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Input
                label="One-Time Limit (₦)"
                placeholder="e.g. 200"
                type="number"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                fullWidth
              />
            </div>

            {customSuccess && (
              <div className="flex items-center gap-2 p-3 text-xs text-emerald-400 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                <Check className="w-4 h-4 shrink-0" />
                <span>{customSuccess}</span>
              </div>
            )}

            {customError && (
              <div className="flex items-center gap-2 p-3 text-xs text-red-400 bg-red-500/5 border border-red-500/20 rounded-xl">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{customError}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={customLoading || !selectedUser || !customInput}
              className="w-full justify-center gap-2 uppercase font-extrabold tracking-wider"
            >
              {customLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Limit"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* CARD 2: General Limit Control */}
      <Card accentColor="blue">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-400" />
            <CardTitle>General Minimum Control</CardTitle>
          </div>
          <CardDescription>Update the default minimum payout amount across all users</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 mb-4">
            <div>
              <p className="text-[10px] uppercase font-bold text-zinc-550 tracking-wider">Current General Minimum</p>
              <p className="text-2xl font-black text-white mt-1">₦{generalMin.toLocaleString()}</p>
            </div>
            <div className="p-2 bg-blue-500/10 rounded-xl">
              <Coins className="w-6 h-6 text-blue-400" />
            </div>
          </div>

          <form onSubmit={handleUpdateGeneral} className="space-y-4">
            <div className="space-y-2">
              <Input
                label="New General Minimum (₦)"
                placeholder="e.g. 500"
                type="number"
                value={generalInput}
                onChange={(e) => setGeneralInput(e.target.value)}
                fullWidth
              />
            </div>

            {generalSuccess && (
              <div className="flex items-center gap-2 p-3 text-xs text-emerald-400 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                <Check className="w-4 h-4 shrink-0" />
                <span>{generalSuccess}</span>
              </div>
            )}

            {generalError && (
              <div className="flex items-center gap-2 p-3 text-xs text-red-400 bg-red-500/5 border border-red-500/20 rounded-xl">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{generalError}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={generalLoading || !generalInput}
              className="w-full justify-center gap-2 uppercase font-extrabold tracking-wider"
            >
              {generalLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save General Minimum"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
