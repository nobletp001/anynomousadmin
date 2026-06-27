"use client";

import React from "react";
import { Clock, MessageCircle, Trash2, Users } from "lucide-react";
import { Badge } from "@/components/ui";
import { SecuredSpot } from "../types";

function formatTimeLeft(ms: number) {
  if (ms <= 0) return "Ready now";
  const minutes = Math.ceil(ms / 60000);
  if (minutes < 60) return `${minutes}m left`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m left`;
}

function cleanWhatsapp(phone: string) {
  return phone.replace(/[^0-9]/g, "");
}

interface SecuredSpotsPanelProps {
  spots: SecuredSpot[];
  isLoading: boolean;
  onRemoveSpot: (spot: SecuredSpot) => void;
  removingUsername?: string | null;
}

export function SecuredSpotsPanel({ spots, isLoading, onRemoveSpot, removingUsername }: SecuredSpotsPanelProps) {
  return (
    <div className="backdrop-blur-md bg-zinc-900/30 border border-zinc-800/80 rounded-2xl shadow-xl overflow-hidden">
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between gap-3 bg-zinc-950/20">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-purple-300" />
          <h2 className="text-sm font-extrabold text-zinc-200 uppercase tracking-wider">Booked Slots</h2>
        </div>
        <Badge variant="purple">{spots.length} booked</Badge>
      </div>

      {isLoading ? (
        <div className="p-5 text-sm text-zinc-500">Loading booked slots...</div>
      ) : spots.length === 0 ? (
        <div className="p-5 text-sm text-zinc-500">No user has booked a slot for this task yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
                <th className="px-5 py-3 font-semibold">User</th>
                <th className="px-5 py-3 font-semibold">WhatsApp</th>
                <th className="px-5 py-3 font-semibold">Slot Time</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40">
              {spots.map((spot) => (
                <tr key={spot.id} className="hover:bg-zinc-800/20 transition-colors">
                  <td className="px-5 py-4">
                    <p className="text-xs font-bold text-zinc-100">{spot.name || "—"}</p>
                    <p className="text-[11px] text-zinc-550">@{spot.username}</p>
                  </td>
                  <td className="px-5 py-4">
                    {spot.whatsappNumber ? (
                      <a
                        href={`https://wa.me/${cleanWhatsapp(spot.whatsappNumber)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        {spot.whatsappNumber}
                      </a>
                    ) : (
                      <span className="text-xs text-zinc-600">No WhatsApp</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-300">
                      <Clock className="h-3.5 w-3.5 text-blue-300" />
                      <span>{formatTimeLeft(spot.timeLeftMs)}</span>
                    </div>
                    <p className="mt-1 text-[10px] text-zinc-600">{new Date(spot.eligibleAt).toLocaleString()}</p>
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant={spot.status === "submitted" ? "success" : spot.isEligible ? "info" : "warning"} dot>
                      {spot.status === "submitted" ? "submitted" : spot.isEligible ? "ready" : "waiting"}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      disabled={removingUsername?.toLowerCase() === spot.username.toLowerCase()}
                      onClick={() => onRemoveSpot(spot)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/30 disabled:opacity-60 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove Slot
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
