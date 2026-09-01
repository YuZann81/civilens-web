import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import VerifyEmailPage from "../verify-email/page";
import { AuthProvider } from "@/lib/auth/auth-context";
import * as apiClient from "@/lib/api/client";

const mockPush = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
  }),
  useSearchParams: () => mockSearchParams,
}));

describe("VerifyEmailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
  });

  it("renders verification prompt and resend button by default", () => {
    vi.spyOn(apiClient, "getAuthUser").mockResolvedValue({
      id: 1,
      name: "Budi Santoso",
      email: "budi@example.com",
      role: "citizen",
      status: "active",
      email_verified_at: null,
    });

    render(
      <AuthProvider>
        <VerifyEmailPage />
      </AuthProvider>
    );

    expect(screen.getByText("Verifikasi Identitas Warga")).toBeDefined();
    expect(screen.getByText("Email Anda")).toBeDefined();
    expect(screen.getByRole("button", { name: /saya sudah verifikasi/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /kirim ulang email verifikasi/i })).toBeDefined();
  });

  it("renders success state when status=success with CTA to /login", () => {
    mockSearchParams = new URLSearchParams("status=success");

    render(
      <AuthProvider>
        <VerifyEmailPage />
      </AuthProvider>
    );

    expect(screen.getByText("Akun Berhasil Diverifikasi")).toBeDefined();
    const loginLink = screen.getByRole("link", { name: /masuk ke civilens/i });
    expect(loginLink).toBeDefined();
    expect(loginLink.getAttribute("href")).toBe("/login");
  });

  it("renders already verified state when status=already with CTA to /login", () => {
    mockSearchParams = new URLSearchParams("status=already");

    render(
      <AuthProvider>
        <VerifyEmailPage />
      </AuthProvider>
    );

    expect(screen.getByText("Email Sudah Diverifikasi")).toBeDefined();
    const loginLink = screen.getByRole("link", { name: /masuk ke civilens/i });
    expect(loginLink).toBeDefined();
    expect(loginLink.getAttribute("href")).toBe("/login");
  });

  it("renders invalid signature state when error=invalid_signature with CTA to /login", () => {
    mockSearchParams = new URLSearchParams("error=invalid_signature");

    render(
      <AuthProvider>
        <VerifyEmailPage />
      </AuthProvider>
    );

    expect(screen.getByText("Link Verifikasi Tidak Valid")).toBeDefined();
    const loginLink = screen.getByRole("link", { name: /kembali ke login/i });
    expect(loginLink).toBeDefined();
    expect(loginLink.getAttribute("href")).toBe("/login");
  });

  it("handles resend verification email with feedback", async () => {
    vi.spyOn(apiClient, "getAuthUser").mockResolvedValue({
      id: 1,
      name: "Budi Santoso",
      email: "budi@example.com",
      role: "citizen",
      status: "active",
      email_verified_at: null,
    });

    const resendSpy = vi.spyOn(apiClient, "resendVerificationEmail").mockResolvedValue();

    render(
      <AuthProvider>
        <VerifyEmailPage />
      </AuthProvider>
    );

    const resendBtn = screen.getByRole("button", { name: /kirim ulang email verifikasi/i });
    fireEvent.click(resendBtn);

    await waitFor(() => {
      expect(resendSpy).toHaveBeenCalled();
      expect(screen.getByText(/tautan verifikasi baru telah dikirim/i)).toBeDefined();
    });
  });
});
