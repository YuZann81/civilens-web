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
import { AuthenticatedShell } from "@/components/layout/authenticated-shell";
import {
  IconPin,
  IconSparkles,
  IconThumbsUp,
  IconBookmark,
  IconUser,
  IconShield,
  IconCamera,
  IconChevronDown,
  IconChevronUp,
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
        bg: "bg-[#edf7ed] border-[#bbf7d0] text-[#15803d]",
        dot: "bg-[#15803d]",
      };
    case "in_progress":
    case "ditindaklanjuti":
      return {
        label: "Sedang Ditindaklanjuti",
        bg: "bg-[#f5f3ff] border-[#ddd6fe] text-[#6d28d9]",
        dot: "bg-[#6d28d9]",
      };
    case "verified":
    case "terverifikasi":
      return {
        label: "Terverifikasi",
        bg: "bg-[#f0fdfa] border-[#99f6e4] text-[#0f766e]",
        dot: "bg-[#0f766e]",
      };
    case "under_review":
    case "diproses":
      return {
        label: "Dalam Peninjauan",
        bg: "bg-[#eff6ff] border-[#bfdbfe] text-[#1d4ed8]",
        dot: "bg-[#1d4ed8]",
      };
    case "rejected":
    case "ditolak":
      return {
        label: "Ditolak / Tidak Valid",
        bg: "bg-[#fee2e2] border-[#fecaca] text-[#b91c1c]",
        dot: "bg-[#b91c1c]",
      };
    case "pending":
    default:
      return {
        label: "Menunggu Peninjauan",
        bg: "bg-[#fef3c7] border-[#fde68a] text-[#b45309]",
        dot: "bg-[#b45309]",
      };
  }
}

function getSeverityBadge(severity?: string | null) {
  switch (severity) {
    case "critical":
      return { label: "Kritis", bg: "bg-[#fee2e2] text-[#b91c1c] border-[#fecaca]" };
    case "high":
      return { label: "Tinggi", bg: "bg-[#ffedd5] text-[#c2410c] border-[#fed7aa]" };
    case "medium":
      return { label: "Sedang", bg: "bg-[#fef3c7] text-[#b45309] border-[#fde68a]" };
    case "low":
    default:
      return { label: "Rendah", bg: "bg-[#edf7ed] text-[#15803d] border-[#bbf7d0]" };
  }
}

