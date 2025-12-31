"use client";

import { Monitor } from "lucide-react";
import { useEffect, useState } from "react";

const MOBILE_BREAKPOINT = 768;

export function MobileBlock({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
      setIsChecking(false);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Don't render anything while checking to prevent flash
  if (isChecking) {
    return null;
  }

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-neutral-950 p-8 text-center">
        <div className="mb-8 rounded-full bg-neutral-900 p-6">
          <Monitor className="h-16 w-16 text-cyan-400" />
        </div>

        <h1 className="mb-4 text-2xl font-bold text-white">Desktop Only</h1>

        <p className="mb-6 max-w-sm text-neutral-400 leading-relaxed">
          App Preview Converter requires a desktop browser to process video files. Please visit this
          page on your computer.
        </p>

        <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 px-6 py-4">
          <p className="text-sm text-neutral-500">
            Video conversion uses FFmpeg which requires desktop processing power.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
