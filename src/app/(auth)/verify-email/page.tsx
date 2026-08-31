"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import AuthWaveLayout from "@/components/ui/AuthWaveLayout";
import { useAuth } from "@/lib/auth/auth-context";
import { resendVerificationEmail } from "@/lib/api/client";

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
          y="48"
          width="152"
          height="104"
          rx="14"
          fill="#e8f0e8"
          stroke="#c8dfc8"
          strokeWidth="1.5"
        />
        <path
          d="M28 52 L100 108 L172 52"
          stroke="#1e4d2b"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="158" cy="120" r="18" fill="#1e4d2b" />
        <path
          d="M150 120 L156 126 L166 114"
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
          Verifikasi Identitas Warga
        </p>
        <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
          Pastikan email Anda aktif untuk menerima pembaruan
          <br />
          dan tindak lanjut laporan lingkungan.
        </p>
      </div>
    </div>
  );
}

function RightPanel() {
  const router = useRouter();
  const { user, refreshUser, logout } = useAuth();
  const [cooldown, setCooldown] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;

    setError("");
    setMessage("");
    setIsResending(true);

    try {
      await resendVerificationEmail();
      setMessage("Tautan verifikasi baru telah dikirim ke email Anda.");
      setCooldown(60);
    } catch (err: unknown) {
      if (err instanceof Error && "status" in err && err.status === 404) {
        setError("Layanan verifikasi email sedang dalam persiapan backend.");
      } else {
        setError("Gagal mengirim ulang email verifikasi. Coba beberapa saat lagi.");
      }
    } finally {
      setIsResending(false);
    }
  };

  const handleCheckStatus = async () => {
    setIsRefreshing(true);
    setError("");
    try {
      await refreshUser();
      if (user?.email_verified_at) {
        router.push("/");
      } else {
        setMessage("Email belum terverifikasi. Periksa kotak masuk atau folder spam Anda.");
      }
    } catch {
      setError("Gagal memeriksa status verifikasi.");
    } finally {
      setIsRefreshing(false);
    }
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
        Verifikasi <span style={{ color: "var(--sage-light)" }}>Email Anda</span>
      </h1>
      <p className="text-sm mb-6 text-center text-[#8fbf7f]">
        Kami telah mengirimkan tautan verifikasi ke{" "}
        <strong className="text-[#fafaf5] font-medium">{user?.email || "alamat email Anda"}</strong>.
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

      <div className="w-full flex flex-col gap-3">
        <button
          type="button"
          onClick={handleCheckStatus}
          disabled={isRefreshing}
          className="w-full py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 text-[var(--green-deep)] bg-[var(--cream)] hover:bg-[#e8ede3] disabled:opacity-50"
        >
          {isRefreshing ? "Memeriksa Status..." : "Saya Sudah Verifikasi"}
        </button>

        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || isResending}
          className="w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all text-[#fafaf5] border border-[rgba(208,240,192,0.25)] hover:bg-[rgba(208,240,192,0.07)] disabled:opacity-50"
        >
          {isResending
            ? "Mengirim..."
            : cooldown > 0
            ? `Kirim Ulang Email (${cooldown}s)`
            : "Kirim Ulang Email Verifikasi"}
        </button>
      </div>

      <div className="mt-8 flex items-center justify-between w-full text-xs text-[#8fbf7f]">
        <Link href="/" className="hover:text-[var(--sage-light)] transition-colors">
          &larr; Kembali ke Beranda
        </Link>
        <button
          type="button"
          onClick={() => void logout()}
          className="hover:text-[#f87171] transition-colors"
        >
          Ganti Akun (Keluar)
        </button>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return <AuthWaveLayout left={<LeftPanel />} right={<RightPanel />} />;
}
