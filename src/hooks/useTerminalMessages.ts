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
        text: "🍎 Welcome to Ciderpress v1.0.0",
        delay: TIMING.INSTANT, // First message starts immediately
        type: "info",
      },
      {
        text: "App preview video rejected? Apple keeps the reasons to themselves.",
        delay: TIMING.BEAT, // Brief pause after welcome
        type: "info",
      },
      {
        text: "We'll press your video into the format they actually accept.",
        delay: TIMING.BEAT,
        type: "info",
      },
    ];
    setMessages(initialMessages);
  }, []);

  const addUploadPrompt = useCallback((onFileUpload: (file: File) => void) => {
    setMessages((prev) => [
      ...prev,
      {
        text: "Drop an apple in the press to begin:",
        type: "prompt",
        delay: TIMING.PAUSE, // Pause before prompt
        buttons: [
          {
            text: "Pick Apple",
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
        text: `🍏 ${fileName} picked successfully!`,
        delay: TIMING.INSTANT, // Immediate response
        type: "success",
      },
    ]);
  }, []);

  const addPlatformPrompt = useCallback(() => {
    setMessages((prev) => [
      ...prev,
      {
        text: "Which orchard are you targeting?",
        delay: TIMING.BEAT, // Small pause after success
        type: "prompt",
        buttons: [
          { text: "macOS (1920×1080)", action: "macos", variant: "apple-blue" },
          { text: "iOS (886×1920)", action: "ios", variant: "apple-purple" },
        ],
      },
    ]);
  }, []);

  const addPlatformSuccessMessage = useCallback((platform: "macOS" | "iOS") => {
    const resolution = platform === "macOS" ? "1920×1080" : "886×1920";
    setMessages((prev) => [
      ...prev,
      {
        text: `✓ Orchard set to ${platform} (${resolution})`,
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
          { text: "Yes (Recommended)", action: "audio-yes", variant: "default" },
          { text: "No", action: "audio-no", variant: "outline" },
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
        text: "🍏 Pressing...",
        delay: TIMING.BEAT,
        type: "info",
      },
    ]);
  }, []);

  const addConversionCompleteMessage = useCallback(() => {
    setMessages((prev) => [
      ...prev,
      {
        text: "🧃 Fresh cider ready! Your video is App Store approved.",
        delay: TIMING.PAUSE, // Pause for effect
        type: "success",
        buttons: [
          { text: "Bottle It", action: "download", type: "rainbow" },
          { text: "Press Another", action: "restart" },
        ],
      },
    ]);
  }, []);

  const addSupportMessage = useCallback(() => {
    setMessages([
      {
        text: "🍎 All pressed. Thank you & enjoy your cider!",
        delay: TIMING.INSTANT,
        type: "info",
        buttons: [
          { text: "Buy me a coffee", action: "bmc", type: "bmc" },
          { text: "Press Another", action: "restart" },
        ],
      },
    ]);
  }, []);

  const addErrorMessage = useCallback((message: string) => {
    setMessages((prev) => [
      ...prev,
      {
        text: `🍂 Bruised apple: ${message}`,
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
