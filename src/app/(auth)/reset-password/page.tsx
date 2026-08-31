"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import AuthWaveLayout from "@/components/ui/AuthWaveLayout";
import { resetPassword } from "@/lib/api/client";

function LeftPanel() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 w-full">
      <Image
        src="/logos/civilens-logo-horizontal.svg"
        alt="CiviLens"
        width={160}
        height={54}
        priority
      />
      <svg
        viewBox="0 0 200 200"
        width={200}
        height={200}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect
          x="36"
          y="60"
          width="128"
          height="92"
          rx="16"
          fill="#e8f0e8"
          stroke="#c8dfc8"
          strokeWidth="1.5"
        />
        <circle cx="100" cy="100" r="14" fill="#1e4d2b" />
        <path
          d="M100 114 V124"
          stroke="#1e4d2b"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M72 60 V46 C72 30 128 30 128 46 V60"
          stroke="#1e4d2b"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="160" cy="68" r="16" fill="#1e4d2b" />
        <path
          d="M153 68 L158 73 L168 62"
          stroke="#d0f0c0"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="text-center">
        <p
          className="font-bold text-xl font-serif text-[var(--text-primary)]"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Atur Ulang Kata Sandi
        </p>
        <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
          Buat kata sandi baru yang kuat dan aman
          <br />
          untuk melindungi akun CiviLens Anda.
        </p>
      </div>
    </div>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState(() => searchParams?.get("email") || "");
  const [token] = useState(() => searchParams?.get("token") || "");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (!token) {
      setError("Token reset kata sandi tidak ditemukan atau tidak valid. Silakan minta tautan baru dari halaman Lupa Kata Sandi.");
      return;
    }

    if (password !== passwordConfirmation) {
      setError("Kata sandi baru dan konfirmasi kata sandi tidak cocok.");
      return;
    }

    if (password.length < 8) {
      setError("Kata sandi minimal harus 8 karakter.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      await resetPassword({
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });

      router.push("/login?reset=success");
    } catch (err: unknown) {
      if (err instanceof Error) {
        if ("status" in err && err.status === 422) {
          setError("Tautan reset kata sandi sudah kedaluwarsa atau data tidak valid. Silakan minta tautan reset baru.");
        } else {
          setError(err.message || "Gagal mengatur ulang kata sandi. Silakan coba lagi.");
        }
      } else {
        setError("Terjadi kesalahan jaringan. Periksa koneksi internet Anda.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(208,240,192,0.2)",
    color: "#fafaf5",
  };

  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "rgba(208,240,192,0.5)";
  };

  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "rgba(208,240,192,0.2)";
  };

  return (
    <div className="flex flex-col items-center w-full">
      <Image
        src="/logos/civilens-logo-stacked-dark.svg"
        alt="CiviLens"
        width={64}
        height={64}
        className="mb-6"
        priority
      />

      <h1
        className="text-2xl font-bold leading-snug mb-1 text-center font-serif text-[#fafaf5]"
        style={{ fontFamily: "Georgia, serif" }}
      >
        Atur Ulang <span style={{ color: "var(--sage-light)" }}>Kata Sandi</span>
      </h1>
      <p className="text-sm mb-6 text-center text-[#8fbf7f]">
        Masukkan kata sandi baru untuk akun Anda
      </p>

      {error && (
        <div
          className="w-full px-4 py-3 rounded-xl text-sm mb-4"
          style={{
            background: "rgba(239,68,68,0.15)",
            color: "#f87171",
            border: "1px solid rgba(239,68,68,0.3)",
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
        {/* Email */}
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-xs tracking-wide text-[#8fbf7f]">
            Alamat Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@email.com"
            required
            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors"
            style={inputStyle}
            onFocus={onFocus}
            onBlur={onBlur}
          />
        </div>

        {/* New Password */}
        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-xs tracking-wide text-[#8fbf7f]">
            Kata Sandi Baru
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 karakter"
              required
              minLength={8}
              className="w-full px-4 py-3 pr-12 rounded-xl text-sm outline-none transition-colors"
              style={inputStyle}
              onFocus={onFocus}
              onBlur={onBlur}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#8fbf7f] hover:text-[#d0f0c0] transition-colors"
              aria-label={showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
            >
              {showPassword ? (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="flex flex-col gap-1">
          <label htmlFor="passwordConfirmation" className="text-xs tracking-wide text-[#8fbf7f]">
            Konfirmasi Kata Sandi Baru
          </label>
          <div className="relative">
            <input
              id="passwordConfirmation"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              placeholder="Ulangi kata sandi baru"
              required
              className="w-full px-4 py-3 pr-12 rounded-xl text-sm outline-none transition-colors"
              style={{
                ...inputStyle,
                borderColor:
                  passwordConfirmation && password !== passwordConfirmation
                    ? "rgba(239,68,68,0.6)"
                    : "rgba(208,240,192,0.2)",
              }}
              onFocus={onFocus}
              onBlur={onBlur}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#8fbf7f] hover:text-[#d0f0c0] transition-colors"
              aria-label={showConfirm ? "Sembunyikan sandi" : "Tampilkan sandi"}
            >
              {showConfirm ? (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
          {passwordConfirmation && password !== passwordConfirmation && (
            <p className="text-xs mt-1 text-[#f87171]">Kata sandi tidak cocok</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 mt-2 disabled:opacity-50 disabled:cursor-not-allowed text-[var(--green-deep)] bg-[var(--cream)] hover:bg-[#e8ede3]"
        >
          {isLoading ? "Menyimpan..." : "Perbarui Kata Sandi"}
        </button>
      </form>

      <p className="mt-8 text-sm text-center text-[#8fbf7f]">
        Batal dan kembali ke{" "}
        <Link
          href="/login"
          className="transition-opacity hover:opacity-70 text-[var(--sage-light)] font-medium"
        >
          Masuk
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthWaveLayout
      left={<LeftPanel />}
      right={
        <Suspense fallback={<div className="text-xs text-[#8fbf7f]">Memuat formulir...</div>}>
          <ResetPasswordForm />
        </Suspense>
      }
    />
  );
}
