export interface Button {
  text: string;
  action: string;
  type?: 'shimmer' | 'default';
  onAction?: (file?: File) => void;
}

export interface TerminalMessage {
  text: string;
  delay: number;
  type?: 'info' | 'prompt' | 'success' | 'error' | 'buttons-container' | 'button-inline';
  buttons?: Button[];
  action?: string;
} 