"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import {
  getReport,
  retryReportAiAnalysis,
  toggleReportReaction,
  toggleReportBookmark,
} from "@/lib/api/client";
import { Report } from "@/lib/api/types";
import ReportComments from "@/components/reports/report-comments";
import ReportTimeline from "@/components/reports/report-timeline";
import FlagReportModal from "@/components/reports/flag-report-modal";
import { ReportDetailSkeleton } from "@/components/ui/skeletons";
import {
  IconPin,
  IconSparkles,
  IconThumbsUp,
  IconBookmark,
  IconUser,
  IconShield,
} from "@/components/ui/icons";

function getStatusBadge(status: string) {
  switch (status) {
    case "closed":
    case "ditutup":
      return {
        label: "Ditutup Resmi",
        bg: "bg-gray-100 border-gray-300 text-gray-800",
        dot: "bg-gray-500",
      };
    case "resolved":
    case "selesai":
      return {
        label: "Selesai Ditindaklanjuti",
        bg: "bg-emerald-50 border-emerald-200 text-emerald-800",
        dot: "bg-emerald-500",
      };
    case "in_progress":
    case "ditindaklanjuti":
      return {
        label: "Sedang Ditindaklanjuti",
        bg: "bg-purple-50 border-purple-200 text-purple-800",
        dot: "bg-purple-500",
      };
    case "verified":
    case "terverifikasi":
      return {
        label: "Terverifikasi",
        bg: "bg-teal-50 border-teal-200 text-teal-800",
        dot: "bg-teal-500",
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
  const { user } = useAuth();

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isRetryingAi, setIsRetryingAi] = useState(false);
  const [reacting, setReacting] = useState(false);
  const [bookmarking, setBookmarking] = useState(false);
  const [flagModalOpen, setFlagModalOpen] = useState(false);

  const isNewlyCreated = searchParams?.get("created") === "1";

  // Initial load
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

  // Polling while AI analysis is pending/processing
  useEffect(() => {
    if (!report || !reportId) return;

    const aiStatus = report.ai_analysis?.status;
    if (aiStatus !== "pending" && aiStatus !== "processing") return;

    const interval = setInterval(() => {
      getReport(reportId)
        .then((updated) => {
          setReport(updated);
        })
        .catch(() => {});
    }, 3000);

    return () => clearInterval(interval);
  }, [report, reportId]);

  const handleRetryAi = async () => {
    if (isRetryingAi || !reportId) return;
    setIsRetryingAi(true);

    try {
      const updated = await retryReportAiAnalysis(reportId);
      setReport(updated);
    } catch {
      // Handled silently
    } finally {
      setIsRetryingAi(false);
    }
  };

  const handleToggleReaction = async () => {
    if (!user || reacting || !report) return;
    setReacting(true);

    const previousReacted = report.user_reacted;
    const previousCount = report.reactions_count || 0;
    const nextReacted = !previousReacted;
    const nextCount = nextReacted ? previousCount + 1 : Math.max(0, previousCount - 1);

    // Optimistic UI update
    setReport((prev) =>
      prev
        ? {
            ...prev,
            user_reacted: nextReacted,
            reactions_count: nextCount,
          }
        : prev
    );

    try {
      const res = await toggleReportReaction(report.id, "support");
      setReport((prev) =>
        prev
          ? {
              ...prev,
              user_reacted: res.reacted,
              reactions_count: res.reactions_count,
            }
          : prev
      );
    } catch {
      // Rollback on failure
      setReport((prev) =>
        prev
          ? {
              ...prev,
              user_reacted: previousReacted,
              reactions_count: previousCount,
            }
          : prev
      );
    } finally {
      setReacting(false);
    }
  };

  const handleToggleBookmark = async () => {
    if (!user || bookmarking || !report) return;
    setBookmarking(true);

    const previousBookmarked = report.user_bookmarked;
    const previousCount = report.bookmarks_count || 0;
    const nextBookmarked = !previousBookmarked;
    const nextCount = nextBookmarked ? previousCount + 1 : Math.max(0, previousCount - 1);

    // Optimistic UI update
    setReport((prev) =>
      prev
        ? {
            ...prev,
            user_bookmarked: nextBookmarked,
            bookmarks_count: nextCount,
          }
        : prev
    );

    try {
      const res = await toggleReportBookmark(report.id);
      setReport((prev) =>
        prev
          ? {
              ...prev,
              user_bookmarked: res.bookmarked,
              bookmarks_count: res.bookmarks_count,
            }
          : prev
      );
    } catch {
      // Rollback on failure
      setReport((prev) =>
        prev
          ? {
              ...prev,
              user_bookmarked: previousBookmarked,
              bookmarks_count: previousCount,
            }
          : prev
      );
    } finally {
      setBookmarking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#fafaf5] text-[#2c2926]">
        <header className="border-b border-[#eae2d3] bg-[#fafaf5]/90 backdrop-blur-xs sticky top-0 z-20">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <Link href="/reports" className="flex items-center gap-2.5 transition-opacity hover:opacity-85">
              <div className="h-6 w-6 rounded-full bg-[#1e4d2b] text-white flex items-center justify-center text-xs font-bold font-serif">
                C
              </div>
              <span className="text-lg font-bold tracking-tight text-[#1c4123]" style={{ fontFamily: "Georgia, serif" }}>
                CiviLens
              </span>
            </Link>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-8">
          <ReportDetailSkeleton />
        </main>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#fafaf5] px-6 text-center">
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
              className="inline-flex items-center gap-2 rounded-xl bg-[#1e4d2b] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#163a20] transition shadow-xs"
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
  const displayTopics = report.topics && report.topics.length > 0
    ? report.topics
    : report.category ? [{ id: 0, name: report.category.name, slug: report.category.slug }] : [];

  return (
    <div className="flex min-h-screen flex-col bg-[#fafaf5] text-[#2c2926]">
      {/* Top Header */}
      <header className="border-b border-[#eae2d3] bg-[#fafaf5]/90 backdrop-blur-xs sticky top-0 z-20">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/reports" className="flex items-center gap-2.5 transition-opacity hover:opacity-85">
            <div className="h-6 w-6 rounded-full bg-[#1e4d2b] text-white flex items-center justify-center text-xs font-bold font-serif">
              C
            </div>
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
            {user && (
              <Link
                href="/bookmarks"
                className="text-xs font-semibold text-[#4a6b52] hover:text-[#1e4d2b] transition"
              >
                Tersimpan
              </Link>
            )}
            <Link
              href="/reports/create"
              className="rounded-lg bg-[#1e4d2b] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#163a20] transition shadow-xs"
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
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1e4d2b] text-white text-sm font-bold">
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
            <Link href="/reports" className="hover:text-[#1c4123] transition flex items-center gap-1 font-medium text-[#1e4d2b]">
              <span>&larr; Kembali ke Feed Laporan</span>
            </Link>
            <span>/</span>
            <span className="text-[#1c4123] font-medium truncate max-w-[200px]">
              {report.title}
            </span>
          </div>

          {/* Report Main Header Card */}
          <div className="rounded-2xl border border-[#eae2d3] bg-white p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f0f4ee] pb-4">
              <div className="flex flex-wrap items-center gap-1.5">
                {displayTopics.map((t, idx) => (
                  <span
                    key={idx}
                    className="rounded-full bg-[#f4f8f4] border border-[#cbe0ce] px-2.5 py-0.5 text-xs font-semibold text-[#1e4d2b]"
                  >
                    #{t.name}
                  </span>
                ))}
                <span className="text-xs text-[#7a9a80] font-mono ml-1">
                  ID: #{report.id}
                </span>
              </div>

              {/* Status Badge */}
              <div className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-semibold ${statusBadge.bg}`}>
                <span className={`h-2 w-2 rounded-full ${statusBadge.dot}`} />
                <span>{statusBadge.label}</span>
              </div>
            </div>

            {/* Title & Metadata */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#17361d]" style={{ fontFamily: "Georgia, serif" }}>
                {report.title}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[#7a9a80]">
                {report.author && (
                  <Link
                    href={`/users/${report.author.id}`}
                    className="flex items-center gap-1 font-semibold text-[#1c4123] hover:underline"
                  >
                    <IconUser className="h-3.5 w-3.5 text-[#1e4d2b]" />
                    <span>{report.author.name}</span>
                  </Link>
                )}
                <span>&bull;</span>
                <span>
                  Dilaporkan pada{" "}
                  {new Date(report.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  WIB
                </span>
              </div>
            </div>

            {/* Civic Actions Bar: Support & Bookmark */}
            <div className="flex items-center gap-2.5 pt-2 border-t border-[#f0f4ee]">
              <button
                type="button"
                onClick={handleToggleReaction}
                disabled={!user || reacting}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition ${
                  report.user_reacted
                    ? "bg-[#1e4d2b] text-white border-[#1e4d2b]"
                    : "bg-[#fafaf5] text-[#1c4123] border-[#cbe0ce] hover:bg-[#f4f8f4]"
                } ${!user ? "opacity-60 cursor-not-allowed" : ""}`}
                title={user ? "Beri dukungan warga pada laporan ini" : "Masuk untuk memberi dukungan"}
              >
                <IconThumbsUp className="h-4 w-4" />
                <span>{report.user_reacted ? "Didukung" : "Dukung Laporan"}</span>
                <span className="ml-1 rounded-full bg-black/10 px-1.5 py-0.2 text-[10px]">
                  {report.reactions_count || 0}
                </span>
              </button>

              <button
                type="button"
                onClick={handleToggleBookmark}
                disabled={!user || bookmarking}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition ${
                  report.user_bookmarked
                    ? "bg-[#7a4400] text-white border-[#7a4400]"
                    : "bg-[#fafaf5] text-[#57524d] border-[#cbe0ce] hover:bg-[#f4f8f4]"
                } ${!user ? "opacity-60 cursor-not-allowed" : ""}`}
                title={user ? "Simpan laporan ke bookmark" : "Masuk untuk menyimpan"}
              >
                <IconBookmark className="h-4 w-4" />
                <span>{report.user_bookmarked ? "Tersimpan" : "Simpan"}</span>
              </button>

              {user && user.id !== report.author?.id && (
                <button
                  type="button"
                  onClick={() => setFlagModalOpen(true)}
                  className="ml-auto inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-medium text-[#8c857e] hover:text-red-700 hover:bg-red-50 transition"
                  title="Laporkan indikasi pelanggaran"
                >
                  <IconShield className="h-3.5 w-3.5" />
                  <span>Laporkan</span>
                </button>
              )}
            </div>

            {/* Location Section */}
            {report.location && (
              <div className="rounded-xl bg-[#fafaf5] border border-[#eae2d3] p-4 space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#1c4123] flex items-center gap-1.5">
                  <IconPin className="h-4 w-4 text-[#1e4d2b]" />
                  <span>Lokasi Kejadian</span>
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

            {/* Problem Description */}
            <div className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#7a9a80]">
                Deskripsi Masalah
              </h2>
              <p className="text-sm text-[#2c2926] leading-relaxed whitespace-pre-line">
                {report.description}
              </p>
            </div>

              {/* Attached Media */}
              {report.media && report.media.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-[#f0f4ee]">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-[#7a9a80]">
                    Foto Bukti Terlampir ({report.media.length})
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {report.media.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl overflow-hidden border border-[#cbe0ce] aspect-video bg-[#fafaf5] p-3 flex flex-col justify-between"
                      >
                        <span className="text-xs font-medium text-[#1c4123] truncate">
                          {item.original_name}
                        </span>
                        <div className="text-[11px] text-[#7a9a80] flex items-center justify-between">
                          <span>{(item.size / 1024).toFixed(0)} KB</span>
                          <span className="rounded-full bg-[#f4f8f4] border border-[#cbe0ce] px-2 py-0.2 text-[9px] font-semibold text-[#1e4d2b]">
                            Terverifikasi
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>

          {/* AI Assessment Panel */}
          <div className="rounded-2xl border border-[#cbe0ce] bg-white p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f0f4ee] pb-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1e4d2b] text-white text-xs font-bold">
                  <IconSparkles className="h-3.5 w-3.5" />
                </span>
                <h2 className="text-lg font-bold font-serif text-[#1e4d2b]" style={{ fontFamily: "Georgia, serif" }}>
                  Analisis Dampak Lingkungan (AI Assessment)
                </h2>
              </div>

              {ai?.severity && ai.status === "completed" && (
                <span className={`rounded-full border px-3 py-0.5 text-xs font-bold ${severityBadge.bg}`}>
                  Tingkat Keparahan: {severityBadge.label}
                </span>
              )}
            </div>

            {!ai ? (
              <div className="text-center py-6 space-y-2">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#1e4d2b] border-t-transparent mx-auto" />
                <p className="text-xs text-[#57524d]">
                  Menyiapkan antrean analisis AI...
                </p>
              </div>
            ) : ai.status === "processing" || ai.status === "pending" ? (
              <div className="rounded-xl bg-[#fafaf5] p-4 border border-[#eae2d3] text-xs text-[#57524d] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#1e4d2b] border-t-transparent shrink-0" />
                  <span>
                    Analisis AI sedang diproses secara asinkron ({ai.status === "pending" ? "menunggu antrean" : "menganalisis bukti & konteks"})...
                  </span>
                </div>
                <span className="text-[10px] text-[#7a9a80] hidden sm:inline">Memperbarui otomatis</span>
              </div>
            ) : ai.status === "failed" ? (
              <div className="rounded-xl bg-amber-50 p-4 border border-amber-200 text-xs text-amber-900 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium">
                    Analisis AI otomatis belum berhasil diselesaikan pada percobaan ini.
                  </p>
                  <button
                    type="button"
                    onClick={handleRetryAi}
                    disabled={isRetryingAi}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#1e4d2b] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#163a20] transition disabled:opacity-50"
                  >
                    <span>{isRetryingAi ? "Menjadwalkan..." : "Ulangi Analisis AI"}</span>
                  </button>
                </div>
                <p className="text-[11px] text-amber-800">
                  Laporan Anda tetap valid dan tersimpan aman. Tim penanganan tetap dapat memproses laporan ini.
                </p>
              </div>
            ) : (
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
                      Penilaian Objektif & Dampak
                    </h3>
                    <p className="text-sm text-[#57524d] leading-relaxed whitespace-pre-line">
                      {ai.analysis}
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#f0f4ee] text-xs text-[#7a9a80]">
                  {ai.confidence !== null && ai.confidence !== undefined && (
                    <span>
                      Tingkat Keyakinan Model: <strong className="text-[#1c4123]">{(ai.confidence * 100).toFixed(0)}%</strong>
                    </span>
                  )}
                  {report.media && report.media.length > 0 && (
                    <span>
                      Bukti Foto Dianalisis: <strong className="text-[#1c4123]">{Math.min(report.media.length, 3)} Foto</strong>
                    </span>
                  )}
                  <span>
                    Status AI: <strong className="text-emerald-700 capitalize">{ai.status}</strong>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Transparent Status Timeline */}
          <ReportTimeline
            report={report}
            onStatusUpdated={(updated) => setReport(updated)}
          />

          {/* Community Discussion & Replies Thread */}
          <ReportComments
            reportId={report.id}
            initialCommentsCount={report.comments_count || 0}
          />

          {/* Citizen Moderation Flag Modal */}
          <FlagReportModal
            reportId={report.id}
            isOpen={flagModalOpen}
            onClose={() => setFlagModalOpen(false)}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#eae2d3] py-6 text-center text-xs text-[#8c857e] mt-auto">
        <div className="mx-auto max-w-5xl px-6">
          CiviLens &bull; Platform Pelaporan Lingkungan Warga
        </div>
      </footer>
    </div>
  );
}
