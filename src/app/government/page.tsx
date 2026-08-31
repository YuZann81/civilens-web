"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import {
  getGovernmentAnalytics,
  getReports,
  getModerationFlags,
  resolveModerationFlag,
} from "@/lib/api/client";
import {
  GovernmentOverviewMetrics,
  Report,
  ReportFlag,
} from "@/lib/api/types";
import {
  IconShield,
  IconPin,
  IconSparkles,
  IconSearch,
  IconCheck,
  IconClose,
} from "@/components/ui/icons";

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

function getStatusBadge(status: string) {
  switch (status) {
    case "resolved":
      return { label: "Selesai", bg: "bg-emerald-50 text-emerald-800 border-emerald-200" };
    case "in_progress":
      return { label: "Ditindaklanjuti", bg: "bg-purple-50 text-purple-800 border-purple-200" };
    case "verified":
      return { label: "Terverifikasi", bg: "bg-teal-50 text-teal-800 border-teal-200" };
    case "under_review":
      return { label: "Peninjauan", bg: "bg-blue-50 text-blue-800 border-blue-200" };
    case "rejected":
      return { label: "Ditolak", bg: "bg-red-50 text-red-800 border-red-200" };
    case "pending":
    default:
      return { label: "Menunggu", bg: "bg-amber-50 text-amber-800 border-amber-200" };
  }
}

