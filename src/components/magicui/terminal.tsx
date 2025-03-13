"use client";

import { cn } from "@/lib/utils";
import { motion, MotionProps } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { BorderBeam } from "@/components/magicui/border-beam";

interface AnimatedSpanProps extends MotionProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export const AnimatedSpan = ({
  children,
  delay = 0,
  className,
  ...props
}: AnimatedSpanProps) => (
  <motion.div
    initial={{ opacity: 0, y: -5 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: delay / 1000 }}
    className={cn("grid text-sm font-normal tracking-tight", className)}
    {...props}
  >
    {children}
  </motion.div>
);

interface TypingAnimationProps extends MotionProps {
  children: string;
  className?: string;
  duration?: number;
  delay?: number;
  as?: React.ElementType;
}

export const TypingAnimation = ({
  children,
  className,
  duration = 60,
  delay = 0,
  as: Component = "span",
  ...props
}: TypingAnimationProps) => {
  if (typeof children !== "string") {
    throw new Error("TypingAnimation: children must be a string. Received:");
  }

  const MotionComponent = motion.create(Component, {
    forwardMotionProps: true,
  });

  const [displayedText, setDisplayedText] = useState<string>("");
  const [started, setStarted] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const startTimeout = setTimeout(() => {
      setStarted(true);
    }, delay);
    return () => clearTimeout(startTimeout);
  }, [delay]);

  useEffect(() => {
    if (!started) return;

    let i = 0;
    const typingEffect = setInterval(() => {
      if (i < children.length) {
        setDisplayedText(children.substring(0, i + 1));
        i++;
      } else {
        clearInterval(typingEffect);
      }
    }, duration);

    return () => {
      clearInterval(typingEffect);
    };
  }, [children, duration, started]);

  return (
    <MotionComponent
      ref={elementRef}
      className={cn(
        "text-sm font-normal tracking-tight",
        className,
        "break-words w-full",
        children.type === 'prompt' && 'text-blue-500',
        children.type === 'info' && 'text-neutral-400',
        children.type === 'success' && 'text-green-500',
        children.type === 'error' && 'text-red-500'
      )}
      {...props}
    >
      {displayedText}
    </MotionComponent>
  );
};

interface TerminalProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export const Terminal = ({ children, className, title }: TerminalProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current;
      scrollElement.scrollTo({
        top: scrollElement.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  // Scroll on children changes
  useEffect(() => {
    scrollToBottom();
  }, [children]);

  // Set up an interval to check for content changes
  useEffect(() => {
    const interval = setInterval(scrollToBottom, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={cn(
        "relative isolate z-0 h-[75vh] w-full rounded-xl border border-border bg-transparent shadow-[0_8px_16px_rgb(0_0_0/0.08)] flex flex-col",
        className,
      )}
    >
      {/* Fixed Header */}
      <div className="flex-none border-b border-border p-4">
        <div className="relative flex flex-row items-center justify-center">
          <div className="absolute left-0 flex gap-x-2">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
          </div>
          <div className="text-sm font-normal tracking-tight">{title}</div>
        </div>
      </div>
      
      {/* Scrollable Content */}
      <div ref={scrollRef} className="flex-1 overflow-auto">
        <pre className="p-4">
          <code className="grid gap-y-1">{children}</code>
        </pre>
      </div>

      <BorderBeam
        duration={6}
        size={400}
        className="from-transparent via-red-500 to-transparent"
      />
      <BorderBeam
        duration={6}
        delay={3}
        size={400}
        className="from-transparent via-blue-500 to-transparent"
      />
    </div>
  );
};
