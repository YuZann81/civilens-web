import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ResetPasswordPage from "../reset-password/page";
import * as apiClient from "@/lib/api/client";
import { ApiError } from "@/lib/api/types";

const mockPush = vi.fn();
let mockSearchParams = new URLSearchParams("token=valid-token-123&email=user%40example.com");

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
  }),
  useSearchParams: () => mockSearchParams,
}));

describe("ResetPasswordPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams("token=valid-token-123&email=user%40example.com");
  });

  it("renders reset password form with prefilled email from searchParams", () => {
    render(<ResetPasswordPage />);

    expect(screen.getByText("Atur Ulang Kata Sandi")).toBeDefined();
    expect(screen.getByLabelText("Alamat Email")).toBeDefined();
    expect(screen.getByLabelText("Kata Sandi Baru")).toBeDefined();
    expect(screen.getByLabelText("Konfirmasi Kata Sandi Baru")).toBeDefined();
    expect(screen.getByRole("button", { name: "Perbarui Kata Sandi" })).toBeDefined();

    const emailInput = screen.getByLabelText("Alamat Email") as HTMLInputElement;
    expect(emailInput.value).toBe("user@example.com");
  });

  it("toggles password visibility on new password and confirm password inputs", () => {
    render(<ResetPasswordPage />);

    const passwordInput = screen.getByLabelText("Kata Sandi Baru") as HTMLInputElement;
    const confirmInput = screen.getByLabelText("Konfirmasi Kata Sandi Baru") as HTMLInputElement;

    expect(passwordInput.type).toBe("password");
    expect(confirmInput.type).toBe("password");

    const toggleButtons = screen.getAllByRole("button", { name: /tampilkan sandi/i });
    expect(toggleButtons.length).toBe(2);

    // Toggle new password
    fireEvent.click(toggleButtons[0]);
    expect(passwordInput.type).toBe("text");

    // Toggle confirm password
    fireEvent.click(toggleButtons[1]);
    expect(confirmInput.type).toBe("text");
  });

  it("validates password matching on submit", async () => {
    render(<ResetPasswordPage />);

    const passwordInput = screen.getByLabelText("Kata Sandi Baru");
    const confirmInput = screen.getByLabelText("Konfirmasi Kata Sandi Baru");
    const submitBtn = screen.getByRole("button", { name: "Perbarui Kata Sandi" });

    fireEvent.change(passwordInput, { target: { value: "newPassword123" } });
    fireEvent.change(confirmInput, { target: { value: "differentPassword" } });
    fireEvent.click(submitBtn);

    expect(
      screen.getByText(/kata sandi baru dan konfirmasi kata sandi tidak cocok/i)
    ).toBeDefined();
  });

  it("submits reset password payload and redirects to login with reset=success", async () => {
    const resetSpy = vi.spyOn(apiClient, "resetPassword").mockResolvedValue();

    render(<ResetPasswordPage />);

    const passwordInput = screen.getByLabelText("Kata Sandi Baru");
    const confirmInput = screen.getByLabelText("Konfirmasi Kata Sandi Baru");
    const submitBtn = screen.getByRole("button", { name: "Perbarui Kata Sandi" });

    fireEvent.change(passwordInput, { target: { value: "newPassword123" } });
    fireEvent.change(confirmInput, { target: { value: "newPassword123" } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(resetSpy).toHaveBeenCalledWith({
        token: "valid-token-123",
        email: "user@example.com",
        password: "newPassword123",
        password_confirmation: "newPassword123",
      });
      expect(mockPush).toHaveBeenCalledWith("/login?reset=success");
    });
  });

  it("handles expired or invalid reset token error (422)", async () => {
    vi.spyOn(apiClient, "resetPassword").mockRejectedValue(
      new ApiError(422, "The password reset token is invalid.")
    );

    render(<ResetPasswordPage />);

    const passwordInput = screen.getByLabelText("Kata Sandi Baru");
    const confirmInput = screen.getByLabelText("Konfirmasi Kata Sandi Baru");
    const submitBtn = screen.getByRole("button", { name: "Perbarui Kata Sandi" });

    fireEvent.change(passwordInput, { target: { value: "newPassword123" } });
    fireEvent.change(confirmInput, { target: { value: "newPassword123" } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/tautan reset kata sandi sudah kedaluwarsa atau data tidak valid/i)
      ).toBeDefined();
    });
  });
});
