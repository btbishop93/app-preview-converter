"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

// biome-ignore lint/suspicious/noShadowRestrictedNames: Next.js requires this function name
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-neutral-950 p-8 text-center">
      <div className="mb-8 rounded-full bg-red-500/10 p-6">
        <AlertTriangle className="h-16 w-16 text-red-400" />
      </div>

      <h1 className="mb-4 text-2xl font-bold text-white">Something went wrong</h1>

      <p className="mb-6 max-w-md text-neutral-400 leading-relaxed">
        An unexpected error occurred. This might be a temporary issue. Please try again.
      </p>

      {process.env.NODE_ENV === "development" && error.message && (
        <div className="mb-6 max-w-lg rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-left">
          <p className="font-mono text-sm text-red-400">{error.message}</p>
        </div>
      )}

      <Button onClick={reset} className="gap-2 bg-neutral-800 hover:bg-neutral-700">
        <RefreshCw className="h-4 w-4" />
        Try Again
      </Button>
    </div>
  );
}
