import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import VerifyResetCodePage from "../verify-reset-code/page";
import { AuthProvider } from "@/lib/auth/auth-context";
import * as apiClient from "@/lib/api/client";
import { ApiError } from "@/lib/api/types";

const mockPush = vi.fn();
let mockSearchParams = new URLSearchParams("email=user%40example.com");

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
  }),
  useSearchParams: () => mockSearchParams,
}));

describe("VerifyResetCodePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams("email=user%40example.com");
  });

  it("renders 6-digit code input with prefilled email", () => {
    render(
      <AuthProvider>
        <VerifyResetCodePage />
      </AuthProvider>
    );

    expect(screen.getByText("Verifikasi Kode Keamanan")).toBeDefined();
    expect(screen.getByText("Kode OTP")).toBeDefined();
    expect(screen.getByLabelText("Alamat Email")).toBeDefined();
    expect(screen.getByLabelText("Kode 6 Digit")).toBeDefined();
    expect(screen.getByRole("button", { name: "Verifikasi Kode" })).toBeDefined();

    const emailInput = screen.getByLabelText("Alamat Email") as HTMLInputElement;
    expect(emailInput.value).toBe("user@example.com");
  });

  it("restricts code input to 6 digits", () => {
    render(
      <AuthProvider>
        <VerifyResetCodePage />
      </AuthProvider>
    );

    const codeInput = screen.getByLabelText("Kode 6 Digit") as HTMLInputElement;

    fireEvent.change(codeInput, { target: { value: "12345678" } });
    expect(codeInput.value).toBe("123456");

    fireEvent.change(codeInput, { target: { value: "abc12xyz3" } });
    expect(codeInput.value).toBe("123");
  });

  it("submits valid 6-digit code, stores auth in memory, and redirects to clean /reset-password", async () => {
    const verifySpy = vi.spyOn(apiClient, "verifyResetCode").mockResolvedValue({
      reset_authorization: "auth-token-xyz-12345",
    });

    render(
      <AuthProvider>
        <VerifyResetCodePage />
      </AuthProvider>
    );

    const codeInput = screen.getByLabelText("Kode 6 Digit");
    const submitBtn = screen.getByRole("button", { name: "Verifikasi Kode" });

    fireEvent.change(codeInput, { target: { value: "654321" } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(verifySpy).toHaveBeenCalledWith({
        email: "user@example.com",
        code: "654321",
      });
      // URL must be clean without any token / authorization exposed
      expect(mockPush).toHaveBeenCalledWith("/reset-password");
    });
  });

  it("handles invalid or expired code error (422)", async () => {
    vi.spyOn(apiClient, "verifyResetCode").mockRejectedValue(
      new ApiError(422, "Kode verifikasi yang Anda masukkan salah.")
    );

    render(
      <AuthProvider>
        <VerifyResetCodePage />
      </AuthProvider>
    );

    const codeInput = screen.getByLabelText("Kode 6 Digit");
    const submitBtn = screen.getByRole("button", { name: "Verifikasi Kode" });

    fireEvent.change(codeInput, { target: { value: "000000" } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/kode verifikasi yang anda masukkan salah/i)
      ).toBeDefined();
    });
  });

  it("renders resend code button with initial cooldown state", () => {
    render(
      <AuthProvider>
        <VerifyResetCodePage />
      </AuthProvider>
    );

    const resendBtn = screen.getByRole("button", { name: /kirim ulang kode/i });
    expect(resendBtn).toBeDefined();
    expect((resendBtn as HTMLButtonElement).disabled).toBe(true);
  });
});
