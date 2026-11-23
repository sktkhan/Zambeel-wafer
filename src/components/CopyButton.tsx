import { Check, Copy } from "lucide-react";
import { useState } from "react";

interface CopyButtonProps {
  text: string;
  label?: string;
  copiedLabel?: string;
  variant?: "subtle" | "primary";
  className?: string;
}

export function CopyButton({
  text,
  label = "Copy",
  copiedLabel = "Copied",
  variant = "subtle",
  className = "",
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    }
  };

  const baseStyle =
    variant === "primary"
      ? "bg-teal-700 text-white hover:bg-teal-800 border border-teal-700"
      : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200";

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center justify-center gap-1.5 min-h-[44px] sm:min-h-[38px] px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 active:scale-[0.98] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 ${baseStyle} ${className}`}
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 shrink-0" />
          <span>{copiedLabel}</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5 shrink-0" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
