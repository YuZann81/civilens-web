"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import {
  getReports,
  getTopics,
  getTrendingTopics,
  toggleReportReaction,
  toggleReportBookmark,
} from "@/lib/api/client";
import { Report, Topic } from "@/lib/api/types";
import {
  IconPin,
  IconHashtag,
  IconSearch,
  IconThumbsUp,
  IconBookmark,
  IconMessage,
  IconShield,
  IconChevronDown,
  IconChevronUp,
  IconArrowRight,
  IconCamera,
} from "@/components/ui/icons";
import { FeedReportSkeleton, TrendingWidgetSkeleton } from "@/components/ui/skeletons";
import { AuthenticatedShell } from "@/components/layout/authenticated-shell";

import { getStatusBadge, getSeverityBadge } from "@/components/reports/report-status-badge";

function ReportMediaGallery({ media }: { media?: Report["media"] }) {
  if (!media || media.length === 0) return null;

  const count = media.length;

  if (count === 1) {
    const item = media[0];
    return (
      <div className="overflow-hidden rounded-xl border border-[#e2e6df] bg-[#fafaf7]">
        <div className="flex h-48 sm:h-64 w-full flex-col items-center justify-center p-5 text-center bg-[#f4f5f0]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e2ede4] text-[#225332]">
            <IconCamera className="h-5 w-5" />
          </div>
          <p className="mt-2 text-xs sm:text-sm font-semibold text-[#1c241e] truncate max-w-sm">
            {item.original_name}
          </p>
          <p className="mt-0.5 text-[11px] text-[#8c978f]">
            Dokumentasi Bukti Lapangan &bull; {(item.size / 1024).toFixed(0)} KB
          </p>
        </div>
      </div>
    );
  }

  if (count === 2) {
    return (
      <div className="grid grid-cols-2 gap-2 overflow-hidden rounded-xl">
        {media.slice(0, 2).map((item, idx) => (
          <div
            key={item.id || idx}
            className="flex h-36 sm:h-44 flex-col items-center justify-center p-3 text-center border border-[#e2e6df] rounded-xl bg-[#f4f5f0]"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e2ede4] text-[#225332]">
              <IconCamera className="h-4 w-4" />
            </div>
            <p className="mt-1.5 text-xs font-semibold text-[#1c241e] truncate max-w-[140px]">
              {item.original_name}
            </p>
            <p className="mt-0.5 text-[10px] text-[#8c978f]">
              Foto {idx + 1} &bull; {(item.size / 1024).toFixed(0)} KB
            </p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 overflow-hidden rounded-xl">
      <div className="sm:col-span-2 flex h-40 sm:h-52 flex-col items-center justify-center p-4 text-center border border-[#e2e6df] rounded-xl bg-[#f4f5f0]">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e2ede4] text-[#225332]">
          <IconCamera className="h-4 w-4" />
        </div>
        <p className="mt-1.5 text-xs sm:text-sm font-semibold text-[#1c241e] truncate max-w-[200px]">
          {media[0].original_name}
        </p>
        <p className="mt-0.5 text-[11px] text-[#8c978f]">
          Bukti Utama &bull; {(media[0].size / 1024).toFixed(0)} KB
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-1 gap-2">
        {media.slice(1, 3).map((item, idx) => (
          <div
            key={item.id || idx}
            className="flex h-20 sm:h-24 flex-col items-center justify-center p-2 text-center border border-[#e2e6df] rounded-xl bg-[#fafaf7]"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#e2ede4] text-[#225332]">
              <IconCamera className="h-3.5 w-3.5" />
            </div>
            <p className="mt-1 text-[11px] font-medium text-[#1c241e] truncate max-w-[110px]">
              {item.original_name}
            </p>
            <p className="text-[10px] text-[#8c978f]">
              {(item.size / 1024).toFixed(0)} KB
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportFeedCard({
  report,
  onReactionToggle,
  onBookmarkToggle,
}: {
  report: Report;
  onReactionToggle: (id: number) => void;
  onBookmarkToggle: (id: number) => void;
}) {
  const [showAiDetail, setShowAiDetail] = useState(false);
  const statusBadge = getStatusBadge(report.status);
  const ai = report.ai_analysis;
  const severityBadge = getSeverityBadge(ai?.severity);

  const displayTopics = report.topics && report.topics.length > 0
    ? report.topics
    : report.category ? [{ id: 0, name: report.category.name, slug: report.category.slug }] : [];

  return (
    <article className="rounded-2xl border border-[#e2e6df] bg-white p-5 sm:p-6 shadow-xs hover:border-[#225332]/40 transition space-y-4">
      {/* 1. Header: Author & Status */}
      <div className="flex items-start justify-between gap-3 border-b border-[#edf0ea] pb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f2f7f3] text-[#225332] font-bold text-xs shrink-0 border border-[#c5dcce]">
            {report.author?.name ? report.author.name.charAt(0).toUpperCase() : "W"}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-semibold text-[#1c241e] truncate">
                {report.author?.name || "Warga Komunitas"}
              </span>
              <span className="text-xs text-[#8c978f]">&bull;</span>
              <time className="text-xs text-[#8c978f] whitespace-nowrap">
                {new Date(report.created_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </time>
            </div>
            {report.location && (
              <p className="text-xs text-[#5c685f] flex items-center gap-1 pt-0.5 truncate">
                <IconPin className="h-3 w-3 text-[#225332] shrink-0" />
                <span className="truncate">{report.location.address}</span>
              </p>
            )}
          </div>
        </div>

        {/* Status indicator on top right */}
        <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusBadge.bg}`}>
          {statusBadge.label}
        </span>
      </div>

      {/* 2. Content: Title & Description */}
      <div className="space-y-2">
        <Link href={`/reports/${report.id}`} className="group block space-y-1">
          <h2 className="text-base sm:text-lg font-bold text-[#1c241e] group-hover:text-[#225332] transition leading-snug">
            {report.title}
          </h2>
          <p className="text-xs sm:text-sm text-[#5c685f] line-clamp-3 leading-relaxed">
            {report.description}
          </p>
        </Link>

        {/* 3. Media Preview Gallery */}
        {report.media && report.media.length > 0 && (
          <div className="pt-1">
            <ReportMediaGallery media={report.media} />
          </div>
        )}
      </div>

      {/* 4. Metadata: Topics & Severity */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        {displayTopics.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {displayTopics.map((t, idx) => (
              <Link
                key={idx}
                href={`/reports?topic=${t.slug}`}
                className="rounded-full bg-[#f4f5f0] border border-[#e2e6df] px-2.5 py-0.5 text-[11px] font-medium text-[#5c685f] hover:bg-[#e2ede4] hover:text-[#225332] transition"
              >
                #{t.name}
              </Link>
            ))}
          </div>
        )}

        {ai?.severity && (
          <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${severityBadge.bg}`}>
            Keparahan: {severityBadge.label}
          </span>
        )}
      </div>

      {/* 5. Supporting AI Signal (Clean & Non-Dominant) */}
      {ai && ai.summary && (
        <div className="rounded-xl border border-[#e2e6df] bg-[#fafaf7] p-3.5 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[#225332] text-[11px] uppercase tracking-wider">
              Ringkasan Analisis AI
            </span>
            {ai.analysis && (
              <button
                type="button"
                onClick={() => setShowAiDetail(!showAiDetail)}
                className="font-medium text-[#225332] hover:underline flex items-center gap-1 text-[11px]"
              >
                <span>{showAiDetail ? "Sembunyikan" : "Detail Dampak"}</span>
                {showAiDetail ? <IconChevronUp className="h-3 w-3" /> : <IconChevronDown className="h-3 w-3" />}
              </button>
            )}
          </div>

          <p className="text-xs text-[#1c241e] leading-relaxed">
            {ai.summary}
          </p>

          {showAiDetail && ai.analysis && (
            <div className="pt-2 border-t border-[#e2e6df] text-xs text-[#5c685f] leading-relaxed whitespace-pre-line">
              {ai.analysis}
            </div>
          )}
        </div>
      )}

      {/* 6. Civic Action Footer */}
      <div className="flex items-center justify-between border-t border-[#edf0ea] pt-3 text-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onReactionToggle(report.id)}
            aria-label={`Dukung laporan (${report.reactions_count || 0})`}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold transition ${
              report.user_reacted
                ? "bg-[#225332] text-white"
                : "bg-[#fafaf7] text-[#5c685f] border border-[#e2e6df] hover:bg-[#f4f5f0] hover:text-[#1c241e]"
            }`}
          >
            <IconThumbsUp className="h-3.5 w-3.5" />
            <span>{report.reactions_count || 0}</span>
          </button>

          <Link
            href={`/reports/${report.id}`}
            aria-label={`Lihat komentar (${report.comments_count || 0})`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#fafaf7] px-3 py-1.5 font-semibold text-[#5c685f] border border-[#e2e6df] hover:bg-[#f4f5f0] hover:text-[#1c241e] transition"
          >
            <IconMessage className="h-3.5 w-3.5" />
            <span>{report.comments_count || 0}</span>
          </Link>

          <button
            type="button"
            onClick={() => onBookmarkToggle(report.id)}
            aria-label={report.user_bookmarked ? "Hapus dari simpanan" : "Simpan laporan"}
            className={`inline-flex items-center gap-1.5 rounded-lg p-2 font-semibold transition ${
              report.user_bookmarked
                ? "bg-[#b45309] text-white"
                : "bg-[#fafaf7] text-[#5c685f] border border-[#e2e6df] hover:bg-[#f4f5f0] hover:text-[#1c241e]"
            }`}
          >
            <IconBookmark className="h-3.5 w-3.5" />
          </button>
        </div>

        <Link
          href={`/reports/${report.id}`}
          className="inline-flex items-center gap-1 font-semibold text-[#225332] hover:underline"
        >
          <span>Detail Lengkap</span>
          <IconArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </article>
  );
}

function ReportsFeedContent() {
  const router = useRouter();
  const { user } = useAuth();
  const searchParams = useSearchParams();

  const urlTopic = searchParams.get("topic") || "";
  const urlQuery = searchParams.get("q") || "";

  const [reports, setReports] = useState<Report[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Feed Tab: "all" (Semua Laporan) vs "mine" (Laporan Saya)
  const [activeTab, setActiveTab] = useState<"all" | "mine">("all");

  // Filter States
  const [searchInput, setSearchInput] = useState(urlQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(urlQuery);
  const [selectedTopic, setSelectedTopic] = useState<string>(urlTopic);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("");
  const [selectedSort, setSelectedSort] = useState<string>("created_at");

  const [reloadTrigger, setReloadTrigger] = useState(0);

  // Initial topics and trending load
  useEffect(() => {
    void getTopics({ limit: 30 })
      .then(setTopics)
      .catch(() => {});
    void getTrendingTopics(6)
      .then(setTrendingTopics)
      .catch(() => {});
  }, []);

  // Fetch reports when filters, tabs, or retry changes
  useEffect(() => {
    let mounted = true;

    getReports({
      q: debouncedQuery.trim() || undefined,
      topic: selectedTopic || undefined,
      status: selectedStatus || undefined,
      severity: selectedSeverity || undefined,
      sort: selectedSort || undefined,
      mine: activeTab === "mine" ? true : undefined,
    })
      .then((res) => {
        if (mounted) {
          setReports(res.data);
          setError("");
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Gagal memuat daftar laporan.");
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
  }, [debouncedQuery, selectedTopic, selectedStatus, selectedSeverity, selectedSort, activeTab, reloadTrigger]);

  const handleToggleReaction = async (reportId: number) => {
    if (!user) {
      router.push("/login");
      return;
    }

    try {
      const res = await toggleReportReaction(reportId, "support");
      setReports((prev) =>
        prev.map((r) =>
          r.id === reportId
            ? { ...r, user_reacted: res.reacted, reactions_count: res.reactions_count }
            : r
        )
      );
    } catch {}
  };

  const handleToggleBookmark = async (reportId: number) => {
    if (!user) {
      router.push("/login");
      return;
    }

    try {
      const res = await toggleReportBookmark(reportId);
      setReports((prev) =>
        prev.map((r) =>
          r.id === reportId
            ? { ...r, user_bookmarked: res.bookmarked, bookmarks_count: res.bookmarks_count }
            : r
        )
      );
    } catch {}
  };

  const handleResetFilters = () => {
    setSelectedTopic("");
    setSelectedStatus("");
    setSelectedSeverity("");
    setSelectedSort("created_at");
    setSearchInput("");
    setDebouncedQuery("");
  };

  return (
    <AuthenticatedShell showSidebar={true} maxWidth="default">
      {/* 2-column proportional grid (Center Stream + Right Discovery Widget) */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* CENTER COLUMN: Main Report Stream */}
        <div className="w-full lg:max-w-[720px] flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold tracking-tight text-[#1c241e]">
              Feed Laporan Lingkungan
            </h1>
          </div>

          {/* Mobile Search Bar */}
          <div className="block md:hidden relative">
            <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8c978f]" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cari laporan, topik, atau wilayah..."
              className="w-full rounded-xl border border-[#e2e6df] bg-white pl-9 pr-4 py-2 text-xs text-[#1c241e] placeholder-[#8c978f] outline-none focus:border-[#225332] shadow-2xs"
            />
          </div>

          {/* Feed Tab Layer */}
          <div className="flex items-center border-b border-[#e2e6df] bg-white rounded-xl px-3 pt-2 shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`flex-1 pb-2.5 text-xs font-bold text-center border-b-2 transition ${
                activeTab === "all"
                  ? "border-[#225332] text-[#225332]"
                  : "border-transparent text-[#5c685f] hover:text-[#1c241e]"
              }`}
            >
              Semua Laporan
            </button>
            {user && (
              <button
                type="button"
                onClick={() => setActiveTab("mine")}
                className={`flex-1 pb-2.5 text-xs font-bold text-center border-b-2 transition ${
                  activeTab === "mine"
                    ? "border-[#225332] text-[#225332]"
                    : "border-transparent text-[#5c685f] hover:text-[#1c241e]"
                }`}
              >
                Laporan Saya
              </button>
            )}
          </div>

          {/* Horizontal Topic Filter Scroll */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              type="button"
              onClick={() => setSelectedTopic("")}
              className={`shrink-0 rounded-full px-3 py-1 font-semibold transition ${
                selectedTopic === ""
                  ? "bg-[#225332] text-white"
                  : "bg-white text-[#5c685f] border border-[#e2e6df] hover:bg-[#fafaf7] hover:text-[#1c241e]"
              }`}
            >
              Semua Topik
            </button>
            {topics.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTopic(t.slug === selectedTopic ? "" : t.slug)}
                className={`shrink-0 rounded-full px-3 py-1 font-semibold transition ${
                  selectedTopic === t.slug
                    ? "bg-[#225332] text-white"
                    : "bg-white text-[#5c685f] border border-[#e2e6df] hover:bg-[#fafaf7] hover:text-[#1c241e]"
                }`}
              >
                #{t.name}
              </button>
            ))}
          </div>

          {/* Filter & Sorting Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-white border border-[#e2e6df] shadow-xs text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-[#1c241e]">Status:</span>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="rounded-lg border border-[#e2e6df] bg-[#fafaf7] px-2 py-1 text-xs text-[#1c241e] outline-none focus:border-[#225332]"
                >
                  <option value="">Semua</option>
                  <option value="pending">Menunggu</option>
                  <option value="under_review">Peninjauan</option>
                  <option value="verified">Terverifikasi</option>
                  <option value="in_progress">Ditindaklanjuti</option>
                  <option value="resolved">Selesai</option>
                  <option value="rejected">Ditolak</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-[#1c241e]">Keparahan:</span>
                <select
                  value={selectedSeverity}
                  onChange={(e) => setSelectedSeverity(e.target.value)}
                  className="rounded-lg border border-[#e2e6df] bg-[#fafaf7] px-2 py-1 text-xs text-[#1c241e] outline-none focus:border-[#225332]"
                >
                  <option value="">Semua</option>
                  <option value="critical">Kritis</option>
                  <option value="high">Tinggi</option>
                  <option value="medium">Sedang</option>
                  <option value="low">Rendah</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-[#1c241e]">Urutan:</span>
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="rounded-lg border border-[#e2e6df] bg-[#fafaf7] px-2.5 py-1 text-xs text-[#1c241e] outline-none focus:border-[#225332]"
              >
                <option value="created_at">Terbaru</option>
                <option value="reactions_count">Dukungan Warga</option>
                <option value="priority">Prioritas AI</option>
              </select>
            </div>
          </div>

          {/* Error Message with Retry */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 flex items-center justify-between gap-3">
              <span>{error}</span>
              <button
                type="button"
                onClick={() => setReloadTrigger((prev) => prev + 1)}
                className="font-semibold underline hover:text-red-900 shrink-0"
              >
                Coba Lagi
              </button>
            </div>
          )}

          {/* Report Stream */}
          {loading ? (
            <div className="space-y-4" aria-busy="true" aria-label="Memuat daftar laporan...">
              <FeedReportSkeleton />
              <FeedReportSkeleton />
              <FeedReportSkeleton />
            </div>
          ) : reports.length === 0 ? (
            <div className="space-y-4">
              {/* Compact Content-Driven Empty State Card */}
              <div className="rounded-2xl border border-[#e2e6df] bg-white p-6 sm:p-7 text-center space-y-3 shadow-xs">
                <h2 className="text-base font-bold text-[#1c241e]">
                  Belum ada laporan yang cocok
                </h2>
                {debouncedQuery ? (
                  <p className="text-xs text-[#5c685f] max-w-sm mx-auto">
                    Tidak ditemukan laporan yang sesuai dengan kata kunci &ldquo;<strong className="text-[#1c241e]">{debouncedQuery}</strong>&rdquo;.
                  </p>
                ) : (
                  <p className="text-xs text-[#5c685f] max-w-sm mx-auto">
                    Belum ada laporan dengan filter yang dipilih saat ini.
                  </p>
                )}
                <div className="flex items-center justify-center gap-2 pt-1">
                  {(debouncedQuery || selectedTopic || selectedStatus || selectedSeverity) && (
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[#e2e6df] bg-[#fafaf7] px-4 py-2 text-xs font-semibold text-[#1c241e] hover:bg-white transition shadow-xs"
                    >
                      Reset Filter
                    </button>
                  )}
                  <Link
                    href="/reports/create"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#225332] px-4 py-2 text-xs font-semibold text-white hover:bg-[#173722] transition shadow-xs"
                  >
                    <span>+ Buat Laporan Baru</span>
                  </Link>
                </div>
              </div>

              {/* Discovery Section: Topics to Monitor */}
              {topics.length > 0 && (
                <div className="rounded-2xl border border-[#e2e6df] bg-white p-5 shadow-xs space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#225332]">
                    Topik yang Bisa Kamu Pantau
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {topics.slice(0, 10).map((top) => (
                      <button
                        key={top.id}
                        type="button"
                        onClick={() => setSelectedTopic(top.slug)}
                        className="rounded-full border border-[#e2e6df] bg-[#fafaf7] px-2.5 py-1 text-xs font-medium text-[#1c241e] hover:bg-[#e2ede4] hover:text-[#225332] transition"
                      >
                        #{top.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Information Section: Cara Kerja CiviLens */}
              <div className="rounded-2xl border border-[#e2e6df] bg-white p-5 shadow-xs space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#225332]">
                  Cara Kerja CiviLens
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#5c685f]">
                  <div className="p-3 rounded-xl bg-[#fafaf7] border border-[#e2e6df] space-y-1">
                    <p className="font-bold text-[#1c241e]">1. Laporkan Masalah</p>
                    <p className="leading-relaxed text-[11px]">Unggah foto bukti otentik dan tentukan lokasi kejadian.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#fafaf7] border border-[#e2e6df] space-y-1">
                    <p className="font-bold text-[#1c241e]">2. CiviLens Menganalisis</p>
                    <p className="leading-relaxed text-[11px]">Sistem cerdas merangkum fakta dan tingkat keparahan masalah.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#fafaf7] border border-[#e2e6df] space-y-1">
                    <p className="font-bold text-[#1c241e]">3. Ditindaklanjuti</p>
                    <p className="leading-relaxed text-[11px]">Instansi memverifikasi dan memperbarui progres di linimasa.</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <ReportFeedCard
                  key={report.id}
                  report={report}
                  onReactionToggle={handleToggleReaction}
                  onBookmarkToggle={handleToggleBookmark}
                />
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Discovery / Topic Aggregation (~300px) */}
        <aside className="hidden lg:block w-[300px] shrink-0 space-y-4">
          {/* Widget 1: Topik Paling Banyak Dilaporkan */}
          <div className="rounded-2xl border border-[#e2e6df] bg-white p-4 shadow-xs space-y-3">
            <div>
              <h2 className="text-sm font-bold text-[#1c241e] flex items-center gap-1.5">
                <IconHashtag className="h-4 w-4 text-[#b45309]" />
                <span>Topik Paling Banyak Dilaporkan</span>
              </h2>
              <p className="text-[11px] text-[#8c978f] mt-0.5">
                Akumulasi laporan warga pada topik aktif.
              </p>
            </div>

            {trendingTopics.length === 0 ? (
              <TrendingWidgetSkeleton />
            ) : (
              <div className="space-y-1.5">
                {trendingTopics.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedTopic(item.slug === selectedTopic ? "" : item.slug)}
                    className={`w-full text-left px-3 py-2 rounded-xl border transition ${
                      selectedTopic === item.slug
                        ? "bg-[#f2f7f3] border-[#225332] text-[#225332] font-semibold"
                        : "bg-[#fafaf7] border-[#e2e6df] hover:border-[#8c978f] text-[#1c241e]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">#{item.name}</span>
                      <span className="text-[10px] text-[#8c978f]">
                        {item.reports_count !== undefined && item.reports_count > 0
                          ? `${item.reports_count} Laporan`
                          : "Topik Resmi"}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Widget 2: Panduan Partisipasi Sipil */}
          <div className="rounded-2xl border border-[#e2e6df] bg-white p-4 shadow-xs space-y-2 text-xs">
            <h3 className="font-bold text-[#225332] flex items-center gap-1.5">
              <IconShield className="h-3.5 w-3.5 text-[#225332]" />
              <span>Transparansi Penanganan</span>
            </h3>
            <p className="text-[11px] text-[#5c685f] leading-relaxed">
              Setiap laporan yang masuk diteruskan ke instansi penanggung jawab dan dapat dipantau bersama linimasa statusnya oleh publik.
            </p>
          </div>

          {/* Widget 3: Quick Links / Footer */}
          <div className="px-2 text-[11px] text-[#8c978f] space-y-1">
            <div className="flex flex-wrap gap-x-2 gap-y-1">
              <Link href="/reports" className="hover:underline">Feed</Link>
              <span>&bull;</span>
              <Link href="/reports/create" className="hover:underline">Buat Laporan</Link>
              <span>&bull;</span>
              <Link href="/bookmarks" className="hover:underline">Tersimpan</Link>
            </div>
            <p>&copy; {new Date().getFullYear()} CiviLens Indonesia</p>
          </div>
        </aside>
      </div>
    </AuthenticatedShell>
  );
}

export default function ReportsFeedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#fafaf7] text-[#1c241e]">
          <div className="mx-auto max-w-[1360px] px-4 sm:px-6 py-5 flex gap-6 items-start">
            <div className="hidden lg:block w-[240px] space-y-4">
              <TrendingWidgetSkeleton />
            </div>
            <div className="flex-1 lg:max-w-[720px] space-y-4">
              <FeedReportSkeleton />
              <FeedReportSkeleton />
            </div>
            <div className="hidden lg:block w-[300px]">
              <TrendingWidgetSkeleton />
            </div>
          </div>
        </div>
      }
    >
      <ReportsFeedContent />
    </Suspense>
  );
}
