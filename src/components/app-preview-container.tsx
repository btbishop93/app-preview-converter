"use client";

import { useState, useEffect, useRef } from "react";
import VideoConvertFlow from "@/components/video-convert/VideoConvertFlow";
import { UploadButtonProvider } from "@/components/providers/upload-button-provider";
import { Confetti, ConfettiRef } from "./magicui/confetti";

export default function AppPreviewContainer() {

  const confettiRef = useRef<ConfettiRef>(null);
  
  const [isMounted, setIsMounted] = useState(false);
  const [_videoFile, setVideoFile] = useState<File | null>(null);
  const [_platform, setPlatform] = useState<'macOS' | 'iOS'>('macOS');
  const [_addSilentAudio, setAddSilentAudio] = useState(true);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleFileSelected = (file: File) => {
    setVideoFile(file);
  };

  const handlePlatformSelected = (selectedPlatform: 'macOS' | 'iOS') => {
    setPlatform(selectedPlatform);
  };

  const handleAudioSelected = (shouldAddAudio: boolean) => {
    setAddSilentAudio(shouldAddAudio);
  };

  const handleConversionComplete = () => {
    confettiRef.current?.fire();
  };

  if (!isMounted) {
    return (
      <UploadButtonProvider>
        <div className="flex justify-center items-center">
          <div className="max-w-3xl w-full mx-auto my-24">
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