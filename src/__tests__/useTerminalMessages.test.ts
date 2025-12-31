import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useTerminalMessages } from "@/hooks/useTerminalMessages";

describe("useTerminalMessages", () => {
  it("should initialize with empty messages", () => {
    const { result } = renderHook(() => useTerminalMessages());

    expect(result.current.messages).toEqual([]);
  });

  it("should add initial messages when initialized", () => {
    const { result } = renderHook(() => useTerminalMessages());

    act(() => {
      result.current.initializeMessages();
    });

    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[0].text).toContain("Welcome");
    expect(result.current.messages[0].type).toBe("info");
  });

  it("should add upload prompt with button", () => {
    const { result } = renderHook(() => useTerminalMessages());
    const mockCallback = () => {};

    act(() => {
      result.current.initializeMessages();
      result.current.addUploadPrompt(mockCallback);
    });

    expect(result.current.messages).toHaveLength(3);
    const uploadPrompt = result.current.messages[2];
    expect(uploadPrompt.type).toBe("prompt");
    expect(uploadPrompt.buttons).toBeDefined();
    expect(uploadPrompt.buttons?.[0].action).toBe("upload");
  });

  it("should add platform prompt with macOS and iOS options", () => {
    const { result } = renderHook(() => useTerminalMessages());

    act(() => {
      result.current.initializeMessages();
      result.current.addPlatformPrompt();
    });

    const platformPrompt = result.current.messages[2];
    expect(platformPrompt.type).toBe("prompt");
    expect(platformPrompt.buttons).toHaveLength(2);
    expect(platformPrompt.buttons?.[0].action).toBe("macos");
    expect(platformPrompt.buttons?.[1].action).toBe("ios");
  });

  it("should add platform success message for macOS", () => {
    const { result } = renderHook(() => useTerminalMessages());

    act(() => {
      result.current.addPlatformSuccessMessage("macOS");
    });

    expect(result.current.messages[0].type).toBe("success");
    expect(result.current.messages[0].text).toContain("macOS");
    expect(result.current.messages[0].text).toContain("1920×1080");
  });

  it("should add platform success message for iOS", () => {
    const { result } = renderHook(() => useTerminalMessages());

    act(() => {
      result.current.addPlatformSuccessMessage("iOS");
    });

    expect(result.current.messages[0].text).toContain("iOS");
    expect(result.current.messages[0].text).toContain("886×1920");
  });

  it("should add audio prompt with yes/no options", () => {
    const { result } = renderHook(() => useTerminalMessages());

    act(() => {
      result.current.addAudioPrompt();
    });

    // Audio prompt adds 3 messages: 2 info + 1 prompt
    expect(result.current.messages).toHaveLength(3);
    const audioPrompt = result.current.messages[2];
    expect(audioPrompt.type).toBe("prompt");
    expect(audioPrompt.buttons?.[0].action).toBe("audio-yes");
    expect(audioPrompt.buttons?.[1].action).toBe("audio-no");
  });

  it("should add error message with warning emoji", () => {
    const { result } = renderHook(() => useTerminalMessages());

    act(() => {
      result.current.addErrorMessage("Something went wrong");
    });

    expect(result.current.messages[0].type).toBe("error");
    expect(result.current.messages[0].text).toContain("⚠️");
    expect(result.current.messages[0].text).toContain("Something went wrong");
  });

  it("should add conversion complete message with download button", () => {
    const { result } = renderHook(() => useTerminalMessages());

    act(() => {
      result.current.addConversionCompleteMessage();
    });

    const completeMessage = result.current.messages[0];
    expect(completeMessage.type).toBe("success");
    expect(completeMessage.buttons).toBeDefined();

    const downloadButton = completeMessage.buttons?.find((b) => b.action === "download");
    expect(downloadButton).toBeDefined();
    expect(downloadButton?.type).toBe("rainbow");
  });

  it("should clear messages and show support message", () => {
    const { result } = renderHook(() => useTerminalMessages());

    act(() => {
      result.current.initializeMessages();
      result.current.addUploadPrompt(() => {});
      result.current.addSupportMessage();
    });

    // Support message replaces all messages
    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].text).toContain("done");
  });
});
