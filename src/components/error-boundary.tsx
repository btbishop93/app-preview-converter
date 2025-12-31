"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-neutral-950 p-8 text-center">
          <div className="mb-8 rounded-full bg-red-500/10 p-6">
            <AlertTriangle className="h-16 w-16 text-red-400" />
          </div>

          <h1 className="mb-4 text-2xl font-bold text-white">Something went wrong</h1>

          <p className="mb-6 max-w-md text-neutral-400 leading-relaxed">
            An unexpected error occurred. This might be a temporary issue. Please try refreshing the
            page.
          </p>

          {process.env.NODE_ENV === "development" && this.state.error && (
            <div className="mb-6 max-w-lg rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-left">
              <p className="font-mono text-sm text-red-400">{this.state.error.message}</p>
            </div>
          )}

          <Button onClick={this.handleReset} className="gap-2 bg-neutral-800 hover:bg-neutral-700">
            <RefreshCw className="h-4 w-4" />
            Refresh Page
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Simpler error display for non-critical errors
export function ErrorMessage({
  title,
  message,
  onRetry,
}: {
  title?: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" />
        <div className="flex-1">
          {title && <h3 className="mb-1 font-medium text-red-400">{title}</h3>}
          <p className="text-sm text-red-300/80">{message}</p>
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="ghost"
              size="sm"
              className="mt-3 text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              Try again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
