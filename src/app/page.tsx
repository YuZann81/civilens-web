"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import { getGoogleOAuthUrl } from "@/lib/api/client";

export default function HomePage() {
  const { user, status, logout } = useAuth();
  const googleAuthUrl = getGoogleOAuthUrl();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-[#faf8f5] text-[#2c2926]">
      {/* Header / Brand */}
      <header className="border-b border-[#eae2d3] bg-[#faf8f5]/90 backdrop-blur-xs sticky top-0 z-20">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-90">
            <svg
              className="h-7 w-7 text-[#2d6a36]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
            </svg>
            <span
              className="text-xl font-bold tracking-tight text-[#1c4123] font-serif"
              style={{ fontFamily: "Georgia, serif" }}
            >
              CiviLens
            </span>
          </Link>

          {/* Desktop Nav Actions */}
          <div className="hidden md:flex items-center gap-4">
            {status === "loading" && (
              <span className="text-xs text-[#57524d]">Memeriksa autentikasi...</span>
            )}

            {status === "authenticated" && user && (
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-[#1c4123]">
                  Masuk sebagai <strong className="font-semibold">{user.name}</strong> ({user.role})
                </span>
                <button
                  type="button"
                  onClick={() => void logout()}
                  className="rounded-lg border border-[#cbe0ce] bg-white px-3 py-1.5 text-xs font-semibold text-[#1c4123] transition hover:bg-[#f4f8f4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2d6a36]"
                >
                  Keluar
                </button>
              </div>
            )}

            {(status === "unauthenticated" || status === "error") && (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="px-3 py-2 text-sm font-semibold text-[#1c4123] transition hover:text-[#2d6a36] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2d6a36]"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#2d6a36] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#22512a] shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2d6a36]"
                >
                  Daftar
                </Link>
              </div>
            )}

            <span className="rounded-full bg-[#e5f0e6] px-3 py-1 text-xs font-semibold text-[#22512a]">
              Phase 0 Foundation
            </span>
          </div>

          {/* Mobile Hamburger Toggle Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#1c4123] hover:bg-[#f4f8f4] transition-colors focus-visible:outline-2 focus-visible:outline-[#2d6a36]"
              aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="4" y1="18" x2="20" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#eae2d3] bg-[#faf8f5] px-6 py-4 space-y-3">
            {status === "loading" && (
              <p className="text-xs text-[#57524d]">Memeriksa autentikasi...</p>
            )}

            {status === "authenticated" && user && (
              <div className="space-y-3">
                <div className="rounded-lg bg-[#f4f8f4] p-3 border border-[#cbe0ce]">
                  <p className="text-xs text-[#57524d]">Masuk sebagai:</p>
                  <p className="text-sm font-semibold text-[#1c4123]">{user.name}</p>
                  <p className="text-xs text-[#22512a] capitalize">Peran: {user.role}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    void logout();
                  }}
                  className="w-full text-center rounded-lg border border-[#cbe0ce] bg-white py-2 text-sm font-semibold text-[#1c4123] transition hover:bg-[#f4f8f4]"
                >
                  Keluar
                </button>
              </div>
            )}

            {(status === "unauthenticated" || status === "error") && (
              <div className="flex flex-col gap-2 pt-1">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center rounded-lg border border-[#cbe0ce] bg-white py-2.5 text-sm font-semibold text-[#1c4123] transition hover:bg-[#f4f8f4]"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center rounded-lg bg-[#2d6a36] py-2.5 text-sm font-semibold text-white transition hover:bg-[#22512a] shadow-xs"
                >
                  Daftar
                </Link>
                <a
                  href={googleAuthUrl}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center rounded-lg border border-[#cbe0ce] bg-white py-2 text-xs font-medium text-[#57524d] flex items-center justify-center gap-2 transition hover:bg-[#f4f8f4]"
                >
                  <span>Masuk dengan Google</span>
                </a>
              </div>
            )}

            <div className="pt-2 border-t border-[#eae2d3] flex justify-between items-center">
              <span className="text-xs text-[#8c857e]">CiviLens Platform</span>
              <span className="rounded-full bg-[#e5f0e6] px-2.5 py-0.5 text-[11px] font-semibold text-[#22512a]">
                Phase 0 Foundation
              </span>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-6 py-16">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#cbe0ce] bg-[#f4f8f4] px-4 py-1.5 text-sm font-medium text-[#22512a]">
            <span>Community-driven environmental transparency</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-[#17361d] sm:text-5xl">
            Making local environmental issues visible, actionable, and transparent.
          </h1>

          <p className="max-w-2xl text-lg text-[#57524d] leading-relaxed">
            CiviLens connects citizens, thoughtful candidate solution analysis, community
            decision-making, and government action into a single verified lifecycle.
          </p>

          <div className="pt-2">
            {status === "authenticated" && user ? (
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/reports/create"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#2d6a36] px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-[#22512a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2d6a36]"
                >
                  <span>Mulai Laporkan Isu</span>
                  <span>&rarr;</span>
                </Link>
                <Link
                  href="/reports"
                  className="inline-flex items-center gap-2 rounded-lg border border-[#cbe0ce] bg-white px-5 py-2.5 text-sm font-semibold text-[#1c4123] shadow-xs transition hover:bg-[#f4f8f4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2d6a36]"
                >
                  <span>Lihat Feed Laporan</span>
                </Link>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/reports/create"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#2d6a36] px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-[#22512a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2d6a36]"
                >
                  <span>Mulai Laporkan Isu</span>
                  <span>&rarr;</span>
                </Link>
                <Link
                  href="/reports"
                  className="inline-flex items-center gap-2 rounded-lg border border-[#cbe0ce] bg-white px-5 py-2.5 text-sm font-semibold text-[#1c4123] shadow-xs transition hover:bg-[#f4f8f4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2d6a36]"
                >
                  <span>Lihat Feed Laporan</span>
                </Link>
                <a
                  href={googleAuthUrl}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#eae2d3] bg-white px-5 py-2.5 text-sm font-medium text-[#57524d] shadow-xs transition hover:bg-[#f4f8f4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2d6a36]"
                >
                  <span>Masuk dengan Google</span>
                </a>
              </div>
            )}
          </div>

          <div className="grid gap-4 pt-6 sm:grid-cols-3">
            <div className="rounded-xl border border-[#eae2d3] bg-[#ffffff] p-5 shadow-xs">
              <h2 className="font-semibold text-[#1c4123]">Report</h2>
              <p className="mt-1 text-sm text-[#57524d]">
                Citizens document environmental concerns with verified locations and media.
              </p>
            </div>
            <div className="rounded-xl border border-[#eae2d3] bg-[#ffffff] p-5 shadow-xs">
              <h2 className="font-semibold text-[#1c4123]">Participate</h2>
              <p className="mt-1 text-sm text-[#57524d]">
                Communities review actionable candidate solutions and vote on priority paths.
              </p>
            </div>
            <div className="rounded-xl border border-[#eae2d3] bg-[#ffffff] p-5 shadow-xs">
              <h2 className="font-semibold text-[#1c4123]">Verify</h2>
              <p className="mt-1 text-sm text-[#57524d]">
                Government resolutions progress transparently with verifiable evidence.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#eae2d3] py-6 text-center text-xs text-[#8c857e]">
        <div className="mx-auto max-w-6xl px-6">
          CiviLens &bull; Phase 0 Foundation
        </div>
      </footer>
    </div>
  );
}
