"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getBookmarks } from "@/lib/api/client";
import { Report } from "@/lib/api/types";
import { IconBookmark, IconPin } from "@/components/ui/icons";
import { FeedReportSkeleton } from "@/components/ui/skeletons";
import { getStatusBadge } from "@/components/reports/report-status-badge";
import { AuthenticatedShell } from "@/components/layout/authenticated-shell";

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
    <AuthenticatedShell maxWidth="default">
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-xs text-[#5c685f]">
          <Link href="/reports" className="hover:text-[#1c241e] transition flex items-center gap-1 font-medium text-[#225332]">
            <span>&larr; Kembali ke Feed Laporan</span>
          </Link>
          <span>/</span>
          <span className="text-[#1c241e] font-semibold">
            Laporan Tersimpan
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <IconBookmark className="h-6 w-6 text-[#b45309]" />
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1c241e]">
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
          <div className="rounded-2xl border border-[#e2e6df] bg-white p-12 text-center space-y-3 shadow-xs">
            <p className="text-base font-semibold text-[#1c241e]">Belum Ada Laporan Tersimpan</p>
            <p className="text-xs text-[#5c685f] max-w-md mx-auto">
              Anda dapat menyimpan laporan yang ingin Anda pantau perkembangannya dengan menekan tombol Simpan pada halaman detail laporan.
            </p>
            <div className="pt-2">
              <Link
                href="/reports"
                className="inline-flex items-center gap-2 rounded-xl bg-[#225332] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#173722] transition shadow-xs"
              >
                Jelajahi Laporan Warga
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.map((rep) => {
              const statusBadge = getStatusBadge(rep.status);

              return (
                <Link
                  key={rep.id}
                  href={`/reports/${rep.id}`}
                  className="group flex flex-col justify-between rounded-2xl border border-[#e2e6df] bg-white p-5 shadow-xs hover:border-[#225332] hover:shadow-sm transition space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${statusBadge.bg}`}>
                        {statusBadge.label}
                      </span>
                      <span className="text-[10px] text-[#8c978f] font-mono">#{rep.id}</span>
                    </div>

                    <h2 className="text-base font-bold text-[#1c241e] group-hover:text-[#225332] transition line-clamp-2">
                      {rep.title}
                    </h2>
                    <p className="text-xs text-[#5c685f] line-clamp-3 leading-relaxed">
                      {rep.description}
                    </p>
                  </div>
                  {rep.location && (
                    <p className="text-xs text-[#5c685f] flex items-center gap-1 truncate pt-2 border-t border-[#edf0ea]">
                      <IconPin className="h-3.5 w-3.5 text-[#225332] shrink-0" />
                      <span className="truncate">{rep.location.address}</span>
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AuthenticatedShell>
  );
}
