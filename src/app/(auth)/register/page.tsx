"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import AuthWaveLayout from "@/components/ui/AuthWaveLayout";
import { useAuth } from "@/lib/auth/auth-context";
import { getGoogleOAuthUrl } from "@/lib/api/client";

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
        <circle cx="100" cy="72" r="30" fill="#e8f0e8" stroke="#c8dfc8" strokeWidth="1.5" />
        <circle cx="100" cy="68" r="16" fill="#d0f0c0" fillOpacity="0.75" />
        <path
          d="M82 88 C82 88 76 96 76 106 C76 112 87 116 100 116 C113 116 124 112 124 106 C124 96 118 88 118 88"
          stroke="#4a6b52"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
        <rect
          x="28"
          y="124"
          width="144"
          height="44"
          rx="12"
          fill="#e8f0e8"
          stroke="#c8dfc8"
          strokeWidth="1.5"
        />
        <rect x="40" y="135" width="56" height="7" rx="3.5" fill="#c8dfc8" />
        <rect x="40" y="147" width="88" height="6" rx="3" fill="#dceadc" />
        <rect x="40" y="157" width="64" height="5" rx="2.5" fill="#dceadc" />
        <circle cx="158" cy="124" r="18" fill="#1e4d2b" />
        <path
          d="M158 115 L158 133 M149 124 L167 124"
          stroke="#d0f0c0"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="32" cy="60" r="5" fill="#ffe8a3" stroke="#7a4400" strokeWidth="1" />
        <circle cx="170" cy="168" r="4" fill="#d0f0c0" stroke="#4a6b52" strokeWidth="1" />
        <path d="M14 90 Q8 102 14 114" stroke="#c8dfc8" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M186 50 Q192 62 186 74" stroke="#c8dfc8" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <div className="text-center">
        <p
          className="font-bold text-xl font-serif text-[var(--text-primary)]"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Bergabung &amp; Berkontribusi
        </p>
        <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
          Buat akun gratis dan mulai laporkan
          <br />
          isu di sekitar Anda hari ini.
        </p>
      </div>
    </div>
  );
}

