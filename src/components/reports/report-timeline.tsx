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
    <div className="rounded-2xl border border-[#eae2d3] bg-white p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex items-center justify-between border-b border-[#f0f4ee] pb-4">
        <h2 className="text-lg font-bold font-serif text-[#1e4d2b]" style={{ fontFamily: "Georgia, serif" }}>
          Transparansi & Riwayat Penanganan
        </h2>
        <span className="text-xs text-[#7a9a80]">
          {histories.length} Catatan Penanganan
        </span>
      </div>

      {/* Timeline Stream */}
      <div className="space-y-4">
        {histories.length === 0 ? (
          <div className="flex items-start gap-3 text-xs text-[#57524d] bg-[#fafaf5] p-4 rounded-xl border border-[#eae2d3]">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#e5f0e6] text-[#1e4d2b] font-bold text-[10px] shrink-0">
              1
            </span>
            <div>
              <p className="font-semibold text-[#1c4123]">Laporan Diterima Sistem</p>
              <p className="text-[#8c857e] mt-0.5">
                Laporan tercatat dan menunggu verifikasi serta peninjauan dinas terkait.
              </p>
            </div>
          </div>
        ) : (
          histories.map((item, idx) => (
            <div key={item.id || idx} className="relative pl-6 border-l-2 border-[#c8dfc8] pb-4 last:pb-0">
              <span className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-[#1e4d2b] border-2 border-white" />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#1c4123] capitalize">
                    Status: {item.status.replace("_", " ")}
                  </span>
                  <span className="rounded-full bg-[#f4f8f4] border border-[#cbe0ce] px-2 py-0.2 text-[10px] font-semibold text-[#1e4d2b]">
                    {item.actor_name} ({item.actor_role})
                  </span>
                </div>
                {item.notes && (
                  <p className="text-xs text-[#57524d] leading-relaxed whitespace-pre-line">
                    {item.notes}
                  </p>
                )}
                <p className="text-[10px] text-[#8c857e]">
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
        <form onSubmit={handleUpdateStatus} className="pt-4 border-t border-[#f0f4ee] space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#1e4d2b]">
            <IconShield className="h-4 w-4" />
            <span>Tindakan Resmi Instansi / Verifikasi (Petugas)</span>
          </div>

          {error && (
            <p className="text-xs text-red-700 bg-red-50 p-2.5 rounded-xl border border-red-200">
              {error}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#1c4123]">
                Ubah Status Menjadi:
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full rounded-xl border border-[#c8dfc8] bg-[#fafaf5] px-3 py-2 text-xs text-[#2c2926] outline-none focus:border-[#1e4d2b] focus:bg-white"
              >
                <option value="under_review">Dalam Peninjauan (Under Review)</option>
                <option value="verified">Terverifikasi (Verified)</option>
                <option value="in_progress">Sedang Ditindaklanjuti (In Progress)</option>
                <option value="resolved">Selesai Ditindaklanjuti (Resolved)</option>
                <option value="closed">Ditutup Resmi (Closed)</option>
                <option value="rejected">Ditolak / Tidak Valid (Rejected)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#1c4123]">
                Catatan Penanganan:
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Petugas DLH telah mengangkut sampah di lokasi."
                className="w-full rounded-xl border border-[#c8dfc8] bg-[#fafaf5] px-3 py-2 text-xs text-[#2c2926] outline-none focus:border-[#1e4d2b] focus:bg-white"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#1e4d2b] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#163a20] transition disabled:opacity-40 shadow-xs"
            >
              <IconCheck className="h-3.5 w-3.5" />
              <span>{submitting ? "Menyimpan..." : "Perbarui Status Resmi"}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