function ReportDetailMediaGallery({ media }: { media?: Report["media"] }) {
  if (!media || media.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {media.map((item, idx) => (
          <div
            key={item.id || idx}
            className="rounded-xl overflow-hidden border border-[#e2e6df] bg-[#f4f5f0] p-3 flex flex-col justify-between aspect-video sm:aspect-4/3 transition"
          >
            <div className="flex items-center justify-center flex-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e2ede4] text-[#225332]">
                <IconCamera className="h-5 w-5" />
              </div>
            </div>
            <div className="pt-2 border-t border-[#e2e6df]/60 flex items-center justify-between text-[11px]">
              <span className="font-semibold text-[#1c241e] truncate max-w-[130px]" title={item.original_name}>
                {item.original_name}
              </span>
              <span className="text-[#8c978f] shrink-0">
                {(item.size / 1024).toFixed(0)} KB
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
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
  const [showAiDetail, setShowAiDetail] = useState(false);

  const isNewlyCreated = searchParams?.get("created") === "1";

  const [reloadTrigger, setReloadTrigger] = useState(0);

  // Initial load
  useEffect(() => {
    if (!reportId) return;
    let mounted = true;

    getReport(reportId)
      .then((data) => {
        if (mounted) {
          setReport(data);
          setError("");
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Laporan tidak ditemukan.");
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [reportId, reloadTrigger]);

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
      <AuthenticatedShell maxWidth="narrow">
        <ReportDetailSkeleton />
      </AuthenticatedShell>
    );
  }

  if (error || !report) {
    return (
      <AuthenticatedShell maxWidth="narrow">
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <div className="max-w-md rounded-2xl border border-[#e2e6df] bg-white p-8 shadow-xs space-y-4">
            <h1 className="text-xl font-bold text-[#1c241e]">
              Laporan Tidak Ditemukan
            </h1>
            <p className="text-sm text-[#5c685f]">
              {error || "Laporan yang Anda cari mungkin telah dihapus atau URL tidak valid."}
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setReloadTrigger((prev) => prev + 1)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#e2e6df] bg-[#fafaf7] px-4 py-2 text-sm font-semibold text-[#1c241e] hover:bg-white transition shadow-xs"
              >
                Coba Lagi
              </button>
              <Link
                href="/reports"
                className="inline-flex items-center gap-2 rounded-xl bg-[#225332] px-5 py-2 text-sm font-semibold text-white hover:bg-[#173722] transition shadow-xs"
              >
                &larr; Lihat Semua Laporan
              </Link>
            </div>
          </div>
        </div>
      </AuthenticatedShell>
    );
  }

  const statusBadge = getStatusBadge(report.status);
  const ai = report.ai_analysis;
  const severityBadge = getSeverityBadge(ai?.severity);
  const displayTopics = report.topics && report.topics.length > 0
    ? report.topics
    : report.category ? [{ id: 0, name: report.category.name, slug: report.category.slug }] : [];

  return (
    <AuthenticatedShell maxWidth="narrow">
      <div className="space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#5c685f]">
          <Link href="/reports" className="hover:text-[#1c241e] transition flex items-center gap-1 font-medium text-[#225332]">
            <span>&larr; Kembali ke Feed Laporan</span>
          </Link>
          <span>/</span>
          <span className="text-[#1c241e] font-semibold truncate max-w-[240px]">
            {report.title}
          </span>
        </div>

        {/* Newly Created Banner */}
        {isNewlyCreated && (
          <div className="rounded-2xl border border-[#c5dcce] bg-[#f2f7f3] p-4 sm:p-5 shadow-xs flex items-start gap-3.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#225332] text-white text-sm font-bold">
              ✓
            </div>
            <div className="space-y-1 text-xs">
              <p className="text-sm font-bold text-[#173722]">
                Laporan Anda Berhasil Dikirim ke Sistem!
              </p>
              <p className="text-[#5c685f] leading-relaxed">
                Laporan telah tercatat dengan ID <strong className="font-mono text-[#1c241e]">#{report.id}</strong>. Pipeline AI CiviLens sedang menganalisis keparahan dampak dan menyusun ringkasan objektif.
              </p>
            </div>
          </div>
        )}

        {/* 1. PRIMARY CASE FILE CARD */}
        <div className="rounded-2xl border border-[#e2e6df] bg-white p-5 sm:p-7 shadow-xs space-y-6">
          {/* Header Metadata & Single Official Status */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf0ea] pb-4">
            <div className="flex flex-wrap items-center gap-1.5">
              {displayTopics.map((t, idx) => (
                <span
                  key={idx}
                  className="rounded-full bg-[#f4f5f0] border border-[#e2e6df] px-2.5 py-0.5 text-xs font-semibold text-[#225332]"
                >
                  #{t.name}
                </span>
              ))}
              <span className="text-xs text-[#8c978f] font-mono ml-1">
                ID: #{report.id}
              </span>
            </div>

            {/* Official Status Badge */}
            <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${statusBadge.bg}`}>
              <span className={`h-2 w-2 rounded-full ${statusBadge.dot}`} />
              <span>{statusBadge.label}</span>
            </div>
          </div>

          {/* Title & Author Info */}
          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1c241e] leading-snug">
              {report.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#5c685f]">
              {report.author ? (
                <Link
                  href={`/users/${report.author.id}`}
                  className="inline-flex items-center gap-1 font-semibold text-[#1c241e] hover:text-[#225332] transition"
                >
                  <IconUser className="h-3.5 w-3.5 text-[#225332]" />
                  <span>{report.author.name}</span>
                </Link>
              ) : (
                <span className="inline-flex items-center gap-1 font-semibold text-[#1c241e]">
                  <IconUser className="h-3.5 w-3.5 text-[#225332]" />
                  <span>Warga Komunitas</span>
                </span>
              )}
              <span>&bull;</span>
              <span>
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

          {/* Evidence First: Attached Photo Gallery */}
          {report.media && report.media.length > 0 && (
            <div className="space-y-2.5 pt-2 border-t border-[#edf0ea]">
              <div className="flex items-center justify-between text-xs text-[#5c685f]">
                <span className="font-semibold uppercase tracking-wider text-[11px] text-[#1c241e] flex items-center gap-1.5">
                  <IconCamera className="h-4 w-4 text-[#225332]" />
                  <span>Dokumentasi Bukti Lapangan ({report.media.length})</span>
                </span>
                <span className="text-[#8c978f]">Otentik & Terverifikasi</span>
              </div>
              <ReportDetailMediaGallery media={report.media} />
            </div>
          )}

          {/* Problem Description */}
          <div className="space-y-2 pt-2 border-t border-[#edf0ea]">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#8c978f]">
              Deskripsi Masalah
            </h2>
            <p className="text-sm text-[#1c241e] leading-relaxed whitespace-pre-line">
              {report.description}
            </p>
          </div>

          {/* Location Context */}
          {report.location && (
            <div className="rounded-xl bg-[#fafaf7] border border-[#e2e6df] p-3.5 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#1c241e] flex items-center gap-1.5">
                <IconPin className="h-4 w-4 text-[#225332]" />
                <span>Titik Lokasi Kejadian</span>
              </p>
              <p className="text-sm font-medium text-[#1c241e] pl-5.5">
                {report.location.address}
              </p>
              {report.location.latitude && report.location.longitude && (
                <p className="text-xs text-[#8c978f] font-mono pl-5.5">
                  Koordinat GPS: {report.location.latitude}, {report.location.longitude}
                </p>
              )}
            </div>
          )}

          {/* Primary Civic Actions Bar */}
          <div className="flex items-center gap-2.5 pt-3 border-t border-[#edf0ea]">
            <button
              type="button"
              onClick={handleToggleReaction}
              disabled={!user || reacting}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition active:scale-[0.98] ${
                report.user_reacted
                  ? "bg-[#225332] text-white border-[#225332]"
                  : "bg-[#fafaf7] text-[#1c241e] border-[#e2e6df] hover:bg-white"
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
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition active:scale-[0.98] ${
                report.user_bookmarked
                  ? "bg-[#b45309] text-white border-[#b45309]"
                  : "bg-[#fafaf7] text-[#5c685f] border-[#e2e6df] hover:bg-white hover:text-[#1c241e]"
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
                className="ml-auto inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-medium text-[#8c978f] hover:text-[#b91c1c] hover:bg-[#fee2e2]/60 transition"
                title="Laporkan indikasi pelanggaran"
              >
                <IconShield className="h-3.5 w-3.5" />
                <span>Laporkan</span>
              </button>
            )}
          </div>
        </div>

        {/* 2. CIVILENS AI ANALYSIS (Supporting Assistant Signal) */}
        <div className="rounded-2xl border border-[#e2e6df] bg-white p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf0ea] pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#225332] text-white text-xs font-bold">
                <IconSparkles className="h-3.5 w-3.5" />
              </span>
              <div>
                <h2 className="text-base font-bold text-[#1c241e]">
                  Analisis Dampak Lingkungan (AI Assessment)
                </h2>
                <p className="text-[11px] text-[#8c978f]">
                  Asisten cerdas pendukung keputusan, bukan pengganti verifikasi resmi instansi.
                </p>
              </div>
            </div>

            {ai?.severity && ai.status === "completed" && (
              <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${severityBadge.bg}`}>
                Tingkat Keparahan: {severityBadge.label}
              </span>
            )}
          </div>

          {!ai ? (
            <div className="text-center py-6 space-y-2">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#225332] border-t-transparent mx-auto" />
              <p className="text-xs text-[#5c685f]">
                Menyiapkan antrean analisis AI...
              </p>
            </div>
          ) : ai.status === "processing" || ai.status === "pending" ? (
            <div className="rounded-xl bg-[#fafaf7] p-4 border border-[#e2e6df] text-xs text-[#5c685f] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#225332] border-t-transparent shrink-0" />
                <span>
                  Analisis AI sedang diproses secara asinkron ({ai.status === "pending" ? "menunggu antrean" : "menganalisis bukti & konteks"})...
                </span>
              </div>
              <span className="text-[10px] text-[#8c978f] hidden sm:inline">Memperbarui otomatis</span>
            </div>
          ) : ai.status === "failed" ? (
            <div className="rounded-xl bg-[#fef3c7] p-4 border border-[#fde68a] text-xs text-[#b45309] space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-medium">
                  Analisis AI otomatis belum berhasil diselesaikan pada percobaan ini.
                </p>
                <button
                  type="button"
                  onClick={handleRetryAi}
                  disabled={isRetryingAi}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#225332] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#173722] transition disabled:opacity-50"
                >
                  <span>{isRetryingAi ? "Menjadwalkan..." : "Ulangi Analisis AI"}</span>
                </button>
              </div>
              <p className="text-[11px] text-[#b45309]">
                Laporan Anda tetap valid dan tersimpan aman. Tim penanganan tetap dapat memproses laporan ini.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {ai.summary && (
                <div className="space-y-1">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8c978f]">
                    Ringkasan Fakta Masalah
                  </h3>
                  <p className="text-sm font-medium text-[#1c241e] leading-relaxed">
                    {ai.summary}
                  </p>
                </div>
              )}

              {ai.analysis && (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setShowAiDetail(!showAiDetail)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#225332] hover:underline"
                  >
                    <span>{showAiDetail ? "Sembunyikan Penjelasan Dampak" : "Lihat Penjelasan Dampak & Rekomendasi"}</span>
                    {showAiDetail ? <IconChevronUp className="h-3.5 w-3.5" /> : <IconChevronDown className="h-3.5 w-3.5" />}
                  </button>

                  {showAiDetail && (
                    <div className="rounded-xl bg-[#fafaf7] border border-[#e2e6df] p-4 text-xs text-[#5c685f] leading-relaxed whitespace-pre-line animate-in fade-in duration-150">
                      {ai.analysis}
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#edf0ea] text-[11px] text-[#8c978f]">
                {ai.confidence !== null && ai.confidence !== undefined && (
                  <span>
                    Tingkat Keyakinan Model: <strong className="text-[#1c241e]">{(ai.confidence * 100).toFixed(0)}%</strong>
                  </span>
                )}
                {report.media && report.media.length > 0 && (
                  <span>
                    Bukti Dianalisis: <strong className="text-[#1c241e]">{Math.min(report.media.length, 3)} Foto</strong>
                  </span>
                )}
                <span>
                  Status AI: <strong className="text-[#15803d] capitalize">{ai.status}</strong>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 3. GOVERNMENT RESOLUTION TIMELINE */}
        <ReportTimeline
          report={report}
          onStatusUpdated={(updated) => setReport(updated)}
        />

        {/* 4. COMMUNITY DISCUSSION & REPLIES THREAD */}
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
    </AuthenticatedShell>
  );
}
