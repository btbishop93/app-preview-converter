import { useCallback, useState } from "react";
import type { TerminalMessage } from "@/types/terminal";

// Timing constants - delays represent pause BEFORE each message starts
// (after previous message finishes typing)
const TIMING = {
  INSTANT: 0, // No pause
  BEAT: 300, // Small pause for rhythm
  PAUSE: 600, // Moderate pause
  LONG_PAUSE: 1000, // Longer pause for emphasis
} as const;

export const useTerminalMessages = () => {
  const [messages, setMessages] = useState<TerminalMessage[]>([]);

  const initializeMessages = useCallback(() => {
    const initialMessages: TerminalMessage[] = [
      {
        text: "Welcome to App Preview Converter v1.0.0",
        delay: TIMING.INSTANT, // First message starts immediately
        type: "info",
      },
      {
        text: "This tool helps you convert videos for App Store submissions",
        delay: TIMING.BEAT, // Brief pause after welcome
        type: "info",
      },
    ];
    setMessages(initialMessages);
  }, []);

  const addUploadPrompt = useCallback((onFileUpload: (file: File) => void) => {
    setMessages((prev) => [
      ...prev,
      {
        text: "Upload a video to begin:",
        type: "prompt",
        delay: TIMING.PAUSE, // Pause before prompt
        buttons: [
          {
            text: "Upload",
            action: "upload",
            onAction: (file?: File) => {
              if (file) {
                onFileUpload(file);
              }
            },
          },
        ],
      },
    ]);
  }, []);

  const addSuccessMessage = useCallback((fileName: string) => {
    setMessages((prev) => [
      ...prev,
      {
        text: `✓ ${fileName} uploaded successfully!`,
        delay: TIMING.INSTANT, // Immediate response
        type: "success",
      },
    ]);
  }, []);

  const addPlatformPrompt = useCallback(() => {
    setMessages((prev) => [
      ...prev,
      {
        text: "Which platform are you targeting?",
        delay: TIMING.BEAT, // Small pause after success
        type: "prompt",
        buttons: [
          { text: "macOS (1920×1080)", action: "macos" },
          { text: "iOS (886×1920)", action: "ios" },
        ],
      },
    ]);
  }, []);

  const addPlatformSuccessMessage = useCallback((platform: "macOS" | "iOS") => {
    const resolution = platform === "macOS" ? "1920×1080" : "886×1920";
    setMessages((prev) => [
      ...prev,
      {
        text: `✓ Platform set to ${platform} (${resolution})`,
        delay: TIMING.INSTANT,
        type: "success",
      },
    ]);
  }, []);

  const addAudioPrompt = useCallback(() => {
    setMessages((prev) => [
      ...prev,
      {
        text: "Unless you have specific audio, it is RECOMMENDED to add a silent audio track.",
        delay: TIMING.BEAT,
        type: "info",
      },
      {
        text: "Apple often rejects videos without proper audio tracks.",
        delay: TIMING.BEAT,
        type: "info",
      },
      {
        text: "Would you like to add a silent audio track?",
        delay: TIMING.BEAT,
        type: "prompt",
        buttons: [
          { text: "Yes (Recommended)", action: "audio-yes" },
          { text: "No", action: "audio-no" },
        ],
      },
    ]);
  }, []);

  const addAudioSuccessMessage = useCallback((addSilentAudio: boolean) => {
    setMessages((prev) => [
      ...prev,
      {
        text: addSilentAudio
          ? "✓ Silent audio track will be added to your video"
          : "✓ No silent audio track will be added",
        delay: TIMING.INSTANT,
        type: "success",
      },
    ]);
  }, []);

  const addConversionStartMessage = useCallback(() => {
    setMessages((prev) => [
      ...prev,
      {
        text: "Starting video conversion...",
        delay: TIMING.BEAT,
        type: "info",
      },
    ]);
  }, []);

  const addConversionCompleteMessage = useCallback(() => {
    setMessages((prev) => [
      ...prev,
      {
        text: "✓ Video is now ready for App Preview upload!",
        delay: TIMING.PAUSE, // Pause for effect
        type: "success",
        buttons: [
          { text: "Download", action: "download", type: "rainbow" },
          { text: "New Conversion", action: "restart" },
        ],
      },
    ]);
  }, []);

  const addSupportMessage = useCallback(() => {
    setMessages([
      {
        text: "All done. Thank you & enjoy!",
        delay: TIMING.INSTANT,
        type: "info",
        buttons: [
          { text: "Buy me a coffee", action: "bmc", type: "bmc" },
          { text: "New Conversion", action: "restart" },
        ],
      },
    ]);
  }, []);

  const addErrorMessage = useCallback((message: string) => {
    setMessages((prev) => [
      ...prev,
      {
        text: `⚠️ ${message}`,
        delay: TIMING.INSTANT,
        type: "error",
      },
    ]);
  }, []);

  return {
    messages,
    initializeMessages,
    addUploadPrompt,
    addSuccessMessage,
    addPlatformPrompt,
    addPlatformSuccessMessage,
    addAudioPrompt,
    addAudioSuccessMessage,
    addConversionStartMessage,
    addConversionCompleteMessage,
    addSupportMessage,
    addErrorMessage,
    setMessages,
  };
};
