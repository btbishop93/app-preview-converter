export interface Button {
  text: string;
  action: string;
  type?: "rainbow" | "default" | "bmc";
  onAction?: (file?: File) => void;
}

export interface TerminalMessage {
  text: string;
  delay: number;
  type?: "info" | "prompt" | "success" | "error" | "buttons-container" | "button-inline";
  buttons?: Button[];
  action?: string;
  /** If true, renders instantly without typing animation and updates live */
  live?: boolean;
}
