import { useState } from 'react';
import { TerminalMessage } from '@/types/terminal';

export const useTerminalMessages = () => {
  const [messages, setMessages] = useState<TerminalMessage[]>([]);

  const initializeMessages = () => {
    const initialMessages: TerminalMessage[] = [
      { text: "Welcome to App Preview Converter v1.0.0", delay: 0, type: "info" },
      { text: "This tool helps you convert videos for App Store submissions", delay: 2100, type: "info" },
    ];
    setMessages(initialMessages);
  };

  const addUploadPrompt = (onFileUpload: (file: File) => void) => {
    setMessages(prev => [...prev, {
      text: "Upload a video to begin:",
      type: "prompt",
      delay: 5200,
      buttons: [{
        text: "Upload",
        action: "upload",
        onAction: (file?: File) => {
          if (file) {
            onFileUpload(file);
          }
        }
      }]
    }]);
  };

  const addSuccessMessage = (fileName: string) => {
    setMessages(prev => [...prev, {
      text: `✓ ${fileName} uploaded successfully!`,
      delay: 0,
      type: "success"
    }]);
  };

  const addPlatformPrompt = () => {
    setMessages(prev => [...prev, {
      text: "Which platform are you targeting?",
      delay: 2800,
      type: "prompt",
      buttons: [
        { text: "macOS (1920×1080)", action: "macos" },
        { text: "iOS (886×1920)", action: "ios" },
      ]
    }]);
  };

  const addPlatformSuccessMessage = (platform: 'macOS' | 'iOS') => {
    const resolution = platform === 'macOS' ? '1920×1080' : '886×1920';
    setMessages(prev => [...prev, {
      text: `✓ Platform set to ${platform} (${resolution})`,
      delay: 300,
      type: "success"
    }]);
  };

  const addAudioPrompt = () => {
    setMessages(prev => [...prev, 
      { 
        text: "Unless you have specific audio, it is RECOMMENDED to add a silent audio track.", 
        delay: 2800, 
        type: "info" 
      },
      { 
        text: "Apple often rejects videos without proper audio tracks.", 
        delay: 7600, 
        type: "info" 
      },
      { 
        text: "Would you like to add a silent audio track?", 
        delay: 10400,
        type: "prompt",
        buttons: [
          { text: "Yes (Recommended)", action: "audio-yes" },
          { text: "No", action: "audio-no" }
        ]
      },
    ]);
  };

  const addAudioSuccessMessage = (addSilentAudio: boolean) => {
    setMessages(prev => [...prev, {
      text: addSilentAudio 
        ? "✓ Silent audio track will be added to your video"
        : "✓ No silent audio track will be added",
      delay: 300,
      type: "success"
    }]);
  };

  const addConversionStartMessage = () => {
    setMessages(prev => [...prev, {
      text: "Starting video conversion...",
      delay: 2700,
      type: "info"
    }]);
  };

  const addConversionCompleteMessage = () => {
    setMessages(prev => [...prev, {
      text: "Video is now ready for App Preview upload!",
      delay: 3500,
      type: "success",
      buttons: [
        { text: "Download", action: "download", type: "rainbow" },
        { text: "New Conversion", action: "restart" }
      ]
    }]);
  };

  const addSupportMessage = () => {
    setMessages([
      {
        text: "All done. Thank you & enjoy!",
        delay: 0,
        type: "info",
        buttons: [
          { text: "Buy me a coffee", action: "bmc", type: "bmc" },
          { text: "New Conversion", action: "restart" }
        ]
      }
    ]);
  };

  const addErrorMessage = (message: string) => {
    setMessages(prev => [...prev, {
      text: `⚠️ ${message}`,
      delay: 300,
      type: "error"
    }]);
  };

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
    setMessages
  };
}; 