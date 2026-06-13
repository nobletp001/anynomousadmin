"use client";

import React, { useEffect, useState } from "react";
import { X, RefreshCw, ImageIcon, ScanSearch } from "lucide-react";
import { ImageCollisionMatch } from "../types";
import { apiClient } from "@/services/api-client";

interface SubmissionCollisionModalProps {
  type: string; // "bank" | "ip" | "device" | "image"
  value: string;
  onClose: () => void;
  onCompareUser?: (username: string) => void;
  currentUsername?: string;
}

const TYPE_LABELS: Record<string, string> = {
  bank: "Bank Account",
  ip: "IP Address",
  device: "Device ID / Fingerprint",
  image: "Image Hash / Similar Proof",
  user_images: "User Submitted Proofs",
  text: "Collected Text Details",
};

export function SubmissionCollisionModal({
  type,
  value,
  onClose,
  onCompareUser,
  currentUsername,
}: SubmissionCollisionModalProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      if (type === "image") {
        const res = await apiClient.get<{ success: boolean; matches: ImageCollisionMatch[] }>(
          `/admin/fraud/image-collision/${encodeURIComponent(value)}`
        );
        setData((res as any).matches ?? []);
      } else {
        const res = await apiClient.get<{ success: boolean; data: any[] }>(
          `/admin/fraud/collision-details?type=${type}&value=${encodeURIComponent(value)}`
        );
        setData((res as any).data ?? []);
      }
    } catch {
      setError("Failed to load collision details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [type, value]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <ScanSearch className="w-4 h-4 text-violet-400" />
            <div>
              <h3 className="text-sm font-bold text-zinc-100">Collision Investigation</h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                {TYPE_LABELS[type] ?? type}:{" "}
                <span className="font-mono text-zinc-300 bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700 text-[10px]">
                  {value.length > 60 ? `${value.substring(0, 60)}…` : value}
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={load}
              disabled={loading}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-5">
          {loading ? (
            <div className="py-16 text-center">
              <RefreshCw className="w-7 h-7 text-violet-500/40 animate-spin mx-auto mb-3" />
              <p className="text-zinc-500 text-sm">Loading…</p>
            </div>
          ) : error ? (
            <div className="py-16 text-center text-red-400 text-sm">{error}</div>
          ) : data.length === 0 ? (
            <div className="py-16 text-center text-zinc-500 text-sm">No other accounts share this value.</div>
          ) : type === "image" ? (
            <ImageCollisionList
              matches={data as ImageCollisionMatch[]}
              onCompareUser={onCompareUser}
              currentUsername={currentUsername}
            />
          ) : (
            <AccountCollisionList items={data} onCompareUser={onCompareUser} currentUsername={currentUsername} />
          )}
        </div>
      </div>
    </div>
  );
}

function ImageCollisionList({
  matches,
  onCompareUser,
  currentUsername,
}: {
  matches: ImageCollisionMatch[];
  onCompareUser?: (username: string) => void;
  currentUsername?: string;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-zinc-500 font-semibold">{matches.length} submission(s) with the same image</p>
      {matches.map((m) => (
        <div key={m.submissionId} className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 flex gap-4">
          {m.proof && m.proofType !== "text" ? (
            <img
              src={m.proof}
              alt="proof"
              className="w-20 h-20 rounded-lg object-cover border border-zinc-700 shrink-0 bg-zinc-800"
            />
          ) : (
            <div className="w-20 h-20 rounded-lg border border-zinc-700 bg-zinc-800 flex items-center justify-center shrink-0">
              <ImageIcon className="w-6 h-6 text-zinc-600" />
            </div>
          )}
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap w-full">
              <span className="font-bold text-sm text-zinc-200">@{m.username}</span>
              {(m as any).similarity !== undefined && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  {(m as any).similarity}% match
                </span>
              )}
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                  m.status === "approved"
                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                    : m.status === "rejected"
                      ? "bg-red-500/15 text-red-400 border-red-500/30"
                      : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                }`}
              >
                {m.status}
              </span>
              {onCompareUser && m.username !== currentUsername && (
                <button
                  onClick={() => onCompareUser(m.username)}
                  className="ml-auto px-2 py-1 bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 border border-violet-500/20 rounded text-[10px] font-bold transition cursor-pointer"
                >
                  Compare Side-by-Side
                </button>
              )}
            </div>
            <p className="text-xs text-zinc-500 font-medium">Task: {m.taskTitle}</p>
            <p className="text-[10px] text-zinc-600">{new Date(m.createdAt).toLocaleString()}</p>
            {m.ipAddress && <p className="text-[10px] text-zinc-600 font-mono">IP: {m.ipAddress}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

function AccountCollisionList({
  items,
  onCompareUser,
  currentUsername,
}: {
  items: any[];
  onCompareUser?: (username: string) => void;
  currentUsername?: string;
}) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-zinc-500 font-semibold">{items.length} account(s) share this value</p>
      {items.map((item) => (
        <div
          key={item.user?.id ?? item.username}
          className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 space-y-2"
        >
          <div className="flex items-center justify-between gap-2 w-full">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-purple-400 text-xs shrink-0">
                {(item.user?.name ?? item.username ?? "?").charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-sm text-zinc-200">{item.user?.name ?? item.username}</p>
                <p className="text-[10px] text-zinc-500">@{item.user?.username ?? item.username}</p>
              </div>
            </div>
            {onCompareUser && (item.user?.username ?? item.username) !== currentUsername && (
              <button
                onClick={() => onCompareUser(item.user?.username ?? item.username)}
                className="px-2 py-1 bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 border border-violet-500/20 rounded text-[10px] font-bold transition cursor-pointer"
              >
                Compare Side-by-Side
              </button>
            )}
          </div>
          {item.bankDetails && (
            <div className="text-[10px] text-zinc-400 font-mono space-y-0.5">
              <p>
                Acc: {item.bankDetails.accountNumber} · {item.bankDetails.bankName}
              </p>
              <p>Name: {item.bankDetails.accountName}</p>
            </div>
          )}
          {item.submissions?.length > 0 && (
            <div className="space-y-2 mt-3 pt-3 border-t border-zinc-800/60">
              <p className="text-[10px] text-zinc-500 uppercase font-semibold">
                Submitted Proofs ({item.submissions.length})
              </p>
              <div className="grid grid-cols-4 gap-2">
                {item.submissions.map((sub: any) => {
                  let proofs: string[] = [];
                  if (sub.proof) {
                    if (sub.proof.startsWith("[") && sub.proof.endsWith("]")) {
                      try {
                        proofs = JSON.parse(sub.proof);
                      } catch {
                        proofs = [sub.proof];
                      }
                    } else {
                      proofs = [sub.proof];
                    }
                  }
                  return proofs.map((url, idx) => (
                    <div
                      key={`${sub.id}-${idx}`}
                      className="relative group aspect-square rounded-lg border border-zinc-850 overflow-hidden bg-zinc-900 flex items-center justify-center"
                    >
                      {sub.proofType !== "text" && url ? (
                        <img src={url} alt="proof" className="w-full h-full object-cover" />
                      ) : (
                        <div className="p-1 text-center text-[9px] text-zinc-500 font-medium line-clamp-3">
                          {sub.textResponse || "Text Proof"}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-1.5 text-[8px] text-zinc-300 pointer-events-none">
                        <p className="truncate font-semibold">{sub.taskTitle}</p>
                        <p className="text-zinc-500 font-mono uppercase font-bold mt-0.5">{sub.status}</p>
                      </div>
                    </div>
                  ));
                })}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
