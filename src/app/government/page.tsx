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
  IconDocument,
  IconArrowRight,
} from "@/components/ui/icons";
import { GovernmentDashboardSkeleton } from "@/components/ui/skeletons";
import { AuthenticatedShell } from "@/components/layout/authenticated-shell";

import { getStatusBadge, getSeverityBadge, formatRelativeTime } from "@/components/reports/report-status-badge";

export default function GovernmentDashboardPage() {
  const router = useRouter();
  const { user, status: authStatus } = useAuth();

  const [tab, setTab] = useState<"queue" | "moderation">("queue");
  const [metrics, setMetrics] = useState<GovernmentOverviewMetrics | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [flags, setFlags] = useState<ReportFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortFilter, setSortFilter] = useState("priority");

  const isPrivileged = user && (user.role === "government" || user.role === "admin");

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    if (authStatus === "loading") return;
    if (!user || (user.role !== "government" && user.role !== "admin")) {
      router.push("/reports");
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
      q: debouncedSearch.trim() || undefined,
      sort: sortFilter,
      per_page: 25,
    })
      .then((res) => {
        if (mounted) {
          setReports(res.data);
          setError("");
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Gagal memuat antrean laporan.");
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [authStatus, user, router, statusFilter, severityFilter, debouncedSearch, sortFilter, reloadTrigger]);

  // Load moderation flags when tab is selected
  useEffect(() => {
    if (tab === "moderation" && isPrivileged) {
      getModerationFlags()
        .then((res) => setFlags(res.data))
        .catch(() => {});
    }
  }, [tab, isPrivileged, reloadTrigger]);

  const handleResolveFlag = async (flagId: number, action: "dismiss" | "remove_report") => {
    try {
      await resolveModerationFlag(flagId, action, `Diselesaikan oleh petugas ${user?.name || ""}`);
      setFlags((prev) => prev.filter((f) => f.id !== flagId));
    } catch {
      // Handled silently
    }
  };

  const handleResetFilters = () => {
    setStatusFilter("");
    setSeverityFilter("");
    setSearchQuery("");
    setDebouncedSearch("");
    setSortFilter("priority");
  };

  if (authStatus === "loading" || !user) {
    return (
      <AuthenticatedShell maxWidth="wide">
        <GovernmentDashboardSkeleton />
      </AuthenticatedShell>
    );
  }

  return (
    <AuthenticatedShell maxWidth="wide">
      <div className="space-y-6 pb-12 sm:pb-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#5c685f]">
          <Link href="/reports" className="hover:text-[#1c241e] transition flex items-center gap-1 font-medium text-[#225332]">
            <span>&larr; Kembali ke Feed Laporan</span>
          </Link>
          <span>/</span>
          <span className="text-[#1c241e] font-semibold">
            Portal Instansi
          </span>
        </div>

        {/* 1. OPERATIONAL COCKPIT HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1c241e]">
                Pusat Tindak Lanjut & Moderasi Laporan
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#225332] px-2.5 py-0.5 text-xs font-semibold text-white">
                <IconShield className="h-3 w-3" />
                <span>Portal Instansi ({user.role})</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#5c685f]">
              Ruang kerja operasional untuk meninjau laporan warga, memprioritaskan triase berbasis keparahan AI, dan memperbarui status penanganan secara transparan.
            </p>
          </div>
        </div>

        {/* 2. COMPACT OPERATIONAL SUMMARY */}
        {metrics && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-[#e2e6df] bg-white p-3.5 shadow-xs space-y-0.5">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#8c978f]">Total Laporan</div>
              <div className="text-2xl font-bold text-[#1c241e] leading-tight">{metrics.total_reports}</div>
              <div className="text-[10px] text-[#5c685f]">Seluruh laporan masuk</div>
            </div>

            <div className="rounded-xl border border-[#fed7aa] bg-[#fff7ed] p-3.5 shadow-xs space-y-0.5">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#c2410c] flex items-center gap-1">
                <IconSparkles className="h-3 w-3 text-[#c2410c]" />
                <span>Prioritas AI</span>
              </div>
              <div className="text-2xl font-bold text-[#9a3412] leading-tight">{metrics.high_priority_count}</div>
              <div className="text-[10px] text-[#c2410c]">Tingkat Kritis/Tinggi aktif</div>
            </div>

            <div className="rounded-xl border border-[#bfdbfe] bg-[#eff6ff] p-3.5 shadow-xs space-y-0.5">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#1d4ed8]">Perlu Ditinjau</div>
              <div className="text-2xl font-bold text-[#1e40af] leading-tight">
                {metrics.pending_reports + metrics.under_review_reports}
              </div>
              <div className="text-[10px] text-[#1d4ed8]">Menunggu & Dalam Peninjauan</div>
            </div>

            <div className="rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] p-3.5 shadow-xs space-y-0.5">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#15803d]">Terselesaikan</div>
              <div className="text-2xl font-bold text-[#166534] leading-tight">{metrics.resolved_reports}</div>
              <div className="text-[10px] text-[#15803d]">
                {metrics.total_reports > 0
                  ? `${Math.round((metrics.resolved_reports / metrics.total_reports) * 100)}%`
                  : "0%"}
              </div>
            </div>
          </div>
        )}

        {/* 3. COHERENT OPERATIONAL WORKSPACE (Queue & Controls) */}
        <div className="rounded-2xl border border-[#e2e6df] bg-white shadow-xs overflow-hidden">
          {/* Workspace Tabs Header */}
          <div className="flex items-center border-b border-[#e2e6df] bg-[#fafaf7] px-4 pt-3 gap-6">
            <button
              type="button"
              onClick={() => setTab("queue")}
              className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition ${
                tab === "queue"
                  ? "border-[#225332] text-[#225332]"
                  : "border-transparent text-[#5c685f] hover:text-[#1c241e]"
              }`}
            >
              Antrean Triase Penanganan ({reports.length})
            </button>
            <button
              type="button"
              onClick={() => setTab("moderation")}
              className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition ${
                tab === "moderation"
                  ? "border-[#225332] text-[#225332]"
                  : "border-transparent text-[#5c685f] hover:text-[#1c241e]"
              }`}
            >
              Laporan Pelanggaran Warga {flags.length > 0 && <span className="ml-1 rounded-full bg-[#fee2e2] text-[#b91c1c] border border-[#fecaca] px-2 py-0.2 text-[10px] font-bold">{flags.length}</span>}
            </button>
          </div>

          {tab === "queue" ? (
            <div className="p-4 sm:p-5 space-y-4">
              {/* Queue Controls Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[#fafaf7] border border-[#e2e6df] text-xs">
                <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
                  {/* Search Input */}
                  <div className="relative min-w-[200px] flex-1 sm:flex-none">
                    <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8c978f]" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari judul atau lokasi..."
                      className="w-full rounded-lg border border-[#e2e6df] bg-white pl-8 pr-3 py-1.5 text-xs text-[#1c241e] placeholder-[#8c978f] outline-none transition focus:border-[#225332]"
                    />
                  </div>

                  {/* Status Filter */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-lg border border-[#e2e6df] bg-white px-2.5 py-1.5 text-xs text-[#1c241e] outline-none transition focus:border-[#225332]"
                    aria-label="Filter status laporan"
                  >
                    <option value="">Semua Status</option>
                    <option value="pending">Menunggu</option>
                    <option value="under_review">Peninjauan</option>
                    <option value="verified">Terverifikasi</option>
                    <option value="in_progress">Ditindaklanjuti</option>
                    <option value="resolved">Selesai</option>
                    <option value="rejected">Ditolak</option>
                  </select>

                  {/* Severity Filter */}
                  <select
                    value={severityFilter}
                    onChange={(e) => setSeverityFilter(e.target.value)}
                    className="rounded-lg border border-[#e2e6df] bg-white px-2.5 py-1.5 text-xs text-[#1c241e] outline-none transition focus:border-[#225332]"
                    aria-label="Filter tingkat keparahan AI"
                  >
                    <option value="">Semua Keparahan (AI)</option>
                    <option value="critical">Kritis</option>
                    <option value="high">Tinggi</option>
                    <option value="medium">Sedang</option>
                    <option value="low">Rendah</option>
                  </select>
                </div>

                {/* Sorting Select */}
                <div className="flex items-center gap-1.5 text-[#5c685f]">
                  <span>Urutan:</span>
                  <select
                    value={sortFilter}
                    onChange={(e) => setSortFilter(e.target.value)}
                    className="rounded-lg border border-[#e2e6df] bg-white px-2.5 py-1.5 text-xs text-[#1c241e] outline-none transition focus:border-[#225332]"
                    aria-label="Urutan antrean"
                  >
                    <option value="priority">Prioritas AI (Tinggi dulu)</option>
                    <option value="newest">Terbaru</option>
                    <option value="oldest">Terlama</option>
                  </select>
                </div>
              </div>

              {/* Error Banner */}
              {error && (
                <div className="rounded-xl border border-[#fecaca] bg-[#fee2e2] p-4 text-xs text-[#b91c1c] flex items-center justify-between gap-3">
                  <span>{error}</span>
                  <button
                    type="button"
                    onClick={() => setReloadTrigger((c) => c + 1)}
                    className="font-semibold underline hover:opacity-80 shrink-0"
                  >
                    Coba Lagi
                  </button>
                </div>
              )}

              {/* Operational Queue Table / List */}
              {loading ? (
                <div className="space-y-2 py-2">
                  <div className="h-10 w-full animate-pulse bg-[#e2e6df]/50 rounded-xl" />
                  <div className="h-14 w-full animate-pulse bg-[#e2e6df]/50 rounded-xl" />
                  <div className="h-14 w-full animate-pulse bg-[#e2e6df]/50 rounded-xl" />
                  <div className="h-14 w-full animate-pulse bg-[#e2e6df]/50 rounded-xl" />
                </div>
              ) : reports.length === 0 ? (
                <div className="rounded-xl border border-[#e2e6df] bg-[#fafaf7] p-10 text-center space-y-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f2f7f3] text-[#225332] mx-auto">
                    <IconDocument className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold text-[#1c241e]">Tidak Ada Laporan dalam Antrean</h3>
                  <p className="text-xs text-[#5c685f] max-w-sm mx-auto">
                    Semua laporan telah ditindaklanjuti atau tidak ada data yang cocok dengan kriteria filter saat ini.
                  </p>
                  {(statusFilter || severityFilter || searchQuery) && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="inline-flex items-center gap-1 rounded-xl border border-[#e2e6df] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#1c241e] hover:bg-[#fafaf7] transition shadow-xs"
                      >
                        Reset Filter
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-[#edf0ea] border border-[#e2e6df] rounded-xl overflow-hidden">
                  {/* Desktop Table Header */}
                  <div className="hidden md:grid md:grid-cols-12 gap-3 px-4 py-2.5 bg-[#fafaf7] text-[11px] font-semibold uppercase tracking-wider text-[#5c685f]">
                    <div className="col-span-2">Status & Prioritas</div>
                    <div className="col-span-5">Laporan Masalah</div>
                    <div className="col-span-3">Lokasi & Waktu</div>
                    <div className="col-span-2 text-right">Tindakan</div>
                  </div>

                  {/* Queue Items Stream */}
                  {reports.map((report) => {
                    const statusBadge = getStatusBadge(report.status);
                    const severityBadge = getSeverityBadge(report.ai_analysis?.severity);
                    const ageText = formatRelativeTime(report.created_at);

                    return (
                      <div
                        key={report.id}
                        className="p-4 md:p-3.5 hover:bg-[#fafaf7] transition group flex flex-col md:grid md:grid-cols-12 gap-3 items-start md:items-center"
                      >
                        {/* 1. Status & Severity Column */}
                        <div className="md:col-span-2 flex flex-wrap items-center gap-1.5">
                          <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${statusBadge.bg}`}>
                            {statusBadge.label}
                          </span>
                          {report.ai_analysis?.severity && (
                            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${severityBadge.bg}`}>
                              AI: {severityBadge.label}
                            </span>
                          )}
                        </div>

                        {/* 2. Report Title & Topic Column */}
                        <div className="md:col-span-5 min-w-0 space-y-1 w-full">
                          <Link
                            href={`/reports/${report.id}`}
                            className="text-xs sm:text-sm font-bold text-[#1c241e] hover:text-[#225332] transition line-clamp-1 block"
                            title={report.title}
                          >
                            {report.title}
                          </Link>
                          <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-[#5c685f]">
                            {report.topics && report.topics.length > 0 ? (
                              report.topics.map((t) => (
                                <span key={t.id} className="text-[#225332] font-medium">
                                  #{t.name}
                                </span>
                              ))
                            ) : (
                              <span className="text-[#8c978f]">Umum</span>
                            )}
                            <span className="text-[#8c978f]">&bull;</span>
                            <span className="text-[#8c978f] font-mono text-[10px]">#{report.id}</span>
                          </div>
                        </div>

                        {/* 3. Location & Time Column */}
                        <div className="md:col-span-3 min-w-0 space-y-0.5 w-full text-xs text-[#5c685f]">
                          {report.location && (
                            <p className="flex items-center gap-1 truncate" title={report.location.address}>
                              <IconPin className="h-3 w-3 text-[#225332] shrink-0" />
                              <span className="truncate">{report.location.address}</span>
                            </p>
                          )}
                          <p className="text-[11px] text-[#8c978f] flex items-center gap-1">
                            <span>Masuk: {ageText}</span>
                          </p>
                        </div>

                        {/* 4. Action Column */}
                        <div className="md:col-span-2 w-full flex md:justify-end">
                          <Link
                            href={`/reports/${report.id}`}
                            className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#225332] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#173722] transition active:scale-[0.98] shadow-xs whitespace-nowrap"
                          >
                            <span>Tinjau & Tindak Lanjut</span>
                            <IconArrowRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* Moderation Queue Stream */
            <div className="p-4 sm:p-5 space-y-4">
              {flags.length === 0 ? (
                <div className="rounded-xl border border-[#e2e6df] bg-[#fafaf7] p-10 text-center space-y-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f2f7f3] text-[#225332] mx-auto">
                    <IconShield className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold text-[#1c241e]">Tidak Ada Laporan Pelanggaran Aktif</h3>
                  <p className="text-xs text-[#5c685f]">Semua bendera laporan dari warga telah selesai ditinjau.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {flags.map((flag) => (
                    <div
                      key={flag.id}
                      className="rounded-xl border border-[#fed7aa] bg-white p-4 sm:p-5 shadow-xs space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-[#edf0ea] pb-2.5 flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-[#fee2e2] border border-[#fecaca] px-2.5 py-0.5 text-xs font-bold text-[#b91c1c]">
                            Alasan: {flag.reason}
                          </span>
                          <span className="text-xs text-[#5c685f]">
                            Pelapor: <strong>{flag.reporter?.name || "Warga"}</strong>
                          </span>
                        </div>
                        <span className="text-[11px] text-[#8c978f] font-mono">
                          ID #{flag.id} &bull; {formatRelativeTime(flag.created_at)}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <p className="text-xs text-[#5c685f]">
                          Keterangan pelapor: &ldquo;{flag.description || "Tidak ada rincian tambahan"}&rdquo;
                        </p>
                        {flag.report && (
                          <div className="p-3 rounded-xl bg-[#fafaf7] border border-[#e2e6df]">
                            <p className="text-xs font-semibold text-[#1c241e]">
                              Target: <Link href={`/reports/${flag.report.id}`} className="text-[#225332] underline hover:text-[#173722]">{flag.report.title}</Link>
                            </p>
                            <p className="text-[11px] text-[#5c685f] mt-0.5">Status Laporan: {flag.report.status}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#edf0ea]">
                        <button
                          type="button"
                          onClick={() => handleResolveFlag(flag.id, "dismiss")}
                          className="inline-flex items-center gap-1 rounded-xl border border-[#e2e6df] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#5c685f] hover:bg-[#fafaf7] hover:text-[#1c241e] transition active:scale-[0.98]"
                        >
                          <IconCheck className="h-3.5 w-3.5 text-[#5c685f]" />
                          <span>Abaikan / Laporan Sah</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleResolveFlag(flag.id, "remove_report")}
                          className="inline-flex items-center gap-1 rounded-xl bg-[#b91c1c] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#991b1b] transition active:scale-[0.98] shadow-xs"
                        >
                          <IconClose className="h-3.5 w-3.5" />
                          <span>Tolak / Hapus Laporan</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AuthenticatedShell>
  );
}
