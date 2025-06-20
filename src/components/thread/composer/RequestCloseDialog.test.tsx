import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { RequestCloseDialog } from "./RequestCloseDialog";

describe("RequestCloseDialog", () => {
  const mockOnOpenChange = vi.fn();
  const mockOnRequestClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render dialog when open is true", () => {
    render(
      <RequestCloseDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onRequestClose={mockOnRequestClose}
        isRequesting={false}
      />,
    );

    expect(screen.getByText("Request to close thread")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Are you sure you want to request to close this thread?",
      ),
    ).toBeInTheDocument();
  });

  it("should not render dialog when open is false", () => {
    render(
      <RequestCloseDialog
        open={false}
        onOpenChange={mockOnOpenChange}
        onRequestClose={mockOnRequestClose}
        isRequesting={false}
      />,
    );

    expect(
      screen.queryByText("Request to close thread"),
    ).not.toBeInTheDocument();
  });

  it("should call onRequestClose when confirm button is clicked", () => {
    render(
      <RequestCloseDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onRequestClose={mockOnRequestClose}
        isRequesting={false}
      />,
    );

    const confirmButton = screen.getByRole("button", {
      name: /make request to close/i,
    });
    fireEvent.click(confirmButton);

    expect(mockOnRequestClose).toHaveBeenCalledTimes(1);
  });

  it("should call onOpenChange when cancel button is clicked", () => {
    render(
      <RequestCloseDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onRequestClose={mockOnRequestClose}
        isRequesting={false}
      />,
    );

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it("should show loading state when isRequesting is true", () => {
    render(
      <RequestCloseDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onRequestClose={mockOnRequestClose}
        isRequesting={true}
      />,
    );

    // Find the confirm button (second button in the footer)
    const buttons = screen.getAllByRole("button");
    const confirmButton = buttons.find(
      (button) =>
        button.textContent !== "Cancel" && button.textContent !== "Close",
    );

    expect(confirmButton).toBeInTheDocument();
    expect(confirmButton).toBeDisabled();
    expect(confirmButton?.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("should not be disabled when isRequesting is false", () => {
    render(
      <RequestCloseDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onRequestClose={mockOnRequestClose}
        isRequesting={false}
      />,
    );

    const confirmButton = screen.getByRole("button", {
      name: /make request to close/i,
    });
    expect(confirmButton).not.toBeDisabled();
  });
});
