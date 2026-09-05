"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { createReport, uploadReportMedia } from "@/lib/api/client";
import MapPicker from "@/components/reports/map-picker";
import TopicPicker from "@/components/reports/topic-picker";
import {
  IconDocument,
  IconPin,
  IconCamera,
  IconCheck,
  IconArrowRight,
  IconArrowLeft,
  IconClose,
  IconUpload,
} from "@/components/ui/icons";
import { AuthenticatedShell } from "@/components/layout/authenticated-shell";

type Step = "evidence_location" | "details_review";

export default function CreateReportPage() {
  const router = useRouter();
  const { user, status, loginWithGoogle } = useAuth();

  // 2-Step Flow State
  const [currentStep, setCurrentStep] = useState<Step>("evidence_location");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Step 1 State: Evidence & Location
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  // Step 2 State: Problem Details & Topics
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [topics, setTopics] = useState<string[]>([]);

  // Cleanup object URLs on unmount or file change
  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    setError("");

    // Enforce max 3 photos
    if (files.length + selectedFiles.length > 3) {
      setError("Maksimal 3 foto bukti yang dapat diunggah.");
      return;
    }

    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    for (const file of selectedFiles) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        setError("Format foto harus berupa JPG, PNG, atau WebP.");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError(`Ukuran foto ${file.name} melebihi batas maksimal 10 MB.`);
        return;
      }

      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }

    setFiles((prev) => [...prev, ...validFiles]);
    setPreviews((prev) => [...prev, ...newPreviews]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Step Validation
  const validateStep = (step: Step): boolean => {
    setError("");

    if (step === "evidence_location") {
      if (files.length < 1) {
        setError("Wajib menyertakan minimal 1 foto bukti kondisi lingkungan.");
        return false;
      }
      if (!address.trim()) {
        setError("Alamat atau patokan lokasi wajib diisi.");
        return false;
      }
      return true;
    }

    if (step === "details_review") {
      if (!title.trim()) {
        setError("Judul laporan wajib diisi.");
        return false;
      }
      if (title.trim().length < 5) {
        setError("Judul laporan minimal 5 karakter.");
        return false;
      }
      if (!description.trim()) {
        setError("Deskripsi masalah wajib diisi.");
        return false;
      }
      if (description.trim().length < 20) {
        setError("Deskripsi masalah minimal 20 karakter agar jelas bagi warga dan AI.");
        return false;
      }
      if (topics.length === 0) {
        setError("Pilih atau buat minimal 1 topik tag untuk laporan Anda.");
        return false;
      }
      return true;
    }

    return true;
  };

  const handleNextToDetails = () => {
    if (!validateStep("evidence_location")) return;
    setCurrentStep("details_review");
    if (typeof window !== "undefined" && typeof window.scrollTo === "function") {
      try {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch {}
    }
  };

  const handleBackToEvidence = () => {
    setError("");
    setCurrentStep("evidence_location");
    if (typeof window !== "undefined" && typeof window.scrollTo === "function") {
      try {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch {}
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (!validateStep("evidence_location") || !validateStep("details_review")) {
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const latNum = latitude ? parseFloat(latitude) : null;
      const lngNum = longitude ? parseFloat(longitude) : null;

      // 1. Create Report with Topics & Location
      const report = await createReport({
        title: title.trim(),
        description: description.trim(),
        topics,
        location: {
          address: address.trim(),
          latitude: latNum,
          longitude: lngNum,
        },
      });

      // 2. Upload attached evidence media (1 to 3 files)
      if (files.length > 0) {
        for (const file of files) {
          try {
            await uploadReportMedia(report.id, file);
          } catch {
            // Upload failure handled gracefully, report created
          }
        }
      }

      router.push(`/reports/${report.id}?created=1`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal membuat laporan. Silakan periksa koneksi dan coba lagi."
      );
      setIsSubmitting(false);
    }
  };

  // Auth Guard
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafaf7]">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#225332] border-t-transparent mx-auto" />
          <p className="text-xs text-[#5c685f]">Memeriksa autentikasi...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" || !user) {
    return (
      <AuthenticatedShell maxWidth="narrow">
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <div className="max-w-md rounded-2xl border border-[#e2e6df] bg-white p-8 shadow-xs space-y-5">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f2f7f3] text-[#225332]">
              <IconDocument className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-bold text-[#1c241e]">
                Masuk untuk Melaporkan Isu
              </h1>
              <p className="text-xs text-[#5c685f] leading-relaxed">
                Pelaporan isu lingkungan di CiviLens membutuhkan autentikasi agar laporan dapat ditindaklanjuti secara bertanggung jawab.
              </p>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <Link
                href="/login"
                className="rounded-xl bg-[#225332] py-2.5 text-sm font-semibold text-white hover:bg-[#173722] transition shadow-xs"
              >
                Masuk dengan Akun
              </Link>
              <button
                type="button"
                onClick={loginWithGoogle}
                className="rounded-xl border border-[#c5dcce] bg-[#f2f7f3] py-2.5 text-xs font-semibold text-[#225332] hover:bg-[#e2ede4] transition"
              >
                Masuk dengan Google
              </button>
              <Link
                href="/reports"
                className="mt-2 text-xs font-medium text-[#8c978f] hover:text-[#225332] transition"
              >
                &larr; Kembali ke Feed Laporan
              </Link>
            </div>
          </div>
        </div>
      </AuthenticatedShell>
    );
  }

  return (
    <AuthenticatedShell maxWidth="narrow">
      <div className="space-y-6 pb-20 sm:pb-8">
        {/* Top Header & Breadcrumb */}
        <div>
          <Link
            href="/reports"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5c685f] hover:text-[#1c241e] transition mb-3"
          >
            <IconArrowLeft className="h-3.5 w-3.5" />
            <span>Kembali ke Feed Laporan</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1c241e]">
            Buat Laporan Masalah Lingkungan
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#5c685f]">
            Laporkan masalah lingkungan di sekitar Anda secara cepat dengan bukti foto nyata dan titik lokasi presisi.
          </p>
        </div>

        {/* 2-Step Compact Progress Bar */}
        <div className="grid grid-cols-2 gap-3 border-b border-[#e2e6df] pb-4">
          <button
            type="button"
            onClick={handleBackToEvidence}
            className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition ${
              currentStep === "evidence_location"
                ? "border-[#225332] bg-[#f2f7f3] text-[#225332]"
                : "border-[#e2e6df] bg-white text-[#5c685f] hover:border-[#8c978f]"
            }`}
          >
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shrink-0 ${
                currentStep === "evidence_location"
                  ? "bg-[#225332] text-white"
                  : files.length > 0 && address.trim()
                  ? "bg-[#225332] text-white"
                  : "bg-[#f4f5f0] text-[#5c685f]"
              }`}
            >
              1
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate">1. Bukti & Lokasi</p>
              <p className="text-[10px] text-[#8c978f] truncate">Foto kondisi & titik peta</p>
            </div>
          </button>

          <button
            type="button"
            onClick={handleNextToDetails}
            className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition ${
              currentStep === "details_review"
                ? "border-[#225332] bg-[#f2f7f3] text-[#225332]"
                : "border-[#e2e6df] bg-white text-[#5c685f] hover:border-[#8c978f]"
            }`}
          >
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shrink-0 ${
                currentStep === "details_review"
                  ? "bg-[#225332] text-white"
                  : "bg-[#f4f5f0] text-[#5c685f]"
              }`}
            >
              2
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate">2. Detail Masalah & Kirim</p>
              <p className="text-[10px] text-[#8c978f] truncate">Judul, deskripsi, & topik</p>
            </div>
          </button>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="rounded-xl border border-[#fecaca] bg-[#fee2e2] p-4 text-xs font-medium text-[#b91c1c] flex items-center justify-between gap-3">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError("")}
              className="text-[#b91c1c] hover:opacity-75"
              aria-label="Tutup pesan error"
            >
              <IconClose className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 1: BUKTI FOTO & TITIK LOKASI (EVIDENCE & LOCATION) */}
        {/* ========================================================= */}
        {currentStep === "evidence_location" && (
          <div className="space-y-6">
            {/* 1. Evidence Photos Box */}
            <div className="rounded-2xl border border-[#e2e6df] bg-white p-5 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#edf0ea] pb-3">
                <div>
                  <h2 className="text-base font-bold text-[#1c241e] flex items-center gap-2">
                    <IconCamera className="h-5 w-5 text-[#225332]" />
                    <span>Bukti Foto Lingkungan</span>
                  </h2>
                  <p className="text-xs text-[#5c685f]">
                    Lampirkan 1 hingga 3 foto nyata kondisi di lapangan (Maks. 10 MB per berkas).
                  </p>
                </div>
                <span className="text-xs font-semibold text-[#225332] bg-[#f2f7f3] border border-[#c5dcce] px-2.5 py-0.5 rounded-full">
                  {files.length}/3 Foto
                </span>
              </div>

              {/* Upload Drop Zone / Camera Action */}
              <div className="space-y-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  id="evidence-file-input"
                />

                {files.length < 3 && (
                  <label
                    htmlFor="evidence-file-input"
                    className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-[#e2e6df] bg-[#fafaf7] hover:border-[#225332] hover:bg-[#f2f7f3] transition cursor-pointer text-center space-y-2 group"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white border border-[#e2e6df] text-[#225332] group-hover:scale-105 transition shadow-2xs">
                      <IconUpload className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-[#1c241e]">
                        Pilih foto atau ambil langsung dari kamera
                      </p>
                      <p className="text-[11px] text-[#8c978f] mt-0.5">
                        Mendukung format JPG, PNG, atau WebP (1-3 foto)
                      </p>
                    </div>
                  </label>
                )}

                {/* Previews Grid */}
                {previews.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    {previews.map((previewUrl, idx) => (
                      <div
                        key={idx}
                        className="relative rounded-xl overflow-hidden border border-[#e2e6df] aspect-square bg-[#f4f5f0] group"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={previewUrl}
                          alt={`Bukti ${idx + 1}`}
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(idx)}
                          className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white hover:bg-red-600 transition"
                          title="Hapus foto ini"
                          aria-label={`Hapus foto ${idx + 1}`}
                        >
                          <IconClose className="h-3.5 w-3.5" />
                        </button>
                        <span className="absolute bottom-1.5 left-1.5 rounded-md bg-black/60 px-1.5 py-0.2 text-[9px] font-semibold text-white">
                          Foto {idx + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 2. Location & Interactive Map Box */}
            <div className="rounded-2xl border border-[#e2e6df] bg-white p-5 sm:p-7 shadow-xs space-y-4">
              <div className="border-b border-[#edf0ea] pb-3">
                <h2 className="text-base font-bold text-[#1c241e] flex items-center gap-2">
                  <IconPin className="h-5 w-5 text-[#225332]" />
                  <span>Titik Lokasi Kejadian (Peta & Koordinat)</span>
                </h2>
                <p className="text-xs text-[#5c685f]">
                  Gunakan tombol deteksi GPS atau klik langsung pada peta untuk menandai titik presisi.
                </p>
              </div>

              <MapPicker
                address={address}
                latitude={latitude}
                longitude={longitude}
                onLocationChange={(loc) => {
                  setAddress(loc.address);
                  setLatitude(loc.latitude);
                  setLongitude(loc.longitude);
                }}
              />
            </div>

            {/* Desktop Navigation CTA */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleNextToDetails}
                className="inline-flex items-center gap-2 rounded-xl bg-[#225332] px-6 py-3 text-sm font-semibold text-white hover:bg-[#173722] transition active:scale-[0.98] shadow-xs"
              >
                <span>Lanjut: Detail Masalah & Review</span>
                <IconArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 2: DETAIL MASALAH, TOPIK & REVIEW (DETAILS & REVIEW) */}
        {/* ========================================================= */}
        {currentStep === "details_review" && (
          <div className="space-y-6">
            {/* 1. Problem Information Form */}
            <div className="rounded-2xl border border-[#e2e6df] bg-white p-5 sm:p-7 shadow-xs space-y-5">
              <div className="border-b border-[#edf0ea] pb-3">
                <h2 className="text-base font-bold text-[#1c241e] flex items-center gap-2">
                  <IconDocument className="h-5 w-5 text-[#225332]" />
                  <span>Jelaskan Permasalahan</span>
                </h2>
                <p className="text-xs text-[#5c685f]">
                  Tuliskan judul dan deskripsi masalah secara jelas dan faktual agar mudah dipahami warga dan sistem AI.
                </p>
              </div>

              {/* Title Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="title" className="block text-xs font-semibold uppercase tracking-wider text-[#1c241e]">
                    Judul Laporan <span className="text-red-600">*</span>
                  </label>
                  <span className="text-[11px] text-[#8c978f]">
                    {title.length}/100 karakter (min. 5)
                  </span>
                </div>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Tumpukan Sampah Liar Menumpuk di Bantaran Kali Ciliwung"
                  maxLength={100}
                  className="w-full rounded-xl border border-[#e2e6df] bg-[#fafaf7] px-4 py-3 text-xs sm:text-sm text-[#1c241e] placeholder-[#8c978f] outline-none transition focus:border-[#225332] focus:bg-white"
                />
              </div>

              {/* Description Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="description" className="block text-xs font-semibold uppercase tracking-wider text-[#1c241e]">
                    Deskripsi Lengkap Masalah <span className="text-red-600">*</span>
                  </label>
                  <span className="text-[11px] text-[#8c978f]">
                    {description.length} karakter (min. 20)
                  </span>
                </div>
                <textarea
                  id="description"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ceritakan detail masalah yang terjadi, dampak lingkungan yang timbul, durasi kejadian, atau informasi penting lainnya..."
                  className="w-full rounded-xl border border-[#e2e6df] bg-[#fafaf7] px-4 py-3 text-xs sm:text-sm text-[#1c241e] placeholder-[#8c978f] outline-none transition focus:border-[#225332] focus:bg-white"
                />
              </div>

              {/* Topics Selection */}
              <div className="space-y-2 pt-2 border-t border-[#edf0ea]">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1c241e]">
                  Kategori / Topik Laporan <span className="text-red-600">*</span>
                </label>
                <TopicPicker
                  selectedTopics={topics}
                  onChange={setTopics}
                />
              </div>
            </div>

            {/* 2. Compact Review Summary Card */}
            <div className="rounded-2xl border border-[#c5dcce] bg-[#f2f7f3] p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#c5dcce] pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#225332] flex items-center gap-1.5">
                  <IconCheck className="h-4 w-4" />
                  <span>Ringkasan Laporan Sebelum Kirim</span>
                </h3>
                <button
                  type="button"
                  onClick={handleBackToEvidence}
                  className="text-xs font-semibold text-[#225332] hover:underline"
                >
                  Ubah Bukti / Lokasi
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Location & Media summary */}
                <div className="space-y-2 bg-white p-3.5 rounded-xl border border-[#e2e6df]">
                  <p className="font-semibold text-[#1c241e] flex items-center gap-1">
                    <IconPin className="h-3.5 w-3.5 text-[#225332]" />
                    <span>Lokasi Kejadian</span>
                  </p>
                  <p className="text-[#5c685f] line-clamp-2">
                    {address || "Belum ada alamat lokasi"}
                  </p>
                  <div className="pt-2 border-t border-[#edf0ea] flex items-center justify-between text-[11px] text-[#8c978f]">
                    <span>Foto Bukti: <strong className="text-[#1c241e]">{files.length} Terlampir</strong></span>
                    {latitude && <span>GPS: {parseFloat(latitude).toFixed(4)}, {parseFloat(longitude).toFixed(4)}</span>}
                  </div>
                </div>

                {/* AI Pipeline Notice */}
                <div className="space-y-1.5 bg-white p-3.5 rounded-xl border border-[#e2e6df]">
                  <p className="font-semibold text-[#225332]">
                    Analisis Otomatis AI CiviLens
                  </p>
                  <p className="text-[#5c685f] leading-relaxed text-[11px]">
                    Setelah dikirim, laporan akan dianalisis oleh AI untuk merangkum fakta objektif, mengukur tingkat keparahan, dan diteruskan ke instansi terkait.
                  </p>
                </div>
              </div>
            </div>

            {/* Desktop Action Controls */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleBackToEvidence}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#e2e6df] bg-white px-5 py-2.5 text-xs font-semibold text-[#5c685f] hover:bg-[#fafaf7] hover:text-[#1c241e] transition"
              >
                <IconArrowLeft className="h-4 w-4" />
                <span>Kembali ke Bukti & Lokasi</span>
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-xl bg-[#225332] px-7 py-3 text-sm font-semibold text-white shadow-xs hover:bg-[#173722] transition active:scale-[0.98] disabled:opacity-50"
              >
                <span>{isSubmitting ? "Mengirim Laporan..." : "Kirim Laporan Resmi"}</span>
                <IconCheck className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sticky CTA Bar (Above Universal Bottom Nav) */}
      <div className="sm:hidden fixed bottom-14 left-0 right-0 z-20 border-t border-[#e2e6df] bg-white/95 backdrop-blur-md px-4 py-2.5 shadow-md flex items-center justify-between gap-3">
        {currentStep === "evidence_location" ? (
          <button
            type="button"
            onClick={handleNextToDetails}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#225332] py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#173722] active:scale-[0.98]"
          >
            <span>Lanjut: Detail Masalah</span>
            <IconArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <div className="w-full flex items-center gap-2">
            <button
              type="button"
              onClick={handleBackToEvidence}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-1 rounded-xl border border-[#e2e6df] bg-white px-3 py-2.5 text-xs font-semibold text-[#5c685f]"
            >
              <IconArrowLeft className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#225332] py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#173722] active:scale-[0.98] disabled:opacity-50"
            >
              <span>{isSubmitting ? "Mengirim..." : "Kirim Laporan Resmi"}</span>
              <IconCheck className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </AuthenticatedShell>
  );
}
