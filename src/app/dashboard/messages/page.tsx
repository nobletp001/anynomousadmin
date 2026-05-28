"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/api-client";
import { Badge, Button } from "@/components/ui";
import { MessageSquare, AlertCircle, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import { MessageDetail } from "./components/MessageDetail";
import { MessagesResponse } from "./types";

export default function MessagesPage() {
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data, isLoading, error, refetch } = useQuery<MessagesResponse>({
    queryKey: ["admin-messages", page],
    queryFn: () => apiClient.get(`/admin/messages?page=${page}&limit=20`) as any,
  });

  const totalPages = data ? Math.ceil(data.total / data.limit) : 1;

  const toggleRow = (id: number) => setExpandedId((prev) => (prev === id ? null : id));

  const formatDate = (d: string) => {
    return new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-100 tracking-tight">Messages</h1>
        <p className="text-zinc-405 text-sm mt-1">
          All anonymous messages — latest first. Click a row to inspect details.
        </p>
      </div>

      <div className="backdrop-blur-md bg-zinc-900/30 border border-zinc-800/80 rounded-2xl shadow-xl overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-zinc-800/50">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex gap-4 px-6 py-4 animate-pulse">
                <div className="h-4 bg-zinc-800 rounded w-8" />
                <div className="h-4 bg-zinc-800 rounded flex-1" />
                <div className="h-4 bg-zinc-800 rounded w-28" />
                <div className="h-4 bg-zinc-800 rounded w-28" />
                <div className="h-4 bg-zinc-800 rounded w-32" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <AlertCircle className="w-10 h-10 text-red-400" />
            <p className="text-zinc-400 text-sm">Failed to load messages</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-semibold w-8"></th>
                    <th className="px-6 py-4 font-semibold">Content</th>
                    <th className="px-6 py-4 font-semibold">Sender</th>
                    <th className="px-6 py-4 font-semibold">Receiver</th>
                    <th className="px-6 py-4 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.data.length ? (
                    data.data.map((msg) => (
                      <React.Fragment key={msg.id}>
                        <tr
                          onClick={() => toggleRow(msg.id)}
                          className="border-b border-zinc-800/40 hover:bg-zinc-800/20 transition-colors cursor-pointer"
                        >
                          <td className="px-6 py-4 text-zinc-600">
                            {expandedId === msg.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </td>
                          <td className="px-6 py-4 text-zinc-400 max-w-xs">
                            <span className="line-clamp-1">{msg.content}</span>
                          </td>
                          <td className="px-6 py-4">
                            {msg.senderUsername ? (
                              <span className="text-zinc-200 font-medium">@{msg.senderUsername}</span>
                            ) : (
                              <Badge variant="default">Anonymous</Badge>
                            )}
                          </td>
                          <td className="px-6 py-4 text-zinc-300">@{msg.receiverUsername}</td>
                          <td className="px-6 py-4 text-zinc-500 text-xs whitespace-nowrap">
                            {formatDate(msg.createdAt)}
                          </td>
                        </tr>
                        {expandedId === msg.id && <MessageDetail msg={msg} />}
                      </React.Fragment>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center text-zinc-500">
                        <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        No messages found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800/60">
              <span className="text-xs text-zinc-500">
                Page {page} of {totalPages} · {data?.total ?? 0} total messages
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline" size="sm"
                  onClick={() => {
                    setPage((p) => p - 1);
                    setExpandedId(null);
                  }}
                  disabled={page === 1}
                  leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
                >
                  Prev
                </Button>
                <Button
                  variant="outline" size="sm"
                  onClick={() => {
                    setPage((p) => p + 1);
                    setExpandedId(null);
                  }}
                  disabled={page >= totalPages}
                  rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
