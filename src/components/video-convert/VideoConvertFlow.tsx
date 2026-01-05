"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import TerminalContent from "@/components/terminal-content";
import { useTerminalMessages } from "@/hooks/useTerminalMessages";
import { useUploadButtonState } from "@/hooks/useUploadButtonState";
import { useVideoConversion } from "@/hooks/useVideoConversion";
import { validateVideo } from "@/lib/video-validation";
import type { TerminalMessage } from "@/types/terminal";

// Steps that show UI messages (skip "audio" - it's too fast to be useful)
const UI_STEPS = ["loading", "scaling", "finalizing"] as const;

// Get the status text based on step and progress
const getStatusText = (currentStep: string, currentProgress: number): string => {
  switch (currentStep) {
    case "loading":
      return "🍎 Warming up the cider press...";
    case "scaling":
      return `🍏 Pressing... ${currentProgress}%`;
    case "finalizing":
      return "🫗 Bottling your fresh cider...";
    default:
      return "";
  }
};

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

  // Client-side video conversion
  const {
    loadFFmpeg,
    convertVideo,
    reset: resetConversion,
    error: conversionError,
    progress,
    step,
  } = useVideoConversion();

  const {
    messages,
    initializeMessages,
    addUploadPrompt,
    addPlatformPrompt,
    addPlatformSuccessMessage,
    addAudioPrompt,
    addAudioSuccessMessage,
    addConversionCompleteMessage,
    addSupportMessage,
    addErrorMessage,
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

  // Track which step we've added a message for
  const lastStepRef = useRef<string>("idle");
  // Map of step -> message index for live updates
  const stepMsgIndicesRef = useRef<Map<string, number>>(new Map());

  // Add a new live message when step changes (only for UI-visible steps)
  useEffect(() => {
    if (step === "idle" || step === "complete") return;
    if (!UI_STEPS.includes(step as (typeof UI_STEPS)[number])) return;
    if (step === lastStepRef.current) return;

    lastStepRef.current = step;

    // Add a new live message for this step
    setMessages((prev) => {
      const newIndex = prev.length;
      stepMsgIndicesRef.current.set(step, newIndex);
      return [
        ...prev,
        {
          text: getStatusText(step, progress),
          delay: 0,
          type: "info" as const,
          live: true,
        },
      ];
    });
  }, [step, progress, setMessages]);

  // Update the current step's live message with progress
  useEffect(() => {
    if (step === "idle" || step === "complete") return;
    if (!UI_STEPS.includes(step as (typeof UI_STEPS)[number])) return;

    const msgIndex = stepMsgIndicesRef.current.get(step);
    if (msgIndex === undefined) return;

    const text = getStatusText(step, progress);
    if (!text) return;

    setMessages((prev) => {
      if (msgIndex >= prev.length) return prev;
      if (prev[msgIndex].text === text) return prev;

      const updated = [...prev];
      updated[msgIndex] = { ...updated[msgIndex], text };
      return updated;
    });
  }, [step, progress, setMessages]);

  // Reset on restart
  useEffect(() => {
    if (step === "idle") {
      lastStepRef.current = "idle";
      stepMsgIndicesRef.current.clear();
    }
  }, [step]);

  const handleConversion = useCallback(async () => {
    const file = videoFileRef.current;
    if (!file) return;

    const loaded = await loadFFmpeg();
    if (!loaded) {
      addErrorMessage("Failed to load video processor. Please refresh and try again.");
      return;
    }

    const result = await convertVideo(file, {
      platform: selectedPlatformRef.current,
      addSilentAudio: addSilentAudioRef.current,
    });

    if (result) {
      const url = URL.createObjectURL(result.blob);
      setConvertedVideoUrl(url);
      addConversionCompleteMessage();

      // Trigger confetti after a short delay for the message to appear
      setTimeout(() => {
        onConversionComplete?.();
      }, 1500);
    } else if (conversionError) {
      addErrorMessage(conversionError);
    }
  }, [
    loadFFmpeg,
    convertVideo,
    conversionError,
    addConversionCompleteMessage,
    addErrorMessage,
    onConversionComplete,
  ]);

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
    // Reset all refs
    videoFileRef.current = null;
    selectedPlatformRef.current = "macOS";
    addSilentAudioRef.current = true;
    lastStepRef.current = "idle";
    stepMsgIndicesRef.current.clear();

    // Reset state
    setConvertedVideoUrl(null);
    setUploadKey((prev) => prev + 1);
    resetConversion();

    // Reinitialize messages
    initializeMessages();
    show();
    addUploadPrompt(handleFileUpload);
  }, [resetConversion, initializeMessages, show, addUploadPrompt, handleFileUpload]);

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
