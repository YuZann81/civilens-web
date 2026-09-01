"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { getReports, getTopics, getTrendingTopics, toggleReportReaction, toggleReportBookmark } from "@/lib/api/client";
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
  IconUser,
  IconBell,
  IconArrowRight,
  IconCamera,
  IconDocument,
} from "@/components/ui/icons";
import { FeedReportSkeleton, TrendingWidgetSkeleton } from "@/components/ui/skeletons";

function getStatusBadge(status: string) {
  switch (status) {
    case "resolved":
    case "selesai":
      return { label: "Selesai", bg: "bg-[#eef8f0] text-[#1e4d2b] border-[#c0e4c7]" };
    case "in_progress":
      return { label: "Ditindaklanjuti", bg: "bg-[#f2eef8] text-[#4a2e80] border-[#d8cde9]" };
    case "verified":
      return { label: "Terverifikasi", bg: "bg-[#edf7f7] text-[#1b5e5e] border-[#bfe2e2]" };
    case "under_review":
    case "diproses":
      return { label: "Peninjauan", bg: "bg-[#eef4f9] text-[#1a4b75] border-[#c3d9ec]" };
    case "rejected":
    case "ditolak":
      return { label: "Ditolak", bg: "bg-[#fbeeed] text-[#8a241b] border-[#f2c2be]" };
    case "pending":
    default:
      return { label: "Menunggu", bg: "bg-[#fcf5e8] text-[#7a4400] border-[#ecd5af]" };
  }
}

function getSeverityBadge(severity?: string | null) {
  switch (severity) {
    case "critical":
      return { label: "KRITIS", bg: "bg-[#8a241b] text-white border-[#8a241b]" };
    case "high":
      return { label: "TINGGI", bg: "bg-[#ba4c08] text-white border-[#ba4c08]" };
    case "medium":
      return { label: "SEDANG", bg: "bg-[#c57d11] text-white border-[#c57d11]" };
    case "low":
    default:
      return { label: "RENDAH", bg: "bg-[#2d6a36] text-white border-[#2d6a36]" };
  }
}

