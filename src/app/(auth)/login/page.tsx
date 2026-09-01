"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
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
        <rect
          x="24"
          y="40"
          width="152"
          height="110"
          rx="14"
          fill="#e8f0e8"
          stroke="#c8dfc8"
          strokeWidth="1.5"
        />
        <rect x="36" y="56" width="68" height="9" rx="4.5" fill="#c8dfc8" />
        <rect x="36" y="72" width="128" height="7" rx="3.5" fill="#dceadc" />
        <rect x="36" y="84" width="100" height="7" rx="3.5" fill="#dceadc" />
        <rect
          x="36"
          y="100"
          width="128"
          height="32"
          rx="9"
          fill="#d0f0c0"
          fillOpacity="0.5"
          stroke="#c8dfc8"
          strokeWidth="1"
        />
        <circle cx="52" cy="116" r="7" fill="#1e4d2b" fillOpacity="0.15" />
        <rect x="64" y="112" width="64" height="5" rx="2.5" fill="#4a6b52" fillOpacity="0.45" />
        <rect x="64" y="120" width="44" height="4" rx="2" fill="#7a9a80" fillOpacity="0.4" />
        <rect x="36" y="140" width="56" height="12" rx="6" fill="#1e4d2b" />
        <rect x="98" y="143" width="66" height="6" rx="3" fill="#dceadc" />
        <circle cx="158" cy="52" r="20" fill="#1e4d2b" />
        <path
          d="M149 52 L155 58 L167 46"
          stroke="#d0f0c0"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="30" cy="38" r="5" fill="#ffe8a3" stroke="#7a4400" strokeWidth="1" />
        <circle cx="172" cy="158" r="4" fill="#d0f0c0" stroke="#4a6b52" strokeWidth="1" />
        <path d="M12 72 Q6 84 12 96" stroke="#c8dfc8" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M188 100 Q194 112 188 124" stroke="#c8dfc8" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <div className="text-center">
        <p
          className="font-bold text-xl font-serif text-[var(--text-primary)]"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Laporkan &amp; Pantau
        </p>
        <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
          Sampaikan isu warga, pantau progres,
          <br />
          dan jadilah bagian dari perubahan nyata.
        </p>
      </div>
    </div>
  );
}

function RightPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, loginWithGoogle } = useAuth();
  const googleAuthUrl = getGoogleOAuthUrl();

  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isResetSuccess = searchParams?.get("reset") === "success";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setError("");
    setIsLoading(true);

    try {
      const user = await login({ email, password, remember });
      if (user.status === "suspended") {
        setError("Akun Anda sedang ditangguhkan. Silakan hubungi administrator.");
        return;
      }
      router.push("/reports");
    } catch (err: unknown) {
      if (err instanceof Error) {
        if ("status" in err && err.status === 404) {
          setError("Fitur login email sedang dalam persiapan backend. Silakan gunakan Masuk dengan Google.");
        } else if ("status" in err && err.status === 401) {
          setError("Alamat email atau kata sandi yang Anda masukkan salah.");
        } else if ("status" in err && err.status === 422) {
          setError("Data yang dimasukkan tidak valid. Periksa format email dan kata sandi.");
        } else {
          setError(err.message || "Terjadi kesalahan saat masuk. Silakan coba lagi.");
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
        <span style={{ color: "var(--sage-light)" }}>Selamat datang,</span> masuk ke akun Anda
      </h1>
      <p className="text-sm mb-6 text-center text-[#8fbf7f]">
        Pantau dan laporkan isu di sekitar Anda
      </p>

      {isResetSuccess && (
        <div
          className="w-full px-4 py-3 rounded-xl text-sm mb-4 bg-[rgba(208,240,192,0.15)] text-[#d0f0c0] border border-[rgba(208,240,192,0.3)]"
        >
          Kata sandi Anda berhasil diperbarui! Silakan masuk dengan kata sandi baru Anda.
        </div>
      )}

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

        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-xs tracking-wide text-[#8fbf7f]">
            Kata Sandi
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
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

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer text-sm select-none text-[#8fbf7f]">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="w-4 h-4 rounded"
              style={{ accentColor: "var(--sage-light)" }}
            />
            Ingat saya
          </label>
          <Link
            href="/forgot-password"
            className="text-sm transition-opacity hover:opacity-70 text-[var(--sage-light)]"
          >
            Lupa kata sandi?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 mt-1 disabled:opacity-50 disabled:cursor-not-allowed text-[var(--green-deep)] bg-[var(--cream)] hover:bg-[#e8ede3]"
        >
          {isLoading ? "Memproses..." : "Masuk"}
        </button>
      </form>

      <div className="flex items-center gap-3 w-full my-5">
        <div className="flex-1 h-px bg-[rgba(208,240,192,0.15)]" />
        <span className="text-xs text-[#8fbf7f]">atau</span>
        <div className="flex-1 h-px bg-[rgba(208,240,192,0.15)]" />
      </div>

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
        Masuk dengan Google
      </a>

      <p className="mt-8 text-sm text-center text-[#8fbf7f]">
        Belum punya akun?{" "}
        <Link
          href="/register"
          className="transition-opacity hover:opacity-70 text-[var(--sage-light)]"
        >
          Daftar sekarang
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthWaveLayout
      left={<LeftPanel />}
      right={
        <Suspense fallback={<div className="text-xs text-[#8fbf7f]">Memuat formulir...</div>}>
          <RightPanel />
        </Suspense>
      }
    />
  );
}
