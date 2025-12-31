import { execFile } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import util from "node:util";
import { type NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

const execFileAsync = util.promisify(execFile);

// Constants
const MAX_FILE_SIZE_MB = 500;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const PLATFORM_RESOLUTIONS = {
  macOS: "1920:1080",
  iOS: "886:1920",
} as const;

type Platform = keyof typeof PLATFORM_RESOLUTIONS;

// Check if ffmpeg is available
async function checkFfmpegAvailable(): Promise<boolean> {
  try {
    await execFileAsync("ffmpeg", ["-version"]);
    return true;
  } catch {
    return false;
  }
}

// Clean up temporary files
async function cleanupFiles(...filePaths: string[]): Promise<void> {
  for (const filePath of filePaths) {
    try {
      await fs.access(filePath);
      await fs.unlink(filePath);
    } catch {
      // File doesn't exist or can't be deleted - ignore
    }
  }
}

export async function POST(request: NextRequest) {
  // Check ffmpeg availability first
  const ffmpegAvailable = await checkFfmpegAvailable();
  if (!ffmpegAvailable) {
    return NextResponse.json(
      {
        error: "FFmpeg is not installed on the server",
        details: "Video conversion requires FFmpeg to be installed",
      },
      { status: 503 },
    );
  }

  try {
    if (!request.formData) {
      return NextResponse.json({ error: "FormData not supported" }, { status: 400 });
    }

    const formData = await request.formData();
    const videoFile = formData.get("video") as File;
    const platform = (formData.get("platform") as Platform) || "macOS";
    const addSilentAudio = formData.get("addSilentAudio") === "true";

    // Validation
    if (!videoFile) {
      return NextResponse.json({ error: "No video file provided" }, { status: 400 });
    }

    if (videoFile.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          error: `File too large`,
          details: `Maximum file size is ${MAX_FILE_SIZE_MB}MB`,
        },
        { status: 400 },
      );
    }

    if (!["macOS", "iOS"].includes(platform)) {
      return NextResponse.json(
        { error: "Invalid platform", details: "Must be macOS or iOS" },
        { status: 400 },
      );
    }

    // Create temporary file paths
    const tempDir = os.tmpdir();
    const uniqueId = uuidv4();
    const inputPath = path.join(tempDir, `input-${uniqueId}.mp4`);
    const tempOutputPath = path.join(tempDir, `temp-${uniqueId}.mp4`);
    const outputPath = path.join(tempDir, `output-${uniqueId}.mp4`);
    const finalPath = path.join(tempDir, `final-${uniqueId}.mp4`);

    try {
      // Save the uploaded file to disk
      const videoBuffer = Buffer.from(await videoFile.arrayBuffer());
      await fs.writeFile(inputPath, videoBuffer);

      const resolution = PLATFORM_RESOLUTIONS[platform];
      const scaleFilter = `scale=${resolution}:flags=lanczos,setsar=1`;

      if (addSilentAudio) {
        // Convert video without audio first
        await execFileAsync("ffmpeg", [
          "-y",
          "-i",
          inputPath,
          "-vf",
          scaleFilter,
          "-an",
          tempOutputPath,
        ]);

        // Add silent audio track
        await execFileAsync("ffmpeg", [
          "-y",
          "-f",
          "lavfi",
          "-i",
          "anullsrc=channel_layout=stereo:sample_rate=48000",
          "-i",
          tempOutputPath,
          "-c:v",
          "copy",
          "-c:a",
          "aac",
          "-b:a",
          "128k",
          "-shortest",
          outputPath,
        ]);
      } else {
        // Just convert video
        await execFileAsync("ffmpeg", ["-y", "-i", inputPath, "-vf", scaleFilter, outputPath]);
      }

      // Convert to 30fps (Apple requirement)
      await execFileAsync("ffmpeg", ["-y", "-i", outputPath, "-r", "30", finalPath]);

      // Move final to output path
      await fs.rename(finalPath, outputPath);

      // Read the output file
      const outputBuffer = await fs.readFile(outputPath);

      // Generate filename
      const filename = `${platform}_Preview${addSilentAudio ? "_with_silent_audio" : ""}.mp4`;

      return new NextResponse(outputBuffer, {
        headers: {
          "Content-Type": "video/mp4",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    } finally {
      // Clean up all temporary files
      await cleanupFiles(inputPath, tempOutputPath, outputPath, finalPath);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        error: "Video conversion failed",
        details:
          process.env.NODE_ENV === "development"
            ? errorMessage
            : "Please try again or use a different video file",
      },
      { status: 500 },
    );
  }
}