export default function GovernmentDashboardPage() {
  const router = useRouter();
  const { user, status: authStatus } = useAuth();

  const [tab, setTab] = useState<"queue" | "moderation">("queue");
  const [metrics, setMetrics] = useState<GovernmentOverviewMetrics | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [flags, setFlags] = useState<ReportFlag[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortFilter, setSortFilter] = useState("priority");

  const isPrivileged = user && (user.role === "government" || user.role === "admin");

  useEffect(() => {
    if (authStatus === "loading") return;
    if (!user || (user.role !== "government" && user.role !== "admin")) {
      router.push("/");
      return;
    }

    let mounted = true;

    // Load analytics overview
    getGovernmentAnalytics()
      .then((data) => {
        if (mounted) setMetrics(data);
      })
      .catch(() => {});

    // Load reports queue
    getReports({
      status: statusFilter || undefined,
      severity: severityFilter || undefined,
      q: searchQuery.trim() || undefined,
      sort: sortFilter,
      per_page: 20,
    })
      .then((res) => {
        if (mounted) setReports(res.data);
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [authStatus, user, router, statusFilter, severityFilter, searchQuery, sortFilter]);

  // Load moderation flags when tab is selected
  useEffect(() => {
    if (tab === "moderation" && isPrivileged) {
      getModerationFlags()
        .then((res) => setFlags(res.data))
        .catch(() => {});
    }
  }, [tab, isPrivileged]);

  const handleResolveFlag = async (flagId: number, status: "actioned" | "dismissed") => {
    try {
      await resolveModerationFlag(flagId, status, `Ditangani oleh ${user?.name}`);
      setFlags((prev) =>
        prev.map((f) => (f.id === flagId ? { ...f, status } : f))
      );
    } catch {
      // Handled silently
    }
  };

  if (authStatus === "loading" || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafaf5]">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1e4d2b] border-t-transparent mx-auto" />
          <p className="text-xs text-[#57524d]">Memeriksa hak akses instansi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#fafaf5] text-[#2c2926]">
      {/* Top Header */}
      <header className="border-b border-[#eae2d3] bg-[#fafaf5]/90 backdrop-blur-xs sticky top-0 z-20">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-85">
              <div className="h-6 w-6 rounded-full bg-[#1e4d2b] text-white flex items-center justify-center text-xs font-bold font-serif">
                C
              </div>
              <span className="text-lg font-bold tracking-tight text-[#1c4123]" style={{ fontFamily: "Georgia, serif" }}>
                CiviLens
              </span>
            </Link>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#1e4d2b] px-2.5 py-0.5 text-[11px] font-semibold text-white">
              <IconShield className="h-3 w-3" />
              <span>Portal Instansi ({user.role})</span>
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-[#4a6b52]">
            <Link href="/reports" className="hover:text-[#1e4d2b] transition">
              Feed Warga
            </Link>
            <span className="text-[#1c4123] font-medium">Petugas: {user.name}</span>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-8">
        <div className="space-y-6">
          {/* Header Title */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17361d]" style={{ fontFamily: "Georgia, serif" }}>
              Dasbor Penanganan & Moderasi Isu Lingkungan
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#57524d]">
              Sistem terpadu untuk peninjauan laporan warga, triase berbasis keparahan AI, verifikasi lapangan, dan tindak lanjut transparan.
            </p>
          </div>

          {/* Analytics Overview Cards */}
          {metrics && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="rounded-2xl border border-[#eae2d3] bg-white p-4 shadow-xs space-y-1">
                <div className="text-xs font-semibold text-[#7a9a80]">Total Laporan</div>
                <div className="text-2xl font-bold text-[#17361d]">{metrics.total_reports}</div>
                <div className="text-[10px] text-[#8c857e]">Seluruh laporan masuk</div>
              </div>

              <div className="rounded-2xl border border-orange-200 bg-orange-50/60 p-4 shadow-xs space-y-1">
                <div className="text-xs font-semibold text-orange-900 flex items-center gap-1">
                  <IconSparkles className="h-3.5 w-3.5 text-orange-700" />
                  <span>Prioritas Tinggi (AI)</span>
                </div>
                <div className="text-2xl font-bold text-orange-950">{metrics.high_priority_count}</div>
                <div className="text-[10px] text-orange-800">Tingkat Kritis/Tinggi belum selesai</div>
              </div>

              <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 shadow-xs space-y-1">
                <div className="text-xs font-semibold text-blue-900">Perlu Ditinjau</div>
                <div className="text-2xl font-bold text-blue-950">
                  {metrics.pending_reports + metrics.under_review_reports}
                </div>
                <div className="text-[10px] text-blue-800">Menunggu & Peninjauan</div>
              </div>

              <div className="rounded-2xl border border-[#cbe0ce] bg-[#f4f8f4] p-4 shadow-xs space-y-1">
                <div className="text-xs font-semibold text-[#1e4d2b]">Tingkat Penyelesaian</div>
                <div className="text-2xl font-bold text-[#1e4d2b]">{metrics.resolution_rate}%</div>
                <div className="text-[10px] text-[#2d6a36]">{metrics.resolved_reports} laporan terselesaikan</div>
              </div>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex items-center gap-3 border-b border-[#eae2d3] pb-2">
            <button
              type="button"
              onClick={() => setTab("queue")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
                tab === "queue"
                  ? "bg-[#1e4d2b] text-white shadow-xs"
                  : "bg-white text-[#57524d] border border-[#cbe0ce] hover:bg-[#fafaf5]"
              }`}
            >
              Antrean Laporan & Triase AI
            </button>

            <button
              type="button"
              onClick={() => setTab("moderation")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
                tab === "moderation"
                  ? "bg-[#1e4d2b] text-white shadow-xs"
                  : "bg-white text-[#57524d] border border-[#cbe0ce] hover:bg-[#fafaf5]"
              }`}
            >
              Moderasi Konten & Pelanggaran {flags.length > 0 && `(${flags.length})`}
            </button>
          </div>

          {/* TAB 1: REPORTS TRIAGE QUEUE */}
          {tab === "queue" && (
            <div className="space-y-4">
              {/* Composable Filter Bar */}
              <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-white border border-[#eae2d3] shadow-xs text-xs">
                {/* Search Input */}
                <div className="relative flex-1 min-w-[200px]">
                  <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#7a9a80]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari judul, kata kunci, atau alamat..."
                    className="w-full rounded-xl border border-[#c8dfc8] bg-[#fafaf5] pl-8 pr-3 py-1.5 text-xs text-[#2c2926] outline-none focus:border-[#1e4d2b] focus:bg-white"
                  />
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-[#1c4123]">Status:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-lg border border-[#cbe0ce] bg-[#fafaf5] px-2.5 py-1.5 text-xs text-[#2c2926] outline-none"
                  >
                    <option value="">Semua Status</option>
                    <option value="pending">Menunggu</option>
                    <option value="under_review">Peninjauan</option>
                    <option value="verified">Terverifikasi</option>
                    <option value="in_progress">Ditindaklanjuti</option>
                    <option value="resolved">Selesai</option>
                    <option value="rejected">Ditolak</option>
                  </select>
                </div>

                {/* AI Severity Filter */}
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-[#1c4123]">Keparahan AI:</span>
                  <select
                    value={severityFilter}
                    onChange={(e) => setSeverityFilter(e.target.value)}
                    className="rounded-lg border border-[#cbe0ce] bg-[#fafaf5] px-2.5 py-1.5 text-xs text-[#2c2926] outline-none"
                  >
                    <option value="">Semua Tingkat</option>
                    <option value="critical">Kritis (Critical)</option>
                    <option value="high">Tinggi (High)</option>
                    <option value="medium">Sedang (Medium)</option>
                    <option value="low">Rendah (Low)</option>
                  </select>
                </div>

                {/* Sort Filter */}
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-[#1c4123]">Urutan:</span>
                  <select
                    value={sortFilter}
                    onChange={(e) => setSortFilter(e.target.value)}
                    className="rounded-lg border border-[#cbe0ce] bg-[#fafaf5] px-2.5 py-1.5 text-xs text-[#2c2926] outline-none"
                  >
                    <option value="priority">Prioritas AI & Tanggap Darurat</option>
                    <option value="created_at">Terbaru</option>
                    <option value="reactions_count">Dukungan Terbanyak</option>
                  </select>
                </div>
              </div>

              {/* Reports Table/Cards */}
              {loading ? (
                <div className="text-center py-16 text-xs text-[#7a9a80]">Memuat antrean laporan...</div>
              ) : reports.length === 0 ? (
                <div className="rounded-2xl border border-[#eae2d3] bg-white p-12 text-center text-xs text-[#8c857e] shadow-xs">
                  Tidak ada laporan yang cocok dengan filter yang dipilih.
                </div>
              ) : (
                <div className="space-y-3">
                  {reports.map((report) => {
                    const statusBadge = getStatusBadge(report.status);
                    const aiSeverityBadge = getSeverityBadge(report.ai_analysis?.severity);

                    return (
                      <div
                        key={report.id}
                        className="rounded-2xl border border-[#eae2d3] bg-white p-5 shadow-xs hover:border-[#1e4d2b] transition space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs text-[#7a9a80]">#{report.id}</span>
                            <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusBadge.bg}`}>
                              {statusBadge.label}
                            </span>
                            {report.ai_analysis?.severity && (
                              <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${aiSeverityBadge.bg}`}>
                                AI: {aiSeverityBadge.label}
                              </span>
                            )}
                            {report.topics?.map((t) => (
                              <span key={t.id} className="rounded-full bg-[#f4f8f4] border border-[#cbe0ce] px-2 py-0.2 text-[10px] font-semibold text-[#1e4d2b]">
                                #{t.name}
                              </span>
                            ))}
                          </div>

                          <div className="text-[11px] text-[#8c857e]">
                            {new Date(report.created_at).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })} WIB
                          </div>
                        </div>

                        <div className="space-y-1">
                          <h2 className="text-base font-bold text-[#17361d]" style={{ fontFamily: "Georgia, serif" }}>
                            {report.title}
                          </h2>
                          <p className="text-xs text-[#57524d] line-clamp-2 leading-relaxed">
                            {report.description}
                          </p>
                        </div>

                        {report.location && (
                          <p className="text-xs text-[#4a6b52] flex items-center gap-1">
                            <IconPin className="h-3.5 w-3.5 text-[#1e4d2b] shrink-0" />
                            <span>{report.location.address}</span>
                          </p>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-[#f0f4ee]">
                          <div className="text-[11px] text-[#7a9a80] flex items-center gap-3">
                            <span>{report.media?.length || 0} Foto Bukti</span>
                            <span>{report.reactions_count || 0} Dukungan</span>
                            <span>{report.comments_count || 0} Tanggapan</span>
                          </div>

                          <Link
                            href={`/reports/${report.id}`}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-[#1e4d2b] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#163a20] transition shadow-xs"
                          >
                            <span>Tinjau & Tindak Lanjuti</span>
                            <span>&rarr;</span>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MODERATION FLAGS */}
          {tab === "moderation" && (
            <div className="space-y-4">
              {flags.length === 0 ? (
                <div className="rounded-2xl border border-[#eae2d3] bg-white p-12 text-center text-xs text-[#8c857e] shadow-xs">
                  Tidak ada laporan indikasi pelanggaran konten yang menunggu moderasi.
                </div>
              ) : (
                <div className="space-y-3">
                  {flags.map((flag) => (
                    <div
                      key={flag.id}
                      className="rounded-2xl border border-[#eae2d3] bg-white p-5 shadow-xs space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-[#f0f4ee] pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-red-100 text-red-800 border border-red-200 px-2.5 py-0.5 text-xs font-bold uppercase">
                            {flag.reason.replace("_", " ")}
                          </span>
                          <span className="text-xs text-[#7a9a80]">
                            Dilaporkan oleh: <strong>{flag.reporter?.name || "Warga"}</strong>
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-[#1c4123] capitalize">
                          Status: {flag.status}
                        </span>
                      </div>

                      {flag.description && (
                        <p className="text-xs text-[#57524d] italic bg-[#fafaf5] p-2.5 rounded-xl border border-[#eae2d3]">
                          &ldquo;{flag.description}&rdquo;
                        </p>
                      )}

                      {flag.report && (
                        <div className="text-xs text-[#17361d] space-y-1">
                          <span className="font-semibold text-[#7a9a80]">Target Laporan:</span>
                          <Link
                            href={`/reports/${flag.report.id}`}
                            className="block font-bold hover:text-[#1e4d2b] transition"
                          >
                            #{flag.report.id} - {flag.report.title}
                          </Link>
                        </div>
                      )}

                      {flag.status === "pending" && (
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#f0f4ee]">
                          <button
                            type="button"
                            onClick={() => handleResolveFlag(flag.id, "dismissed")}
                            className="inline-flex items-center gap-1 rounded-xl border border-[#cbe0ce] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#57524d] hover:bg-[#fafaf5] transition"
                          >
                            <IconClose className="h-3 w-3" />
                            <span>Abaikan (Dismiss)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleResolveFlag(flag.id, "actioned")}
                            className="inline-flex items-center gap-1 rounded-xl bg-red-700 px-4 py-1.5 text-xs font-semibold text-white hover:bg-red-800 transition shadow-xs"
                          >
                            <IconCheck className="h-3 w-3" />
                            <span>Tindak Lanjuti (Action)</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-[#eae2d3] py-6 text-center text-xs text-[#8c857e] mt-auto">
        <div className="mx-auto max-w-6xl px-6">
          CiviLens &bull; Portal Pemerintahan & Transparansi Lingkungan Warga
        </div>
      </footer>
    </div>
  );
}
