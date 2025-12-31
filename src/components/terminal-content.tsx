"use client";

import { useEffect, useRef, useState } from "react";
import { TerminalButtons } from "@/components/terminal-buttons";
import { AnimatedSpan, TERMINAL_TIMING, Terminal, TypingAnimation } from "@/components/ui/terminal";
import { useUploadButtonState } from "@/hooks/useUploadButtonState";
import { cn } from "@/lib/utils";
import type { Button as ButtonType, TerminalMessage } from "@/types/terminal";

interface TerminalContentProps {
  messages: TerminalMessage[];
  onUploadComplete?: () => void;
  onButtonClick?: (action: string) => void;
  resetUploadState?: () => void;
}

export default function TerminalContent({
  messages,
  onUploadComplete,
  onButtonClick,
  resetUploadState,
}: TerminalContentProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isVisible, isUploading, setUploading } = useUploadButtonState();

  // Track which message index is currently allowed to start typing
  // All messages up to this index can show, message AT this index is typing
  const [activeMessageIndex, setActiveMessageIndex] = useState(0);

  // Track which messages have completed typing
  const [completedMessages, setCompletedMessages] = useState<Set<number>>(new Set());

  // Store cumulative delay info at time of message addition
  const messageMetaRef = useRef<Map<number, { addedAt: number; batchStart: number }>>(new Map());
  const prevMessageCountRef = useRef(0);

  // Version counter to force component remount when messages are replaced
  const [messageVersion, setMessageVersion] = useState(0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // When messages change, track batch info
  useEffect(() => {
    const prevCount = prevMessageCountRef.current;
    const newCount = messages.length;

    if (newCount > prevCount) {
      // New messages added - record when this batch started
      const now = Date.now();
      for (let i = prevCount; i < newCount; i++) {
        messageMetaRef.current.set(i, {
          addedAt: now,
          batchStart: prevCount,
        });
      }
      // Allow the first new message to start after its delay
      const firstNewMessage = messages[prevCount];
      if (firstNewMessage) {
        setTimeout(() => {
          setActiveMessageIndex((prev) => Math.max(prev, prevCount));
        }, firstNewMessage.delay);
      }
    } else if (newCount < prevCount || (newCount > 0 && prevCount > 0 && newCount !== prevCount)) {
      // Messages replaced or reset - increment version to force remount
      messageMetaRef.current.clear();
      setActiveMessageIndex(0);
      setCompletedMessages(new Set());
      setMessageVersion((v) => v + 1);

      // Schedule first message to start after its delay
      const firstMessage = messages[0];
      if (firstMessage) {
        setTimeout(() => {
          setActiveMessageIndex(0);
        }, firstMessage.delay);
      }
    }

    prevMessageCountRef.current = newCount;
  }, [messages]);

  const handleMessageComplete = (index: number) => {
    // Mark this message as completed
    setCompletedMessages((prev) => new Set(prev).add(index));

    // When a message finishes, allow the next one to start (after its delay)
    const nextIndex = index + 1;
    if (nextIndex < messages.length) {
      const nextMessage = messages[nextIndex];
      setTimeout(() => {
        setActiveMessageIndex((prev) => Math.max(prev, nextIndex));
      }, nextMessage.delay);
    }
  };

  const handleFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploading(true);
      try {
        const uploadMessage = messages.find((m) => m.buttons?.some((b) => b.action === "upload"));
        const uploadButton = uploadMessage?.buttons?.find((b) => b.action === "upload");

        await uploadButton?.onAction?.(file);

        const lastNonPromptMessage = [...messages].reverse().find((m) => m.type !== "prompt");
        if (lastNonPromptMessage?.type === "success") {
          setLastAction("upload");
          onUploadComplete?.();
        }
      } catch (error) {
        console.error("Upload failed:", error);
      } finally {
        setUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  };

  const handleButtonClick = (button: ButtonType) => {
    button.onAction?.();
    onButtonClick?.(button.action);

    if (button.action === "restart") {
      setUploading(false);
      setLastAction(null);
      setActiveMessageIndex(0);
      setCompletedMessages(new Set());
      setMessageVersion((v) => v + 1);
      messageMetaRef.current.clear();
      prevMessageCountRef.current = 0;
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      resetUploadState?.();
    } else {
      setLastAction(button.action);
    }
  };

  const renderButtons = (buttons: ButtonType[], messageIndex: number) => {
    const hasUploadButton = buttons.some((b) => b.action === "upload");
    if (hasUploadButton && !isVisible) {
      return null;
    }

    if (!hasUploadButton) {
      const messageWithLastAction = messages.findIndex((m) =>
        m.buttons?.some((b) => b.action === lastAction),
      );
      if (messageWithLastAction !== -1 && messageIndex <= messageWithLastAction) {
        return null;
      }
    }

    return (
      <TerminalButtons
        buttons={buttons}
        isVisible={isVisible}
        isUploading={isUploading}
        fileInputRef={fileInputRef}
        onFileUpload={handleFileUpload}
        onFileChange={handleFileChange}
        onButtonClick={handleButtonClick}
      />
    );
  };

  const renderMessage = (message: TerminalMessage, index: number) => {
    const canStart = index <= activeMessageIndex;
    const isComplete = completedMessages.has(index);

    // Don't render messages that can't start yet
    if (!canStart) {
      return null;
    }

    return (
      <div key={`${messageVersion}-${index}`}>
        <TypingAnimation
          delay={0} // No delay - we control start via activeMessageIndex
          duration={TERMINAL_TIMING.TYPING_SPEED_MS}
          onComplete={() => handleMessageComplete(index)}
          className={cn(
            "break-words w-full",
            message.type === "prompt" && "text-cyan-400",
            message.type === "info" && "text-neutral-400",
            message.type === "success" && "text-emerald-400",
            message.type === "error" && "text-red-400",
          )}
        >
          {message.text}
        </TypingAnimation>

        {message.buttons && isComplete && (
          <AnimatedSpan delay={TERMINAL_TIMING.BUTTON_APPEAR_DELAY_MS}>
            {renderButtons(message.buttons, index)}
          </AnimatedSpan>
        )}
      </div>
    );
  };

  return (
    <Terminal title="App Preview Converter">
      {isMounted && <>{messages.map((message, index) => renderMessage(message, index))}</>}
    </Terminal>
  );
}
