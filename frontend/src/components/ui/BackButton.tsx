"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  className?: string;
}

export function BackButton({ className = "" }: BackButtonProps) {
  const router = useRouter();

  return (
    <div className={`styled-wrapper ${className}`}>
      <button 
        className="button" 
        onClick={() => router.back()} 
        aria-label="Go back"
      >
        <div className="button-box">
          <span className="button-elem">
            <ArrowLeft className="w-full h-full stroke-current" />
          </span>
          <span className="button-elem">
            <ArrowLeft className="w-full h-full stroke-current" />
          </span>
        </div>
      </button>
    </div>
  );
}
