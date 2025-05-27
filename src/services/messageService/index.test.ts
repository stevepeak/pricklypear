import { describe, it, expect } from "vitest";
import * as index from "./index";
import { getMessages } from "./get-messages";
import * as readReceipts from "./readReceipts";

describe("messageService index", () => {
  it("re-exports getMessages", () => {
    expect(index.getMessages).toBe(getMessages);
  });

  it("re-exports read receipt functions", () => {
    expect(index.createReadReceipts).toBe(readReceipts.createReadReceipts);
  });
});
