import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { TerminalButtons } from "@/components/terminal-buttons";
import type { Button as ButtonType } from "@/types/terminal";

// Mock the upload button provider
vi.mock("@/hooks/useUploadButtonState", () => ({
  useUploadButtonState: () => ({
    isVisible: true,
    isUploading: false,
    show: vi.fn(),
    hide: vi.fn(),
    setUploading: vi.fn(),
  }),
}));

describe("TerminalButtons", () => {
  const defaultProps = {
    isVisible: true,
    isUploading: false,
    fileInputRef: createRef<HTMLInputElement>(),
    onFileUpload: vi.fn(),
    onFileChange: vi.fn(),
    onButtonClick: vi.fn(),
  };

  it("should render default buttons", () => {
    const buttons: ButtonType[] = [
      { text: "Button 1", action: "action1" },
      { text: "Button 2", action: "action2" },
    ];

    render(<TerminalButtons {...defaultProps} buttons={buttons} />);

    expect(screen.getByText("Button 1")).toBeInTheDocument();
    expect(screen.getByText("Button 2")).toBeInTheDocument();
  });

  it("should call onButtonClick when button is clicked", () => {
    const onButtonClick = vi.fn();
    const buttons: ButtonType[] = [{ text: "Click Me", action: "test-action" }];

    render(<TerminalButtons {...defaultProps} buttons={buttons} onButtonClick={onButtonClick} />);

    fireEvent.click(screen.getByText("Click Me"));
    expect(onButtonClick).toHaveBeenCalledWith(expect.objectContaining({ action: "test-action" }));
  });

  it("should render rainbow button when type is rainbow", () => {
    const buttons: ButtonType[] = [{ text: "Rainbow", action: "download", type: "rainbow" }];

    render(<TerminalButtons {...defaultProps} buttons={buttons} />);

    const button = screen.getByText("Rainbow");
    expect(button).toBeInTheDocument();
  });

  it("should render restart button with outline variant", () => {
    const buttons: ButtonType[] = [{ text: "Restart", action: "restart" }];

    render(<TerminalButtons {...defaultProps} buttons={buttons} />);

    expect(screen.getByText("Restart")).toBeInTheDocument();
  });

  it("should hide upload button when not visible", () => {
    const buttons: ButtonType[] = [{ text: "Upload", action: "upload" }];

    render(<TerminalButtons {...defaultProps} buttons={buttons} isVisible={false} />);

    // The upload button container should not render when not visible
    expect(screen.queryByText("Upload")).not.toBeInTheDocument();
  });
});
