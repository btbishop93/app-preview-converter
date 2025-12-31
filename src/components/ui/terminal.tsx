"use client";

import { type MotionProps, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { BorderBeam } from "@/components/ui/border-beam";
import { CiderpressLogo } from "@/components/ui/ciderpress-logo";
import { cn } from "@/lib/utils";

// Animation timing constants
const TYPING_SPEED_MS = 12; // Characters per millisecond target
const BUTTON_APPEAR_DELAY_MS = 50;
const SCROLL_THROTTLE_MS = 150;

interface AnimatedSpanProps extends MotionProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export const AnimatedSpan = ({ children, delay = 0, className, ...props }: AnimatedSpanProps) => (
  <motion.div
    initial={{ opacity: 0, y: -5 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.2, delay: delay / 1000 }}
    className={cn("grid text-sm font-normal tracking-tight", className)}
    {...props}
  >
    {children}
  </motion.div>
);

type MessageType = "prompt" | "info" | "success" | "error";

interface TypingAnimationProps {
  children: string;
  messageType?: MessageType;
  className?: string;
  duration?: number;
  delay?: number;
  onComplete?: () => void;
}

export const TypingAnimation = ({
  children,
  messageType,
  className,
  duration = TYPING_SPEED_MS,
  delay = 0,
  onComplete,
}: TypingAnimationProps) => {
  if (typeof children !== "string") {
    throw new Error("TypingAnimation: children must be a string");
  }

  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const textRef = useRef<HTMLSpanElement | null>(null);
  const cursorRef = useRef<HTMLSpanElement | null>(null);

  // Use ref for onComplete to avoid restarting effect when callback changes
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Allow skipping animation on click
  const skipAnimation = useCallback(() => {
    if (!completed && textRef.current) {
      textRef.current.textContent = children;
      if (cursorRef.current) {
        cursorRef.current.style.display = "none";
      }
      setCompleted(true);
      onCompleteRef.current?.();
    }
  }, [children, completed]);

  useEffect(() => {
    const startTimeout = setTimeout(() => {
      setStarted(true);
    }, delay);
    return () => clearTimeout(startTimeout);
  }, [delay]);

  // Use requestAnimationFrame for smooth typing
  useEffect(() => {
    if (!started || completed) return;

    let charIndex = 0;
    let lastTime = 0;
    let rafId: number;

    const animate = (currentTime: number) => {
      if (!lastTime) lastTime = currentTime;
      const elapsed = currentTime - lastTime;

      // Calculate how many characters to add based on elapsed time
      const charsToAdd = Math.floor(elapsed / duration);

      if (charsToAdd > 0) {
        charIndex = Math.min(charIndex + charsToAdd, children.length);
        lastTime = currentTime;

        if (textRef.current) {
          textRef.current.textContent = children.substring(0, charIndex);
        }
      }

      if (charIndex < children.length) {
        rafId = requestAnimationFrame(animate);
      } else {
        if (cursorRef.current) {
          cursorRef.current.style.display = "none";
        }
        setCompleted(true);
        onCompleteRef.current?.();
      }
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [children, duration, started, completed]);

  return (
    <span
      role="button"
      tabIndex={0}
      onClick={skipAnimation}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") skipAnimation();
      }}
      className={cn(
        "text-sm font-mono tracking-tight cursor-pointer",
        className,
        "break-words w-full",
        messageType === "prompt" && "text-cyan-400",
        messageType === "info" && "text-neutral-400",
        messageType === "success" && "text-emerald-400",
        messageType === "error" && "text-red-400",
      )}
    >
      <span ref={textRef}></span>
      <span
        ref={cursorRef}
        className="animate-pulse text-neutral-500"
        style={{ display: started && !completed ? "inline" : "none" }}
      >
        ▊
      </span>
    </span>
  );
};

// Export timing constants for use in other components
export const TERMINAL_TIMING = {
  TYPING_SPEED_MS,
  BUTTON_APPEAR_DELAY_MS,
  getTypingDuration: (text: string) => text.length * TYPING_SPEED_MS,
};

interface TerminalProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export const Terminal = ({ children, className, title }: TerminalProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLElement>(null);
  const lastScrollTime = useRef(0);
  const pendingScroll = useRef(false);

  // Throttled scroll function
  const scrollToBottom = useCallback(() => {
    const now = Date.now();
    const timeSinceLastScroll = now - lastScrollTime.current;

    if (timeSinceLastScroll >= SCROLL_THROTTLE_MS) {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
      lastScrollTime.current = now;
      pendingScroll.current = false;
    } else if (!pendingScroll.current) {
      pendingScroll.current = true;
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: "smooth",
          });
        }
        lastScrollTime.current = Date.now();
        pendingScroll.current = false;
      }, SCROLL_THROTTLE_MS - timeSinceLastScroll);
    }
  }, []);

  // Scroll when children change
  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  // Use MutationObserver to detect DOM changes (typing animation updates)
  useEffect(() => {
    const contentElement = contentRef.current;
    if (!contentElement) return;

    const observer = new MutationObserver(() => {
      scrollToBottom();
    });

    observer.observe(contentElement, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, [scrollToBottom]);

  return (
    <div
      className={cn(
        "relative isolate z-0 h-[75vh] w-full rounded-xl border border-neutral-800 bg-neutral-950 shadow-2xl flex flex-col",
        className,
      )}
    >
      {/* Fixed Header */}
      <div className="flex-none border-b border-neutral-800 p-4">
        <div className="relative flex flex-row items-center justify-center">
          <div className="absolute left-0 flex gap-x-2">
            <div className="h-3 w-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500 transition-colors"></div>
            <div className="h-3 w-3 rounded-full bg-green-500/80 hover:bg-green-500 transition-colors"></div>
          </div>
          {title ? (
            <div className="text-sm font-mono text-neutral-300 tracking-tight">{title}</div>
          ) : (
            <CiderpressLogo size="sm" showText />
          )}
        </div>
      </div>

      {/* Scrollable Content */}
      <div ref={scrollRef} className="flex-1 overflow-auto">
        <pre className="p-4">
          <code ref={contentRef} className="grid gap-y-2">
            {children}
          </code>
        </pre>
      </div>

      <BorderBeam
        duration={6}
        size={400}
        className="from-transparent via-cyan-500/50 to-transparent"
      />
      <BorderBeam
        duration={6}
        delay={3}
        size={400}
        className="from-transparent via-purple-500/50 to-transparent"
      />
    </div>
  );
};
