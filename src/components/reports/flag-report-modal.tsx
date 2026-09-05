"use client";

import React, { useState } from "react";
import { flagReport } from "@/lib/api/client";
import { IconClose, IconShield } from "@/components/ui/icons";

interface FlagReportModalProps {
  reportId: number | string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function FlagReportModal({
  reportId,
  isOpen,
  onClose,
  onSuccess,
}: FlagReportModalProps) {
  const [reason, setReason] = useState("spam");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setError("");
    setSubmitting(true);

    try {
      await flagReport(reportId, reason, description.trim() || undefined);
      setSuccess(true);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal melaporkan konten.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl border border-[#eae2d3] bg-white p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#f0f4ee] pb-3">
          <div className="flex items-center gap-2 text-[#1e4d2b]">
            <IconShield className="h-5 w-5" />
            <h2 className="text-base font-bold text-[#1c241e]">
              Laporkan Pelanggaran Konten
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#8c857e] hover:text-[#1c4123] transition"
          >
            <IconClose className="h-4 w-4" />
          </button>
        </div>

        {success ? (
          <div className="py-6 text-center space-y-2">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#e5f0e6] text-[#1e4d2b] font-bold">
              ✓
            </div>
            <p className="text-xs font-semibold text-[#1c4123]">
              Terima kasih. Laporan indikasi pelanggaran telah dikirim ke tim moderator CiviLens.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="text-xs text-red-700 bg-red-50 p-2.5 rounded-xl border border-red-200">
                {error}
              </p>
            )}

            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#1c4123]">
                Alasan Pelaporan:
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-xl border border-[#c8dfc8] bg-[#fafaf5] px-3 py-2.5 text-xs text-[#2c2926] outline-none focus:border-[#1e4d2b] focus:bg-white"
              >
                <option value="spam">Spam / Iklan tidak relevan</option>
                <option value="false_information">Informasi palsu / manipulasi fakta</option>
                <option value="inappropriate_content">Konten tidak pantas / SARA / kekerasan</option>
                <option value="duplicate">Duplikasi laporan yang sudah ada</option>
                <option value="irrelevant">Bukan permasalahan fasilitas/lingkungan publik</option>
                <option value="abuse">Ujaran kebencian / pencemaran nama baik</option>
                <option value="other">Lainnya</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#1c4123]">
                Keterangan Tambahan (Opsional):
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Berikan konteks mengapa laporan ini dinilai bermasalah..."
                maxLength={500}
                className="w-full rounded-xl border border-[#c8dfc8] bg-[#fafaf5] px-3 py-2 text-xs text-[#2c2926] outline-none focus:border-[#1e4d2b] focus:bg-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-[#cbe0ce] bg-white px-4 py-2 text-xs font-semibold text-[#57524d] hover:bg-[#fafaf5] transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-[#7a4400] px-5 py-2 text-xs font-semibold text-white hover:bg-[#5c3300] transition disabled:opacity-50 shadow-xs"
              >
                {submitting ? "Mengirim..." : "Kirim Laporan"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
