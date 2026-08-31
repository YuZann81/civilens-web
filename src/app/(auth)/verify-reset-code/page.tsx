"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import AuthWaveLayout from "@/components/ui/AuthWaveLayout";
import { useAuth } from "@/lib/auth/auth-context";
import { verifyResetCode, forgotPassword } from "@/lib/api/client";

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
          y="48"
          width="128"
          height="104"
          rx="16"
          fill="#e8f0e8"
          stroke="#c8dfc8"
          strokeWidth="1.5"
        />
        <circle cx="70" cy="100" r="10" fill="#1e4d2b" />
        <circle cx="100" cy="100" r="10" fill="#1e4d2b" />
        <circle cx="130" cy="100" r="10" fill="#1e4d2b" />
        <circle cx="160" cy="60" r="16" fill="#1e4d2b" />
        <path
          d="M153 60 L158 65 L168 54"
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
          Verifikasi Kode Keamanan
        </p>
        <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
          Masukkan 6 karakter kode OTP yang kami kirimkan
          <br />
          ke email Anda untuk melanjutkan reset kata sandi.
        </p>
      </div>
    </div>
  );
}

function VerifyResetCodeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setResetAuthSession } = useAuth();

  const emailParam = searchParams?.get("email") || "";
  const [email, setEmail] = useState(() => emailParam);
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [cooldown, setCooldown] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const fullCode = digits.join("");

  const handleDigitChange = (index: number, value: string) => {
    const cleanChar = value.replace(/[^A-Za-z0-9]/g, "").toUpperCase();

    if (!cleanChar) {
      const newDigits = [...digits];
      newDigits[index] = "";
      setDigits(newDigits);
      return;
    }

    const char = cleanChar.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);

    // Auto-focus next box if not on the last box
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/[^A-Za-z0-9]/g, "")
      .toUpperCase()
      .slice(0, 6);

    if (!pastedData) return;

    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pastedData[i] || "";
    }
    setDigits(newDigits);

    const targetIndex = Math.min(pastedData.length, 5);
    inputRefs.current[targetIndex]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (!fullCode || fullCode.length !== 6 || !/^[A-Za-z0-9]{6}$/.test(fullCode)) {
      setError("Kode verifikasi harus terdiri dari 6 karakter huruf atau angka.");
      return;
    }

    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const response = await verifyResetCode({
        email,
        code: fullCode,
      });

      // Secure in-memory storage (never stored in URL, localStorage, or sessionStorage)
      setResetAuthSession({
        email,
        token: response.reset_authorization,
      });

      router.push("/reset-password");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Kode verifikasi tidak valid atau sudah kedaluwarsa.");
      } else {
        setError("Terjadi kesalahan jaringan. Periksa koneksi internet Anda.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;

    setError("");
    setMessage("");
    setIsResending(true);

    try {
      await forgotPassword(email);
      setMessage("Kode verifikasi 6 karakter baru telah dikirim ke email Anda.");
      setCooldown(60);
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Gagal mengirim ulang kode. Coba beberapa saat lagi.");
      } else {
        setError("Gagal mengirim ulang kode. Periksa koneksi internet Anda.");
      }
    } finally {
      setIsResending(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.07)",
    border: error ? "1px solid rgba(239,68,68,0.6)" : "1px solid rgba(208,240,192,0.2)",
    color: "#fafaf5",
  };

  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = error
      ? "rgba(239,68,68,0.8)"
      : "rgba(208,240,192,0.6)";
  };

  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = error
      ? "rgba(239,68,68,0.6)"
      : "rgba(208,240,192,0.2)";
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
        Verifikasi <span style={{ color: "var(--sage-light)" }}>Kode OTP</span>
      </h1>
      <p className="text-sm mb-6 text-center text-[#8fbf7f]">
        Kode 6 karakter telah dikirim ke{" "}
        <strong className="text-[#fafaf5] font-medium">{email || "email Anda"}</strong>.
      </p>

      {message && (
        <div className="w-full px-4 py-3 rounded-xl text-sm mb-4 bg-[rgba(208,240,192,0.15)] text-[#d0f0c0] border border-[rgba(208,240,192,0.3)]">
          {message}
        </div>
      )}

      {error && (
        <div className="w-full px-4 py-3 rounded-xl text-sm mb-4 bg-[rgba(239,68,68,0.15)] text-[#f87171] border border-[rgba(239,68,68,0.3)]">
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

        {/* 6-Box Segmented Alphanumeric OTP Code */}
        <div className="flex flex-col gap-2">
          <label className="text-xs tracking-wide text-[#8fbf7f]">
            Kode Verifikasi 6 Karakter (A-Z, 0-9)
          </label>
          <div className="flex items-center justify-center gap-1.5 sm:gap-2.5">
            {/* First 3 boxes */}
            <div className="flex gap-1.5 sm:gap-2">
              {[0, 1, 2].map((i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputRefs.current[i] = el;
                  }}
                  id={i === 0 ? "otp-box-0" : undefined}
                  type="text"
                  autoComplete="one-time-code"
                  maxLength={1}
                  value={digits[i]}
                  onChange={(e) => handleDigitChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onPaste={i === 0 ? handlePaste : undefined}
                  className="w-10 h-12 sm:w-12 sm:h-14 rounded-xl text-center font-mono font-bold text-lg sm:text-xl uppercase outline-none transition-all focus:scale-105"
                  style={inputStyle}
                  onFocus={onFocus}
                  onBlur={onBlur}
                  aria-label={`Digit ${i + 1}`}
                />
              ))}
            </div>

            {/* Visual Middle Dash Divider */}
            <div className="text-[var(--sage-light)] font-bold text-lg opacity-60 select-none px-0.5">
              &ndash;
            </div>

            {/* Last 3 boxes */}
            <div className="flex gap-1.5 sm:gap-2">
              {[3, 4, 5].map((i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputRefs.current[i] = el;
                  }}
                  type="text"
                  autoComplete="one-time-code"
                  maxLength={1}
                  value={digits[i]}
                  onChange={(e) => handleDigitChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-10 h-12 sm:w-12 sm:h-14 rounded-xl text-center font-mono font-bold text-lg sm:text-xl uppercase outline-none transition-all focus:scale-105"
                  style={inputStyle}
                  onFocus={onFocus}
                  onBlur={onBlur}
                  aria-label={`Digit ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Verify Button */}
        <button
          type="submit"
          disabled={isLoading || fullCode.length !== 6}
          className="w-full py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 mt-2 disabled:opacity-50 disabled:cursor-not-allowed text-[var(--green-deep)] bg-[var(--cream)] hover:bg-[#e8ede3]"
        >
          {isLoading ? "Memverifikasi..." : "Verifikasi Kode"}
        </button>

        {/* Resend Button */}
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || isResending}
          className="w-full py-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-all text-[#fafaf5] border border-[rgba(208,240,192,0.25)] hover:bg-[rgba(208,240,192,0.07)] disabled:opacity-50"
        >
          {isResending
            ? "Mengirim Kode..."
            : cooldown > 0
            ? `Kirim Ulang Kode (${cooldown}s)`
            : "Kirim Ulang Kode"}
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

export default function VerifyResetCodePage() {
  return (
    <AuthWaveLayout
      left={<LeftPanel />}
      right={
        <Suspense fallback={<div className="text-xs text-[#8fbf7f]">Memuat formulir...</div>}>
          <VerifyResetCodeForm />
        </Suspense>
      }
    />
  );
}