function ReportMediaGallery({ media }: { media?: Report["media"] }) {
  if (!media || media.length === 0) return null;

  const count = media.length;

  if (count === 1) {
    const item = media[0];
    return (
      <div className="overflow-hidden rounded-xl border border-[#eae2d3] bg-[#f4f7f2]">
        <div className="flex h-56 sm:h-72 w-full flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#fafaf5] to-[#edf4eb]">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e5f0e6] text-[#1e4d2b]">
            <IconCamera className="h-6 w-6" />
          </div>
          <p className="mt-3 text-sm font-semibold text-[#1c4123] truncate max-w-sm">
            {item.original_name}
          </p>
          <p className="mt-1 text-xs text-[#7a9a80]">
            Dokumentasi Bukti Lapangan &bull; {(item.size / 1024).toFixed(0)} KB
          </p>
        </div>
      </div>
    );
  }

  if (count === 2) {
    return (
      <div className="grid grid-cols-2 gap-2 overflow-hidden rounded-xl border border-[#eae2d3]">
        {media.slice(0, 2).map((item, idx) => (
          <div
            key={item.id || idx}
            className="flex h-44 sm:h-52 flex-col items-center justify-center p-4 text-center bg-[#f4f7f2]"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e5f0e6] text-[#1e4d2b]">
              <IconCamera className="h-4 w-4" />
            </div>
            <p className="mt-2 text-xs font-semibold text-[#1c4123] truncate max-w-[150px]">
              {item.original_name}
            </p>
            <p className="mt-0.5 text-[11px] text-[#7a9a80]">
              Foto {idx + 1} &bull; {(item.size / 1024).toFixed(0)} KB
            </p>
          </div>
        ))}
      </div>
    );
  }

  // 3 or more photos (2 columns with 1 large left and 2 stacked right)
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 overflow-hidden rounded-xl border border-[#eae2d3]">
      <div className="sm:col-span-2 flex h-48 sm:h-64 flex-col items-center justify-center p-6 text-center bg-[#f4f7f2]">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e5f0e6] text-[#1e4d2b]">
          <IconCamera className="h-5 w-5" />
        </div>
        <p className="mt-2 text-xs sm:text-sm font-semibold text-[#1c4123] truncate max-w-[220px]">
          {media[0].original_name}
        </p>
        <p className="mt-0.5 text-xs text-[#7a9a80]">
          Bukti Utama &bull; {(media[0].size / 1024).toFixed(0)} KB
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-1 gap-2">
        {media.slice(1, 3).map((item, idx) => (
          <div
            key={item.id || idx}
            className="flex h-24 sm:h-31 flex-col items-center justify-center p-3 text-center bg-[#fafaf5]"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#e5f0e6] text-[#1e4d2b]">
              <IconCamera className="h-3.5 w-3.5" />
            </div>
            <p className="mt-1 text-[11px] font-medium text-[#1c4123] truncate max-w-[120px]">
              {item.original_name}
            </p>
            <p className="text-[10px] text-[#7a9a80]">
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
    <article className="rounded-2xl border border-[#eae2d3] bg-white p-5 sm:p-6 shadow-xs hover:border-[#c8dfc8] transition-colors">
      {/* Header: Citizen Author Identity & Status */}
      <div className="flex items-start justify-between gap-3 border-b border-[#f2ede4] pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1e4d2b] text-white font-bold text-xs font-serif shrink-0">
            {report.author?.name ? report.author.name.charAt(0).toUpperCase() : "W"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-[#17361d]">
                {report.author?.name || "Warga Komunitas"}
              </span>
              <span className="text-xs text-[#8c857e]">&bull;</span>
              <time className="text-xs text-[#7a9a80]">
                {new Date(report.created_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </time>
            </div>
            {report.location && (
              <p className="mt-0.5 text-xs text-[#4a6b52] flex items-center gap-1 font-medium">
                <IconPin className="h-3.5 w-3.5 text-[#1e4d2b] shrink-0" />
                <span className="truncate max-w-[220px] sm:max-w-md">{report.location.address}</span>
              </p>
            )}
          </div>
        </div>

        {/* Official Status */}
        <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${statusBadge.bg}`}>
          {statusBadge.label}
        </span>
      </div>

      {/* Report Body: Title & Context */}
      <div className="mt-4 space-y-2.5">
        <Link href={`/reports/${report.id}`} className="group block space-y-1.5">
          <h2
            className="text-base sm:text-lg font-bold text-[#17361d] group-hover:text-[#1e4d2b] transition-colors leading-snug"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {report.title}
          </h2>
          <p className="text-xs sm:text-sm text-[#4a4642] leading-relaxed">
            {report.description}
          </p>
        </Link>

        {/* Evidence Photos Gallery */}
        {report.media && report.media.length > 0 && (
          <div className="pt-1.5">
            <ReportMediaGallery media={report.media} />
          </div>
        )}
      </div>

      {/* Topic Tags */}
      {displayTopics.length > 0 && (
        <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
          {displayTopics.map((t, idx) => (
            <Link
              key={idx}
              href={`/reports?topic=${t.slug}`}
              className="rounded-full bg-[#f4f7f2] border border-[#d6e4d4] px-2.5 py-0.5 text-xs font-medium text-[#1e4d2b] hover:bg-[#e5f0e6] transition-colors"
            >
              #{t.name}
            </Link>
          ))}
        </div>
      )}

      {/* Analisis CiviLens (Clean, Editorial, Non-Chatbot) */}
      {ai && (
        <div className="mt-4 rounded-xl border border-[#d6e4d4] bg-[#f4f7f2] p-4 text-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-wider uppercase text-[#1e4d2b]">
                Analisis CiviLens
              </span>
              {ai.severity && (
                <span className={`rounded-sm border px-1.5 py-0.2 text-[10px] font-bold ${severityBadge.bg}`}>
                  {severityBadge.label}
                </span>
              )}
            </div>

            {ai.analysis && (
              <button
                type="button"
                onClick={() => setShowAiDetail(!showAiDetail)}
                className="font-semibold text-[#1e4d2b] hover:underline flex items-center gap-1 text-[11px]"
              >
                <span>{showAiDetail ? "Sembunyikan" : "Penjelasan Dampak"}</span>
                {showAiDetail ? <IconChevronUp className="h-3 w-3" /> : <IconChevronDown className="h-3 w-3" />}
              </button>
            )}
          </div>

          {ai.summary && (
            <p className="text-xs font-medium text-[#2c2926] leading-relaxed">
              {ai.summary}
            </p>
          )}

          {showAiDetail && ai.analysis && (
            <div className="pt-2 border-t border-[#d6e4d4] text-xs text-[#57524d] leading-relaxed whitespace-pre-line">
              {ai.analysis}
            </div>
          )}
        </div>
      )}

      {/* Civic Action Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-[#f2ede4] pt-3 text-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onReactionToggle(report.id)}
            aria-label={`Dukung laporan (${report.reactions_count || 0})`}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold transition-colors ${
              report.user_reacted
                ? "bg-[#1e4d2b] text-white"
                : "bg-[#fafaf5] text-[#57524d] border border-[#eae2d3] hover:bg-[#f4f7f2]"
            }`}
          >
            <IconThumbsUp className="h-3.5 w-3.5" />
            <span>{report.reactions_count || 0}</span>
          </button>

          <Link
            href={`/reports/${report.id}`}
            aria-label={`Lihat komentar (${report.comments_count || 0})`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#fafaf5] px-3 py-1.5 font-semibold text-[#57524d] border border-[#eae2d3] hover:bg-[#f4f7f2] transition-colors"
          >
            <IconMessage className="h-3.5 w-3.5" />
            <span>{report.comments_count || 0}</span>
          </Link>

          <button
            type="button"
            onClick={() => onBookmarkToggle(report.id)}
            aria-label={report.user_bookmarked ? "Hapus dari simpanan" : "Simpan laporan"}
            className={`inline-flex items-center gap-1.5 rounded-lg p-2 font-semibold transition-colors ${
              report.user_bookmarked
                ? "bg-[#7a4400] text-white"
                : "bg-[#fafaf5] text-[#57524d] border border-[#eae2d3] hover:bg-[#f4f7f2]"
            }`}
          >
            <IconBookmark className="h-3.5 w-3.5" />
          </button>
        </div>

        <Link
          href={`/reports/${report.id}`}
          className="inline-flex items-center gap-1 font-semibold text-[#1e4d2b] hover:underline"
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
  const { user, status, logout } = useAuth();
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

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchInput);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Initial topics and trending load
  useEffect(() => {
    void getTopics({ limit: 30 })
      .then(setTopics)
      .catch(() => {});
    void getTrendingTopics(6)
      .then(setTrendingTopics)
      .catch(() => {});
  }, []);

  // Fetch reports when filters or tabs change
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
  }, [debouncedQuery, selectedTopic, selectedStatus, selectedSeverity, selectedSort, activeTab]);

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

  return (
    <div className="min-h-screen bg-[#fafaf5] text-[#2c2926] pb-20 lg:pb-10">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-[#eae2d3] bg-[#fafaf5]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3">
          <Link href="/reports" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#1e4d2b] text-white font-bold font-serif text-sm">
              C
            </div>
            <span className="text-xl font-bold tracking-tight text-[#1e4d2b] font-serif">
              CiviLens
            </span>
          </Link>

          {/* Desktop Search Header */}
          <div className="hidden md:flex flex-1 max-w-md mx-6 relative">
            <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7a9a80]" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cari laporan, topik, atau wilayah..."
              className="w-full rounded-full border border-[#c8dfc8] bg-white pl-9 pr-4 py-1.5 text-xs text-[#2c2926] outline-none focus:border-[#1e4d2b] shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/reports/create"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#1e4d2b] px-4 py-2 text-xs font-semibold text-white hover:bg-[#163a20] transition-colors shadow-xs"
            >
              <span>+ Buat Laporan</span>
            </Link>

            {status === "authenticated" && user ? (
              <div className="flex items-center gap-2">
                <Link
                  href={`/users/${user.id}`}
                  className="hidden sm:block text-xs font-semibold text-[#1e4d2b] hover:underline"
                >
                  {user.name}
                </Link>
                <button
                  type="button"
                  onClick={() => void logout()}
                  className="rounded-lg border border-[#cbe0ce] bg-white px-2.5 py-1 text-xs font-semibold text-[#57524d] hover:bg-[#fafaf5]"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="rounded-lg border border-[#cbe0ce] bg-white px-3 py-1.5 text-xs font-semibold text-[#1e4d2b] hover:bg-[#f4f7f2]"
              >
                Masuk
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Layout: 3-column proportional grid (1280-1360px max-width) */}
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6 py-5 flex flex-col lg:flex-row gap-6 items-start">
        {/* LEFT COLUMN: Sidebar Navigation (~240px) */}
        <aside className="hidden lg:block w-[240px] shrink-0 space-y-4">
          <div className="sticky top-20 rounded-2xl border border-[#eae2d3] bg-white p-4 shadow-xs space-y-3">
            <nav className="space-y-1 text-xs font-semibold" aria-label="Navigasi Samping">
              <Link
                href="/reports"
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition-colors ${
                  !selectedTopic && activeTab === "all"
                    ? "bg-[#e5f0e6] text-[#1e4d2b]"
                    : "text-[#57524d] hover:bg-[#fafaf5]"
                }`}
              >
                <IconDocument className="h-4 w-4 shrink-0" />
                <span>Feed Utama</span>
              </Link>
              <Link
                href="/reports/create"
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[#57524d] hover:bg-[#fafaf5] transition-colors"
              >
                <IconCamera className="h-4 w-4 shrink-0" />
                <span>Buat Laporan</span>
              </Link>
              {user && (
                <>
                  <Link
                    href="/bookmarks"
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[#57524d] hover:bg-[#fafaf5] transition-colors"
                  >
                    <IconBookmark className="h-4 w-4 shrink-0" />
                    <span>Laporan Tersimpan</span>
                  </Link>
                  <Link
                    href="/notifications"
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[#57524d] hover:bg-[#fafaf5] transition-colors"
                  >
                    <IconBell className="h-4 w-4 shrink-0" />
                    <span>Pusat Notifikasi</span>
                  </Link>
                  <Link
                    href={`/users/${user.id}`}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[#57524d] hover:bg-[#fafaf5] transition-colors"
                  >
                    <IconUser className="h-4 w-4 shrink-0" />
                    <span>Profil Publik</span>
                  </Link>
                  {(user.role === "government" || user.role === "admin") && (
                    <Link
                      href="/government"
                      className="flex items-center gap-2 rounded-xl bg-[#1e4d2b] px-3 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#163a20] transition-colors mt-2"
                    >
                      <IconShield className="h-3.5 w-3.5 shrink-0" />
                      <span>Portal Instansi</span>
                    </Link>
                  )}
                </>
              )}
            </nav>

            <div className="pt-2 border-t border-[#f2ede4]">
              <Link
                href="/reports/create"
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-[#1e4d2b] py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#163a20] transition-colors"
              >
                <span>+ Buat Laporan</span>
              </Link>
            </div>
          </div>
        </aside>

        {/* CENTER COLUMN: Main Report Stream (~680-720px) */}
        <main className="w-full lg:max-w-[720px] flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold font-serif text-[#1e4d2b]" style={{ fontFamily: "Georgia, serif" }}>
              Feed Laporan Lingkungan
            </h1>
          </div>

          {/* Mobile Search Bar */}
          <div className="block md:hidden relative">
            <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7a9a80]" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cari laporan, topik, atau wilayah..."
              className="w-full rounded-xl border border-[#c8dfc8] bg-white pl-9 pr-4 py-2 text-xs text-[#2c2926] outline-none focus:border-[#1e4d2b] shadow-2xs"
            />
          </div>

          {/* Feed Tab Layer */}
          <div className="flex items-center border-b border-[#eae2d3] bg-white rounded-xl px-3 pt-2 shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`flex-1 pb-2.5 text-xs font-bold text-center border-b-2 transition-colors ${
                activeTab === "all"
                  ? "border-[#1e4d2b] text-[#1e4d2b]"
                  : "border-transparent text-[#7a9a80] hover:text-[#2c2926]"
              }`}
            >
              Semua Laporan
            </button>
            {user && (
              <button
                type="button"
                onClick={() => setActiveTab("mine")}
                className={`flex-1 pb-2.5 text-xs font-bold text-center border-b-2 transition-colors ${
                  activeTab === "mine"
                    ? "border-[#1e4d2b] text-[#1e4d2b]"
                    : "border-transparent text-[#7a9a80] hover:text-[#2c2926]"
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
              className={`shrink-0 rounded-full px-3 py-1 font-semibold transition-colors ${
                selectedTopic === ""
                  ? "bg-[#1e4d2b] text-white"
                  : "bg-white text-[#57524d] border border-[#eae2d3] hover:bg-[#fafaf5]"
              }`}
            >
              Semua Topik
            </button>
            {topics.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTopic(t.slug === selectedTopic ? "" : t.slug)}
                className={`shrink-0 rounded-full px-3 py-1 font-semibold transition-colors ${
                  selectedTopic === t.slug
                    ? "bg-[#1e4d2b] text-white"
                    : "bg-white text-[#57524d] border border-[#eae2d3] hover:bg-[#fafaf5]"
                }`}
              >
                #{t.name}
              </button>
            ))}
          </div>

          {/* Filter & Sorting Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-white border border-[#eae2d3] shadow-xs text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-[#1c4123]">Status:</span>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="rounded-lg border border-[#cbe0ce] bg-[#fafaf5] px-2 py-1 text-xs text-[#2c2926] outline-none"
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
                <span className="font-semibold text-[#1c4123]">Keparahan:</span>
                <select
                  value={selectedSeverity}
                  onChange={(e) => setSelectedSeverity(e.target.value)}
                  className="rounded-lg border border-[#cbe0ce] bg-[#fafaf5] px-2 py-1 text-xs text-[#2c2926] outline-none"
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
              <span className="font-semibold text-[#1c4123]">Urutan:</span>
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="rounded-lg border border-[#cbe0ce] bg-[#fafaf5] px-2.5 py-1 text-xs text-[#2c2926] outline-none"
              >
                <option value="created_at">Terbaru</option>
                <option value="reactions_count">Dukungan Warga</option>
                <option value="priority">Prioritas AI</option>
              </select>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
              {error}
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
              <div className="rounded-2xl border border-[#eae2d3] bg-white p-6 sm:p-7 text-center space-y-3 shadow-xs">
                <h2 className="text-base font-bold text-[#1c4123]" style={{ fontFamily: "Georgia, serif" }}>
                  Belum ada laporan yang cocok
                </h2>
                {debouncedQuery ? (
                  <p className="text-xs text-[#57524d] max-w-sm mx-auto">
                    Tidak ditemukan laporan yang sesuai dengan kata kunci &ldquo;<strong className="text-[#1c4123]">{debouncedQuery}</strong>&rdquo;.
                  </p>
                ) : (
                  <p className="text-xs text-[#57524d] max-w-sm mx-auto">
                    Belum ada laporan dengan filter yang dipilih saat ini.
                  </p>
                )}
                <div>
                  <Link
                    href="/reports/create"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#1e4d2b] px-4 py-2 text-xs font-semibold text-white hover:bg-[#163a20] transition-colors shadow-xs"
                  >
                    <span>+ Buat Laporan Baru</span>
                  </Link>
                </div>
              </div>

              {/* Discovery Section: Topics to Monitor */}
              {topics.length > 0 && (
                <div className="rounded-2xl border border-[#eae2d3] bg-white p-5 shadow-xs space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#1e4d2b]">
                    Topik yang Bisa Kamu Pantau
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {topics.slice(0, 10).map((top) => (
                      <button
                        key={top.id}
                        type="button"
                        onClick={() => setSelectedTopic(top.slug)}
                        className="rounded-full border border-[#d6e4d4] bg-[#fafaf5] px-2.5 py-1 text-xs font-medium text-[#1e4d2b] hover:bg-[#e5f0e6] transition-colors"
                      >
                        #{top.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Information Section: Cara Kerja CiviLens */}
              <div className="rounded-2xl border border-[#eae2d3] bg-white p-5 shadow-xs space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1e4d2b]">
                  Cara Kerja CiviLens
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#57524d]">
                  <div className="p-3 rounded-xl bg-[#fafaf5] border border-[#f2ede4] space-y-1">
                    <p className="font-bold text-[#1c4123]">1. Laporkan Masalah</p>
                    <p className="leading-relaxed text-[11px]">Unggah foto bukti otentik dan tentukan lokasi kejadian.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#fafaf5] border border-[#f2ede4] space-y-1">
                    <p className="font-bold text-[#1c4123]">2. CiviLens Menganalisis</p>
                    <p className="leading-relaxed text-[11px]">Sistem cerdas merangkum fakta dan tingkat keparahan masalah.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#fafaf5] border border-[#f2ede4] space-y-1">
                    <p className="font-bold text-[#1c4123]">3. Ditindaklanjuti</p>
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
        </main>

        {/* RIGHT COLUMN: Discovery / Topic Aggregation (~300px) */}
        <aside className="hidden lg:block w-[300px] shrink-0 space-y-4">
          {/* Widget 1: Topik Paling Banyak Dilaporkan */}
          <div className="rounded-2xl border border-[#eae2d3] bg-white p-4 shadow-xs space-y-3">
            <div>
              <h2 className="text-sm font-bold text-[#1e4d2b] flex items-center gap-1.5" style={{ fontFamily: "Georgia, serif" }}>
                <IconHashtag className="h-4 w-4 text-[#7a4400]" />
                <span>Topik Paling Banyak Dilaporkan</span>
              </h2>
              <p className="text-[11px] text-[#7a9a80] mt-0.5">
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
                    className={`w-full text-left px-3 py-2 rounded-xl border transition-colors ${
                      selectedTopic === item.slug
                        ? "bg-[#e5f0e6] border-[#1e4d2b] text-[#1e4d2b]"
                        : "bg-[#fafaf5] border-[#eae2d3] hover:border-[#c8dfc8] text-[#2c2926]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#1c4123]">#{item.name}</span>
                      <span className="text-[10px] text-[#7a9a80]">
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
          <div className="rounded-2xl border border-[#eae2d3] bg-white p-4 shadow-xs space-y-2 text-xs">
            <h3 className="font-bold text-[#1e4d2b] flex items-center gap-1.5">
              <IconShield className="h-3.5 w-3.5 text-[#1e4d2b]" />
              <span>Transparansi Penanganan</span>
            </h3>
            <p className="text-[11px] text-[#57524d] leading-relaxed">
              Setiap laporan yang masuk diteruskan ke instansi penanggung jawab dan dapat dipantau bersama linimasa statusnya oleh publik.
            </p>
          </div>

          {/* Widget 3: Quick Links / Footer */}
          <div className="px-2 text-[11px] text-[#8c857e] space-y-1">
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

      {/* Mobile Bottom Navigation */}
      <nav
        aria-label="Navigasi Bawah Mobile"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-[#eae2d3] bg-[#fafaf5]/95 backdrop-blur-md px-4 py-2 flex items-center justify-around text-[10px] font-semibold text-[#57524d]"
      >
        <Link href="/reports" className="flex flex-col items-center gap-0.5 text-[#1e4d2b]">
          <IconDocument className="h-4 w-4" />
          <span>Feed</span>
        </Link>
        <Link href="/reports/create" className="flex flex-col items-center gap-0.5 hover:text-[#1e4d2b]">
          <IconCamera className="h-4 w-4" />
          <span>Lapor</span>
        </Link>
        {user ? (
          <>
            <Link href="/bookmarks" className="flex flex-col items-center gap-0.5 hover:text-[#1e4d2b]">
              <IconBookmark className="h-4 w-4" />
              <span>Simpan</span>
            </Link>
            <Link href="/notifications" className="flex flex-col items-center gap-0.5 hover:text-[#1e4d2b]">
              <IconBell className="h-4 w-4" />
              <span>Notifikasi</span>
            </Link>
            <Link href={`/users/${user.id}`} className="flex flex-col items-center gap-0.5 hover:text-[#1e4d2b]">
              <IconUser className="h-4 w-4" />
              <span>Profil</span>
            </Link>
          </>
        ) : (
          <Link href="/login" className="flex flex-col items-center gap-0.5 hover:text-[#1e4d2b]">
            <IconUser className="h-4 w-4" />
            <span>Masuk</span>
          </Link>
        )}
      </nav>
    </div>
  );
}

export default function ReportsFeedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#fafaf5] text-[#2c2926]">
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
