"use client";

import { useEffect, useRef, useState } from "react";
import { UploadButtonProvider } from "@/components/providers/upload-button-provider";
import VideoConvertFlow from "@/components/video-convert/VideoConvertFlow";
import { Confetti, type ConfettiRef } from "./ui/confetti";

export default function AppPreviewContainer() {
  const confettiRef = useRef<ConfettiRef>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleConversionComplete = () => {
    confettiRef.current?.fire();
  };

  if (!isMounted) {
    return (
      <UploadButtonProvider>
        <div className="flex justify-center items-center min-h-screen">
          <div className="max-w-3xl w-full mx-auto px-4 py-24">
            <div className="animate-pulse bg-neutral-900 h-96 rounded-xl"></div>
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
