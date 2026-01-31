"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function BackButton({ className = "" }) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className={
        "inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-stone-200 bg-white/90 backdrop-blur " +
        "shadow-sm hover:shadow transition text-sm font-semibold text-stone-700 " +
        className
      }
      aria-label="Regresar"
      title="Regresar"
    >
      <ArrowLeft size={18} />
      Regresar
    </button>
  );
}
