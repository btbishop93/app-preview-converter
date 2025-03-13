"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface UploadButtonState {
  isVisible: boolean;
  isUploading: boolean;
  show: () => void;
  hide: () => void;
  setUploading: (uploading: boolean) => void;
}

const UploadButtonContext = createContext<UploadButtonState | undefined>(undefined);

export function UploadButtonProvider({ children }: { children: ReactNode }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const show = useCallback(() => setIsVisible(true), []);
  const hide = useCallback(() => setIsVisible(false), []);
  const setUploading = useCallback((uploading: boolean) => setIsUploading(uploading), []);

  const value = {
    isVisible,
    isUploading,
    show,
    hide,
    setUploading
  };

  return (
    <UploadButtonContext.Provider value={value}>
      {children}
    </UploadButtonContext.Provider>
  );
}

export const useUploadButtonState = () => {
  const context = useContext(UploadButtonContext);
  if (context === undefined) {
    throw new Error('useUploadButtonState must be used within a UploadButtonProvider');
  }
  return context;
}; 