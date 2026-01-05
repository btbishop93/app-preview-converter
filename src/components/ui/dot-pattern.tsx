"use client";

import type React from "react";
import { useId, useMemo } from "react";
import { cn } from "@/lib/utils";

const APPLE_COLORS = [
  "#61bb46", // green
  "#fdb827", // yellow
  "#f5821f", // orange
  "#e03a3e", // red
  "#963d97", // purple
  "#009ddc", // blue
];

interface DotPatternProps extends React.SVGProps<SVGSVGElement> {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  className?: string;
  glow?: boolean;
}

export function DotPattern({
  width = 32,
  height = 32,
  x = 0,
  y = 0,
  className,
  glow = false,
  ...props
}: DotPatternProps) {
  const id = useId();

  // Generate a grid of apples with deterministic colors based on position
  const appleSize = 10;
  const cols = Math.ceil(1920 / width);
  const rows = Math.ceil(1080 / height);

  // Create apple symbols with each color
  const appleSymbols = useMemo(() => {
    return APPLE_COLORS.map((color, i) => (
      <symbol key={color} id={`${id}-apple-${i}`} viewBox="0 0 16 16">
        {/* Stem */}
        <path
          d="M8 1.5 Q8.5 0.5 9.5 0.5"
          fill="none"
          stroke="#5D4037"
          strokeWidth="0.8"
          strokeLinecap="round"
        />
        {/* Leaf */}
        <ellipse cx="10" cy="1.5" rx="1.5" ry="0.8" fill="#4CAF50" transform="rotate(30 10 1.5)" />
        {/* Apple body */}
        <path
          d="M8 3 C5 3 3 5.5 3 8.5 C3 12 5.5 14.5 8 14.5 C10.5 14.5 13 12 13 8.5 C13 5.5 11 3 8 3"
          fill={color}
        />
        {/* Highlight */}
        <ellipse cx="5.5" cy="6.5" rx="1.2" ry="1.8" fill="white" fillOpacity="0.3" />
      </symbol>
    ));
  }, [id]);

  // Create a grid of apple uses with pseudo-random colors
  const apples = useMemo(() => {
    const result = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // Deterministic "random" color based on position
        const colorIndex = (col * 7 + row * 13) % APPLE_COLORS.length;
        result.push(
          <use
            key={`${row}-${col}`}
            href={`#${id}-apple-${colorIndex}`}
            x={col * width + (width - appleSize) / 2}
            y={row * height + (height - appleSize) / 2}
            width={appleSize}
            height={appleSize}
            opacity={0.4}
          />,
        );
      }
    }
    return result;
  }, [id, width, height, cols, rows, appleSize]);

  return (
    <svg
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full",
        glow && "animate-dot-glow",
        className,
      )}
      {...props}
    >
      <defs>{appleSymbols}</defs>
      {apples}
    </svg>
  );
}
