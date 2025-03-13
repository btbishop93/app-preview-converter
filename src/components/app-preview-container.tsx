"use client";

import { useState, useEffect } from "react";
import { Confetti } from "@/components/ui/animated-elements";
import VideoConvertFlow from "@/components/video-convert/VideoConvertFlow";
import { UploadButtonProvider } from "@/components/providers/upload-button-provider";

export default function AppPreviewContainer() {
  const [isMounted, setIsMounted] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [platform, setPlatform] = useState<'macOS' | 'iOS'>('macOS');
  const [addSilentAudio, setAddSilentAudio] = useState(true);

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

  if (!isMounted) {
    return (
      <UploadButtonProvider>
        <div className="flex justify-center items-center">
          <div className="max-w-3xl w-full mx-auto my-24">
            <VideoConvertFlow 
              onFileSelected={handleFileSelected}
              onPlatformSelected={handlePlatformSelected}
              onAudioSelected={handleAudioSelected}
            />
          </div>
        </div>
      </UploadButtonProvider>
    );
  }

  return (
    <UploadButtonProvider>
      <Confetti active={true} />
      <div className="flex justify-center items-center">
        <div className="max-w-4xl w-full mx-auto bg-white">
          <VideoConvertFlow 
            onFileSelected={handleFileSelected}
            onPlatformSelected={handlePlatformSelected}
            onAudioSelected={handleAudioSelected}
          />
        </div>
      </div>
    </UploadButtonProvider>
  );
} 