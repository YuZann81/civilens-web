"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { getUserProfile } from "@/lib/api/client";
import { UserProfile, Report } from "@/lib/api/types";
import { IconPin, IconShield, IconDocument, IconCheck } from "@/components/ui/icons";
import { UserProfileSkeleton } from "@/components/ui/skeletons";
import { AuthenticatedShell } from "@/components/layout/authenticated-shell";

import { getStatusBadge } from "@/components/reports/report-status-badge";

export default function UserProfilePage() {
  const params = useParams();
  const userId = params?.id as string;
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "resolved">("all");
  const [reloadTrigger, setReloadTrigger] = useState(0);

  useEffect(() => {
    if (!userId) return;

    let mounted = true;
    getUserProfile(userId)
      .then((data) => {
        if (mounted) {
          setProfile(data);
          setError("");
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Gagal memuat profil pengguna.");
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
  }, [userId, reloadTrigger]);

  if (loading) {
    return (
      <AuthenticatedShell maxWidth="narrow">
        <UserProfileSkeleton />
      </AuthenticatedShell>
    );
  }

  if (error || !profile) {
    return (
      <AuthenticatedShell maxWidth="narrow">
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <div className="max-w-md rounded-2xl border border-[#e2e6df] bg-white p-8 shadow-xs space-y-4">
            <h1 className="text-xl font-bold text-[#1c241e]">
              Profil Tidak Ditemukan
            </h1>
            <p className="text-sm text-[#5c685f]">{error || "Pengguna ini tidak ditemukan atau belum terdaftar."}</p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setReloadTrigger((c) => c + 1)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#e2e6df] bg-[#fafaf7] px-4 py-2 text-sm font-semibold text-[#1c241e] hover:bg-white transition shadow-xs"
              >
                Coba Lagi
              </button>
              <Link
                href="/reports"
                className="inline-flex items-center gap-2 rounded-xl bg-[#225332] px-5 py-2 text-sm font-semibold text-white hover:bg-[#173722] transition shadow-xs"
              >
                &larr; Lihat Feed Laporan
              </Link>
            </div>
          </div>
        </div>
      </AuthenticatedShell>
    );
  }

  const reports: Report[] = profile.recent_reports || [];

  const filteredReports = reports.filter((rep) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "resolved") return rep.status === "resolved" || rep.status === "selesai";
    if (activeFilter === "active") return rep.status !== "resolved" && rep.status !== "selesai" && rep.status !== "rejected";
    return true;
  });

  const isOwnProfile = currentUser && currentUser.id === profile.id;

  return (
    <AuthenticatedShell maxWidth="narrow">
      <div className="space-y-6 pb-12 sm:pb-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#5c685f]">
          <Link href="/reports" className="hover:text-[#1c241e] transition flex items-center gap-1 font-medium text-[#225332]">
            <span>&larr; Kembali ke Feed Laporan</span>
          </Link>
          <span>/</span>
          <span className="text-[#1c241e] font-semibold truncate max-w-[200px]">
            Profil {profile.name}
          </span>
        </div>

        {/* 1. CIVIC TRUST IDENTITY HEADER */}
        <div className="rounded-2xl border border-[#e2e6df] bg-white p-5 sm:p-7 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 border-b border-[#edf0ea] pb-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f2f7f3] text-[#225332] text-2xl font-bold border-2 border-[#c5dcce] shrink-0 shadow-2xs">
                {profile.name.charAt(0).toUpperCase()}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1c241e]">
                    {profile.name}
                  </h1>

                  {/* Verification / Role Badge */}
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#f2f7f3] border border-[#c5dcce] px-2.5 py-0.5 text-xs font-semibold text-[#225332] capitalize">
                    {profile.role === "government" ? (
                      <>
                        <IconShield className="h-3 w-3" />
                        <span>Petugas Pemerintah</span>
                      </>
                    ) : profile.role === "admin" ? (
                      <>
                        <IconShield className="h-3 w-3" />
                        <span>Administrator</span>
                      </>
                    ) : (
                      <>
                        <IconCheck className="h-3 w-3" />
                        <span>Warga Terverifikasi</span>
                      </>
                    )}
                  </span>
                </div>

                <p className="text-xs text-[#8c978f]">
                  Bergabung sejak {profile.member_since ? new Date(profile.member_since).toLocaleDateString("id-ID", { month: "long", year: "numeric" }) : "Warga CiviLens"}
                </p>
              </div>
            </div>

            {/* Compact Contribution Signals */}
            <div className="flex items-center gap-3 self-start sm:self-auto">
              <div className="rounded-xl bg-[#fafaf7] border border-[#e2e6df] px-4 py-2 text-center min-w-[90px]">
                <span className="block text-lg sm:text-xl font-bold text-[#1c241e] leading-tight">
                  {profile.total_reports ?? 0}
                </span>
                <span className="text-[11px] font-medium text-[#5c685f]">Laporan</span>
              </div>
              <div className="rounded-xl bg-[#f2f7f3] border border-[#c5dcce] px-4 py-2 text-center min-w-[90px]">
                <span className="block text-lg sm:text-xl font-bold text-[#225332] leading-tight">
                  {profile.resolved_reports ?? 0}
                </span>
                <span className="text-[11px] font-medium text-[#5c685f]">Selesai</span>
              </div>
            </div>
          </div>

          {/* 2. REPORT HISTORY & CIVIC CONTRIBUTIONS */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-[#1c241e] flex items-center gap-2">
                  <IconDocument className="h-4 w-4 text-[#225332]" />
                  <span>Riwayat Kontribusi Laporan</span>
                </h2>
                <p className="text-xs text-[#5c685f]">
                  Laporan permasalahan lingkungan yang dipublikasikan oleh {profile.name}.
                </p>
              </div>

              {/* Status Segmented Filter Tabs */}
              {reports.length > 0 && (
                <div className="inline-flex rounded-xl bg-[#fafaf7] border border-[#e2e6df] p-1 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setActiveFilter("all")}
                    className={`px-3 py-1 rounded-lg transition ${
                      activeFilter === "all"
                        ? "bg-white text-[#225332] border border-[#e2e6df] shadow-2xs"
                        : "text-[#5c685f] hover:text-[#1c241e]"
                    }`}
                  >
                    Semua ({reports.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFilter("active")}
                    className={`px-3 py-1 rounded-lg transition ${
                      activeFilter === "active"
                        ? "bg-white text-[#225332] border border-[#e2e6df] shadow-2xs"
                        : "text-[#5c685f] hover:text-[#1c241e]"
                    }`}
                  >
                    Aktif
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFilter("resolved")}
                    className={`px-3 py-1 rounded-lg transition ${
                      activeFilter === "resolved"
                        ? "bg-white text-[#225332] border border-[#e2e6df] shadow-2xs"
                        : "text-[#5c685f] hover:text-[#1c241e]"
                    }`}
                  >
                    Selesai
                  </button>
                </div>
              )}
            </div>

            {/* Reports Collection */}
            {reports.length === 0 ? (
              <div className="rounded-xl border border-[#e2e6df] bg-[#fafaf7] p-8 text-center space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f2f7f3] text-[#225332] mx-auto">
                  <IconDocument className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-[#1c241e]">Belum Ada Laporan</h3>
                <p className="text-xs text-[#5c685f] max-w-sm mx-auto leading-relaxed">
                  {isOwnProfile
                    ? "Anda belum mempublikasikan laporan masalah lingkungan. Mulai laporkan isu di sekitar Anda sekarang."
                    : `${profile.name} belum mempublikasikan laporan masalah lingkungan.`}
                </p>
                {isOwnProfile && (
                  <div className="pt-1">
                    <Link
                      href="/reports/create"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#225332] px-4 py-2 text-xs font-semibold text-white hover:bg-[#173722] transition shadow-xs"
                    >
                      <span>+ Buat Laporan Baru</span>
                    </Link>
                  </div>
                )}
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="rounded-xl border border-[#e2e6df] bg-[#fafaf7] p-6 text-center text-xs text-[#5c685f]">
                Tidak ada laporan dengan status yang dipilih.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredReports.map((rep) => {
                  const statusBadge = getStatusBadge(rep.status);

                  return (
                    <Link
                      key={rep.id}
                      href={`/reports/${rep.id}`}
                      className="block p-4 sm:p-5 rounded-xl border border-[#e2e6df] bg-[#fafaf7] hover:border-[#225332] hover:bg-white transition shadow-xs space-y-2 group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-sm sm:text-base font-bold text-[#1c241e] group-hover:text-[#225332] transition line-clamp-1 leading-snug">
                          {rep.title}
                        </h3>
                        <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${statusBadge.bg}`}>
                          {statusBadge.label}
                        </span>
                      </div>

                      <p className="text-xs text-[#5c685f] line-clamp-2 leading-relaxed">
                        {rep.description}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#e2e6df]/70 text-[11px] text-[#8c978f]">
                        {rep.location && (
                          <span className="flex items-center gap-1 text-[#5c685f] truncate max-w-[240px]">
                            <IconPin className="h-3 w-3 text-[#225332] shrink-0" />
                            <span className="truncate">{rep.location.address}</span>
                          </span>
                        )}
                        <span>
                          {new Date(rep.created_at).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthenticatedShell>
  );
}
