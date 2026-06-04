import React, { useState } from "react";
import { X, Upload, Loader2, Edit3 } from "lucide-react";
import { apiClient } from "@/services/api-client";
import { FamilyMember } from "../types";

interface EditPointsModalProps {
  member: FamilyMember;
  onClose: () => void;
  onSave: (id: number, payload: any) => Promise<void>;
}

export function EditPointsModal({ member, onClose, onSave }: EditPointsModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Common fields (depending on staff/user)
  const [points, setPoints] = useState(member.points);
  const [entryNumber, setEntryNumber] = useState(member.entryNumber || "");
  const [name, setName] = useState(member.name || "");
  const [role, setRole] = useState(member.role || "");
  const [bio, setBio] = useState(member.bio || "");
  const [photoUrl, setPhotoUrl] = useState(member.photo || "");
  const [uploading, setUploading] = useState(false);

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
      const payload: any = {};
      if (member.isStaff) {
        if (!name.trim() || !role.trim()) {
          throw new Error("Name and Role are required.");
        }
        payload.name = name.trim();
        payload.role = role.trim();
        payload.photo = photoUrl || null;
        payload.bio = bio.trim() || null;
      } else {
        payload.points = points;
        payload.entryNumber = entryNumber.trim() || null;
      }

      await onSave(member.id, payload);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update family member.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4.5 h-4.5 text-purple-400" />
            <h2 className="text-sm font-black text-white uppercase tracking-wider">
              {member.isStaff ? "Edit Staff Details" : "Adjust Member Points"}
            </h2>
          </div>
          <button onClick={onClose} className="text-zinc-550 hover:text-zinc-300 transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-left">
          {error && (
            <div className="p-3 text-xs bg-red-955/5 border border-red-500/15 rounded-xl text-red-400 font-medium">
              ⚠️ {error}
            </div>
          )}

          {member.isStaff ? (
            /* Custom Staff Editing fields */
            <div className="space-y-4">
              {/* Photo Upload */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block">
                  Profile Photo
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-550 overflow-hidden shrink-0">
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
                      id="edit-staff-photo-upload"
                      onChange={handlePhotoUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                    <label
                      htmlFor="edit-staff-photo-upload"
                      className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition cursor-pointer text-xs font-bold text-zinc-305 inline-block"
                    >
                      Change Photo
                    </label>
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
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-700 outline-none focus:border-purple-500/40"
                  required
                />
              </div>

              {/* Bio */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block">
                  Biography / Bio Description
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-700 outline-none resize-none focus:border-purple-500/40"
                />
              </div>
            </div>
          ) : (
            /* System Linked User Points Adjustment */
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-zinc-850 bg-zinc-900/40">
                <span className="text-[8px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Member Details
                </span>
                <h4 className="text-xs font-black text-white mt-1.5">{member.name || member.username}</h4>
                <p className="text-[10px] text-zinc-500 font-medium mt-0.5">@{member.username}</p>
              </div>

              {/* Entry Number */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block">
                  Entry ID Number
                </label>
                <input
                  type="text"
                  value={entryNumber}
                  onChange={(e) => setEntryNumber(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-700 outline-none focus:border-purple-500/40"
                />
              </div>

              {/* Points Adjustment */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block">
                  Adjust Contributor Points
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setPoints((p) => Math.max(0, p - 50))}
                    className="h-10 w-12 rounded-xl border border-zinc-800 bg-zinc-900 text-sm font-bold text-zinc-400 hover:text-white cursor-pointer active:scale-95 transition"
                  >
                    -50
                  </button>
                  <input
                    type="number"
                    value={points}
                    onChange={(e) => setPoints(Math.max(0, parseInt(e.target.value) || 0))}
                    className="flex-1 text-center bg-zinc-900 border border-zinc-800 rounded-xl h-10 text-xs font-black text-white outline-none focus:border-purple-500/40"
                  />
                  <button
                    type="button"
                    onClick={() => setPoints((p) => p + 50)}
                    className="h-10 w-12 rounded-xl border border-zinc-800 bg-zinc-900 text-sm font-bold text-zinc-400 hover:text-white cursor-pointer active:scale-95 transition"
                  >
                    +50
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Footer Buttons */}
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
              disabled={submitting || uploading}
              className="px-4.5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow-lg shadow-purple-650/10 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1.5"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
