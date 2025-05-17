import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Threads from "./Threads";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("@/contexts/AuthContext", () => ({
  // No signed-in user required for these tests
  useAuth: () => ({ user: null }),
}));

vi.mock("@/services/threadService", () => ({
  getThreads: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/components/ThreadsList", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: () => <div data-testid="threads-list">ThreadsList</div>,
  };
});

vi.mock("@/components/ThreadsTable", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: () => <div data-testid="threads-table">ThreadsTable</div>,
  };
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("<Threads /> – DD-90 view switch", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("shows table view by default", () => {
    render(<Threads />);

    expect(screen.getByTestId("threads-table")).toBeInTheDocument();
    expect(screen.queryByTestId("threads-list")).not.toBeInTheDocument();
  });

  it("toggles to card view when the switch is clicked", async () => {
    const user = userEvent.setup();
    render(<Threads />);

    const switchEl = screen.getByRole("switch");
    await user.click(switchEl);

    expect(screen.getByTestId("threads-list")).toBeInTheDocument();
    expect(screen.queryByTestId("threads-table")).not.toBeInTheDocument();
  });
});
