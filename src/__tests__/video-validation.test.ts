import { describe, expect, it } from "vitest";
import { VIDEO_CONSTRAINTS, validateVideoFile } from "@/lib/video-validation";

describe("validateVideoFile", () => {
  it("should accept .mp4 files", () => {
    const file = new File([""], "test.mp4", { type: "video/mp4" });
    const result = validateVideoFile(file);

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("should accept .MP4 files (case insensitive)", () => {
    const file = new File([""], "test.MP4", { type: "video/mp4" });
    const result = validateVideoFile(file);

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("should reject .mov files", () => {
    const file = new File([""], "test.mov", { type: "video/quicktime" });
    const result = validateVideoFile(file);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("File must be in .mp4 format");
  });

  it("should reject .avi files", () => {
    const file = new File([""], "test.avi", { type: "video/x-msvideo" });
    const result = validateVideoFile(file);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("File must be in .mp4 format");
  });

  it("should reject files without extensions", () => {
    const file = new File([""], "testvideo", { type: "video/mp4" });
    const result = validateVideoFile(file);

    expect(result.isValid).toBe(false);
  });
});

describe("VIDEO_CONSTRAINTS", () => {
  it("should have correct duration constraints", () => {
    expect(VIDEO_CONSTRAINTS.MIN_DURATION_SECONDS).toBe(15);
    expect(VIDEO_CONSTRAINTS.MAX_DURATION_SECONDS).toBe(30);
  });

  it("should only allow .mp4 extension", () => {
    expect(VIDEO_CONSTRAINTS.ALLOWED_EXTENSIONS).toEqual([".mp4"]);
  });
});
