"use client";

import { useState, useEffect, useRef } from "react";
import VideoConvertFlow from "@/components/video-convert/VideoConvertFlow";
import { UploadButtonProvider } from "@/components/providers/upload-button-provider";
import { Confetti, ConfettiRef } from "./magicui/confetti";

export default function AppPreviewContainer() {

  const confettiRef = useRef<ConfettiRef>(null);
  
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleFileSelected = () => {
    // No-op since we don't need to track the file state here
  };

  const handlePlatformSelected = () => {
    // No-op since we don't need to track the platform state here
  };

  const handleAudioSelected = () => {
    // No-op since we don't need to track the audio state here
  };

  const handleConversionComplete = () => {
    confettiRef.current?.fire();
  };

  if (!isMounted) {
    return (
      <UploadButtonProvider>
        <div className="flex justify-center items-center">
          <div className="max-w-3xl w-full mx-auto my-24">
            <div className="animate-pulse bg-gray-200 h-96 rounded-lg"></div>
          </div>
        </div>
      </UploadButtonProvider>
    );
  }

  return (
    <UploadButtonProvider>
      <Confetti ref={confettiRef}
        className="absolute left-0 top-0 z-0 size-full"/>
      <div className="flex justify-center items-center">
        <div className="max-w-4xl w-full mx-auto bg-white">
          <VideoConvertFlow 
            onFileSelected={handleFileSelected}
            onPlatformSelected={handlePlatformSelected}
            onAudioSelected={handleAudioSelected}
            onConversionComplete={handleConversionComplete}
          />
        </div>
      </div>
    </UploadButtonProvider>
  );
} 