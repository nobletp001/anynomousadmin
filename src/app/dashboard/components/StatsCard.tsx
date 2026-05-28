import React from "react";
import { motion, type Variants } from "framer-motion";
import { TrendingUp } from "lucide-react";

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: "easeOut" as const,
    },
  }),
};

interface StatsCardProps {
  index: number;
  label: string;
  value: number | undefined;
  icon: React.ComponentType<any>;
  color: "purple" | "blue" | "emerald";
  subtext: string;
  showTrending?: boolean;
}

export function StatsCard({
  index,
  label,
  value,
  icon: Icon,
  color,
  subtext,
  showTrending = false,
}: StatsCardProps) {
  const themes = {
    purple: {
      border: "hover:border-purple-500/30",
      glow: "bg-purple-500/5 group-hover:bg-purple-500/10",
      iconContainer: "bg-purple-500/10 border-purple-500/20 text-purple-400",
      text: "text-purple-400",
    },
    blue: {
      border: "hover:border-blue-500/30",
      glow: "bg-blue-500/5 group-hover:bg-blue-500/10",
      iconContainer: "bg-blue-500/10 border-blue-500/20 text-blue-400",
      text: "text-blue-400",
    },
    emerald: {
      border: "hover:border-emerald-500/30",
      glow: "bg-emerald-500/5 group-hover:bg-emerald-500/10",
      iconContainer: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
      text: "text-emerald-400",
    },
  };

  const theme = themes[color];

  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      className={`backdrop-blur-md bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden group transition-all duration-300 ${theme.border}`}
    >
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-xl transition-all duration-300 ${theme.glow}`} />
      <div className="flex items-center justify-between mb-4">
        <span className="text-zinc-500 text-sm font-semibold tracking-wide uppercase">{label}</span>
        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${theme.iconContainer}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <span className="text-3xl font-extrabold text-zinc-100 tracking-tight block">
        {value !== undefined ? value : "—"}
      </span>
      <span className={`text-xs font-medium flex items-center gap-1 mt-2 ${theme.text}`}>
        {showTrending && <TrendingUp className="w-3.5 h-3.5" />}
        <span>{subtext}</span>
      </span>
    </motion.div>
  );
}
