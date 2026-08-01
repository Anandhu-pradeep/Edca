"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useState } from "react";

export default function ClientBackground() {
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !user?.customThemeBg) {
    return null;
  }

  return (
    <>
      <div 
        className="fixed inset-0 w-full h-full -z-50"
        style={{
          backgroundImage: `url(${user.customThemeBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
        }}
      >
        {/* Subtle dark overlay to ensure text readability without hiding the image */}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {user.customTextColor && (
        <style dangerouslySetInnerHTML={{
          __html: `
            :root {
              --foreground-override: ${user.customTextColor};
            }
            body, .text-foreground, h1, h2, h3, h4, p, span, div {
              color: var(--foreground-override) !important;
            }
            .text-muted-foreground {
              color: var(--foreground-override) !important;
              opacity: 0.8;
            }
          `
        }} />
      )}
    </>
  );
}
