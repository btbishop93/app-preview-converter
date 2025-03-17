"use client";

import { Terminal } from "@/components/magicui/terminal";
import { TypingAnimation } from "@/components/magicui/terminal";
import { AnimatedSpan } from "@/components/magicui/terminal";
import { Button } from "@/components/ui/button";
import { AnimatedUploadButton } from "@/components/magicui/animated-upload-button";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { RainbowButton } from "./magicui/rainbow-button";
import { useUploadButtonState } from "@/hooks/useUploadButtonState";
import { BMCButton } from "@/components/ui/bmc-button";

export interface Button {
  text: string;
  action: string;
  type?: 'rainbow' | 'default' | 'bmc';
  onAction?: (file?: File) => void;
}

export interface TerminalMessage {
  text: string;
  delay: number;
  type?: 'info' | 'prompt' | 'success' | 'buttons-container' | 'button-inline' | 'error';
  buttons?: Button[];
  action?: string;
}

interface TerminalContentProps {
  messages: TerminalMessage[];
  onUploadComplete?: () => void;
  onButtonClick?: (action: string) => void;
  resetUploadState?: () => void;
}

export default function TerminalContent({ messages, onUploadComplete, onButtonClick, resetUploadState }: TerminalContentProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isVisible, isUploading, setUploading } = useUploadButtonState();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploading(true);
      try {
        // Find the upload button and call its onAction handler
        const uploadMessage = messages.find(m => m.buttons?.some(b => b.action === 'upload'));
        const uploadButton = uploadMessage?.buttons?.find(b => b.action === 'upload');
        
        // Call the onAction handler
        await uploadButton?.onAction?.(file);
        
        // Check if the last non-prompt message is a success message
        const lastNonPromptMessage = [...messages].reverse().find(m => m.type !== 'prompt');
        if (lastNonPromptMessage?.type === 'success') {
          setLastAction('upload');
          onUploadComplete?.();
        }
      } catch (error) {
        console.error('Upload failed:', error);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleButtonClick = (button: Button) => {
    button.onAction?.();
    onButtonClick?.(button.action);

    // If this is a restart action, reset all states
    if (button.action === 'restart') {
      setUploading(false);
      setLastAction(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      resetUploadState?.();
    } else {
      setLastAction(button.action);
    }
  };

  const renderButtons = (buttons: Button[], messageIndex: number) => {
    // For upload buttons, check visibility from our hook
    const hasUploadButton = buttons.some(b => b.action === 'upload');
    if (hasUploadButton && !isVisible) {
      return null;
    }

    // For non-upload buttons, keep the original hiding logic
    if (!hasUploadButton) {
      const messageWithLastAction = messages.findIndex(m => 
        m.buttons?.some(b => b.action === lastAction)
      );
      if (messageWithLastAction !== -1 && messageIndex <= messageWithLastAction) {
        return null;
      }
    }

    return (
      <div className="flex items-center flex-wrap gap-2 mt-2">
        {buttons.map((button, buttonIndex) => {
          if (button.action === 'upload' && !isVisible) {
            return null;
          }
          
          if (button.action === 'upload') {
            return (
              <div key={buttonIndex} className="flex items-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="video/*"
                  className="hidden"
                />
                <AnimatedUploadButton
                  uploadStatus={!isVisible}
                  isUploading={isUploading}
                  onUpload={handleFileUpload}
                  className="w-40"
                />
              </div>
            );
          }
          
          // Use BMCButton for buttons with type="bmc"
          if (button.type === 'bmc') {
            return (
              <BMCButton 
                key={buttonIndex}
                link="https://buymeacoffee.com/brendenbishop"
                className="w-36 cursor-pointer hover:drop-shadow-md hover:scale-105 transition-all duration-300"
              />
            );
          }
          
          // Use RainbowButton for buttons with type="rainbow"
          if (button.type === 'rainbow') {
            return (
              <RainbowButton 
                key={buttonIndex}
                onClick={() => handleButtonClick(button)}
                className="w-fit"
              >
                {button.text}
              </RainbowButton>
            );
          }
          
          return (
            <Button 
              key={buttonIndex}
              variant={button.action === 'restart' ? 'outline' : 'default'}
              className="w-fit"
              onClick={() => handleButtonClick(button)}
            >
              {button.text}
            </Button>
          );
        })}
      </div>
    );
  };

  const renderMessage = (message: TerminalMessage, index: number) => {
    return (
      <div key={index}>
        <TypingAnimation 
          delay={message.delay} 
          duration={50}
          className={cn(
            "break-words w-full",
            message.type === 'prompt' && 'text-blue-500',
            message.type === 'info' && 'text-neutral-400',
            message.type === 'success' && 'text-green-500',
            message.type === 'error' && 'text-red-500'
          )}
        >
          {message.text}
        </TypingAnimation>
        
        {message.buttons && (
          <AnimatedSpan delay={message.delay + (message.text.length * 50) + 500}>
            {renderButtons(message.buttons, index)}
          </AnimatedSpan>
        )}
      </div>
    );
  };

  return (
    <Terminal title="App Preview Converter">
      {isMounted && (
        <>
          {messages.map((message, index) => renderMessage(message, index))}
        </>
      )}
    </Terminal>
  );
} 