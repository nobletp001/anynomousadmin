"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  accentColor?: "purple" | "blue" | "emerald" | "amber" | "red" | "none";
}

const accentMap: Record<string, string> = {
  purple: "hover:border-purple-500/30",
  blue: "hover:border-blue-500/30",
  emerald: "hover:border-emerald-500/30",
  amber: "hover:border-amber-500/30",
  red: "hover:border-red-500/30",
  none: "",
};

export function Card({ children, className, hover = false, accentColor = "none", ...props }: CardProps) {
  return (
    <div
      className={cn(
        "backdrop-blur-md bg-zinc-900/50 border border-zinc-800/80 rounded-2xl shadow-xl transition-all duration-300",
        hover && "hover:shadow-2xl",
        accentColor !== "none" && accentMap[accentColor],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-6 pt-6 pb-4 border-b border-zinc-800/60", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-lg font-bold text-zinc-100 tracking-tight", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-xs text-zinc-500 mt-1", className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-6 py-5", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-6 pb-6 pt-4 border-t border-zinc-800/60 flex items-center gap-3", className)} {...props}>
      {children}
    </div>
  );
}
