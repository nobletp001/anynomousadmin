import React from "react";

export function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs text-zinc-400 mb-1.5 font-medium">
      {children}
      {required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  );
}
