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
  IconSparkles,
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
    <div className="flex min-h-screen flex-col bg-[#fafaf5] text-[#2c2926]">
      {/* Navigation Bar */}
      <header className="border-b border-[#eae2d3] bg-[#fafaf5]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-4">
          <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-90">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1e4d2b] text-white shadow-xs">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
              </svg>
            </div>
            <span
              className="text-xl font-bold tracking-tight text-[#1e4d2b]"
              style={{ fontFamily: "Georgia, serif" }}
            >
              CiviLens
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Navigasi Utama">
            <Link
              href="/reports"
              className="text-sm font-medium text-[#4a6b52] hover:text-[#1e4d2b] transition"
            >
              Jelajahi Laporan
            </Link>
            <a
              href="#alur-kerja"
              className="text-sm font-medium text-[#4a6b52] hover:text-[#1e4d2b] transition"
            >
              Cara Kerja
            </a>
            <a
              href="#topik"
              className="text-sm font-medium text-[#4a6b52] hover:text-[#1e4d2b] transition"
            >
              Topik Isu
            </a>
            <a
              href="#faq"
              className="text-sm font-medium text-[#4a6b52] hover:text-[#1e4d2b] transition"
            >
              FAQ
            </a>

            {status === "loading" && (
              <span className="text-xs text-[#57524d]">Memeriksa sesi...</span>
            )}

            {status === "authenticated" && user && (
              <div className="flex items-center gap-3 pl-2 border-l border-[#eae2d3]">
                {(user.role === "government" || user.role === "admin") && (
                  <Link
                    href="/government"
                    className="inline-flex items-center gap-1 rounded-lg bg-[#1e4d2b] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#163a20] transition shadow-xs"
                  >
                    <span>Portal Instansi</span>
                  </Link>
                )}
                <Link
                  href="/bookmarks"
                  className="text-xs font-semibold text-[#4a6b52] hover:text-[#1e4d2b] transition"
                >
                  Tersimpan
                </Link>
                <Link
                  href={`/users/${user.id}`}
                  className="text-xs font-medium text-[#1e4d2b] hover:underline"
                >
                  <span className="font-semibold">{user.name}</span>
                </Link>
                <button
                  type="button"
                  onClick={() => void logout()}
                  className="rounded-lg border border-[#cbe0ce] bg-white px-3 py-1.5 text-xs font-semibold text-[#1e4d2b] transition hover:bg-[#f4f8f4]"
                >
                  Keluar
                </button>
              </div>
            )}

            {(status === "unauthenticated" || status === "error") && (
              <div className="flex items-center gap-3 pl-2 border-l border-[#eae2d3]">
                <Link
                  href="/login"
                  className="px-3 py-2 text-sm font-semibold text-[#1e4d2b] transition hover:text-[#2d6a36]"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#1e4d2b] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#163a20] shadow-xs"
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
              className="p-2 rounded-lg text-[#1e4d2b] hover:bg-[#f4f8f4] transition"
              aria-label={mobileMenuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
          <div className="md:hidden border-t border-[#eae2d3] bg-[#fafaf5] px-6 py-4 space-y-4 shadow-lg">
            <div className="flex flex-col space-y-2">
              <Link
                href="/reports"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 text-sm font-medium text-[#1e4d2b]"
              >
                Jelajahi Laporan Warga
              </Link>
              <a
                href="#alur-kerja"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 text-sm font-medium text-[#4a6b52]"
              >
                Cara Kerja Platform
              </a>
              <a
                href="#topik"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 text-sm font-medium text-[#4a6b52]"
              >
                Topik Lingkungan
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 text-sm font-medium text-[#4a6b52]"
              >
                Pertanyaan Umum (FAQ)
              </a>
            </div>

            {status === "authenticated" && user ? (
              <div className="border-t border-[#eae2d3] pt-3 space-y-2">
                <div className="rounded-lg bg-[#f4f8f4] p-3 border border-[#cbe0ce]">
                  <p className="text-xs text-[#57524d]">Masuk sebagai:</p>
                  <p className="text-sm font-semibold text-[#1e4d2b]">{user.name}</p>
                  <p className="text-xs text-[#22512a] capitalize">Peran: {user.role}</p>
                </div>
                {(user.role === "government" || user.role === "admin") && (
                  <Link
                    href="/government"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-center rounded-lg bg-[#1e4d2b] py-2 text-sm font-semibold text-white"
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
                  className="w-full text-center rounded-lg border border-[#cbe0ce] bg-white py-2 text-sm font-semibold text-[#1e4d2b]"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <div className="border-t border-[#eae2d3] pt-3 flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center rounded-lg border border-[#cbe0ce] bg-white py-2.5 text-sm font-semibold text-[#1e4d2b]"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center rounded-lg bg-[#1e4d2b] py-2.5 text-sm font-semibold text-white shadow-xs"
                >
                  Daftar
                </Link>
                <a
                  href={googleAuthUrl}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center rounded-lg border border-[#eae2d3] bg-white py-2 text-xs font-medium text-[#57524d]"
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
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-[#eae2d3] bg-gradient-to-b from-[#fafaf5] via-[#f4f8f4] to-[#fafaf5] px-4 sm:px-6 py-16 md:py-24">
          <div className="mx-auto max-w-5xl text-center space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#c8dfc8] bg-[#f0f4ee] px-4 py-1.5 text-xs sm:text-sm font-semibold text-[#1e4d2b] shadow-2xs">
              <IconSparkles className="h-4 w-4 text-[#7a4400]" />
              <span>Platform Keterbukaan &amp; Pelaporan Lingkungan Warga</span>
            </div>

            <h1
              className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#1e4d2b] leading-[1.15]"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Laporkan Masalah Lingkungan, Wujudkan Solusi Nyata &amp; Terbuka.
            </h1>

            <p className="mx-auto max-w-3xl text-base sm:text-lg md:text-xl text-[#57524d] leading-relaxed">
              CiviLens memudahkan warga melaporkan tumpukan sampah, genangan banjir, jalan rusak, dan pencemaran dengan bukti foto berkoordinat presisi. Pantau proses verifikasi dan tindak lanjut petugas secara transparan dalam satu sistem.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-4">
              <Link
                href="/reports/create"
                className="inline-flex items-center gap-2 rounded-xl bg-[#1e4d2b] px-6 py-3.5 text-sm sm:text-base font-semibold text-white shadow-md transition hover:bg-[#163a20] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4d2b]"
              >
                <span>Laporkan Masalah Sekarang</span>
                <IconArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/reports"
                className="inline-flex items-center gap-2 rounded-xl border border-[#c8dfc8] bg-white px-6 py-3.5 text-sm sm:text-base font-semibold text-[#1e4d2b] shadow-xs transition hover:bg-[#f4f8f4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4d2b]"
              >
                <span>Lihat Feed Isu Publik</span>
              </Link>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 gap-4 pt-12 text-left sm:grid-cols-3">
              <div className="rounded-2xl border border-[#c8dfc8] bg-white p-6 shadow-xs hover:border-[#1e4d2b] transition">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d0f0c0] text-[#1e4d2b]">
                  <IconGps className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-base font-bold text-[#1e4d2b]">Pemetaan Lokasi Akurat</h2>
                <p className="mt-2 text-sm text-[#57524d] leading-relaxed">
                  Pin lokasi interaktif memastikan titik koordinat dan nama jalan teridentifikasi jelas untuk mempermudah pengecekan lapangan.
                </p>
              </div>

              <div className="rounded-2xl border border-[#c8dfc8] bg-white p-6 shadow-xs hover:border-[#1e4d2b] transition">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d0f0c0] text-[#1e4d2b]">
                  <IconBrain className="h-5 w-5" />
                </div>
                <h2 className="mt-2 text-base font-bold text-[#1e4d2b]">Analisis AI Penasihat</h2>
                <p className="mt-2 text-sm text-[#57524d] leading-relaxed">
                  Bantuan kecerdasan buatan menyusun ringkasan situasi dan mengestimasikan tingkat keparahan guna mempercepat respon tim terkait.
                </p>
              </div>

              <div className="rounded-2xl border border-[#c8dfc8] bg-white p-6 shadow-xs hover:border-[#1e4d2b] transition">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d0f0c0] text-[#1e4d2b]">
                  <IconActivity className="h-5 w-5" />
                </div>
                <h2 className="mt-2 text-base font-bold text-[#1e4d2b]">Jejak Tindak Lanjut Transparan</h2>
                <p className="mt-2 text-sm text-[#57524d] leading-relaxed">
                  Setiap tahapan penanganan tercatat di linimasa publik, dari status diterima, ditinjau, diperbaiki, hingga selesai.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Problems Addressed Section */}
        <section className="border-b border-[#eae2d3] bg-white px-4 sm:px-6 py-16">
          <div className="mx-auto max-w-5xl">
            <div className="text-center space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#7a4400]">
                Urgensi Lingkungan &amp; Sipil
              </span>
              <h2
                className="text-2xl sm:text-4xl font-bold text-[#1e4d2b]"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Masalah Lingkungan yang Kerap Terabaikan
              </h2>
              <p className="mx-auto max-w-2xl text-sm sm:text-base text-[#57524d]">
                Banyak permasalahan di lingkungan pemukiman dan fasilitas umum lambat teratasi karena saluran pengaduan manual yang tidak transparan atau minim data visual.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
              <div className="rounded-2xl border border-[#eae2d3] bg-[#fafaf5] p-6 space-y-3">
                <div className="flex items-center gap-3 text-[#7a4400]">
                  <IconCamera className="h-6 w-6" />
                  <h3 className="text-lg font-bold text-[#1e4d2b]">Ketiadaan Dokumentasi Berkelanjutan</h3>
                </div>
                <p className="text-sm text-[#57524d] leading-relaxed">
                  Keluhan lisan di grup obrolan warga sering kali tenggelam tanpa jejak verifikasi visual yang jelas, menyulitkan pelacakan berulang terhadap tumpukan sampah dan saluran mampet.
                </p>
              </div>

              <div className="rounded-2xl border border-[#eae2d3] bg-[#fafaf5] p-6 space-y-3">
                <div className="flex items-center gap-3 text-[#7a4400]">
                  <IconShield className="h-6 w-6" />
                  <h3 className="text-lg font-bold text-[#1e4d2b]">Minimnya Akuntabilitas &amp; Status Terbuka</h3>
                </div>
                <p className="text-sm text-[#57524d] leading-relaxed">
                  Masyarakat jarang mengetahui apakah laporan mereka sedang diperiksa, menunggu giliran logistik, atau sudah diperbaiki oleh instansi penanggung jawab.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Workflow Section */}
        <section id="alur-kerja" className="border-b border-[#eae2d3] bg-[#fafaf5] px-4 sm:px-6 py-16 scroll-mt-20">
          <div className="mx-auto max-w-5xl">
            <div className="text-center space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#7a4400]">
                Alur Transparansi
              </span>
              <h2
                className="text-2xl sm:text-4xl font-bold text-[#1e4d2b]"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Bagaimana CiviLens Bekerja
              </h2>
              <p className="mx-auto max-w-2xl text-sm sm:text-base text-[#57524d]">
                Empat langkah terstruktur menghubungkan inisiatif warga dengan tindakan nyata petugas lapangan.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
              {workflowSteps.map((item) => (
                <div
                  key={item.step}
                  className="relative rounded-2xl border border-[#c8dfc8] bg-white p-6 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="text-2xl font-extrabold text-[#7a4400] font-mono">{item.step}</div>
                    <h3 className="mt-3 text-base font-bold text-[#1e4d2b]">{item.title}</h3>
                    <p className="mt-2 text-sm text-[#57524d] leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Topic Discovery Section */}
        <section id="topik" className="border-b border-[#eae2d3] bg-white px-4 sm:px-6 py-16 scroll-mt-20">
          <div className="mx-auto max-w-5xl">
            <div className="text-center space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#7a4400]">
                Kategori Laporan Utama
              </span>
              <h2
                className="text-2xl sm:text-4xl font-bold text-[#1e4d2b]"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Topik Masalah Lingkungan &amp; Fasilitas
              </h2>
              <p className="mx-auto max-w-2xl text-sm sm:text-base text-[#57524d]">
                Temukan atau buat laporan berdasarkan topik spesifik yang sering dihadapi oleh komunitas sekitar Anda.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-10">
              {topics.map((topic) => (
                <Link
                  key={topic.slug}
                  href={`/reports?topic=${topic.slug}`}
                  className="group rounded-xl border border-[#eae2d3] bg-[#fafaf5] p-4 transition hover:border-[#1e4d2b] hover:bg-white shadow-xs"
                >
                  <span className="text-base font-bold text-[#1e4d2b] group-hover:text-[#2d6a36]">
                    {topic.name}
                  </span>
                  <p className="mt-1.5 text-xs text-[#57524d] leading-normal">{topic.desc}</p>
                </Link>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/reports"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1e4d2b] hover:underline"
              >
                <span>Lihat semua laporan aktif berdasarkan topik</span>
                <IconArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="border-b border-[#eae2d3] bg-[#fafaf5] px-4 sm:px-6 py-16 scroll-mt-20">
          <div className="mx-auto max-w-3xl">
            <div className="text-center space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#7a4400]">
                Bantuan &amp; Informasi
              </span>
              <h2
                className="text-2xl sm:text-4xl font-bold text-[#1e4d2b]"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Pertanyaan yang Sering Diajukan
              </h2>
              <p className="text-sm sm:text-base text-[#57524d]">
                Segala hal yang perlu Anda ketahui mengenai mekanisme pelaporan di CiviLens.
              </p>
            </div>

            <div className="mt-10 space-y-3">
              {faqs.map((faq, idx) => (
                <div
                  key={faq.q}
                  className="rounded-xl border border-[#c8dfc8] bg-white transition overflow-hidden shadow-2xs"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="flex w-full items-center justify-between p-5 text-left text-sm sm:text-base font-bold text-[#1e4d2b] hover:bg-[#f4f8f4]"
                    aria-expanded={openFaq === idx}
                  >
                    <span>{faq.q}</span>
                    {openFaq === idx ? (
                      <IconChevronUp className="h-5 w-5 shrink-0 text-[#7a4400]" />
                    ) : (
                      <IconChevronDown className="h-5 w-5 shrink-0 text-[#4a6b52]" />
                    )}
                  </button>
                  {openFaq === idx && (
                    <div className="border-t border-[#eae2d3] bg-[#fafaf5] p-5 text-sm text-[#57524d] leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA Section */}
        <section className="bg-gradient-to-br from-[#1e4d2b] to-[#163a20] px-4 sm:px-6 py-16 text-white text-center">
          <div className="mx-auto max-w-4xl space-y-6">
            <h2
              className="text-2xl sm:text-4xl font-extrabold text-[#fafaf5] leading-tight"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Mulai Berkontribusi untuk Lingkungan Lebih Bersih &amp; Terawat
            </h2>
            <p className="mx-auto max-w-2xl text-sm sm:text-base text-[#d0f0c0] leading-relaxed">
              Jadilah bagian dari warga aktif yang peduli pada fasilitas umum dan kebersihan lingkungan. Laporkan isu sekitar Anda hari ini.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-4">
              <Link
                href="/reports/create"
                className="inline-flex items-center gap-2 rounded-xl bg-[#d0f0c0] px-6 py-3.5 text-sm sm:text-base font-bold text-[#1e4d2b] shadow-md transition hover:bg-[#bce6aa] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d0f0c0]"
              >
                <span>Kirim Laporan Pertama</span>
                <IconCheck className="h-4 w-4" />
              </Link>
              <Link
                href="/reports"
                className="inline-flex items-center gap-2 rounded-xl border border-[#d0f0c0]/40 bg-[#1e4d2b]/60 px-6 py-3.5 text-sm sm:text-base font-semibold text-white transition hover:bg-[#1e4d2b]"
              >
                <span>Jelajahi Feed Isu</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Public Footer */}
      <footer className="border-t border-[#eae2d3] bg-[#fafaf5] py-12 text-sm text-[#57524d]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1e4d2b] text-white">
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                  <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                </svg>
              </div>
              <span className="font-bold text-lg text-[#1e4d2b] font-serif">CiviLens</span>
            </div>
            <p className="text-xs text-[#57524d] max-w-sm leading-relaxed">
              Platform keterbukaan sipil untuk pelaporan masalah lingkungan dan fasilitas publik di Indonesia. Menjembatani aspirasi warga dan penanganan instansi secara transparan.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-[#1e4d2b] text-xs uppercase tracking-wider mb-3">
              Navigasi
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/reports" className="hover:text-[#1e4d2b] transition">
                  Feed Laporan
                </Link>
              </li>
              <li>
                <Link href="/reports/create" className="hover:text-[#1e4d2b] transition">
                  Buat Laporan Baru
                </Link>
              </li>
              <li>
                <a href="#alur-kerja" className="hover:text-[#1e4d2b] transition">
                  Cara Kerja
                </a>
              </li>
              <li>
                <a href="#topik" className="hover:text-[#1e4d2b] transition">
                  Topik Lingkungan
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-[#1e4d2b] text-xs uppercase tracking-wider mb-3">
              Akses Pengguna
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/login" className="hover:text-[#1e4d2b] transition">
                  Masuk Akun
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-[#1e4d2b] transition">
                  Daftar Warga Baru
                </Link>
              </li>
              <li>
                <a href={googleAuthUrl} className="hover:text-[#1e4d2b] transition">
                  Masuk dengan Google
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-8 mt-8 border-t border-[#eae2d3] flex flex-col sm:flex-row items-center justify-between text-xs text-[#8c857e] gap-4">
          <p>&copy; {new Date().getFullYear()} CiviLens. Hak cipta dilindungi.</p>
          <p>Mendukung partisipasi sipil &amp; kebersihan lingkungan.</p>
        </div>
      </footer>
    </div>
  );
}
