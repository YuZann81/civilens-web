import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RegisterPage from "../register/page";
import { AuthProvider } from "@/lib/auth/auth-context";
import * as apiClient from "@/lib/api/client";
import { ApiError } from "@/lib/api/types";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
  }),
}));

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("renders split panel registration with name fields, agreement, and Google signup", () => {
    vi.spyOn(apiClient, "getAuthUser").mockRejectedValue(new ApiError(401, "Unauthenticated."));

    render(
      <AuthProvider>
        <RegisterPage />
      </AuthProvider>
    );

    // Left Panel
    expect(screen.getByText("Bergabung & Berkontribusi")).toBeDefined();
    expect(screen.getByText(/buat akun gratis dan mulai laporkan/i)).toBeDefined();

    // Right Panel
    expect(screen.getByText("akun baru")).toBeDefined();
    expect(screen.getByLabelText("Nama Depan")).toBeDefined();
    expect(screen.getByLabelText("Nama Belakang")).toBeDefined();
    expect(screen.getByLabelText("Alamat Email")).toBeDefined();
    expect(screen.getByLabelText("Kata Sandi")).toBeDefined();
    expect(screen.getByLabelText("Konfirmasi Kata Sandi")).toBeDefined();
    expect(screen.getByRole("button", { name: "Buat Akun" })).toBeDefined();
    expect(screen.getByRole("link", { name: /daftar dengan google/i })).toBeDefined();
    expect(screen.getByRole("link", { name: /masuk di sini/i })).toBeDefined();
  });

  it("validates password matching on submit", () => {
    vi.spyOn(apiClient, "getAuthUser").mockRejectedValue(new ApiError(401, "Unauthenticated."));

    render(
      <AuthProvider>
        <RegisterPage />
      </AuthProvider>
    );

    const passwordInput = screen.getByLabelText("Kata Sandi");
    const confirmInput = screen.getByLabelText("Konfirmasi Kata Sandi");
    const agreeCheckbox = screen.getByRole("checkbox");

    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(confirmInput, { target: { value: "differentPassword" } });
    fireEvent.click(agreeCheckbox);

    const submitBtn = screen.getByRole("button", { name: "Buat Akun" });
    fireEvent.click(submitBtn);

    expect(screen.getAllByText(/kata sandi.*tidak cocok/i).length).toBeGreaterThan(0);
  });

  it("handles duplicate email registration error", async () => {
    vi.spyOn(apiClient, "getAuthUser").mockRejectedValue(new ApiError(401, "Unauthenticated."));
    vi.spyOn(apiClient, "register").mockRejectedValue(new ApiError(422, "Email already exists."));

    render(
      <AuthProvider>
        <RegisterPage />
      </AuthProvider>
    );

    fireEvent.change(screen.getByLabelText("Nama Depan"), { target: { value: "Budi" } });
    fireEvent.change(screen.getByLabelText("Nama Belakang"), { target: { value: "Santoso" } });
    fireEvent.change(screen.getByLabelText("Alamat Email"), { target: { value: "existing@example.com" } });
    fireEvent.change(screen.getByLabelText("Kata Sandi"), { target: { value: "password123" } });
    fireEvent.change(screen.getByLabelText("Konfirmasi Kata Sandi"), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("checkbox"));

    fireEvent.click(screen.getByRole("button", { name: "Buat Akun" }));

    await waitFor(() => {
      expect(
        screen.getByText(/data pendaftaran tidak valid atau email sudah terdaftar/i)
      ).toBeDefined();
    });
  });
});
