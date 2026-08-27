import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "../page";

describe("HomePage", () => {
  it("renders brand heading and phase indicator", () => {
    render(<HomePage />);

    expect(screen.getByText("CiviLens")).toBeDefined();
    expect(screen.getByText("Phase 0 Foundation")).toBeDefined();
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /making local environmental issues visible/i,
      })
    ).toBeDefined();
  });
});
