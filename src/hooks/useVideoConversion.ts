"use client";

import { useCallback, useRef, useState } from "react";

type Platform = "macOS" | "iOS";

interface ConversionOptions {
  platform: Platform;
  addSilentAudio: boolean;
}

interface ConversionResult {
  blob: Blob;
  filename: string;
}

const PLATFORM_RESOLUTIONS = {
  macOS: "1920:1080",
  iOS: "886:1920",
} as const;

// CDN URLs for ffmpeg core files (single-threaded - MT has issues in browser)
const CORE_URL = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd/ffmpeg-core.js";
const WASM_URL = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd/ffmpeg-core.wasm";

// Singleton state
let ffmpegInstance: any = null;
let isLoaded = false;
let loadPromise: Promise<boolean> | null = null;
let ffmpegUtils: { fetchFile: (file: File) => Promise<Uint8Array> } | null = null;

type ConversionStep = "idle" | "loading" | "scaling" | "audio" | "finalizing" | "complete";

export const useVideoConversion = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState<ConversionStep>("idle");
  const [error, setError] = useState<string | null>(null);

  const loadFFmpeg = useCallback(async (): Promise<boolean> => {
    if (isLoaded && ffmpegInstance) {
      return true;
    }

    if (loadPromise) {
      return loadPromise;
    }

    setIsLoading(true);
    setStep("loading");
    setError(null);

    loadPromise = (async () => {
      try {
        // Import the packages
        const { FFmpeg } = await import("@ffmpeg/ffmpeg");
        const { fetchFile, toBlobURL } = await import("@ffmpeg/util");
        
        ffmpegUtils = { fetchFile };
        ffmpegInstance = new FFmpeg();

        // Logging
        ffmpegInstance.on("log", ({ type, message }: { type: string; message: string }) => {
          console.log(`[FFmpeg ${type}]`, message);
        });

        // Progress tracking
        ffmpegInstance.on("progress", ({ progress: p }: { progress: number }) => {
          console.log(`[FFmpeg] Progress: ${Math.round(p * 100)}%`);
          setProgress(Math.round(p * 100));
        });

        console.log("[FFmpeg] Loading core from CDN...");
        // Convert CDN URLs to blob URLs for reliability
        const [coreURL, wasmURL] = await Promise.all([
          toBlobURL(CORE_URL, "text/javascript"),
          toBlobURL(WASM_URL, "application/wasm"),
        ]);

        // Load single-threaded core (MT has issues in browser environment)
        await ffmpegInstance.load({
          coreURL,
          wasmURL,
        });
        console.log("[FFmpeg] Core loaded successfully!");

        isLoaded = true;
        setIsLoading(false);
        return true;
      } catch (err) {
        console.error("[FFmpeg] Load error:", err);
        setError(err instanceof Error ? err.message : "Failed to load video processor");
        setIsLoading(false);
        loadPromise = null;
        return false;
      }
    })();

    return loadPromise;
  }, []);

  const convertVideo = useCallback(
    async (file: File, options: ConversionOptions): Promise<ConversionResult | null> => {
      if (!ffmpegInstance || !isLoaded || !ffmpegUtils) {
        setError("FFmpeg not loaded");
        return null;
      }

      setIsConverting(true);
      setProgress(0);
      setStep("scaling");
      setError(null);

      try {
        const { fetchFile } = ffmpegUtils;

        const inputName = "input.mp4";
        const scaledName = "scaled.mp4";
        const outputName = "output.mp4";

        console.log("[FFmpeg] Writing input file...");
        // Write input file
        await ffmpegInstance.writeFile(inputName, await fetchFile(file));
        console.log("[FFmpeg] Input file written, starting conversion...");

        const resolution = PLATFORM_RESOLUTIONS[options.platform];
        const scaleFilter = `scale=${resolution}:flags=lanczos,setsar=1`;

        if (options.addSilentAudio) {
          console.log("[FFmpeg] Step 1: Scaling video...");
          // Step 1: Scale video, remove audio (use ultrafast preset for speed)
          await ffmpegInstance.exec([
            "-i", inputName,
            "-vf", scaleFilter,
            "-preset", "ultrafast",
            "-an",
            scaledName,
          ]);

          console.log("[FFmpeg] Step 2: Adding silent audio...");
          setStep("audio");
          setProgress(0);
          // Step 2: Add silent audio + set framerate
          await ffmpegInstance.exec([
            "-f", "lavfi",
            "-i", "anullsrc=channel_layout=stereo:sample_rate=48000",
            "-i", scaledName,
            "-c:v", "copy",
            "-c:a", "aac",
            "-b:a", "128k",
            "-shortest",
            "-r", "30",
            outputName,
          ]);
        } else {
          console.log("[FFmpeg] Scaling video...");
          await ffmpegInstance.exec([
            "-i", inputName,
            "-vf", scaleFilter,
            "-preset", "ultrafast",
            "-r", "30",
            outputName,
          ]);
        }

        console.log("[FFmpeg] Reading output file...");
        setStep("finalizing");
        // Read output
        const data = await ffmpegInstance.readFile(outputName);
        console.log("[FFmpeg] Conversion complete!");
        setStep("complete");

        // Cleanup
        await ffmpegInstance.deleteFile(inputName);
        if (options.addSilentAudio) {
          await ffmpegInstance.deleteFile(scaledName);
        }
        await ffmpegInstance.deleteFile(outputName);

        // Create blob
        const uint8Data = data instanceof Uint8Array ? data : new Uint8Array(data);
        const blob = new Blob([uint8Data.slice()], { type: "video/mp4" });

        const filename = `${options.platform}_Preview${options.addSilentAudio ? "_with_silent_audio" : ""}.mp4`;

        setIsConverting(false);
        setProgress(100);

        return { blob, filename };
      } catch (err) {
        console.error("[FFmpeg] Conversion error:", err);
        setError(err instanceof Error ? err.message : "Conversion failed");
        setIsConverting(false);
        return null;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setProgress(0);
    setStep("idle");
    setError(null);
  }, []);

  return {
    loadFFmpeg,
    convertVideo,
    reset,
    isLoading,
    isConverting,
    progress,
    step,
    error,
  };
};
