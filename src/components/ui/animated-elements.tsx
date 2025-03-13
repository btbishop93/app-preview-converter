"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export function ShimmerButton({ 
  children, 
  onClick,
  disabled = false,
  className = ""
}: { 
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`group relative overflow-hidden rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90 ${className}`}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-[1500ms] group-hover:translate-x-[100%]" />
      </div>
      <div className="relative">{children}</div>
    </button>
  );
}

export function SparkleText({ 
  children,
  className = ""
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={`relative inline-block ${className}`}>
      {[...Array(10)].map((_, i) => (
        <motion.span
          key={i}
          className="absolute h-[4px] w-[4px] rounded-full bg-yellow-300"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: 0,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            rotate: [0, 360],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: Math.random() * 5,
            repeatDelay: Math.random() * 5 + 3,
          }}
        />
      ))}
      {children}
    </span>
  );
}

export function TextReveal({ 
  children,
  className = "" 
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`overflow-hidden ${className}`}>
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </div>
  );
}

export function FadeInView({ 
  children, 
  delay = 0,
  className = ""
}: { 
  children: React.ReactNode; 
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export const AnimatedDivider = () => {
  return (
    <div className="py-4">
      <div className="relative flex items-center">
        <div className="flex-grow border-t border-muted"></div>
        <motion.div 
          className="mx-4 h-2 w-2 rounded-full bg-primary"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <div className="flex-grow border-t border-muted"></div>
      </div>
    </div>
  );
};

export function Confetti({ active }: { active: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-[10px] w-[10px]"
              initial={{
                top: "50%",
                left: "50%",
                opacity: 1,
              }}
              animate={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: 0,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 1.5,
                ease: "easeOut",
                delay: Math.random() * 0.2,
              }}
            >
              <div
                className="h-full w-full rounded-sm"
                style={{
                  backgroundColor: `hsl(${Math.random() * 360}deg, 100%, 75%)`,
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
              />
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
} 