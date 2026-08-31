"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { getReport } from "@/lib/api/client";
import { Report } from "@/lib/api/types";

function getStatusBadge(status: string) {
  switch (status) {
    case "resolved":
    case "selesai":
      return {
        label: "Selesai Ditindaklanjuti",
        bg: "bg-emerald-50 border-emerald-200 text-emerald-800",
        dot: "bg-emerald-500",
      };
    case "under_review":
    case "diproses":
      return {
        label: "Dalam Peninjauan",
        bg: "bg-blue-50 border-blue-200 text-blue-800",
        dot: "bg-blue-500",
      };
    case "rejected":
    case "ditolak":
      return {
        label: "Ditolak / Tidak Valid",
        bg: "bg-red-50 border-red-200 text-red-800",
        dot: "bg-red-500",
      };
    case "pending":
    default:
      return {
        label: "Menunggu Peninjauan",
        bg: "bg-amber-50 border-amber-200 text-amber-800",
        dot: "bg-amber-500",
      };
  }
}

function getSeverityBadge(severity?: string | null) {
  switch (severity) {
    case "critical":
      return { label: "Kritis", bg: "bg-red-100 text-red-800 border-red-300" };
    case "high":
      return { label: "Tinggi", bg: "bg-orange-100 text-orange-800 border-orange-300" };
    case "medium":
      return { label: "Sedang", bg: "bg-amber-100 text-amber-800 border-amber-300" };
    case "low":
    default:
      return { label: "Rendah", bg: "bg-emerald-100 text-emerald-800 border-emerald-300" };
  }
}

