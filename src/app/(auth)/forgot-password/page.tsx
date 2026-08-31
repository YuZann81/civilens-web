"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import AuthWaveLayout from "@/components/ui/AuthWaveLayout";
import { forgotPassword } from "@/lib/api/client";

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
      </svg>
      <div className="text-center">
        <p
          className="font-bold text-xl font-serif text-[var(--text-primary)]"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Pemulihan Akun Aman
        </p>
        <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
          Kami akan mengirimkan instruksi pemulihan
          <br />
          ke alamat email yang terdaftar.
        </p>
      </div>
    </div>
  );
}

function RightPanel() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      await forgotPassword(email);
      setMessage("Tautan reset kata sandi telah dikirim ke email Anda jika terdaftar.");
    } catch (err: unknown) {
      if (err instanceof Error && "status" in err && err.status === 404) {
        setError("Layanan reset kata sandi sedang dalam persiapan backend. Silakan gunakan Masuk dengan Google.");
      } else {
        setError("Gagal memproses permintaan reset kata sandi. Silakan coba lagi nanti.");
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
        Lupa <span style={{ color: "var(--sage-light)" }}>Kata Sandi?</span>
      </h1>
      <p className="text-sm mb-6 text-center text-[#8fbf7f]">
        Masukkan email Anda untuk menerima instruksi reset kata sandi.
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
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-xs tracking-wide text-[#8fbf7f]">
            Alamat Email Terdaftar
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

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 text-[var(--green-deep)] bg-[var(--cream)] hover:bg-[#e8ede3] disabled:opacity-50"
        >
          {isLoading ? "Mengirim..." : "Kirim Tautan Reset"}
        </button>
      </form>

      <p className="mt-8 text-sm text-center text-[#8fbf7f]">
        Ingat kata sandi Anda?{" "}
        <Link
          href="/login"
          className="transition-opacity hover:opacity-70 text-[var(--sage-light)] font-medium"
        >
          Masuk di sini
        </Link>
      </p>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return <AuthWaveLayout left={<LeftPanel />} right={<RightPanel />} />;
}
