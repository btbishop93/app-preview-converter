import { useEffect, useState, useCallback } from 'react';
import { useTerminalMessages } from '@/hooks/useTerminalMessages';
import TerminalContent from '@/components/terminal-content';
import { TerminalMessage } from '@/types/terminal';
import { useUploadButtonState } from '@/hooks/useUploadButtonState';

interface VideoConvertFlowProps {
  onFileSelected: (file: File) => void;
  onPlatformSelected: (platform: 'macOS' | 'iOS') => void;
  onAudioSelected: (addSilentAudio: boolean) => void;
  onConversionComplete?: () => void;
}

export default function VideoConvertFlow({ 
  onFileSelected, 
  onPlatformSelected,
  onAudioSelected,
  onConversionComplete 
}: VideoConvertFlowProps) {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<'macOS' | 'iOS'>('macOS');
  const [addSilentAudio, setAddSilentAudio] = useState(true);
  const [convertedVideoUrl, setConvertedVideoUrl] = useState<string | null>(null);
  const [uploadKey, setUploadKey] = useState(0);
  const { show, hide } = useUploadButtonState();

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
    setMessages
  } = useTerminalMessages();

  const updateMessage = useCallback((message: string, type: 'success' | 'error') => {
    setMessages(currentMessages => {
      // Find the upload prompt index
      const uploadPromptIndex = currentMessages.findIndex(msg => msg.type === 'prompt');
      if (uploadPromptIndex === -1) return currentMessages;

      // Keep all messages before the upload prompt
      const baseMessages = currentMessages.slice(0, uploadPromptIndex + 1);

      // Create new message
      const newMessage: TerminalMessage = {
        text: type === 'success' ? `✓ ${message}` : `⚠️ ${message}`,
        delay: 300,
        type: type
      };

      return [...baseMessages, newMessage];
    });
  }, [setMessages]);

  const validateVideo = async (file: File): Promise<{ isValid: boolean; errors: string[] }> => {
    const errors: string[] = [];
    
    // Check file type
    if (!file.name.toLowerCase().endsWith('.mp4')) {
      errors.push('File must be in .mp4 format');
    }

    // Check video duration
    try {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      const duration = await new Promise<number>((resolve) => {
        video.onloadedmetadata = () => resolve(video.duration);
        video.src = URL.createObjectURL(file);
      });

      if (duration < 15) {
        errors.push('Video must be at least 15 seconds long');
      } else if (duration > 30) {
        errors.push('Video must not exceed 30 seconds');
      }

      URL.revokeObjectURL(video.src);
    } catch (error) {
      console.error('Error checking video duration:', error);
      errors.push('Unable to verify video duration');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  // This effect needs to run only when uploadKey changes 
  // to avoid infinite re-render loops
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    initializeMessages();
    show(); // Show upload button when component mounts
    addUploadPrompt(async (file: File) => {
      const validation = await validateVideo(file);
      
      if (validation.isValid) {
        hide(); // Hide upload button on success
        setVideoFile(file);
        onFileSelected(file);
        updateMessage(`${file.name} uploaded successfully!`, 'success');
        addPlatformPrompt();
      } else {
        const errorMessage = validation.errors.join(' and ');
        updateMessage(errorMessage, 'error');
      }
    });
  }, [uploadKey]);
  /* eslint-enable react-hooks/exhaustive-deps */

  const handlePlatformSelection = (action: string) => {
    if (action === 'macos' || action === 'ios') {
      const platform = action === 'macos' ? 'macOS' : 'iOS';
      setSelectedPlatform(platform);
      onPlatformSelected(platform);
      addPlatformSuccessMessage(platform);
      addAudioPrompt();
    }
  };

  const handleAudioSelection = async (action: string) => {
    if (action === 'audio-yes' || action === 'audio-no') {
      const shouldAddAudio = action === 'audio-yes';
      setAddSilentAudio(shouldAddAudio);
      onAudioSelected(shouldAddAudio);
      addAudioSuccessMessage(shouldAddAudio);
      
      // Start conversion process
      await handleConversion();
    }
  };

  const handleConversion = async () => {
    if (!videoFile) return;

    addConversionStartMessage();

    try {
      const formData = new FormData();
      formData.append('video', videoFile);
      formData.append('platform', selectedPlatform);
      formData.append('addSilentAudio', addSilentAudio.toString());

      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Conversion failed');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setConvertedVideoUrl(url);
      addConversionCompleteMessage();
      
      // Wait for the message animation to complete before triggering confetti
      setTimeout(() => {
        onConversionComplete?.();
      }, 5950); // Wait for initial delay (3500ms) + typing duration (1950ms) + buffer (500ms)
    } catch (error) {
      console.error('Conversion error:', error);
      // Handle error if needed
    }
  };

  const handleDownload = () => {
    if (!convertedVideoUrl) return;
    
    const a = document.createElement('a');
    a.href = convertedVideoUrl;
    a.download = `${selectedPlatform}_Preview${addSilentAudio ? '_with_silent_audio' : ''}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // After download, show the support button
    addSupportMessage();
  };

  const handleButtonClick = (action: string) => {
    if (action === 'bmc') {
      window.open('https://buymeacoffee.com/brendenbishop', '_blank');
    }
  };

  const handleRestart = () => {
    setVideoFile(null);
    setSelectedPlatform('macOS');
    setAddSilentAudio(true);
    setConvertedVideoUrl(null);
    setUploadKey(prev => prev + 1);
    // The rest will be handled by the useEffect when uploadKey changes
  };

  return (
    <TerminalContent 
      messages={messages} 
      onButtonClick={(action: string) => {
        handlePlatformSelection(action);
        handleAudioSelection(action);
        if (action === 'download') handleDownload();
        if (action === 'restart') handleRestart();
        if (action === 'bmc') handleButtonClick(action);
      }}
      resetUploadState={() => setUploadKey(prev => prev + 1)}
    />
  );
} 