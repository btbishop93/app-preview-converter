"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import TerminalContent from "@/components/terminal-content";
import { useTerminalMessages } from "@/hooks/useTerminalMessages";
import { useUploadButtonState } from "@/hooks/useUploadButtonState";
import { validateVideo } from "@/lib/video-validation";
import type { TerminalMessage } from "@/types/terminal";

interface VideoConvertFlowProps {
  onConversionComplete?: () => void;
}

export default function VideoConvertFlow({ onConversionComplete }: VideoConvertFlowProps) {
  const [convertedVideoUrl, setConvertedVideoUrl] = useState<string | null>(null);
  const [_uploadKey, setUploadKey] = useState(0);
  const { show, hide } = useUploadButtonState();

  // Use refs for values needed in callbacks to avoid stale closures
  const videoFileRef = useRef<File | null>(null);
  const selectedPlatformRef = useRef<"macOS" | "iOS">("macOS");
  const addSilentAudioRef = useRef(true);

  const {
    messages,
    initializeMessages,
    addUploadPrompt,
    addPlatformPrompt,
    addPlatformSuccessMessage,
    addAudioPrompt,
    addAudioSuccessMessage,
    addConversionStartMessage,
    addConversionCompleteMessage,
    addSupportMessage,
    setMessages,
  } = useTerminalMessages();

  const updateMessage = useCallback(
    (message: string, type: "success" | "error") => {
      setMessages((currentMessages) => {
        const uploadPromptIndex = currentMessages.findIndex((msg) => msg.type === "prompt");
        if (uploadPromptIndex === -1) return currentMessages;

        const baseMessages = currentMessages.slice(0, uploadPromptIndex + 1);

        const newMessage: TerminalMessage = {
          text: type === "success" ? `✓ ${message}` : `⚠️ ${message}`,
          delay: 100, // Small delay since it appears right after upload attempt
          type: type,
        };

        return [...baseMessages, newMessage];
      });

      // On error, make sure the upload button stays visible
      if (type === "error") {
        show();
      }
    },
    [setMessages, show],
  );

  const handleFileUpload = useCallback(
    async (file: File) => {
      const validation = await validateVideo(file);

      if (validation.isValid) {
        hide();
        videoFileRef.current = file;
        updateMessage(`${file.name} uploaded successfully!`, "success");
        addPlatformPrompt();
      } else {
        const errorMessage = validation.errors.join(" and ");
        updateMessage(errorMessage, "error");
      }
    },
    [hide, updateMessage, addPlatformPrompt],
  );

  // Initialize messages on mount or when uploadKey changes (restart)
  useEffect(() => {
    initializeMessages();
    show();
    addUploadPrompt(handleFileUpload);
  }, [initializeMessages, show, addUploadPrompt, handleFileUpload]);

  const handleConversion = useCallback(async () => {
    const file = videoFileRef.current;
    if (!file) return;

    addConversionStartMessage();

    try {
      const formData = new FormData();
      formData.append("video", file);
      formData.append("platform", selectedPlatformRef.current);
      formData.append("addSilentAudio", addSilentAudioRef.current.toString());

      const response = await fetch("/api/convert", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Conversion failed");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setConvertedVideoUrl(url);
      addConversionCompleteMessage();

      // Trigger confetti after a short delay for the message to appear
      setTimeout(() => {
        onConversionComplete?.();
      }, 1500);
    } catch (error) {
      console.error("Conversion error:", error);
    }
  }, [addConversionStartMessage, addConversionCompleteMessage, onConversionComplete]);

  const handlePlatformSelection = useCallback(
    (action: string) => {
      if (action === "macos" || action === "ios") {
        const platform = action === "macos" ? "macOS" : "iOS";
        selectedPlatformRef.current = platform;
        addPlatformSuccessMessage(platform);
        addAudioPrompt();
      }
    },
    [addPlatformSuccessMessage, addAudioPrompt],
  );

  const handleAudioSelection = useCallback(
    async (action: string) => {
      if (action === "audio-yes" || action === "audio-no") {
        const shouldAddAudio = action === "audio-yes";
        addSilentAudioRef.current = shouldAddAudio;
        addAudioSuccessMessage(shouldAddAudio);

        await handleConversion();
      }
    },
    [addAudioSuccessMessage, handleConversion],
  );

  const handleDownload = useCallback(() => {
    if (!convertedVideoUrl) return;

    const a = document.createElement("a");
    a.href = convertedVideoUrl;
    a.download = `${selectedPlatformRef.current}_Preview${addSilentAudioRef.current ? "_with_silent_audio" : ""}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    addSupportMessage();
  }, [convertedVideoUrl, addSupportMessage]);

  const handleRestart = useCallback(() => {
    videoFileRef.current = null;
    selectedPlatformRef.current = "macOS";
    addSilentAudioRef.current = true;
    setConvertedVideoUrl(null);
    setUploadKey((prev) => prev + 1);
  }, []);

  const handleButtonClick = useCallback(
    (action: string) => {
      handlePlatformSelection(action);
      handleAudioSelection(action);
      if (action === "download") handleDownload();
      if (action === "restart") handleRestart();
      if (action === "bmc") {
        window.open("https://buymeacoffee.com/brendenbishop", "_blank");
      }
    },
    [handlePlatformSelection, handleAudioSelection, handleDownload, handleRestart],
  );

  return (
    <TerminalContent
      messages={messages}
      onButtonClick={handleButtonClick}
      resetUploadState={() => setUploadKey((prev) => prev + 1)}
    />
  );
}
