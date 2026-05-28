import React, { useState } from "react";
import { CheckCircle, Copy } from "lucide-react";

interface CopyBtnProps {
  text: string;
}

export function CopyBtn({ text }: CopyBtnProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      onClick={handleCopy}
      className="text-zinc-600 hover:text-zinc-300 transition-colors cursor-pointer shrink-0"
    >
      {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}
