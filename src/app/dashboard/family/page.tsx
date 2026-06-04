"use client";

import React, { useState, useEffect } from "react";
import { Crown, Plus, Loader2, Search, Trash2, Edit3, ShieldAlert, Sparkles } from "lucide-react";
import { apiClient } from "@/services/api-client";
import { FamilyMember } from "./types";
import { AddMemberModal } from "./components/AddMemberModal";
import { EditPointsModal } from "./components/EditPointsModal";

export default function FamilyPage() {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Pagination
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);

  const fetchMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<any, { success: boolean; data: FamilyMember[] }>("/admin/family");
      if (res && res.success) {
        setMembers(res.data);
      } else {
        setError("Failed to load family members directory.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load family members.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleAddMember = async (payload: any) => {
    const res = await apiClient.post<any, { success: boolean }>("/admin/family/admin", payload);
    if (res && res.success) {
      fetchMembers();
    } else {
      throw new Error("Failed to add member.");
    }
  };

  const handleUpdateMember = async (id: number, payload: any) => {
    const res = await apiClient.patch<any, { success: boolean }>(`/admin/family/admin/${id}`, payload);
    if (res && res.success) {
      fetchMembers();
    } else {
      throw new Error("Failed to update member.");
    }
  };

  const handleDeleteMember = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name} from the PayFluence Family?`)) {
      return;
    }
    try {
      const res = await apiClient.delete<any, { success: boolean }>(`/admin/family/admin/${id}`);
      if (res && res.success) {
        fetchMembers();
      }
    } catch (err: any) {
      alert(err.message || "Failed to delete family member.");
    }
  };

  // Filter search results
  const filteredMembers = members.filter((m) => {
    const term = search.toLowerCase().trim();
    if (!term) return true;
    return (
      (m.name || "").toLowerCase().includes(term) ||
      (m.username || "").toLowerCase().includes(term) ||
      (m.role || "").toLowerCase().includes(term) ||
      (m.entryNumber || "").toLowerCase().includes(term)
    );
  });

  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage) || 1;
  const paginatedMembers = filteredMembers.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-100 tracking-tight flex items-center gap-2">
            <Crown className="w-8 h-8 text-purple-500" />
            Family Management
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Manage the elite PayFluence Family members, trustee board staff, adjust points, and assign Entry ID numbers.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl text-xs font-bold bg-purple-600 text-white hover:bg-purple-500 transition-colors self-start cursor-pointer shadow-lg shadow-purple-650/10 border border-purple-500/20"
        >
          <Plus className="w-4.5 h-4.5" />
          Add Family Member
        </button>
      </div>

      {/* Info Notice card */}
      <div className="p-4.5 rounded-2xl bg-purple-950/5 border border-purple-500/10 flex items-start gap-3.5 text-xs text-zinc-400 leading-relaxed text-left">
        <Sparkles className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-white">PayFluence Family Guidelines:</strong> Family membership represents the top 5%
          of our community contributors. Ranks and points can be updated dynamically for system-linked users, while
          custom trustee profiles (non-users) allow you to represent executive board staff with customized position
          titles.
        </div>
      </div>

      {/* Search & Statistics Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-950/20 p-4 border border-zinc-850 rounded-2xl">
        <div className="w-full sm:w-72 relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search family member..."
            value={search}
            onChange={handleSearchChange}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-105 placeholder:text-zinc-500 focus:outline-none focus:border-purple-500/50 transition-colors"
          />
        </div>
        <div className="flex gap-4 text-xs font-bold text-zinc-450 shrink-0">
          <span>
            Total Members: <strong className="text-white">{members.length}</strong>
          </span>
          <span className="text-zinc-800">|</span>
          <span>
            Staff/Trustees: <strong className="text-purple-400">{members.filter((m) => m.isStaff).length}</strong>
          </span>
          <span className="text-zinc-800">|</span>
          <span>
            Elite Contributors: <strong className="text-emerald-400">{members.filter((m) => !m.isStaff).length}</strong>
          </span>
        </div>
      </div>

      {/* Main Table */}
      <div className="backdrop-blur-md bg-zinc-900/15 border border-zinc-800/80 rounded-2xl shadow-xl overflow-hidden text-left">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-zinc-500 gap-2.5">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-650">Fetching directory...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-20 text-center text-red-400">
            <ShieldAlert className="w-10 h-10 shrink-0" />
            <h3 className="text-sm font-bold">Failed to load directory</h3>
            <p className="text-zinc-550 text-xs max-w-sm">{error}</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="flex flex-col items-center gap-3.5 py-24 text-center text-zinc-500">
            <div className="h-12 w-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
              <Crown className="w-5 h-5 opacity-40" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-zinc-300">No records found</p>
              <p className="text-xs text-zinc-550 mt-1">No family members matched your search criteria.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-850 bg-zinc-950/20 text-zinc-500 font-bold uppercase tracking-wider text-[9px] bg-zinc-950/20">
                  <th className="px-6 py-4">Member Name &amp; Details</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Entry ID</th>
                  <th className="px-6 py-4 text-center">Rank Points</th>
                  <th className="px-6 py-4">Date Joined</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40">
                {paginatedMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-zinc-850/10 transition-colors">
                    {/* Member Details */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-purple-400 font-bold text-sm overflow-hidden shrink-0">
                          {m.photo ? (
                            <img src={m.photo} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            (m.name || m.username || "F").charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-zinc-100 text-sm">{m.name || m.userRealName}</p>
                          <p className="text-[10px] text-zinc-500 font-semibold mt-0.5">
                            {m.userId ? `@${m.username}` : "Custom Trustee"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Member Type */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {m.isStaff ? (
                        <span className="text-[9px] bg-purple-500/10 border border-purple-500/20 text-purple-450 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                          {m.role || "Staff/Trustee"}
                        </span>
                      ) : (
                        <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                          Elite Member
                        </span>
                      )}
                    </td>

                    {/* Entry ID */}
                    <td className="px-6 py-4 whitespace-nowrap font-mono font-bold text-zinc-300">
                      {m.isStaff ? <span className="text-zinc-600">-</span> : `#${m.entryNumber || "PF-MEM"}`}
                    </td>

                    {/* Points */}
                    <td className="px-6 py-4 whitespace-nowrap text-center font-mono font-bold text-zinc-200">
                      {m.isStaff ? <span className="text-zinc-600">-</span> : `${m.points.toLocaleString()} PTS`}
                    </td>

                    {/* Joined Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-zinc-500">
                      {/* We'll handle dates carefully */}
                      {(m as any).createdAt
                        ? new Date((m as any).createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "—"}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingMember(m)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-purple-400 hover:bg-purple-500/10 transition-colors cursor-pointer"
                          title="Edit member points/details"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMember(m.id, m.name || m.username || "")}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                          title="Delete member"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800/40 bg-zinc-900/10">
            <p className="text-xs text-zinc-500 font-semibold">
              Showing <span className="text-zinc-300">{(page - 1) * itemsPerPage + 1}</span> to{" "}
              <span className="text-zinc-300">{Math.min(page * itemsPerPage, filteredMembers.length)}</span> of{" "}
              <span className="text-zinc-300">{filteredMembers.length}</span> members
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-950/40 text-xs font-bold text-zinc-400 hover:text-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-950/40 text-xs font-bold text-zinc-400 hover:text-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      {showAddModal && <AddMemberModal onClose={() => setShowAddModal(false)} onSave={handleAddMember} />}

      {/* Edit Points Modal */}
      {editingMember && (
        <EditPointsModal member={editingMember} onClose={() => setEditingMember(null)} onSave={handleUpdateMember} />
      )}
    </div>
  );
}
