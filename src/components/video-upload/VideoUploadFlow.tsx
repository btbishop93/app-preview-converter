import { useEffect } from 'react';
import { useTerminalMessages } from '@/hooks/useTerminalMessages';
import TerminalContent from '@/components/terminal-content';

interface VideoUploadFlowProps {
  onFileSelected: (file: File) => void;
}

export default function VideoUploadFlow({ onFileSelected }: VideoUploadFlowProps) {
  const {
    messages,
    initializeMessages,
    addUploadPrompt,
    addSuccessMessage,
    addPlatformPrompt
  } = useTerminalMessages();

  useEffect(() => {
    initializeMessages();
    addUploadPrompt((file: File) => {
      // Process the file upload
      onFileSelected(file);
      // Show success message and platform selection
      addSuccessMessage(file.name);
      addPlatformPrompt();
    });
  }, []);

  return <TerminalContent 
    messages={messages} 
    onUploadComplete={() => {
      // This will be called after the file is successfully processed
      // We don't need to do anything here as the upload handler already adds the messages
    }}
  />;
} 