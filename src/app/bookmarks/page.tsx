"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getBookmarks } from "@/lib/api/client";
import { Report } from "@/lib/api/types";
import { IconBookmark, IconPin } from "@/components/ui/icons";
import { FeedReportSkeleton } from "@/components/ui/skeletons";

export default function BookmarksPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getBookmarks()
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
  }, []);

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

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-8">
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-xs text-[#7a9a80]">
            <Link href="/reports" className="hover:text-[#1c4123] transition flex items-center gap-1 font-medium text-[#1e4d2b]">
              <span>&larr; Kembali ke Feed Laporan</span>
            </Link>
            <span>/</span>
            <span className="text-[#1c4123] font-medium">
              Laporan Tersimpan
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <IconBookmark className="h-6 w-6 text-[#7a4400]" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17361d]" style={{ fontFamily: "Georgia, serif" }}>
              Laporan Tersimpan
            </h1>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" aria-busy="true" aria-label="Memuat laporan tersimpan...">
              <FeedReportSkeleton />
              <FeedReportSkeleton />
              <FeedReportSkeleton />
            </div>
          ) : reports.length === 0 ? (
            <div className="rounded-2xl border border-[#eae2d3] bg-white p-12 text-center space-y-3 shadow-xs">
              <p className="text-base font-semibold text-[#1c4123]">Belum Ada Laporan Tersimpan</p>
              <p className="text-xs text-[#7a9a80] max-w-md mx-auto">
                Anda dapat menyimpan laporan yang ingin Anda pantau perkembangannya dengan menekan tombol Simpan pada halaman detail laporan.
              </p>
              <div className="pt-2">
                <Link
                  href="/reports"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#1e4d2b] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#163a20] transition shadow-xs"
                >
                  Jelajahi Laporan Warga
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {reports.map((rep) => (
                <Link
                  key={rep.id}
                  href={`/reports/${rep.id}`}
                  className="group flex flex-col justify-between rounded-2xl border border-[#eae2d3] bg-white p-5 shadow-xs hover:border-[#1e4d2b] hover:shadow-md transition space-y-4"
                >
                  <div className="space-y-2">
                    <h2 className="text-base font-bold text-[#17361d] group-hover:text-[#1e4d2b] transition line-clamp-2" style={{ fontFamily: "Georgia, serif" }}>
                      {rep.title}
                    </h2>
                    <p className="text-xs text-[#57524d] line-clamp-3 leading-relaxed">
                      {rep.description}
                    </p>
                  </div>
                  {rep.location && (
                    <p className="text-xs text-[#4a6b52] flex items-center gap-1 truncate pt-2 border-t border-[#f0f4ee]">
                      <IconPin className="h-3.5 w-3.5 text-[#1e4d2b] shrink-0" />
                      <span>{rep.location.address}</span>
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-[#eae2d3] py-6 text-center text-xs text-[#8c857e] mt-auto">
        <div className="mx-auto max-w-5xl px-6">
          CiviLens &bull; Platform Pelaporan Lingkungan Warga
        </div>
      </footer>
    </div>
  );
}
