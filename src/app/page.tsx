"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import { getGoogleOAuthUrl } from "@/lib/api/client";
import {
  IconCamera,
  IconGps,
  IconBrain,
  IconActivity,
  IconShield,
  IconChevronDown,
  IconChevronUp,
  IconArrowRight,
  IconCheck,
} from "@/components/ui/icons";

export default function HomePage() {
  const { user, status, logout } = useAuth();
  const googleAuthUrl = getGoogleOAuthUrl();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq((prev) => (prev === index ? null : index));
  };

  const topics = [
    { name: "#Sampah", slug: "sampah", desc: "Penumpukan sampah liar, limbah, dan TPS ilegal" },
    { name: "#Banjir", slug: "banjir", desc: "Genangan air, drainase tersumbat, dan luapan sungai" },
    { name: "#JalanRusak", slug: "jalan-rusak", desc: "Lubang jalan, trotoar amblas, dan aspal retak" },
    { name: "#PolusiUdara", slug: "polusi-udara", desc: "Asap pabrik, pembakaran liar, dan polusi gas" },
    { name: "#PolusiAir", slug: "polusi-air", desc: "Pencemaran sungai, air keruh, dan bau limbah cair" },
    { name: "#PohonTumbang", slug: "pohon-tumbang", desc: "Ranting rapuh, pohon miring, bahaya kabel listrik" },
    { name: "#Longsor", slug: "longsor", desc: "Tebing labil, pergeseran tanah, dan potensi bencana" },
    { name: "#FasilitasUmum", slug: "fasilitas-umum", desc: "Lampu penerangan padam, halte rusak, rambu roboh" },
  ];

  const workflowSteps = [
    {
      step: "01",
      title: "Dokumentasikan Bukti & Titik Koordinat",
      desc: "Warga mengambil 1 hingga 3 foto bukti otentik dan menandai titik lokasi presisi langsung pada peta interaktif.",
    },
    {
      step: "02",
      title: "Klasifikasi Otomatis Berbantuan AI",
      desc: "Sistem cerdas menganalisis tingkat keparahan, merekomendasikan topik, serta menyusun ringkasan objektif tanpa mengubah fakta lapangan.",
    },
    {
      step: "03",
      title: "Dukungan & Respon Komunitas",
      desc: "Masyarakat meninjau laporan, memberikan tanggapan, dan menguatkan laporan mendesak melalui interaksi terverifikasi.",
    },
    {
      step: "04",
      title: "Verifikasi & Tindak Lanjut Instansi",
      desc: "Petugas dan pengelola fasilitas menindaklanjuti laporan melalui tahapan status transparan hingga tuntas.",
    },
  ];

  const faqs = [
    {
      q: "Bagaimana cara melaporkan masalah lingkungan di CiviLens?",
      a: "Anda cukup membuat akun atau masuk dengan Google, klik tombol 'Mulai Laporkan Isu', tentukan lokasi pada peta, unggah 1-3 foto bukti, tulis deskripsi masalah, lalu kirimkan laporan Anda.",
    },
    {
      q: "Apakah laporan saya langsung dilihat oleh instansi atau pemerintah setempat?",
      a: "Ya. Setiap laporan yang dikirimkan masuk ke dalam feed publik dan dasbor kerja instansi/moderator untuk melalui proses verifikasi, peninjauan lapangan, hingga penyelesaian tuntas.",
    },
    {
      q: "Bagaimana sistem AI membantu dalam proses pelaporan?",
      a: "Kecerdasan buatan CiviLens bertindak sebagai asisten pembantu (advisory). AI menganalisis foto dan deskripsi untuk memperkirakan tingkat keparahan (rendah, sedang, tinggi, kritis) dan merangkum dampak isu guna memudahkan pemangku kebijakan memprioritaskan penanganan.",
    },
    {
      q: "Berapa banyak foto bukti yang bisa saya lampirkan?",
      a: "Anda dapat melampirkan minimal 1 dan maksimal 3 foto dokumentasi nyata dengan format JPG, PNG, atau WEBP berukuran maksimal 10MB per berkas.",
    },
    {
      q: "Apakah data koordinat lokasi saya aman?",
      a: "Koordinat lokasi disimpan secara kanonikal untuk keperluan penandaan peta dan rute penanganan tim lapangan. Data kredensial pribadi dan akun pengguna dilindungi sesuai standar privasi dan tidak dipublikasikan ke publik.",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-[#fafaf7] text-[#1c241e]">
      {/* Brand Navigation Bar */}
      <header className="border-b border-[#e2e6df] bg-[#fafaf7]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-3.5">
          <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#225332] text-white shadow-xs">
              <svg
                className="h-4.5 w-4.5"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <circle cx="16" cy="16" r="10" stroke="#d0f0c0" strokeWidth="1.8" strokeDasharray="3 2" opacity="0.6"/>
                <path d="M16 8C16 8 10 11 10 18C10 21.5 12.7 24 16 24C19.3 24 22 21.5 22 18C22 11 16 8 16 8Z" fill="#d0f0c0" fillOpacity="0.25" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 24V16M16 16C16 16 13 14 12 12" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round"/>
                <circle cx="16" cy="15" r="1.5" fill="#d0f0c0"/>
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-[#1c241e]">
              CiviLens
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Navigasi Utama">
            <Link
              href="/reports"
              className="text-xs sm:text-sm font-medium text-[#5c685f] hover:text-[#225332] transition"
            >
              Jelajahi Laporan
            </Link>
            <a
              href="#alur-kerja"
              className="text-xs sm:text-sm font-medium text-[#5c685f] hover:text-[#225332] transition"
            >
              Cara Kerja
            </a>
            <a
              href="#topik"
              className="text-xs sm:text-sm font-medium text-[#5c685f] hover:text-[#225332] transition"
            >
              Topik Isu
            </a>
            <a
              href="#faq"
              className="text-xs sm:text-sm font-medium text-[#5c685f] hover:text-[#225332] transition"
            >
              FAQ
            </a>

            {status === "loading" && (
              <span className="text-xs text-[#8c978f]">Memeriksa sesi...</span>
            )}

            {status === "authenticated" && user && (
              <div className="flex items-center gap-3 pl-2 border-l border-[#e2e6df]">
                {(user.role === "government" || user.role === "admin") && (
                  <Link
                    href="/government"
                    className="inline-flex items-center gap-1 rounded-xl bg-[#225332] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#173722] transition shadow-xs"
                  >
                    <span>Portal Instansi</span>
                  </Link>
                )}
                <Link
                  href="/bookmarks"
                  className="text-xs font-semibold text-[#5c685f] hover:text-[#225332] transition"
                >
                  Tersimpan
                </Link>
                <Link
                  href={`/users/${user.id}`}
                  className="text-xs font-semibold text-[#1c241e] hover:text-[#225332] hover:underline transition"
                >
                  <span>{user.name}</span>
                </Link>
                <button
                  type="button"
                  onClick={() => void logout()}
                  className="rounded-lg border border-[#e2e6df] bg-white px-2.5 py-1 text-xs font-semibold text-[#5c685f] hover:bg-[#f4f5f0] transition"
                >
                  Keluar
                </button>
              </div>
            )}

            {(status === "unauthenticated" || status === "error") && (
              <div className="flex items-center gap-3 pl-2 border-l border-[#e2e6df]">
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-xs sm:text-sm font-semibold text-[#1c241e] hover:text-[#225332] transition"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#225332] px-4 py-2 text-xs sm:text-sm font-semibold text-white transition hover:bg-[#173722] shadow-xs active:scale-[0.98]"
                >
                  Daftar Warga
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-[#1c241e] hover:bg-[#f4f5f0] transition"
              aria-label={mobileMenuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="4" y1="18" x2="20" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#e2e6df] bg-[#fafaf7] px-6 py-4 space-y-4 shadow-lg animate-in fade-in duration-150">
            <div className="flex flex-col space-y-2">
              <Link
                href="/reports"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 text-sm font-medium text-[#1c241e]"
              >
                Jelajahi Laporan Warga
              </Link>
              <a
                href="#alur-kerja"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 text-sm font-medium text-[#5c685f]"
              >
                Cara Kerja Platform
              </a>
              <a
                href="#topik"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 text-sm font-medium text-[#5c685f]"
              >
                Topik Lingkungan
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 text-sm font-medium text-[#5c685f]"
              >
                Pertanyaan Umum (FAQ)
              </a>
            </div>

            {status === "authenticated" && user ? (
              <div className="border-t border-[#e2e6df] pt-3 space-y-2">
                <div className="rounded-xl bg-[#f2f7f3] p-3 border border-[#c5dcce]">
                  <p className="text-xs text-[#5c685f]">Masuk sebagai:</p>
                  <p className="text-sm font-semibold text-[#1c241e]">{user.name}</p>
                  <p className="text-xs text-[#225332] capitalize">Peran: {user.role}</p>
                </div>
                {(user.role === "government" || user.role === "admin") && (
                  <Link
                    href="/government"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-center rounded-xl bg-[#225332] py-2 text-sm font-semibold text-white"
                  >
                    Portal Instansi
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    void logout();
                  }}
                  className="w-full text-center rounded-xl border border-[#e2e6df] bg-white py-2 text-sm font-semibold text-[#1c241e]"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <div className="border-t border-[#e2e6df] pt-3 flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center rounded-xl border border-[#e2e6df] bg-white py-2.5 text-sm font-semibold text-[#1c241e]"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center rounded-xl bg-[#225332] py-2.5 text-sm font-semibold text-white shadow-xs"
                >
                  Daftar
                </Link>
                <a
                  href={googleAuthUrl}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center rounded-xl border border-[#e2e6df] bg-white py-2 text-xs font-medium text-[#5c685f]"
                >
                  Masuk dengan Google
                </a>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        {/* ========================================================= */}
        {/* HERO SECTION WITH SUBTLE ENVIRONMENTAL RADAR MOTION       */}
        {/* ========================================================= */}
        <section className="relative overflow-hidden border-b border-[#e2e6df] bg-gradient-to-b from-[#fafaf7] via-[#f2f7f3]/60 to-[#fafaf7] px-4 sm:px-6 py-16 md:py-24">
          {/* Subtle Background Organic Contours & Radar Pulses */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center opacity-40">
            <div className="w-[580px] h-[580px] rounded-full border border-[#225332]/10 animate-pulse-radar" />
            <div className="absolute w-[400px] h-[400px] rounded-full border border-[#225332]/15 animate-pulse-radar" style={{ animationDelay: "1.5s" }} />
            <div className="absolute w-[220px] h-[220px] rounded-full border border-[#225332]/20 animate-pulse-radar" style={{ animationDelay: "3s" }} />
          </div>

          <div className="relative mx-auto max-w-5xl text-center space-y-6">
            {/* Required Authority Eyebrow */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#c5dcce] bg-[#f2f7f3] px-4 py-1.5 text-xs sm:text-sm font-semibold text-[#225332] shadow-2xs">
              <IconShield className="h-3.5 w-3.5 text-[#225332]" />
              <span>Kanal Resmi PPID SMKN 1 Katapang — Terbuka &amp; Akuntabel</span>
            </div>

            {/* Main Editorial Hero Headline */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#1c241e] leading-[1.12] max-w-4xl mx-auto">
              Laporkan Masalah Lingkungan, Wujudkan Solusi Nyata &amp; Terbuka.
            </h1>

            <p className="mx-auto max-w-2xl text-base sm:text-lg text-[#5c685f] leading-relaxed">
              CiviLens memudahkan warga melaporkan tumpukan sampah, genangan banjir, jalan rusak, dan pencemaran dengan bukti foto berkoordinat presisi. Pantau proses verifikasi dan tindak lanjut petugas secara transparan dalam satu sistem.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-4">
              <Link
                href="/reports/create"
                className="inline-flex items-center gap-2 rounded-xl bg-[#225332] px-6 py-3.5 text-sm sm:text-base font-semibold text-white shadow-sm transition hover:bg-[#173722] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#225332]"
              >
                <span>Laporkan Masalah Sekarang</span>
                <IconArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/reports"
                className="inline-flex items-center gap-2 rounded-xl border border-[#e2e6df] bg-white px-6 py-3.5 text-sm sm:text-base font-semibold text-[#1c241e] shadow-2xs transition hover:bg-[#fafaf7] hover:border-[#8c978f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#225332]"
              >
                <span>Lihat Feed Isu Publik</span>
              </Link>
            </div>

            {/* 3-COLUMN FEATURE HIGHLIGHTS (Consistent Balanced Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-12 text-left">
              <div className="rounded-2xl border border-[#e2e6df] bg-white p-6 shadow-xs hover:border-[#225332]/40 transition group">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f2f7f3] text-[#225332] border border-[#c5dcce] group-hover:scale-105 transition">
                  <IconGps className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-base font-bold text-[#1c241e]">Pemetaan Lokasi Akurat</h2>
                <p className="mt-2 text-xs sm:text-sm text-[#5c685f] leading-relaxed">
                  Pin lokasi interaktif memastikan titik koordinat dan nama jalan teridentifikasi jelas untuk mempermudah pengecekan lapangan.
                </p>
              </div>

              <div className="rounded-2xl border border-[#e2e6df] bg-white p-6 shadow-xs hover:border-[#225332]/40 transition group">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f2f7f3] text-[#225332] border border-[#c5dcce] group-hover:scale-105 transition">
                  <IconBrain className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-base font-bold text-[#1c241e]">Analisis AI Penasihat</h2>
                <p className="mt-2 text-xs sm:text-sm text-[#5c685f] leading-relaxed">
                  Bantuan kecerdasan buatan menyusun ringkasan situasi dan mengestimasikan tingkat keparahan guna mempercepat respon tim terkait.
                </p>
              </div>

              <div className="rounded-2xl border border-[#e2e6df] bg-white p-6 shadow-xs hover:border-[#225332]/40 transition group">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f2f7f3] text-[#225332] border border-[#c5dcce] group-hover:scale-105 transition">
                  <IconActivity className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-base font-bold text-[#1c241e]">Jejak Tindak Lanjut Transparan</h2>
                <p className="mt-2 text-xs sm:text-sm text-[#5c685f] leading-relaxed">
                  Setiap tahapan penanganan tercatat di linimasa publik, dari status diterima, ditinjau, diperbaiki, hingga selesai.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Problems Addressed Section */}
        <section className="border-b border-[#e2e6df] bg-white px-4 sm:px-6 py-16">
          <div className="mx-auto max-w-5xl">
            <div className="text-center space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#b45309]">
                Urgensi Lingkungan &amp; Sipil
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1c241e]">
                Masalah Lingkungan yang Kerap Terabaikan
              </h2>
              <p className="mx-auto max-w-2xl text-xs sm:text-sm text-[#5c685f]">
                Banyak permasalahan di lingkungan pemukiman dan fasilitas umum lambat teratasi karena saluran pengaduan manual yang tidak transparan atau minim data visual.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
              <div className="rounded-2xl border border-[#e2e6df] bg-[#fafaf7] p-6 space-y-3">
                <div className="flex items-center gap-3 text-[#225332]">
                  <IconCamera className="h-6 w-6" />
                  <h3 className="text-base sm:text-lg font-bold text-[#1c241e]">Ketiadaan Dokumentasi Berkelanjutan</h3>
                </div>
                <p className="text-xs sm:text-sm text-[#5c685f] leading-relaxed">
                  Keluhan lisan di grup obrolan warga sering kali tenggelam tanpa jejak verifikasi visual yang jelas, menyulitkan pelacakan berulang terhadap tumpukan sampah dan saluran mampet.
                </p>
              </div>

              <div className="rounded-2xl border border-[#e2e6df] bg-[#fafaf7] p-6 space-y-3">
                <div className="flex items-center gap-3 text-[#225332]">
                  <IconShield className="h-6 w-6" />
                  <h3 className="text-base sm:text-lg font-bold text-[#1c241e]">Minimnya Akuntabilitas &amp; Status Terbuka</h3>
                </div>
                <p className="text-xs sm:text-sm text-[#5c685f] leading-relaxed">
                  Masyarakat jarang mengetahui apakah laporan mereka sedang diperiksa, menunggu giliran logistik, atau sudah diperbaiki oleh instansi penanggung jawab.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Workflow Section */}
        <section id="alur-kerja" className="border-b border-[#e2e6df] bg-[#fafaf7] px-4 sm:px-6 py-16 scroll-mt-20">
          <div className="mx-auto max-w-5xl">
            <div className="text-center space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#225332]">
                Alur Transparansi
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1c241e]">
                Bagaimana CiviLens Bekerja
              </h2>
              <p className="mx-auto max-w-2xl text-xs sm:text-sm text-[#5c685f]">
                Empat langkah terstruktur menghubungkan inisiatif warga dengan tindakan nyata petugas lapangan.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">
              {workflowSteps.map((item) => (
                <div
                  key={item.step}
                  className="rounded-2xl border border-[#e2e6df] bg-white p-5 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="text-2xl font-extrabold text-[#225332] font-mono">{item.step}</div>
                    <h3 className="mt-3 text-sm sm:text-base font-bold text-[#1c241e]">{item.title}</h3>
                    <p className="mt-2 text-xs text-[#5c685f] leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Topic Discovery Section */}
        <section id="topik" className="border-b border-[#e2e6df] bg-white px-4 sm:px-6 py-16 scroll-mt-20">
          <div className="mx-auto max-w-5xl">
            <div className="text-center space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#225332]">
                Kategori Laporan Utama
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1c241e]">
                Topik Masalah Lingkungan &amp; Fasilitas
              </h2>
              <p className="mx-auto max-w-2xl text-xs sm:text-sm text-[#5c685f]">
                Temukan atau buat laporan berdasarkan topik spesifik yang sering dihadapi oleh komunitas sekitar Anda.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 mt-10">
              {topics.map((topic) => (
                <Link
                  key={topic.slug}
                  href={`/reports?topic=${topic.slug}`}
                  className="group rounded-xl border border-[#e2e6df] bg-[#fafaf7] p-4 transition hover:border-[#225332] hover:bg-white shadow-2xs"
                >
                  <span className="text-sm sm:text-base font-bold text-[#1c241e] group-hover:text-[#225332] transition">
                    {topic.name}
                  </span>
                  <p className="mt-1 text-xs text-[#5c685f] leading-relaxed">{topic.desc}</p>
                </Link>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/reports"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#225332] hover:underline"
              >
                <span>Lihat semua laporan aktif berdasarkan topik</span>
                <IconArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="border-b border-[#e2e6df] bg-[#fafaf7] px-4 sm:px-6 py-16 scroll-mt-20">
          <div className="mx-auto max-w-3xl">
            <div className="text-center space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#225332]">
                Bantuan &amp; Informasi
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1c241e]">
                Pertanyaan yang Sering Diajukan
              </h2>
              <p className="text-xs sm:text-sm text-[#5c685f]">
                Segala hal yang perlu Anda ketahui mengenai mekanisme pelaporan di CiviLens.
              </p>
            </div>

            <div className="mt-10 space-y-3">
              {faqs.map((faq, idx) => (
                <div
                  key={faq.q}
                  className="rounded-xl border border-[#e2e6df] bg-white transition overflow-hidden shadow-2xs"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="flex w-full items-center justify-between p-4 sm:p-5 text-left text-xs sm:text-sm font-bold text-[#1c241e] hover:bg-[#fafaf7]"
                    aria-expanded={openFaq === idx}
                  >
                    <span>{faq.q}</span>
                    {openFaq === idx ? (
                      <IconChevronUp className="h-4 w-4 shrink-0 text-[#225332]" />
                    ) : (
                      <IconChevronDown className="h-4 w-4 shrink-0 text-[#5c685f]" />
                    )}
                  </button>
                  {openFaq === idx && (
                    <div className="border-t border-[#edf0ea] bg-[#fafaf7] p-4 sm:p-5 text-xs sm:text-sm text-[#5c685f] leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom Editorial Call To Action */}
        <section className="bg-[#173722] px-4 sm:px-6 py-16 text-white text-center">
          <div className="mx-auto max-w-3xl space-y-5">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#fafaf7] leading-snug tracking-tight">
              Mulai Berkontribusi untuk Lingkungan Lebih Bersih &amp; Terawat
            </h2>
            <p className="mx-auto max-w-xl text-xs sm:text-sm text-[#c5dcce] leading-relaxed">
              Jadilah bagian dari warga aktif yang peduli pada fasilitas umum dan kebersihan lingkungan. Laporkan isu sekitar Anda hari ini.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <Link
                href="/reports/create"
                className="inline-flex items-center gap-2 rounded-xl bg-[#225332] border border-[#c5dcce]/30 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-sm transition hover:bg-[#2a6a3e] active:scale-[0.98]"
              >
                <span>Kirim Laporan Pertama</span>
                <IconCheck className="h-4 w-4" />
              </Link>
              <Link
                href="/reports"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-xs sm:text-sm font-semibold text-white transition hover:bg-white/15"
              >
                <span>Jelajahi Feed Isu</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Public Footer */}
      <footer className="border-t border-[#e2e6df] bg-[#fafaf7] py-12 text-sm text-[#5c685f]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#225332] text-white">
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="16" cy="16" r="10" stroke="#d0f0c0" strokeWidth="1.8" strokeDasharray="3 2" opacity="0.6"/>
                  <path d="M16 8C16 8 10 11 10 18C10 21.5 12.7 24 16 24C19.3 24 22 21.5 22 18C22 11 16 8 16 8Z" fill="#d0f0c0" fillOpacity="0.25" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 24V16M16 16C16 16 13 14 12 12" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="font-bold text-lg text-[#1c241e]">CiviLens</span>
            </div>
            <p className="text-xs text-[#5c685f] max-w-sm leading-relaxed">
              Platform keterbukaan sipil untuk pelaporan masalah lingkungan dan fasilitas publik di Indonesia. Menjembatani aspirasi warga dan penanganan instansi secara transparan.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-[#1c241e] text-xs uppercase tracking-wider mb-3">
              Navigasi
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/reports" className="hover:text-[#225332] transition">
                  Feed Laporan
                </Link>
              </li>
              <li>
                <Link href="/reports/create" className="hover:text-[#225332] transition">
                  Buat Laporan Baru
                </Link>
              </li>
              <li>
                <a href="#alur-kerja" className="hover:text-[#225332] transition">
                  Cara Kerja
                </a>
              </li>
              <li>
                <a href="#topik" className="hover:text-[#225332] transition">
                  Topik Lingkungan
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-[#1c241e] text-xs uppercase tracking-wider mb-3">
              Akses Pengguna
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/login" className="hover:text-[#225332] transition">
                  Masuk Akun
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-[#225332] transition">
                  Daftar Warga Baru
                </Link>
              </li>
              <li>
                <a href={googleAuthUrl} className="hover:text-[#225332] transition">
                  Masuk dengan Google
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-8 mt-8 border-t border-[#e2e6df] flex flex-col sm:flex-row items-center justify-between text-xs text-[#8c978f] gap-4">
          <p>&copy; {new Date().getFullYear()} CiviLens. Hak cipta dilindungi.</p>
          <p>Mendukung partisipasi sipil &amp; kebersihan lingkungan.</p>
        </div>
      </footer>
    </div>
  );
}
