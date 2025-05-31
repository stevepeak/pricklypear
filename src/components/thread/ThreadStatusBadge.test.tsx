import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ThreadStatusBadge } from "./ThreadStatusBadge";
import type { Thread } from "@/types/thread";

const baseThread: Thread = {
  id: "1",
  title: "Test Thread",
  createdAt: new Date(),
  status: "Open",
  participants: ["Alice"],
  summary: "Summary",
  topic: "other",
  type: "default",
};

describe("ThreadStatusBadge", () => {
  it("renders AI chat badge", () => {
    render(<ThreadStatusBadge thread={{ ...baseThread, type: "ai_chat" }} />);
    expect(screen.getByText("AI Chat")).toBeTruthy();
  });

  it("renders Support badge", () => {
    render(
      <ThreadStatusBadge
        thread={{ ...baseThread, type: "customer_support" }}
      />,
    );
    expect(screen.getByText("Support")).toBeTruthy();
  });

  it("renders Open badge", () => {
    render(<ThreadStatusBadge thread={{ ...baseThread, status: "Open" }} />);
    expect(screen.getByText("Open")).toBeTruthy();
  });

  it("renders Closed badge", () => {
    render(<ThreadStatusBadge thread={{ ...baseThread, status: "Closed" }} />);
    expect(screen.getByText("Closed")).toBeTruthy();
  });

  it("renders Archived badge", () => {
    render(
      <ThreadStatusBadge thread={{ ...baseThread, status: "Archived" }} />,
    );
    expect(screen.getByText("Archived")).toBeTruthy();
  });
});
