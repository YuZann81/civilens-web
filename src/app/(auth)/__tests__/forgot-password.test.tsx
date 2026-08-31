import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ForgotPasswordPage from "../forgot-password/page";
import * as apiClient from "@/lib/api/client";
import { ApiError } from "@/lib/api/types";

describe("ForgotPasswordPage", () => {
  it("renders forgot password form and submit button", () => {
    render(<ForgotPasswordPage />);

    expect(screen.getByText("Pemulihan Akun Aman")).toBeDefined();
    expect(screen.getByText("Kata Sandi?")).toBeDefined();
    expect(screen.getByLabelText("Alamat Email Terdaftar")).toBeDefined();
    expect(screen.getByRole("button", { name: /kirim tautan reset/i })).toBeDefined();
    expect(screen.getByRole("link", { name: /masuk di sini/i })).toBeDefined();
  });

  it("submits email and displays success feedback message", async () => {
    const forgotSpy = vi.spyOn(apiClient, "forgotPassword").mockResolvedValue();

    render(<ForgotPasswordPage />);

    const emailInput = screen.getByLabelText("Alamat Email Terdaftar");
    const submitBtn = screen.getByRole("button", { name: /kirim tautan reset/i });

    fireEvent.change(emailInput, { target: { value: "user@example.com" } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(forgotSpy).toHaveBeenCalledWith("user@example.com");
      expect(
        screen.getByText(/tautan reset kata sandi telah dikirim/i)
      ).toBeDefined();
    });
  });

  it("displays graceful feedback when backend reset service is not available (404)", async () => {
    vi.spyOn(apiClient, "forgotPassword").mockRejectedValue(new ApiError(404, "Not Found"));

    render(<ForgotPasswordPage />);

    const emailInput = screen.getByLabelText("Alamat Email Terdaftar");
    const submitBtn = screen.getByRole("button", { name: /kirim tautan reset/i });

    fireEvent.change(emailInput, { target: { value: "user@example.com" } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/layanan reset kata sandi sedang dalam persiapan backend/i)
      ).toBeDefined();
    });
  });
});
