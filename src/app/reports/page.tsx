"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import { getReports, getCategories } from "@/lib/api/client";
import { Report, Category } from "@/lib/api/types";

function getStatusBadge(status: string) {
  switch (status) {
    case "resolved":
    case "selesai":
      return { label: "Selesai", bg: "bg-emerald-50 text-emerald-800 border-emerald-200" };
    case "under_review":
    case "diproses":
      return { label: "Diproses", bg: "bg-blue-50 text-blue-800 border-blue-200" };
    case "rejected":
    case "ditolak":
      return { label: "Ditolak", bg: "bg-red-50 text-red-800 border-red-200" };
    case "pending":
    default:
      return { label: "Menunggu", bg: "bg-amber-50 text-amber-800 border-amber-200" };
  }
}

export default function ReportsFeedPage() {
  const { user } = useAuth();

  const [reports, setReports] = useState<Report[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<number | "">("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [mineOnly, setMineOnly] = useState(false);

  useEffect(() => {
    void getCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  useEffect(() => {
    let mounted = true;

    getReports({
      category_id: selectedCategory ? Number(selectedCategory) : undefined,
      status: selectedStatus || undefined,
      mine: mineOnly ? true : undefined,
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
  }, [selectedCategory, selectedStatus, mineOnly]);

  return (
    <div className="flex min-h-screen flex-col bg-[#faf8f5] text-[#2c2926]">
      {/* Header */}
      <header className="border-b border-[#eae2d3] bg-[#faf8f5]/90 backdrop-blur-xs sticky top-0 z-20">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-85">
            <svg className="h-6 w-6 text-[#2d6a36]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
            </svg>
            <span className="text-lg font-bold tracking-tight text-[#1c4123]" style={{ fontFamily: "Georgia, serif" }}>
              CiviLens
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/reports/create"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#2d6a36] px-4 py-2 text-xs font-semibold text-white hover:bg-[#22512a] transition shadow-xs"
            >
              <span>+ Buat Laporan Baru</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-8">
        <div className="space-y-6">
          {/* Header & Intro */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#17361d]" style={{ fontFamily: "Georgia, serif" }}>
                Feed Laporan Lingkungan
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-[#57524d]">
                Daftar permasalahan lingkungan yang dilaporkan warga secara terbuka dan transparan.
              </p>
            </div>

            {user && (
              <button
                type="button"
                onClick={() => setMineOnly(!mineOnly)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold border transition ${
                  mineOnly
                    ? "bg-[#2d6a36] text-white border-[#2d6a36]"
                    : "bg-white text-[#1c4123] border-[#cbe0ce] hover:bg-[#f4f8f4]"
                }`}
              >
                <span>Hanya Laporan Saya</span>
                {mineOnly && <span>&check;</span>}
              </button>
            )}
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-white border border-[#eae2d3] shadow-xs text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#1c4123]">Kategori:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : "")}
                className="rounded-lg border border-[#cbe0ce] bg-[#fafaf5] px-3 py-1.5 text-xs text-[#2c2926] outline-none"
              >
                <option value="">Semua Kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#1c4123]">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="rounded-lg border border-[#cbe0ce] bg-[#fafaf5] px-3 py-1.5 text-xs text-[#2c2926] outline-none"
              >
                <option value="">Semua Status</option>
                <option value="pending">Menunggu</option>
                <option value="under_review">Diproses</option>
                <option value="resolved">Selesai</option>
                <option value="rejected">Ditolak</option>
              </select>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
              {error}
            </div>
          )}

          {/* Reports Grid / Feed */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center space-y-2">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#2d6a36] border-t-transparent mx-auto" />
                <p className="text-xs text-[#57524d]">Memuat laporan warga...</p>
              </div>
            </div>
          ) : reports.length === 0 ? (
            <div className="rounded-2xl border border-[#eae2d3] bg-white p-12 text-center space-y-3 shadow-xs">
              <p className="text-base font-semibold text-[#1c4123]">Belum Ada Laporan yang Cocok</p>
              <p className="text-xs text-[#7a9a80] max-w-md mx-auto">
                Tidak ditemukan laporan dengan filter yang dipilih. Jadilah yang pertama melaporkan permasalahan lingkungan di sekitar Anda!
              </p>
              <div className="pt-2">
                <Link
                  href="/reports/create"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#2d6a36] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#22512a] transition shadow-xs"
                >
                  + Buat Laporan Sekarang
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {reports.map((report) => {
                const statusBadge = getStatusBadge(report.status);
                return (
                  <Link
                    key={report.id}
                    href={`/reports/${report.id}`}
                    className="group flex flex-col justify-between rounded-2xl border border-[#eae2d3] bg-white p-5 shadow-xs hover:border-[#2d6a36] hover:shadow-md transition space-y-4"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded-full bg-[#f4f8f4] border border-[#cbe0ce] px-2.5 py-0.5 text-[11px] font-semibold text-[#22512a]">
                          {report.category?.name || "Kategori"}
                        </span>
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusBadge.bg}`}>
                          {statusBadge.label}
                        </span>
                      </div>

                      <h2 className="text-base font-bold text-[#17361d] group-hover:text-[#2d6a36] transition line-clamp-2" style={{ fontFamily: "Georgia, serif" }}>
                        {report.title}
                      </h2>

                      <p className="text-xs text-[#57524d] line-clamp-3 leading-relaxed">
                        {report.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#f0f4ee] space-y-1.5 text-[11px] text-[#7a9a80]">
                      {report.location && (
                        <p className="truncate text-[#4a6b52] font-medium flex items-center gap-1">
                          <span>📍</span>
                          <span>{report.location.address}</span>
                        </p>
                      )}
                      <div className="flex items-center justify-between text-[10px]">
                        <span>{new Date(report.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
                        <span>{report.media?.length || 0} Foto</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#eae2d3] py-6 text-center text-xs text-[#8c857e] mt-auto">
        <div className="mx-auto max-w-6xl px-6">
          CiviLens • Platform Pelaporan Lingkungan Warga
        </div>
      </footer>
    </div>
  );
}
