export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const VIDEO_CONSTRAINTS = {
  MIN_DURATION_SECONDS: 15,
  MAX_DURATION_SECONDS: 30,
  ALLOWED_EXTENSIONS: [".mp4"] as readonly string[],
} as const;

export function validateVideoFile(file: File): ValidationResult {
  const errors: string[] = [];

  // Check file extension
  const extension = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
  if (!VIDEO_CONSTRAINTS.ALLOWED_EXTENSIONS.includes(extension)) {
    errors.push("File must be in .mp4 format");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export async function validateVideoDuration(file: File): Promise<ValidationResult> {
  const errors: string[] = [];

  try {
    const video = document.createElement("video");
    video.preload = "metadata";

    const duration = await new Promise<number>((resolve, reject) => {
      video.onloadedmetadata = () => resolve(video.duration);
      video.onerror = () => reject(new Error("Failed to load video metadata"));
      video.src = URL.createObjectURL(file);
    });

    URL.revokeObjectURL(video.src);

    if (duration < VIDEO_CONSTRAINTS.MIN_DURATION_SECONDS) {
      errors.push(`Video must be at least ${VIDEO_CONSTRAINTS.MIN_DURATION_SECONDS} seconds long`);
    } else if (duration > VIDEO_CONSTRAINTS.MAX_DURATION_SECONDS) {
      errors.push(`Video must not exceed ${VIDEO_CONSTRAINTS.MAX_DURATION_SECONDS} seconds`);
    }
  } catch {
    errors.push("Unable to verify video duration");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export async function validateVideo(file: File): Promise<ValidationResult> {
  const fileValidation = validateVideoFile(file);
  if (!fileValidation.isValid) {
    return fileValidation;
  }

  const durationValidation = await validateVideoDuration(file);
  return durationValidation;
}
