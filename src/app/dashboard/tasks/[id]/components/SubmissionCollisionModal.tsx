"use client";

import React, { useEffect, useState } from "react";
import { X, RefreshCw, ImageIcon, ScanSearch } from "lucide-react";
import { ImageCollisionMatch } from "../types";
import { apiClient } from "@/services/api-client";

interface SubmissionCollisionModalProps {
  type: string; // "bank" | "ip" | "device" | "image"
  value: string;
  onClose: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  bank: "Bank Account",
  ip: "IP Address",
  device: "Device ID / Fingerprint",
  image: "Image Hash (Duplicate Proof)",
};

export function SubmissionCollisionModal({ type, value, onClose }: SubmissionCollisionModalProps) {
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
            <ImageCollisionList matches={data as ImageCollisionMatch[]} />
          ) : (
            <AccountCollisionList items={data} />
          )}
        </div>
      </div>
    </div>
  );
}

function ImageCollisionList({ matches }: { matches: ImageCollisionMatch[] }) {
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
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-zinc-200">@{m.username}</span>
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

function AccountCollisionList({ items }: { items: any[] }) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-zinc-500 font-semibold">{items.length} account(s) share this value</p>
      {items.map((item) => (
        <div
          key={item.user?.id ?? item.username}
          className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 space-y-2"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-purple-400 text-xs shrink-0">
              {(item.user?.name ?? item.username ?? "?").charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-sm text-zinc-200">{item.user?.name ?? item.username}</p>
              <p className="text-[10px] text-zinc-500">@{item.user?.username ?? item.username}</p>
            </div>
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
            <p className="text-[10px] text-zinc-600">{item.submissions.length} task submission(s)</p>
          )}
        </div>
      ))}
    </div>
  );
}
