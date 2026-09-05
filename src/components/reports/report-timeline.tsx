"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { updateReportStatus } from "@/lib/api/client";
import { Report, ReportStatusHistory } from "@/lib/api/types";
import { IconShield, IconCheck } from "@/components/ui/icons";

interface ReportTimelineProps {
  report: Report;
  onStatusUpdated: (updatedReport: Report) => void;
}

export default function ReportTimeline({ report, onStatusUpdated }: ReportTimelineProps) {
  const { user } = useAuth();

  const [selectedStatus, setSelectedStatus] = useState<string>("under_review");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isPrivileged = user && (user.role === "government" || user.role === "admin");

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setError("");
    setSubmitting(true);

    try {
      const updated = await updateReportStatus(report.id, selectedStatus, notes.trim() || undefined);
      onStatusUpdated(updated);
      setNotes("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memperbarui status laporan.");
    } finally {
      setSubmitting(false);
    }
  };

  const histories: ReportStatusHistory[] = report.status_histories || [];

  return (
    <div className="rounded-2xl border border-[#e2e6df] bg-white p-5 sm:p-7 shadow-xs space-y-6">
      <div className="flex items-center justify-between border-b border-[#edf0ea] pb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#1c241e]">
            Transparansi & Riwayat Penanganan
          </h2>
          <p className="text-[11px] text-[#8c978f]">
            Linimasa verifikasi lapangan dan tindakan resmi instansi yang dapat dipantau publik.
          </p>
        </div>
        <span className="text-xs text-[#8c978f] shrink-0 font-medium">
          {histories.length} Catatan
        </span>
      </div>

      {/* Timeline Stream */}
      <div className="space-y-4">
        {histories.length === 0 ? (
          <div className="flex items-start gap-3 text-xs text-[#5c685f] bg-[#fafaf7] p-4 rounded-xl border border-[#e2e6df]">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#e2ede4] text-[#225332] font-bold text-[10px] shrink-0">
              1
            </span>
            <div>
              <p className="font-semibold text-[#1c241e]">Laporan Diterima Sistem</p>
              <p className="text-[#8c978f] mt-0.5">
                Laporan tercatat dan menunggu verifikasi serta peninjauan dinas terkait.
              </p>
            </div>
          </div>
        ) : (
          histories.map((item, idx) => (
            <div key={item.id || idx} className="relative pl-6 border-l-2 border-[#c5dcce] pb-4 last:pb-0">
              <span className="absolute -left-[9px] top-0.5 h-4 w-4 rounded-full bg-[#225332] border-2 border-white shadow-xs" />
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-[#1c241e] capitalize">
                    Status: {item.status.replace("_", " ")}
                  </span>
                  <span className="rounded-full bg-[#f2f7f3] border border-[#c5dcce] px-2 py-0.2 text-[10px] font-semibold text-[#225332]">
                    {item.actor_name} ({item.actor_role})
                  </span>
                </div>
                {item.notes && (
                  <p className="text-xs text-[#5c685f] leading-relaxed whitespace-pre-line">
                    {item.notes}
                  </p>
                )}
                <p className="text-[10px] text-[#8c978f]">
                  {new Date(item.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })} WIB
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Official Government / Admin Action Box */}
      {isPrivileged && (
        <form onSubmit={handleUpdateStatus} className="pt-4 border-t border-[#edf0ea] space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#225332]">
            <IconShield className="h-4 w-4" />
            <span>Tindakan Resmi Instansi / Verifikasi (Petugas)</span>
          </div>

          {error && (
            <p className="text-xs text-[#b91c1c] bg-[#fee2e2] p-2.5 rounded-xl border border-[#fecaca]">
              {error}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#1c241e]">
                Ubah Status Menjadi:
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full rounded-xl border border-[#e2e6df] bg-[#fafaf7] px-3 py-2 text-xs text-[#1c241e] outline-none transition focus:border-[#225332] focus:bg-white"
              >
                <option value="under_review">Dalam Peninjauan (under_review)</option>
                <option value="verified">Terverifikasi (verified)</option>
                <option value="in_progress">Sedang Ditindaklanjuti (in_progress)</option>
                <option value="resolved">Selesai Ditangani (resolved)</option>
                <option value="rejected">Ditolak / Tidak Valid (rejected)</option>
                <option value="closed">Ditutup Resmi (closed)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#1c241e]">
                Catatan Tindakan / Progres:
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Tim lapangan sudah membersihkan saluran air..."
                className="w-full rounded-xl border border-[#e2e6df] bg-[#fafaf7] px-3 py-2 text-xs text-[#1c241e] placeholder-[#8c978f] outline-none transition focus:border-[#225332] focus:bg-white"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#225332] px-4 py-2 text-xs font-semibold text-white hover:bg-[#173722] transition active:scale-[0.98] disabled:opacity-50 shadow-xs"
            >
              <IconCheck className="h-3.5 w-3.5" />
              <span>{submitting ? "Menyimpan Perubahan..." : "Perbarui Status Resmi"}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
