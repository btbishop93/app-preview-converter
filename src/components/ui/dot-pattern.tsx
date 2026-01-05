"use client";

import { Apple } from "lucide-react";
import { cn } from "@/lib/utils";

const APPLE_COLORS = [
  "#61bb46", // green
  "#fdb827", // yellow
  "#f5821f", // orange
  "#e03a3e", // red
  "#963d97", // purple
  "#009ddc", // blue
];

interface DotPatternProps {
  width?: number;
  height?: number;
  className?: string;
  glow?: boolean;
}

export function DotPattern({
  width = 48,
  height = 48,
  className,
  glow = false,
}: DotPatternProps) {
  // Calculate grid dimensions based on a reasonable viewport
  const cols = Math.ceil(1920 / width);
  const rows = Math.ceil(1080 / height);

  // Create a grid of apples with deterministic colors
  const apples = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Deterministic "random" color based on position
      const colorIndex = (col * 7 + row * 13) % APPLE_COLORS.length;
      const color = APPLE_COLORS[colorIndex];

      apples.push(
        <div
          key={`${row}-${col}`}
          className="absolute"
          style={{
            left: col * width + width / 2 - 6,
            top: row * height + height / 2 - 6,
          }}
        >
          <Apple size={12} color={color} strokeWidth={1.5} style={{ opacity: 0.35 }} />
        </div>,
      );
    }
  }

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        glow && "animate-dot-glow",
        className,
      )}
    >
      {apples}
    </div>
  );
}
