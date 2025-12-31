import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ErrorBoundary, ErrorMessage } from "@/components/error-boundary";

// Suppress console.error during tests
beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("ErrorBoundary", () => {
  it("should render children when there is no error", () => {
    render(
      <ErrorBoundary>
        <div data-testid="child">Child content</div>
      </ErrorBoundary>,
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("should render fallback when provided and error occurs", () => {
    const ThrowingComponent = () => {
      throw new Error("Test error");
    };

    render(
      <ErrorBoundary fallback={<div data-testid="fallback">Fallback UI</div>}>
        <ThrowingComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByTestId("fallback")).toBeInTheDocument();
  });

  it("should render default error UI when error occurs and no fallback", () => {
    const ThrowingComponent = () => {
      throw new Error("Test error");
    };

    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Refresh Page")).toBeInTheDocument();
  });
});

describe("ErrorMessage", () => {
  it("should render error message with title", () => {
    render(<ErrorMessage title="Error Title" message="Error description" />);

    expect(screen.getByText("Error Title")).toBeInTheDocument();
    expect(screen.getByText("Error description")).toBeInTheDocument();
  });

  it("should render error message without title", () => {
    render(<ErrorMessage message="Just a message" />);

    expect(screen.getByText("Just a message")).toBeInTheDocument();
  });

  it("should render retry button when onRetry is provided", () => {
    const onRetry = vi.fn();
    render(<ErrorMessage message="Error" onRetry={onRetry} />);

    const retryButton = screen.getByText("Try again");
    expect(retryButton).toBeInTheDocument();

    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("should not render retry button when onRetry is not provided", () => {
    render(<ErrorMessage message="Error" />);

    expect(screen.queryByText("Try again")).not.toBeInTheDocument();
  });
});
