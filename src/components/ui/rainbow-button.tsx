import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface RainbowButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

export const RainbowButton = ({ className, children, ...props }: RainbowButtonProps) => {
  return (
    <button
      className={cn(
        "group relative inline-flex h-9 animate-rainbow cursor-pointer items-center justify-center rounded-xl border-0 bg-[length:200%] px-8 py-2 font-medium text-primary-foreground transition-colors [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.08*1rem)_solid_transparent] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        // before styles - Apple 6-color gradient glow
        "before:absolute before:bottom-[-20%] before:left-1/2 before:z-0 before:h-1/5 before:w-3/5 before:-translate-x-1/2 before:animate-rainbow before:bg-[linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-2)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-5)),hsl(var(--color-6)))] before:[filter:blur(calc(0.8*1rem))]",
        // light mode colors - Apple 6-color rainbow
        "bg-[linear-gradient(#1c1c1e,#1c1c1e),linear-gradient(#1c1c1e_50%,rgba(28,28,30,0.6)_80%,rgba(28,28,30,0)),linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-2)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-5)),hsl(var(--color-6)))]",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
};

RainbowButton.displayName = "RainbowButton";
