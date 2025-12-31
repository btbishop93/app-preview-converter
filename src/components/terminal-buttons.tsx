"use client";

import { AnimatedUploadButton } from "@/components/ui/animated-upload-button";
import { BMCButton } from "@/components/ui/bmc-button";
import { Button } from "@/components/ui/button";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { cn } from "@/lib/utils";
import type { Button as ButtonType } from "@/types/terminal";

interface TerminalButtonsProps {
  buttons: ButtonType[];
  isVisible: boolean;
  isUploading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileUpload: () => void;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onButtonClick: (button: ButtonType) => void;
}

export function TerminalButtons({
  buttons,
  isVisible,
  isUploading,
  fileInputRef,
  onFileUpload,
  onFileChange,
  onButtonClick,
}: TerminalButtonsProps) {
  return (
    <div className="flex items-center flex-wrap gap-2 mt-3">
      {buttons.map((button) => {
        if (button.action === "upload" && !isVisible) {
          return null;
        }

        if (button.action === "upload") {
          return (
            <div key={button.action} className="flex items-center">
              <input
                type="file"
                ref={fileInputRef}
                onChange={onFileChange}
                accept="video/*"
                className="hidden"
              />
              <AnimatedUploadButton
                uploadStatus={!isVisible}
                isUploading={isUploading}
                onUpload={onFileUpload}
                className="w-40"
              />
            </div>
          );
        }

        if (button.type === "bmc") {
          return (
            <BMCButton
              key={button.action}
              link="https://buymeacoffee.com/brendenbishop"
              className="w-36 cursor-pointer hover:drop-shadow-md hover:scale-105 transition-all duration-300"
            />
          );
        }

        if (button.type === "rainbow") {
          return (
            <RainbowButton
              key={button.action}
              onClick={() => onButtonClick(button)}
              className="w-fit"
            >
              {button.text}
            </RainbowButton>
          );
        }

        return (
          <Button
            key={button.action}
            variant={button.action === "restart" ? "outline" : "default"}
            className={cn(
              "w-fit",
              button.action === "restart" &&
                "border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100",
            )}
            onClick={() => onButtonClick(button)}
          >
            {button.text}
          </Button>
        );
      })}
    </div>
  );
}
