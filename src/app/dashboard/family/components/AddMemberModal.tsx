import React, { useState, useEffect } from "react";
import { X, Search, Upload, Loader2, Sparkles, User, Shield } from "lucide-react";
import { apiClient } from "@/services/api-client";

interface AddMemberModalProps {
  onClose: () => void;
  onSave: (payload: any) => Promise<void>;
}

export function AddMemberModal({ onClose, onSave }: AddMemberModalProps) {
  const [activeTab, setActiveTab] = useState<"system" | "custom">("system");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // System User fields
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [entryNumber, setEntryNumber] = useState("");
  const [points, setPoints] = useState(100);

  // Custom Member fields
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [bio, setBio] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  // Search existing users as admin types
  useEffect(() => {
    if (activeTab !== "system" || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await apiClient.get<any, { success: boolean; data: any[] }>(
          `/admin/users?search=${encodeURIComponent(searchQuery.trim())}`
        );
        if (res && res.success) {
          setSearchResults(res.data);
        }
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setSearching(false);
      }
    }, 450);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, activeTab]);

  // Handle Photo Upload (Convert file to Base64 and upload to Cloudinary)
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64String = reader.result as string;
        try {
          const res = await apiClient.post<any, { success: boolean; url: string }>("/admin/upload", {
            base64: base64String,
            mimeType: file.type,
          });
          if (res && res.success) {
            setPhotoUrl(res.url);
          } else {
            setError("Upload failed. Try again.");
          }
        } catch (err: any) {
          setError(err.message || "Failed to upload photo.");
        } finally {
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setError("File reading failed.");
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (activeTab === "system") {
        if (!selectedUser) {
          throw new Error("Please select an existing user from search results.");
        }
        await onSave({
          userId: selectedUser.id,
          name: selectedUser.name,
          role: "Elite Member",
          entryNumber: entryNumber.trim() || undefined,
          points: points,
          isStaff: false,
        });
      } else {
        if (!name.trim() || !role.trim()) {
          throw new Error("Name and Role are required for custom members.");
        }
        await onSave({
          userId: null,
          name: name.trim(),
          role: role.trim(),
          photo: photoUrl || undefined,
          bio: bio.trim() || undefined,
          isStaff: true,
        });
      }
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to add family member.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h2 className="text-sm font-black text-white uppercase tracking-wider">Add Family Member</h2>
          </div>
          <button onClick={onClose} className="text-zinc-550 hover:text-zinc-300 transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="px-6 pt-4 border-b border-zinc-900 flex gap-4 shrink-0 bg-zinc-950/20">
          <button
            onClick={() => {
              setActiveTab("system");
              setError(null);
            }}
            className={`pb-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "system"
                ? "border-purple-500 text-purple-400"
                : "border-transparent text-zinc-500 hover:text-zinc-350"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Link System User
          </button>
          <button
            onClick={() => {
              setActiveTab("custom");
              setError(null);
            }}
            className={`pb-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "custom"
                ? "border-purple-500 text-purple-400"
                : "border-transparent text-zinc-500 hover:text-zinc-350"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Create Staff/Trustee
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-left">
          {error && (
            <div className="p-3 text-xs bg-red-950/20 border border-red-500/20 rounded-xl text-red-400 font-medium">
              ⚠️ {error}
            </div>
          )}

          {activeTab === "system" ? (
            <div className="space-y-4">
              {/* User Search Query */}
              {!selectedUser ? (
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block">
                    Search User (by Name, Username, Email)
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 text-zinc-650 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Type username or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-zinc-700 outline-none focus:border-purple-500/40"
                    />
                  </div>

                  {/* Results Box */}
                  {searchQuery.trim().length >= 2 && (
                    <div className="mt-2 max-h-48 border border-zinc-800 bg-zinc-900 rounded-xl overflow-y-auto divide-y divide-zinc-850">
                      {searching ? (
                        <div className="p-4 text-center text-zinc-550 flex items-center justify-center gap-2 text-xs">
                          <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                          Searching users...
                        </div>
                      ) : searchResults.length === 0 ? (
                        <div className="p-4 text-center text-zinc-550 text-xs italic">No users matched.</div>
                      ) : (
                        searchResults.map((u) => (
                          <div
                            key={u.id}
                            onClick={() => {
                              setSelectedUser(u);
                              setSearchQuery("");
                              setSearchResults([]);
                            }}
                            className="p-3 hover:bg-purple-950/10 cursor-pointer flex justify-between items-center text-xs"
                          >
                            <div>
                              <p className="font-bold text-zinc-200">{u.name}</p>
                              <p className="text-[10px] text-zinc-550">@{u.username}</p>
                            </div>
                            <span className="text-[10px] text-purple-400 font-bold bg-purple-500/5 px-2 py-0.5 rounded border border-purple-500/10">
                              Select
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* Selected User card */
                <div className="p-4 rounded-xl border border-purple-500/20 bg-purple-500/[0.01] flex items-center justify-between">
                  <div>
                    <span className="text-[8px] bg-purple-500/15 border border-purple-500/30 text-purple-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      Linked Account
                    </span>
                    <h4 className="text-xs font-black text-white mt-1.5">{selectedUser.name}</h4>
                    <p className="text-[10px] text-zinc-500 font-medium">
                      @{selectedUser.username} · {selectedUser.email}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedUser(null)}
                    className="text-xs font-bold text-zinc-550 hover:text-red-400 transition cursor-pointer"
                  >
                    Change
                  </button>
                </div>
              )}

              {/* Entry Number */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block">
                  Family Entry Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. PF-001"
                  value={entryNumber}
                  onChange={(e) => setEntryNumber(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-700 outline-none focus:border-purple-500/40"
                />
              </div>

              {/* Initial Points */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block">
                  Starting Points
                </label>
                <input
                  type="number"
                  value={points}
                  onChange={(e) => setPoints(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-700 outline-none focus:border-purple-500/40"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Photo Upload */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block">
                  Profile Image Photo
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 overflow-hidden shrink-0">
                    {photoUrl ? (
                      <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : uploading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
                    ) : (
                      <Upload className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      id="staff-photo-upload"
                      onChange={handlePhotoUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                    <label
                      htmlFor="staff-photo-upload"
                      className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition cursor-pointer text-xs font-bold text-zinc-300 inline-block"
                    >
                      {photoUrl ? "Replace Photo" : "Upload Photo"}
                    </label>
                    <p className="text-[9px] text-zinc-550 mt-1">Accepts PNG, JPG. Direct upload to storage.</p>
                  </div>
                </div>
              </div>

              {/* Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block">
                  Staff Member Name
                </label>
                <input
                  type="text"
                  placeholder="Enter full name..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-700 outline-none focus:border-purple-500/40"
                  required
                />
              </div>

              {/* Role */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block">
                  Role / Position Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. CEO, Trustee, Community Manager..."
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-700 outline-none focus:border-purple-500/40"
                  required
                />
              </div>

              {/* Bio */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block">
                  Short Biography / Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Short description of their community contributions or leadership role..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-700 outline-none resize-none focus:border-purple-500/40"
                />
              </div>
            </div>
          )}

          {/* Buttons Footer */}
          <div className="pt-4 border-t border-zinc-900 flex justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting || uploading}
              className="px-4.5 py-2.5 rounded-xl border border-zinc-800 text-xs font-bold text-zinc-400 hover:text-zinc-250 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || uploading || (activeTab === "system" && !selectedUser)}
              className="px-4.5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow-lg shadow-purple-600/10 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1.5"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Save Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
