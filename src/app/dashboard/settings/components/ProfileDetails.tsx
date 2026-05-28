import React from "react";
import { Badge } from "@/components/ui";
import { User as UserIcon } from "lucide-react";
import { roleBadgeVariant } from "../utils";

interface UserProfile {
  name: string;
  username: string;
  email: string | null;
  role: string;
}

interface ProfileDetailsProps {
  user: UserProfile | null | undefined;
}

export function ProfileDetails({ user }: ProfileDetailsProps) {
  return (
    <div className="backdrop-blur-md bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
          <UserIcon className="w-4 h-4" />
        </div>
        <h2 className="text-sm font-semibold text-zinc-200">Profile</h2>
      </div>

      {user ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-zinc-800/60">
            <span className="text-xs text-zinc-550 font-medium uppercase tracking-wider">Full Name</span>
            <span className="text-sm text-zinc-200 font-medium">{user.name}</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-zinc-800/60">
            <span className="text-xs text-zinc-550 font-medium uppercase tracking-wider">Username</span>
            <span className="text-sm text-zinc-405">@{user.username}</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-zinc-800/60">
            <span className="text-xs text-zinc-550 font-medium uppercase tracking-wider">Email</span>
            <span className="text-sm text-zinc-405">{user.email ?? "—"}</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-xs text-zinc-555 font-medium uppercase tracking-wider">Role</span>
            <Badge variant={roleBadgeVariant(user.role)} dot>
              {user.role}
            </Badge>
          </div>
        </div>
      ) : (
        <div className="py-6 flex justify-center">
          <div className="h-4 w-48 bg-zinc-800 rounded animate-pulse" />
        </div>
      )}
    </div>
  );
}
