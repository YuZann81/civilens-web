"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getUserProfile } from "@/lib/api/client";
import { UserProfile } from "@/lib/api/types";
import { IconPin } from "@/components/ui/icons";
import { UserProfileSkeleton } from "@/components/ui/skeletons";

export default function UserProfilePage() {
  const params = useParams();
  const userId = params?.id as string;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) return;

    let mounted = true;
    getUserProfile(userId)
      .then((data) => {
        if (mounted) setProfile(data);
      })
      .catch((err) => {
        if (mounted) setError(err instanceof Error ? err.message : "Gagal memuat profil.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [userId]);

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

        <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-8">
          <UserProfileSkeleton />
        </main>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#fafaf5] px-6 text-center">
        <div className="max-w-md rounded-2xl border border-[#eae2d3] bg-white p-8 shadow-xs space-y-4">
          <h1 className="text-xl font-bold font-serif text-[#1c4123]" style={{ fontFamily: "Georgia, serif" }}>
            Profil Tidak Ditemukan
          </h1>
          <p className="text-sm text-[#57524d]">{error || "Pengguna ini tidak ditemukan."}</p>
          <div className="pt-2">
            <Link
              href="/reports"
              className="inline-flex items-center gap-2 rounded-xl bg-[#1e4d2b] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#163a20] transition shadow-xs"
            >
              &larr; Lihat Feed Laporan
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
            <Link href="/reports" className="text-xs font-semibold text-[#4a6b52] hover:text-[#1e4d2b] transition">
              Semua Laporan
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-8">
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-xs text-[#7a9a80]">
            <Link href="/reports" className="hover:text-[#1c4123] transition flex items-center gap-1 font-medium text-[#1e4d2b]">
              <span>&larr; Kembali ke Feed Laporan</span>
            </Link>
            <span>/</span>
            <span className="text-[#1c4123] font-medium truncate max-w-[200px]">
              Profil {profile.name}
            </span>
          </div>

          {/* Profile Header Card */}
          <div className="rounded-2xl border border-[#eae2d3] bg-white p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#f0f4ee] pb-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e5f0e6] text-[#1e4d2b] text-2xl font-bold font-serif shadow-xs">
                  {profile.name.charAt(0)}
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold text-[#17361d]" style={{ fontFamily: "Georgia, serif" }}>
                    {profile.name}
                  </h1>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="rounded-full bg-[#f4f8f4] border border-[#cbe0ce] px-2.5 py-0.5 text-xs font-semibold text-[#1e4d2b] capitalize">
                      Peran: {profile.role}
                    </span>
                    <span className="text-xs text-[#7a9a80]">
                      Bergabung {new Date(profile.member_since).toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Civic Impact Stats */}
              <div className="flex items-center gap-4 text-center">
                <div className="rounded-xl bg-[#fafaf5] border border-[#eae2d3] px-4 py-2.5">
                  <div className="text-lg font-bold text-[#1e4d2b]">{profile.total_reports}</div>
                  <div className="text-[11px] text-[#7a9a80]">Total Laporan</div>
                </div>
                <div className="rounded-xl bg-[#f4f8f4] border border-[#cbe0ce] px-4 py-2.5">
                  <div className="text-lg font-bold text-[#2d6a36]">{profile.resolved_reports}</div>
                  <div className="text-[11px] text-[#2d6a36]">Terselesaikan</div>
                </div>
              </div>
            </div>

            {/* Recent Reports List */}
            <div className="space-y-4">
              <h2 className="text-base font-bold font-serif text-[#1e4d2b]" style={{ fontFamily: "Georgia, serif" }}>
                Laporan Terakhir ({profile.recent_reports?.length || 0})
              </h2>

              {!profile.recent_reports || profile.recent_reports.length === 0 ? (
                <p className="text-xs text-[#8c857e] py-4">Belum ada laporan publik yang dibuat oleh pengguna ini.</p>
              ) : (
                <div className="space-y-3">
                  {profile.recent_reports.map((rep) => (
                    <Link
                      key={rep.id}
                      href={`/reports/${rep.id}`}
                      className="block p-4 rounded-xl border border-[#eae2d3] bg-[#fafaf5] hover:border-[#1e4d2b] hover:bg-white transition shadow-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-[#17361d]" style={{ fontFamily: "Georgia, serif" }}>
                          {rep.title}
                        </span>
                        <span className="text-xs text-[#7a9a80] font-mono">
                          {new Date(rep.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>
                      {rep.location && (
                        <p className="text-xs text-[#4a6b52] flex items-center gap-1">
                          <IconPin className="h-3 w-3 text-[#1e4d2b]" />
                          <span>{rep.location.address}</span>
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-[#eae2d3] py-6 text-center text-xs text-[#8c857e] mt-auto">
        <div className="mx-auto max-w-4xl px-6">
          CiviLens &bull; Platform Pelaporan Lingkungan Warga
        </div>
      </footer>
    </div>
  );
}