function RightPanel() {
  const router = useRouter();
  const { user: authUser, status: authStatus, register, loginWithGoogle } = useAuth();
  const googleAuthUrl = getGoogleOAuthUrl();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // If already authenticated, redirect to /reports
  useEffect(() => {
    if (authStatus === "authenticated" && authUser) {
      router.replace("/reports");
    }
  }, [authStatus, authUser, router]);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirm: "",
    agree: false,
  });

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({
      ...prev,
      [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (form.password !== form.confirm) {
      setError("Kata sandi dan konfirmasi kata sandi tidak cocok.");
      return;
    }

    if (form.password.length < 8) {
      setError("Kata sandi minimal harus 8 karakter.");
      return;
    }

    setError("");
    setIsLoading(true);

    const fullName = `${form.firstName} ${form.lastName}`.trim();

    try {
      const response = await register({
        name: fullName || "Citizen User",
        email: form.email,
        password: form.password,
        password_confirmation: form.confirm,
      });

      if (response.requires_verification || !response.user.email_verified_at) {
        router.push("/verify-email");
      } else {
        router.push("/reports");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        if ("status" in err && (err as { status?: number }).status === 404) {
          setError("Pendaftaran email manual sedang dalam persiapan backend. Silakan gunakan Daftar dengan Google.");
        } else if ("status" in err && (err as { status?: number }).status === 422) {
          setError("Data pendaftaran tidak valid atau email sudah terdaftar.");
        } else if (err.message && err.message.toLowerCase().includes("email already exists")) {
          setError("Data pendaftaran tidak valid atau email sudah terdaftar.");
        } else {
          setError(err.message || "Terjadi kesalahan saat pendaftaran. Silakan coba lagi.");
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
        Buat <span style={{ color: "var(--sage-light)" }}>akun baru</span>
      </h1>
      <p className="text-sm mb-5 text-center text-[#8fbf7f]">
        Gratis selamanya, tanpa iklan
      </p>

      {error && (
        <div
          className="w-full px-4 py-3 rounded-xl text-sm mb-3"
          style={{
            background: "rgba(239,68,68,0.15)",
            color: "#f87171",
            border: "1px solid rgba(239,68,68,0.3)",
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
        {/* Name Fields */}
        <div className="flex gap-3">
          <div className="flex flex-col gap-1 flex-1">
            <label htmlFor="firstName" className="text-xs tracking-wide text-[#8fbf7f]">
              Nama Depan
            </label>
            <input
              id="firstName"
              type="text"
              autoComplete="given-name"
              value={form.firstName}
              onChange={update("firstName")}
              placeholder="Budi"
              required
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors"
              style={inputStyle}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label htmlFor="lastName" className="text-xs tracking-wide text-[#8fbf7f]">
              Nama Belakang
            </label>
            <input
              id="lastName"
              type="text"
              autoComplete="family-name"
              value={form.lastName}
              onChange={update("lastName")}
              placeholder="Santoso"
              required
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors"
              style={inputStyle}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-xs tracking-wide text-[#8fbf7f]">
            Alamat Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={update("email")}
            placeholder="nama@email.com"
            required
            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors"
            style={inputStyle}
            onFocus={onFocus}
            onBlur={onBlur}
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-xs tracking-wide text-[#8fbf7f]">
            Kata Sandi
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={form.password}
              onChange={update("password")}
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
          <label htmlFor="confirm" className="text-xs tracking-wide text-[#8fbf7f]">
            Konfirmasi Kata Sandi
          </label>
          <div className="relative">
            <input
              id="confirm"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              value={form.confirm}
              onChange={update("confirm")}
              placeholder="Ulangi kata sandi"
              required
              className="w-full px-4 py-3 pr-12 rounded-xl text-sm outline-none transition-colors"
              style={{
                ...inputStyle,
                borderColor:
                  form.confirm && form.password !== form.confirm
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
          {form.confirm && form.password !== form.confirm && (
            <p className="text-xs mt-1 text-[#f87171]">Kata sandi tidak cocok</p>
          )}
        </div>

        {/* Agreement Checkbox */}
        <label className="flex items-start gap-2 cursor-pointer text-xs select-none mt-1 text-[#8fbf7f]">
          <input
            type="checkbox"
            checked={form.agree}
            onChange={update("agree")}
            required
            className="mt-0.5 w-4 h-4 rounded"
            style={{ accentColor: "var(--sage-light)" }}
          />
          <span>
            Saya menyetujui{" "}
            <Link
              href="/terms"
              className="underline hover:opacity-70 transition-opacity text-[var(--sage-light)]"
            >
              Syarat &amp; Ketentuan
            </Link>{" "}
            dan{" "}
            <Link
              href="/privacy"
              className="underline hover:opacity-70 transition-opacity text-[var(--sage-light)]"
            >
              Kebijakan Privasi
            </Link>{" "}
            CiviLens
          </span>
        </label>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!form.agree || isLoading}
          className="w-full py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 mt-1 disabled:opacity-40 disabled:cursor-not-allowed text-[var(--green-deep)] bg-[var(--cream)] hover:bg-[#e8ede3]"
        >
          {isLoading ? "Memproses..." : "Buat Akun"}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 w-full my-4">
        <div className="flex-1 h-px bg-[rgba(208,240,192,0.15)]" />
        <span className="text-xs text-[#8fbf7f]">atau</span>
        <div className="flex-1 h-px bg-[rgba(208,240,192,0.15)]" />
      </div>

      {/* Google Button */}
      <a
        href={googleAuthUrl}
        onClick={(e) => {
          if (isLoading) {
            e.preventDefault();
            return;
          }
          loginWithGoogle();
        }}
        className="w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-3 transition-all text-[#fafaf5] border border-[rgba(208,240,192,0.25)] hover:bg-[rgba(208,240,192,0.07)]"
      >
        <svg width="18" height="18" viewBox="0 0 18 18">
          <path
            fill="#4285F4"
            d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
          />
          <path
            fill="#34A853"
            d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
          />
          <path
            fill="#FBBC05"
            d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"
          />
          <path
            fill="#EA4335"
            d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z"
          />
        </svg>
        Daftar dengan Google
      </a>

      {/* Footer */}
      <p className="mt-6 text-sm text-center text-[#8fbf7f]">
        Sudah punya akun?{" "}
        <Link
          href="/login"
          className="transition-opacity hover:opacity-70 text-[var(--sage-light)]"
        >
          Masuk di sini
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return <AuthWaveLayout left={<LeftPanel />} right={<RightPanel />} />;
}
