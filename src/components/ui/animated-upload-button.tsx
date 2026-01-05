"use client";

import { Check, Loader2, Upload } from "lucide-react";
import { AnimatePresence, type HTMLMotionProps, motion } from "motion/react";
import React from "react";
import { cn } from "@/lib/utils";

interface AnimatedUploadButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  uploadStatus?: boolean;
  isUploading?: boolean;
  onUpload?: () => void;
  className?: string;
}

export const AnimatedUploadButton = React.forwardRef<HTMLButtonElement, AnimatedUploadButtonProps>(
  ({ uploadStatus = false, isUploading = false, onClick, onUpload, className, ...props }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!uploadStatus && !isUploading) {
        onUpload?.();
      }
      onClick?.(e);
    };

    return (
      <AnimatePresence mode="wait">
        {uploadStatus ? (
          <motion.button
            ref={ref}
            className={cn(
              "relative flex h-10 w-fit items-center justify-center overflow-hidden rounded-lg bg-[#61bb46] px-6 text-white",
              className,
            )}
            onClick={handleClick}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            {...props}
          >
            <motion.span
              key="success"
              className="relative flex h-full w-full items-center justify-center font-semibold"
              initial={{ y: -50 }}
              animate={{ y: 0 }}
            >
              <span className="inline-flex items-center">
                <Check className="mr-2 size-4" />
                Picked!
              </span>
            </motion.span>
          </motion.button>
        ) : isUploading ? (
          <motion.button
            ref={ref}
            className={cn(
              "relative flex h-10 w-fit cursor-wait items-center justify-center rounded-lg border-none bg-[#61bb46]/80 px-6 text-white",
              className,
            )}
            onClick={handleClick}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            disabled
            {...props}
          >
            <motion.span
              key="loading"
              className="relative flex items-center justify-center font-semibold"
            >
              <span className="inline-flex items-center">
                <Loader2 className="mr-2 size-4 animate-spin" />
                Picking...
              </span>
            </motion.span>
          </motion.button>
        ) : (
          <motion.button
            ref={ref}
            className={cn(
              "relative flex h-10 w-fit cursor-pointer items-center justify-center rounded-lg border-none bg-[#61bb46] hover:bg-[#4fa336] px-6 text-white transition-colors",
              className,
            )}
            onClick={handleClick}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            {...props}
          >
            <motion.span
              key="upload"
              className="relative flex items-center justify-center font-semibold"
              initial={{ x: 0 }}
              exit={{ x: 50, transition: { duration: 0.1 } }}
            >
              <span className="group inline-flex items-center">
                Pick Apple
                <Upload className="ml-2 size-4 transition-transform duration-300 group-hover:translate-y-[-2px]" />
              </span>
            </motion.span>
          </motion.button>
        )}
      </AnimatePresence>
    );
  },
);

AnimatedUploadButton.displayName = "AnimatedUploadButton";
