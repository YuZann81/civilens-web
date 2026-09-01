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
  IconSparkles,
  IconThumbsUp,
  IconBookmark,
  IconMessage,
  IconShield,
  IconChevronDown,
  IconChevronUp,
  IconUser,
  IconBell,
  IconArrowRight,
} from "@/components/ui/icons";

function getStatusBadge(status: string) {
  switch (status) {
    case "resolved":
    case "selesai":
      return { label: "Selesai", bg: "bg-emerald-50 text-emerald-800 border-emerald-200" };
    case "in_progress":
      return { label: "Ditindaklanjuti", bg: "bg-purple-50 text-purple-800 border-purple-200" };
    case "verified":
      return { label: "Terverifikasi", bg: "bg-teal-50 text-teal-800 border-teal-200" };
    case "under_review":
    case "diproses":
      return { label: "Peninjauan", bg: "bg-blue-50 text-blue-800 border-blue-200" };
    case "rejected":
    case "ditolak":
      return { label: "Ditolak", bg: "bg-red-50 text-red-800 border-red-200" };
    case "pending":
    default:
      return { label: "Menunggu", bg: "bg-amber-50 text-amber-800 border-amber-200" };
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

function ReportFeedCard({
  report,
  onReactionToggle,
  onBookmarkToggle,
}: {
  report: Report;
  onReactionToggle: (id: number) => void;
  onBookmarkToggle: (id: number) => void;
}) {
  const [showAi, setShowAi] = useState(false);
  const statusBadge = getStatusBadge(report.status);
  const ai = report.ai_analysis;
  const severityBadge = getSeverityBadge(ai?.severity);

  const displayTopics = report.topics && report.topics.length > 0
    ? report.topics
    : report.category ? [{ id: 0, name: report.category.name, slug: report.category.slug }] : [];

  return (
    <article className="rounded-2xl border border-[#eae2d3] bg-white p-5 sm:p-6 shadow-xs hover:border-[#c8dfc8] transition space-y-4">
      {/* Author & Location Meta */}
      <div className="flex items-start justify-between gap-3 border-b border-[#f0f4ee] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e5f0e6] text-[#1e4d2b] font-bold text-xs font-serif">
            {report.author?.name ? report.author.name.charAt(0).toUpperCase() : "W"}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-[#1c4123]">
                {report.author?.name || "Warga Komunitas"}
              </span>
              <span className="text-[10px] text-[#8c857e]">&bull;</span>
              <span className="text-[10px] text-[#8c857e]">
                {new Date(report.created_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            </div>
            {report.location && (
              <p className="text-[11px] font-medium text-[#4a6b52] flex items-center gap-1">
                <IconPin className="h-3 w-3 text-[#1e4d2b] shrink-0" />
                <span className="truncate max-w-[200px] sm:max-w-xs">{report.location.address}</span>
              </p>
            )}
          </div>
        </div>

        {/* Status Pill */}
        <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${statusBadge.bg}`}>
          {statusBadge.label}
        </span>
      </div>

      {/* Content Body */}
      <div className="space-y-2">
        <Link href={`/reports/${report.id}`} className="group block">
          <h2
            className="text-base sm:text-lg font-bold text-[#17361d] group-hover:text-[#1e4d2b] transition leading-snug"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {report.title}
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-[#57524d] line-clamp-3 leading-relaxed">
            {report.description}
          </p>
        </Link>

        {/* Attached Photos Preview */}
        {report.media && report.media.length > 0 && (
          <div className="pt-2 flex flex-wrap gap-2">
            {report.media.slice(0, 3).map((m, idx) => (
              <div
                key={m.id || idx}
                className="rounded-xl border border-[#cbe0ce] bg-[#fafaf5] px-3 py-1.5 text-[11px] text-[#1c4123] flex items-center gap-1 font-medium"
              >
                <span>📷 {m.original_name}</span>
                <span className="text-[9px] text-[#7a9a80]">({(m.size / 1024).toFixed(0)} KB)</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Topic Tags */}
      {displayTopics.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {displayTopics.map((t, idx) => (
            <Link
              key={idx}
              href={`/reports?topic=${t.slug}`}
              className="rounded-full bg-[#f4f8f4] border border-[#cbe0ce] px-2.5 py-0.5 text-[11px] font-semibold text-[#1e4d2b] hover:bg-[#e5f0e6] transition"
            >
              #{t.name}
            </Link>
          ))}
        </div>
      )}

      {/* Expandable Contextual AI Assessment Section */}
      {ai && (
        <div className="rounded-xl border border-[#c8dfc8] bg-[#f0f4ee]/70 p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <IconSparkles className="h-3.5 w-3.5 text-[#7a4400]" />
              <span className="text-xs font-bold text-[#1e4d2b]">Analisis Dampak AI</span>
              {ai.severity && (
                <span className={`rounded-md border px-1.5 py-0.2 text-[10px] font-bold ${severityBadge.bg}`}>
                  {severityBadge.label}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowAi(!showAi)}
              className="text-[11px] font-semibold text-[#4a6b52] hover:text-[#1e4d2b] flex items-center gap-1"
            >
              <span>{showAi ? "Sembunyikan" : "Lihat Analisis"}</span>
              {showAi ? <IconChevronUp className="h-3 w-3" /> : <IconChevronDown className="h-3 w-3" />}
            </button>
          </div>

          {ai.summary && (
            <p className="text-xs font-medium text-[#1c4123] leading-relaxed">
              {ai.summary}
            </p>
          )}

          {showAi && ai.analysis && (
            <div className="pt-2 border-t border-[#c8dfc8]/60 text-xs text-[#57524d] leading-relaxed whitespace-pre-line animate-in fade-in duration-200">
              {ai.analysis}
            </div>
          )}
        </div>
      )}

      {/* Civic Action Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-[#f0f4ee] text-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onReactionToggle(report.id)}
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-semibold transition ${
              report.user_reacted
                ? "bg-[#1e4d2b] text-white"
                : "bg-[#fafaf5] text-[#57524d] border border-[#eae2d3] hover:bg-[#f4f8f4]"
            }`}
          >
            <IconThumbsUp className="h-3.5 w-3.5" />
            <span>{report.reactions_count || 0}</span>
          </button>

          <Link
            href={`/reports/${report.id}`}
            className="inline-flex items-center gap-1 rounded-lg bg-[#fafaf5] px-2.5 py-1 font-semibold text-[#57524d] border border-[#eae2d3] hover:bg-[#f4f8f4] transition"
          >
            <IconMessage className="h-3.5 w-3.5" />
            <span>{report.comments_count || 0}</span>
          </Link>

          <button
            type="button"
            onClick={() => onBookmarkToggle(report.id)}
            className={`inline-flex items-center gap-1 rounded-lg p-1.5 font-semibold transition ${
              report.user_bookmarked
                ? "bg-[#7a4400] text-white"
                : "bg-[#fafaf5] text-[#57524d] border border-[#eae2d3] hover:bg-[#f4f8f4]"
            }`}
            title="Simpan laporan"
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

  // Feed Tab: "for_you" (Semua Laporan) vs "mine" (Laporan Saya)
  const [activeTab, setActiveTab] = useState<"for_you" | "mine">("for_you");

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
    <div className="min-h-screen bg-[#fafaf5] text-[#2c2926] pb-16 lg:pb-0">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-[#eae2d3] bg-[#fafaf5]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3.5">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#1e4d2b] text-white font-bold font-serif text-sm">
              C
            </div>
            <span className="text-xl font-bold tracking-tight text-[#1e4d2b] font-serif">
              CiviLens
            </span>
          </Link>

          {/* Top Search (Desktop Center) */}
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
              className="inline-flex items-center gap-1 rounded-xl bg-[#1e4d2b] px-4 py-2 text-xs font-semibold text-white hover:bg-[#163a20] transition shadow-xs"
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
                className="rounded-lg border border-[#cbe0ce] bg-white px-3 py-1.5 text-xs font-semibold text-[#1e4d2b] hover:bg-[#f4f8f4]"
              >
                Masuk
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main 3-Column Desktop / Adaptive Mobile Container */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Navigation (Desktop) */}
        <aside className="hidden lg:block lg:col-span-3 space-y-4">
          <div className="sticky top-20 rounded-2xl border border-[#eae2d3] bg-white p-4 shadow-xs space-y-4">
            <nav className="space-y-1 text-sm font-semibold" aria-label="Navigasi Samping">
              <Link
                href="/reports"
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition ${
                  !selectedTopic && activeTab === "for_you"
                    ? "bg-[#e5f0e6] text-[#1e4d2b]"
                    : "text-[#57524d] hover:bg-[#fafaf5]"
                }`}
              >
                <span>Feed Utama</span>
              </Link>
              <Link
                href="/reports/create"
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[#57524d] hover:bg-[#fafaf5] transition"
              >
                <span>+ Buat Laporan Baru</span>
              </Link>
              {user && (
                <>
                  <Link
                    href="/bookmarks"
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[#57524d] hover:bg-[#fafaf5] transition"
                  >
                    <IconBookmark className="h-4 w-4" />
                    <span>Laporan Tersimpan</span>
                  </Link>
                  <Link
                    href="/notifications"
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[#57524d] hover:bg-[#fafaf5] transition"
                  >
                    <IconBell className="h-4 w-4" />
                    <span>Pusat Notifikasi</span>
                  </Link>
                  <Link
                    href={`/users/${user.id}`}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[#57524d] hover:bg-[#fafaf5] transition"
                  >
                    <IconUser className="h-4 w-4" />
                    <span>Profil Publik</span>
                  </Link>
                  {(user.role === "government" || user.role === "admin") && (
                    <Link
                      href="/government"
                      className="flex items-center gap-2 rounded-xl bg-[#1e4d2b] px-3 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#163a20] transition mt-2"
                    >
                      <IconShield className="h-3.5 w-3.5" />
                      <span>Portal Instansi</span>
                    </Link>
                  )}
                </>
              )}
            </nav>
          </div>
        </aside>

        {/* CENTER COLUMN: Main Feed & Filters */}
        <main className="lg:col-span-6 space-y-4">
          {/* Header Title */}
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

          {/* Feed Layer Switcher: Semua Laporan | Laporan Saya */}
          <div className="flex items-center border-b border-[#eae2d3] bg-white rounded-xl px-3 pt-2 shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveTab("for_you")}
              className={`flex-1 pb-2.5 text-xs font-bold text-center border-b-2 transition ${
                activeTab === "for_you"
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
                className={`flex-1 pb-2.5 text-xs font-bold text-center border-b-2 transition ${
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
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              type="button"
              onClick={() => setSelectedTopic("")}
              className={`shrink-0 rounded-full px-3.5 py-1.5 font-semibold transition ${
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
                className={`shrink-0 rounded-full px-3.5 py-1.5 font-semibold transition ${
                  selectedTopic === t.slug
                    ? "bg-[#1e4d2b] text-white"
                    : "bg-white text-[#57524d] border border-[#eae2d3] hover:bg-[#fafaf5]"
                }`}
              >
                #{t.name}
              </button>
            ))}
          </div>

          {/* Secondary Sorting, Status & Severity Filter Bar */}
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

          {/* Feed Content Stream */}
          {loading ? (
            <div className="text-center py-16 space-y-2">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#1e4d2b] border-t-transparent mx-auto" />
              <p className="text-xs text-[#57524d]">Memuat laporan warga...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="rounded-2xl border border-[#eae2d3] bg-white p-8 sm:p-10 text-center space-y-4 shadow-xs">
              <p className="text-base font-bold text-[#1c4123]" style={{ fontFamily: "Georgia, serif" }}>
                Belum ada laporan yang cocok
              </p>
              {debouncedQuery && (
                <p className="text-xs text-[#57524d] max-w-sm mx-auto">
                  Tidak ditemukan laporan dengan kata kunci &ldquo;<strong className="text-[#1c4123]">{debouncedQuery}</strong>&rdquo;.
                </p>
              )}

              {/* Discovery & Reporting Entry Point */}
              <div className="rounded-xl bg-[#fafaf5] border border-[#cbe0ce] p-4 text-left space-y-3 max-w-md mx-auto">
                <p className="text-xs font-bold text-[#1e4d2b]">Mulai Laporkan Isu Tersebut</p>
                <p className="text-xs text-[#57524d] leading-relaxed">
                  Jadilah yang pertama mendokumentasikan permasalahan lingkungan ini agar dapat dipantau dan ditindaklanjuti.
                </p>

                {trendingTopics.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <p className="text-[11px] font-semibold text-[#7a9a80]">Topik Terkait yang Mungkin Sesuai:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {trendingTopics.slice(0, 3).map((tt) => (
                        <button
                          key={tt.id}
                          type="button"
                          onClick={() => setSelectedTopic(tt.slug)}
                          className="rounded-md border border-[#c8dfc8] bg-white px-2 py-0.5 text-[10px] font-semibold text-[#1e4d2b] hover:bg-[#e5f0e6]"
                        >
                          #{tt.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <Link
                    href="/reports/create"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#1e4d2b] px-4 py-2 text-xs font-semibold text-white hover:bg-[#163a20] transition shadow-xs"
                  >
                    <span>+ Buat Laporan Sekarang</span>
                  </Link>
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

        {/* RIGHT COLUMN: Trending Topics & Civic Discovery */}
        <aside className="hidden lg:block lg:col-span-3 space-y-4">
          <div className="sticky top-20 rounded-2xl border border-[#eae2d3] bg-white p-5 shadow-xs space-y-4">
            <div>
              <h2 className="text-sm font-bold text-[#1e4d2b] flex items-center gap-1.5" style={{ fontFamily: "Georgia, serif" }}>
                <IconHashtag className="h-4 w-4 text-[#7a4400]" />
                <span>Topik Paling Banyak Dilaporkan</span>
              </h2>
              <p className="text-[11px] text-[#7a9a80] mt-0.5">
                Akumulasi jumlah laporan warga CiviLens pada topik aktif.
              </p>
            </div>

            {trendingTopics.length === 0 ? (
              <p className="text-xs text-[#8c857e] italic py-2">Belum ada topik aktif.</p>
            ) : (
              <div className="space-y-2">
                {trendingTopics.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedTopic(item.slug === selectedTopic ? "" : item.slug)}
                    className={`w-full text-left p-2.5 rounded-xl border transition ${
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

            <div className="pt-3 border-t border-[#f0f4ee] text-[11px] text-[#8c857e] leading-relaxed">
              CiviLens menjembatani transparansi warga dan tindak lanjut penanganan instansi pemerintah.
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav
        aria-label="Navigasi Bawah Mobile"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-[#eae2d3] bg-[#fafaf5]/95 backdrop-blur-md px-4 py-2 flex items-center justify-around text-[10px] font-semibold text-[#57524d]"
      >
        <Link href="/reports" className="flex flex-col items-center gap-0.5 text-[#1e4d2b]">
          <span className="text-base">🏠</span>
          <span>Feed</span>
        </Link>
        <Link href="/reports/create" className="flex flex-col items-center gap-0.5 hover:text-[#1e4d2b]">
          <span className="text-base">➕</span>
          <span>Lapor</span>
        </Link>
        {user ? (
          <>
            <Link href="/bookmarks" className="flex flex-col items-center gap-0.5 hover:text-[#1e4d2b]">
              <span className="text-base">🔖</span>
              <span>Simpan</span>
            </Link>
            <Link href="/notifications" className="flex flex-col items-center gap-0.5 hover:text-[#1e4d2b]">
              <span className="text-base">🔔</span>
              <span>Notifikasi</span>
            </Link>
            <Link href={`/users/${user.id}`} className="flex flex-col items-center gap-0.5 hover:text-[#1e4d2b]">
              <span className="text-base">👤</span>
              <span>Profil</span>
            </Link>
          </>
        ) : (
          <Link href="/login" className="flex flex-col items-center gap-0.5 hover:text-[#1e4d2b]">
            <span className="text-base">🔑</span>
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
        <div className="flex min-h-screen items-center justify-center bg-[#fafaf5]">
          <div className="text-center space-y-2">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#1e4d2b] border-t-transparent mx-auto" />
            <p className="text-xs text-[#57524d]">Memuat feed laporan...</p>
          </div>
        </div>
      }
    >
      <ReportsFeedContent />
    </Suspense>
  );
}
