"use client";

import { useEffect, useRef, useState } from "react";
import { UploadButtonProvider } from "@/components/providers/upload-button-provider";
import VideoConvertFlow from "@/components/video-convert/VideoConvertFlow";
import { Confetti, type ConfettiRef } from "./ui/confetti";

// Apple retro rainbow colors (1977-1999 logo)
const APPLE_CONFETTI_COLORS = [
  "#61bb46", // green
  "#fdb827", // yellow
  "#f5821f", // orange
  "#e03a3e", // red
  "#963d97", // purple
  "#009ddc", // blue
];

export default function AppPreviewContainer() {
  const confettiRef = useRef<ConfettiRef>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleConversionComplete = () => {
    confettiRef.current?.fire({
      colors: APPLE_CONFETTI_COLORS,
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  if (!isMounted) {
    return (
      <UploadButtonProvider>
        <div className="flex justify-center items-center min-h-screen">
          <div className="max-w-3xl w-full mx-auto px-4 py-24">
            <div className="animate-pulse bg-stone-200 h-96 rounded-xl"></div>
          </div>
        </div>
      </UploadButtonProvider>
    );
  }

  return (
    <UploadButtonProvider>
      <Confetti
        ref={confettiRef}
        className="absolute left-0 top-0 z-50 size-full pointer-events-none"
      />
      <div className="flex justify-center items-center min-h-screen">
        <div className="max-w-4xl w-full mx-auto px-4 py-12">
          <VideoConvertFlow onConversionComplete={handleConversionComplete} />
        </div>
      </div>
    </UploadButtonProvider>
  );
}
