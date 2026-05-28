import React from "react";

interface TopPerformer {
  username: string;
  name: string;
  tasksCount: number;
  averageRating: number;
}

interface TopPerformersProps {
  topPerformers: TopPerformer[];
  onSelectUser: (username: string) => void;
}

export function TopPerformers({ topPerformers, onSelectUser }: TopPerformersProps) {
  if (!topPerformers || topPerformers.length === 0) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 px-1">
        <svg className="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.5"
            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
          />
        </svg>
        Top Performers (This Month)
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {topPerformers.map((user, idx) => (
          <div
            key={user.username}
            onClick={() => onSelectUser(user.username)}
            className="relative overflow-hidden backdrop-blur-md bg-zinc-900/30 hover:bg-zinc-800/40 border border-zinc-800/80 hover:border-purple-500/30 rounded-2xl p-4 cursor-pointer transition-all hover:scale-[1.02] group"
          >
            <div className="absolute -right-2 -bottom-6 text-7xl font-extrabold text-purple-500/5 select-none font-sans group-hover:text-purple-500/10 transition-colors">
              #{idx + 1}
            </div>

            <div className="flex items-center gap-2.5">
              <div
                className={`w-7 h-7 rounded-full border flex items-center justify-center text-[10px] font-black shrink-0 ${
                  idx === 0
                    ? "bg-amber-400/10 border-amber-400/20 text-amber-400"
                    : idx === 1
                      ? "bg-zinc-300/10 border-zinc-300/20 text-zinc-300"
                      : idx === 2
                        ? "bg-amber-600/10 border-amber-600/20 text-amber-600"
                        : "bg-zinc-800/20 border-zinc-800/40 text-zinc-500"
                }`}
              >
                {idx + 1}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-zinc-200 truncate group-hover:text-purple-400 transition-colors">
                  {user.name}
                </p>
                <p className="text-[10px] text-zinc-500 truncate font-mono">@{user.username}</p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-zinc-800/60 pt-3">
              <div>
                <p className="text-[9px] text-zinc-500 uppercase font-semibold">Completed</p>
                <p className="text-[11px] font-bold text-emerald-400 mt-0.5">{user.tasksCount} tasks</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-zinc-500 uppercase font-semibold">Avg Rating</p>
                <div className="flex items-center gap-1 mt-0.5 justify-end">
                  <span className="text-[11px] font-bold text-amber-400 font-mono">
                    {Number(user.averageRating).toFixed(1)}
                  </span>
                  <span className="text-[10px] text-amber-400 leading-none">★</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
