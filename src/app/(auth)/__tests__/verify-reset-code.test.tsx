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

  it("renders 6-box alphanumeric OTP inputs with prefilled email", () => {
    render(
      <AuthProvider>
        <VerifyResetCodePage />
      </AuthProvider>
    );

    expect(screen.getByText("Verifikasi Kode Keamanan")).toBeDefined();
    expect(screen.getByText("Kode OTP")).toBeDefined();
    expect(screen.getByLabelText("Alamat Email")).toBeDefined();
    expect(screen.getByRole("button", { name: "Verifikasi Kode" })).toBeDefined();

    // 6 digit boxes
    for (let i = 1; i <= 6; i++) {
      expect(screen.getByLabelText(`Digit ${i}`)).toBeDefined();
    }

    const emailInput = screen.getByLabelText("Alamat Email") as HTMLInputElement;
    expect(emailInput.value).toBe("user@example.com");
  });

  it("handles typing individual alphanumeric characters with uppercase normalization", () => {
    render(
      <AuthProvider>
        <VerifyResetCodePage />
      </AuthProvider>
    );

    const box1 = screen.getByLabelText("Digit 1") as HTMLInputElement;
    const box2 = screen.getByLabelText("Digit 2") as HTMLInputElement;

    fireEvent.change(box1, { target: { value: "a" } });
    expect(box1.value).toBe("A");

    fireEvent.change(box2, { target: { value: "7" } });
    expect(box2.value).toBe("7");
  });

  it("handles pasting a 6-character alphanumeric code across all boxes", () => {
    render(
      <AuthProvider>
        <VerifyResetCodePage />
      </AuthProvider>
    );

    const box1 = screen.getByLabelText("Digit 1");

    fireEvent.paste(box1, {
      clipboardData: {
        getData: () => "a7k-2m9",
      },
    });

    expect((screen.getByLabelText("Digit 1") as HTMLInputElement).value).toBe("A");
    expect((screen.getByLabelText("Digit 2") as HTMLInputElement).value).toBe("7");
    expect((screen.getByLabelText("Digit 3") as HTMLInputElement).value).toBe("K");
    expect((screen.getByLabelText("Digit 4") as HTMLInputElement).value).toBe("2");
    expect((screen.getByLabelText("Digit 5") as HTMLInputElement).value).toBe("M");
    expect((screen.getByLabelText("Digit 6") as HTMLInputElement).value).toBe("9");
  });

  it("submits valid 6-character code, stores auth in memory, and redirects to clean /reset-password", async () => {
    const verifySpy = vi.spyOn(apiClient, "verifyResetCode").mockResolvedValue({
      reset_authorization: "auth-token-xyz-12345",
    });

    render(
      <AuthProvider>
        <VerifyResetCodePage />
      </AuthProvider>
    );

    // Paste full 6-character alphanumeric code
    const box1 = screen.getByLabelText("Digit 1");
    fireEvent.paste(box1, {
      clipboardData: {
        getData: () => "A7K2M9",
      },
    });

    const submitBtn = screen.getByRole("button", { name: "Verifikasi Kode" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(verifySpy).toHaveBeenCalledWith({
        email: "user@example.com",
        code: "A7K2M9",
      });
      // Clean URL navigation without exposing token in query params
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

    const box1 = screen.getByLabelText("Digit 1");
    fireEvent.paste(box1, {
      clipboardData: {
        getData: () => "XXXXXX",
      },
    });

    const submitBtn = screen.getByRole("button", { name: "Verifikasi Kode" });
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
