import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MemoryRouter } from "react-router-dom";
import React from "react";
import Game from "./Game";

describe("Game page", () => {
  it("renders canvas", () => {
    render(<Game />, { wrapper: MemoryRouter });
    expect(screen.getByTestId("game-canvas")).toBeTruthy();
  });
});