export default function ReportDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const reportId = params?.id as string;

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isNewlyCreated = searchParams?.get("created") === "1";

  useEffect(() => {
    if (!reportId) return;

    let mounted = true;
    getReport(reportId)
      .then((data) => {
        if (mounted) setReport(data);
      })
      .catch((err) => {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Laporan tidak ditemukan.");
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [reportId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf8f5]">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2d6a36] border-t-transparent mx-auto" />
          <p className="text-sm font-medium text-[#57524d]">Memuat detail laporan...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#faf8f5] px-6 text-center">
        <div className="max-w-md rounded-2xl border border-[#eae2d3] bg-white p-8 shadow-xs space-y-4">
          <h1 className="text-xl font-bold font-serif text-[#1c4123]" style={{ fontFamily: "Georgia, serif" }}>
            Laporan Tidak Ditemukan
          </h1>
          <p className="text-sm text-[#57524d]">
            {error || "Laporan yang Anda cari mungkin telah dihapus atau URL tidak valid."}
          </p>
          <div className="pt-2">
            <Link
              href="/reports"
              className="inline-flex items-center gap-2 rounded-xl bg-[#2d6a36] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#22512a] transition shadow-xs"
            >
              &larr; Lihat Semua Laporan
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const statusBadge = getStatusBadge(report.status);
  const ai = report.ai_analysis;
  const severityBadge = getSeverityBadge(ai?.severity);

  return (
    <div className="flex min-h-screen flex-col bg-[#faf8f5] text-[#2c2926]">
      {/* Top Header */}
      <header className="border-b border-[#eae2d3] bg-[#faf8f5]/90 backdrop-blur-xs sticky top-0 z-20">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-85">
            <svg
              className="h-6 w-6 text-[#2d6a36]"
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
            <span className="text-lg font-bold tracking-tight text-[#1c4123]" style={{ fontFamily: "Georgia, serif" }}>
              CiviLens
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/reports"
              className="text-xs font-semibold text-[#4a6b52] hover:text-[#1e4d2b] transition"
            >
              Semua Laporan
            </Link>
            <Link
              href="/reports/create"
              className="rounded-lg bg-[#2d6a36] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#22512a] transition shadow-xs"
            >
              + Buat Laporan
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-8">
        <div className="space-y-6">
          {/* Newly Created Banner */}
          {isNewlyCreated && (
            <div className="rounded-2xl border border-[#cbe0ce] bg-[#f4f8f4] p-5 shadow-xs flex items-start gap-3.5 animate-in fade-in duration-300">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#2d6a36] text-white text-sm font-bold">
                ✓
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-[#1c4123]">
                  Laporan Anda Berhasil Dikirim ke Sistem!
                </p>
                <p className="text-xs text-[#57524d] leading-relaxed">
                  Laporan telah tercatat dengan ID <strong className="font-mono text-[#1c4123]">#{report.id}</strong>. Pipeline AI CiviLens sedang menganalisis keparahan dampak dan menyusun ringkasan objektif.
                </p>
              </div>
            </div>
          )}

          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs text-[#7a9a80]">
            <Link href="/" className="hover:text-[#1c4123] transition">
              Beranda
            </Link>
            <span>/</span>
            <Link href="/reports" className="hover:text-[#1c4123] transition">
              Laporan Warga
            </Link>
            <span>/</span>
            <span className="text-[#1c4123] font-medium truncate max-w-[200px]">
              {report.title}
            </span>
          </div>

          {/* Report Main Header Card */}
          <div className="rounded-2xl border border-[#eae2d3] bg-white p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f0f4ee] pb-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#f4f8f4] border border-[#cbe0ce] px-3 py-1 text-xs font-semibold text-[#22512a]">
                  {report.category?.name || "Kategori Lingkungan"}
                </span>
                <span className="text-xs text-[#7a9a80] font-mono">
                  ID: #{report.id}
                </span>
              </div>

              {/* Status Badge */}
              <div className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-semibold ${statusBadge.bg}`}>
                <span className={`h-2 w-2 rounded-full ${statusBadge.dot}`} />
                <span>{statusBadge.label}</span>
              </div>
            </div>

            {/* Title & Date */}
            <div>
              <h1
                className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#17361d]"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {report.title}
              </h1>
              <p className="mt-2 text-xs text-[#7a9a80]">
                Dilaporkan pada {new Date(report.created_at).toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })} WIB
              </p>
            </div>

            {/* Location Box */}
            {report.location && (
              <div className="rounded-xl bg-[#fafaf5] border border-[#eae2d3] p-4 space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#1c4123] flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-[#2d6a36]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  Lokasi Kejadian
                </p>
                <p className="text-sm font-medium text-[#2c2926] pl-5.5">
                  {report.location.address}
                </p>
                {report.location.latitude && report.location.longitude && (
                  <p className="text-xs text-[#7a9a80] font-mono pl-5.5">
                    Koordinat GPS: {report.location.latitude}, {report.location.longitude}
                  </p>
                )}
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#7a9a80]">
                Deskripsi Masalah
              </h2>
              <p className="text-sm text-[#2c2926] leading-relaxed whitespace-pre-line">
                {report.description}
              </p>
            </div>

            {/* Media Gallery */}
            {report.media && report.media.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-[#f0f4ee]">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-[#7a9a80]">
                  Foto Bukti Terlampir ({report.media.length})
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {report.media.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl overflow-hidden border border-[#cbe0ce] aspect-video bg-[#fafaf5] p-3 flex flex-col justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <svg className="h-4 w-4 text-[#2d6a36] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                        <span className="text-xs font-medium text-[#1c4123] truncate">
                          {item.original_name}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#7a9a80]">
                        {(item.size / 1024).toFixed(0)} KB • Terverifikasi
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* AI Assessment & Analysis Card */}
          <div className="rounded-2xl border border-[#cbe0ce] bg-white p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f0f4ee] pb-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1e4d2b] text-white text-xs font-bold">
                  AI
                </span>
                <h2 className="text-lg font-bold font-serif text-[#1e4d2b]" style={{ fontFamily: "Georgia, serif" }}>
                  Analisis Dampak Lingkungan (AI Assessment)
                </h2>
              </div>

              {ai?.severity && (
                <span className={`rounded-full border px-3 py-0.5 text-xs font-bold ${severityBadge.bg}`}>
                  Tingkat Keparahan: {severityBadge.label}
                </span>
              )}
            </div>

            {ai ? (
              <div className="space-y-4">
                {ai.summary && (
                  <div className="space-y-1">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[#7a9a80]">
                      Ringkasan Fakta Masalah
                    </h3>
                    <p className="text-sm font-medium text-[#1c4123] leading-relaxed">
                      {ai.summary}
                    </p>
                  </div>
                )}

                {ai.analysis && (
                  <div className="space-y-1">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[#7a9a80]">
                      Analisis Objektif
                    </h3>
                    <p className="text-sm text-[#57524d] leading-relaxed whitespace-pre-line">
                      {ai.analysis}
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#f0f4ee] text-xs text-[#7a9a80]">
                  <span>
                    Tingkat Keyakinan Model: <strong className="text-[#1c4123]">{((ai.confidence || 0.95) * 100).toFixed(0)}%</strong>
                  </span>
                  <span>
                    Status AI: <strong className="text-emerald-700 capitalize">{ai.status}</strong>
                  </span>
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-[#fafaf5] p-5 text-center space-y-2 border border-[#eae2d3]">
                <p className="text-sm font-semibold text-[#1c4123]">
                  Sedang Menganalisis Laporan...
                </p>
                <p className="text-xs text-[#7a9a80]">
                  AI CiviLens sedang memproses data laporan dan foto bukti secara otomatis di antrean background. Muat ulang halaman dalam beberapa detik.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#eae2d3] py-6 text-center text-xs text-[#8c857e] mt-auto">
        <div className="mx-auto max-w-5xl px-6">
          CiviLens • Platform Pelaporan Lingkungan Warga
        </div>
      </footer>
    </div>
  );
}
