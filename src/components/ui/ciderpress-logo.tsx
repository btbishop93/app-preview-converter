import { Apple } from "lucide-react";
import { cn } from "@/lib/utils";

interface CiderpressLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showText?: boolean;
}

const sizeMap = {
  sm: { icon: 20, press: 16, gap: 1, text: "text-sm" },
  md: { icon: 28, press: 22, gap: 1.5, text: "text-lg" },
  lg: { icon: 40, press: 32, gap: 2, text: "text-2xl" },
  xl: { icon: 56, press: 44, gap: 3, text: "text-3xl" },
};

function PressLines({ width, height, gap }: { width: number; height: number; gap: number }) {
  const lineStyle = { width: `${width}px`, height: `${height}px` };
  return (
    <div className="flex flex-col justify-center" style={{ gap: `${gap}px` }}>
      <div className="bg-amber-500 rounded-full" style={lineStyle} />
      <div className="bg-amber-500 rounded-full" style={lineStyle} />
      <div className="bg-amber-500 rounded-full" style={lineStyle} />
    </div>
  );
}

export function CiderpressLogo({ size = "md", className, showText = false }: CiderpressLogoProps) {
  const { icon, press, gap, text } = sizeMap[size];
  const lineWidth = press * 0.4;
  const lineHeight = press * 0.08;

  return (
    <div className={cn("flex items-center", showText && "gap-3", className)}>
      {/* Logo Mark */}
      <div className="relative flex items-center" style={{ gap: `${gap * 4}px` }}>
        {/* Left Press Lines */}
        <PressLines width={lineWidth} height={lineHeight} gap={gap} />

        {/* Apple Icon */}
        <div className="relative">
          <Apple size={icon} className="text-red-500 fill-red-500/20" strokeWidth={1.5} />
          {/* Juice Drop */}
          <div
            className="absolute left-1/2 -translate-x-1/2 bg-amber-400 rounded-full animate-pulse"
            style={{
              width: `${icon * 0.15}px`,
              height: `${icon * 0.2}px`,
              bottom: `${-icon * 0.15}px`,
            }}
          />
        </div>

        {/* Right Press Lines */}
        <PressLines width={lineWidth} height={lineHeight} gap={gap} />
      </div>

      {/* Wordmark */}
      {showText && (
        <span className={cn("font-mono font-bold tracking-tight text-white", text)}>
          Ciderpress
        </span>
      )}
    </div>
  );
}
