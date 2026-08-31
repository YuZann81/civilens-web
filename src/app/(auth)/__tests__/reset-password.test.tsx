import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ResetPasswordPage from "../reset-password/page";
import { AuthProvider, useAuth } from "@/lib/auth/auth-context";
import * as apiClient from "@/lib/api/client";
import { ApiError } from "@/lib/api/types";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
  }),
}));

function SeedResetSession({
  email = "user@example.com",
  token = "auth-auth-64-bytes",
  children,
}: {
  email?: string;
  token?: string;
  children: React.ReactNode;
}) {
  const { setResetAuthSession } = useAuth();
  React.useEffect(() => {
    setResetAuthSession({ email, token });
  }, [email, token, setResetAuthSession]);

  return <>{children}</>;
}

describe("ResetPasswordPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders expired session view when accessed directly or refreshed without in-memory state", () => {
    render(
      <AuthProvider>
        <ResetPasswordPage />
      </AuthProvider>
    );

    expect(screen.getByText("Sesi Reset")).toBeDefined();
    expect(screen.getByText("Kedaluwarsa")).toBeDefined();
    expect(
      screen.getByText(/sesi otorisasi reset kata sandi tidak ditemukan/i)
    ).toBeDefined();
    expect(
      screen.getByRole("link", { name: "Minta Kode Verifikasi Baru" })
    ).toBeDefined();
  });

  it("renders reset password form when valid in-memory session is present", async () => {
    render(
      <AuthProvider>
        <SeedResetSession>
          <ResetPasswordPage />
        </SeedResetSession>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Atur Ulang")).toBeDefined();
      expect(screen.getByText("Kata Sandi")).toBeDefined();
      expect(screen.getByText("user@example.com")).toBeDefined();
      expect(screen.getByLabelText("Kata Sandi Baru")).toBeDefined();
      expect(screen.getByLabelText("Konfirmasi Kata Sandi Baru")).toBeDefined();
      expect(screen.getByRole("button", { name: "Perbarui Kata Sandi" })).toBeDefined();
    });
  });

  it("toggles password visibility on new password and confirm password inputs", async () => {
    render(
      <AuthProvider>
        <SeedResetSession>
          <ResetPasswordPage />
        </SeedResetSession>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Kata Sandi Baru")).toBeDefined();
    });

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
    render(
      <AuthProvider>
        <SeedResetSession>
          <ResetPasswordPage />
        </SeedResetSession>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Kata Sandi Baru")).toBeDefined();
    });

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

    render(
      <AuthProvider>
        <SeedResetSession>
          <ResetPasswordPage />
        </SeedResetSession>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Kata Sandi Baru")).toBeDefined();
    });

    const passwordInput = screen.getByLabelText("Kata Sandi Baru");
    const confirmInput = screen.getByLabelText("Konfirmasi Kata Sandi Baru");
    const submitBtn = screen.getByRole("button", { name: "Perbarui Kata Sandi" });

    fireEvent.change(passwordInput, { target: { value: "newPassword123" } });
    fireEvent.change(confirmInput, { target: { value: "newPassword123" } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(resetSpy).toHaveBeenCalledWith({
        reset_authorization: "auth-auth-64-bytes",
        email: "user@example.com",
        password: "newPassword123",
        password_confirmation: "newPassword123",
      });
      expect(mockPush).toHaveBeenCalledWith("/login?reset=success");
    });
  });

  it("handles expired or invalid authorization token error (422)", async () => {
    vi.spyOn(apiClient, "resetPassword").mockRejectedValue(
      new ApiError(422, "Otorisasi reset kata sandi sudah kedaluwarsa atau data tidak valid.")
    );

    render(
      <AuthProvider>
        <SeedResetSession>
          <ResetPasswordPage />
        </SeedResetSession>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Kata Sandi Baru")).toBeDefined();
    });

    const passwordInput = screen.getByLabelText("Kata Sandi Baru");
    const confirmInput = screen.getByLabelText("Konfirmasi Kata Sandi Baru");
    const submitBtn = screen.getByRole("button", { name: "Perbarui Kata Sandi" });

    fireEvent.change(passwordInput, { target: { value: "newPassword123" } });
    fireEvent.change(confirmInput, { target: { value: "newPassword123" } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/otorisasi reset kata sandi sudah kedaluwarsa/i)
      ).toBeDefined();
    });
  });
});
