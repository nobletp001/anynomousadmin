import React from "react";

interface FieldLabelProps {
  children: React.ReactNode;
  required?: boolean;
}

export function FieldLabel({ children, required }: FieldLabelProps) {
  return (
    <label className="block text-xs text-zinc-400 mb-1.5 font-medium">
      {children}
      {required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  );
}
