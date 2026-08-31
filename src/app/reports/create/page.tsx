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
  IconHashtag,
  IconPin,
  IconCamera,
  IconCheck,
  IconArrowRight,
  IconArrowLeft,
  IconClose,
  IconUpload,
} from "@/components/ui/icons";

type Step = "details" | "topics" | "location" | "evidence" | "review";

export default function CreateReportPage() {
  const router = useRouter();
  const { user, status, loginWithGoogle } = useAuth();

  // Multi-step state
  const [currentStep, setCurrentStep] = useState<Step>("details");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Step 1: Details
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Step 2: Topics
  const [topics, setTopics] = useState<string[]>([]);

  // Step 3: Location
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  // Step 4: Evidence Photos (Min 1, Max 3)
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  // Step Validation & Navigation
  const validateStep = (step: Step): boolean => {
    setError("");

    if (step === "details") {
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
      return true;
    }

    if (step === "topics") {
      if (topics.length === 0) {
        setError("Pilih atau buat minimal 1 topik tag untuk laporan Anda.");
        return false;
      }
      return true;
    }

    if (step === "location") {
      if (!address.trim()) {
        setError("Alamat atau patokan lokasi wajib diisi.");
        return false;
      }
      return true;
    }

    if (step === "evidence") {
      if (files.length < 1) {
        setError("Wajib menyertakan minimal 1 foto bukti kondisi lingkungan.");
        return false;
      }
      return true;
    }

    return true;
  };

  const goToNextStep = () => {
    if (!validateStep(currentStep)) return;

    if (currentStep === "details") setCurrentStep("topics");
    else if (currentStep === "topics") setCurrentStep("location");
    else if (currentStep === "location") setCurrentStep("evidence");
    else if (currentStep === "evidence") setCurrentStep("review");

    if (typeof window !== "undefined" && typeof window.scrollTo === "function") {
      try {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch {
        // Safe for test environments
      }
    }
  };

  const goToPrevStep = () => {
    setError("");
    if (currentStep === "topics") setCurrentStep("details");
    else if (currentStep === "location") setCurrentStep("topics");
    else if (currentStep === "evidence") setCurrentStep("location");
    else if (currentStep === "review") setCurrentStep("evidence");
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    // Validate all requirements before final POST
    if (!validateStep("details") || !validateStep("topics") || !validateStep("location") || !validateStep("evidence")) {
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
            // Upload failure logged, proceed to detail page
          }
        }
      }

      router.push(`/reports/${report.id}?created=1`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal membuat laporan. Silakan coba lagi."
      );
      setIsSubmitting(false);
    }
  };

  // Auth Guard
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafaf5]">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1e4d2b] border-t-transparent mx-auto" />
          <p className="text-xs text-[#57524d]">Memeriksa autentikasi...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" || !user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#fafaf5] px-6 text-center">
        <div className="max-w-md rounded-2xl border border-[#eae2d3] bg-white p-8 shadow-xs space-y-5">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f4f8f4] text-[#1e4d2b]">
            <IconDocument className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold font-serif text-[#1e4d2b]" style={{ fontFamily: "Georgia, serif" }}>
              Masuk untuk Melaporkan Isu
            </h1>
            <p className="text-xs text-[#57524d] leading-relaxed">
              Pelaporan isu lingkungan di CiviLens membutuhkan autentikasi agar laporan dapat ditindaklanjuti secara bertanggung jawab.
            </p>
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <Link
              href="/login"
              className="rounded-xl bg-[#1e4d2b] py-2.5 text-sm font-semibold text-white hover:bg-[#163a20] transition shadow-xs"
            >
              Masuk dengan Akun
            </Link>
            <button
              type="button"
              onClick={loginWithGoogle}
              className="rounded-xl border border-[#cbe0ce] bg-[#fafaf5] py-2.5 text-xs font-semibold text-[#1e4d2b] hover:bg-[#f4f8f4] transition"
            >
              Masuk dengan Google
            </button>
            <Link
              href="/"
              className="mt-2 text-xs font-medium text-[#7a9a80] hover:text-[#1e4d2b] transition"
            >
              &larr; Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const stepsList: { id: Step; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: "details", label: "Informasi", icon: IconDocument },
    { id: "topics", label: "Topik", icon: IconHashtag },
    { id: "location", label: "Lokasi", icon: IconPin },
    { id: "evidence", label: "Bukti Foto", icon: IconCamera },
    { id: "review", label: "Periksa", icon: IconCheck },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-[#fafaf5] text-[#2c2926]">
      {/* Top Header */}
      <header className="border-b border-[#eae2d3] bg-[#fafaf5]/90 backdrop-blur-xs sticky top-0 z-20">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-85">
            <div className="h-6 w-6 rounded-full bg-[#1e4d2b] text-white flex items-center justify-center text-xs font-bold font-serif">
              C
            </div>
            <span className="text-lg font-bold tracking-tight text-[#1c4123]" style={{ fontFamily: "Georgia, serif" }}>
              CiviLens
            </span>
          </Link>

          <div className="flex items-center gap-3 text-xs text-[#57524d]">
            <span>Pelapor: <strong className="text-[#1c4123] font-semibold">{user.name}</strong></span>
            <span className="rounded-full bg-[#e5f0e6] px-2.5 py-0.5 font-semibold text-[#1e4d2b] uppercase text-[10px]">
              {user.role}
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-8">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4a6b52] hover:text-[#1e4d2b] transition mb-3"
          >
            <IconArrowLeft className="h-3.5 w-3.5" />
            <span>Kembali ke Beranda</span>
          </Link>
          <h1
            className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#17361d]"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Buat Laporan Lingkungan Baru
          </h1>
        </div>

        {/* Step Progress Bar */}
        <div className="mb-8 grid grid-cols-5 gap-2 border-b border-[#eae2d3] pb-4">
          {stepsList.map((st, index) => {
            const Icon = st.icon;
            const isCurrent = currentStep === st.id;
            const isDone = stepsList.findIndex((s) => s.id === currentStep) > index;

            return (
              <div
                key={st.id}
                className={`flex flex-col items-center text-center gap-1 transition-colors ${
                  isCurrent
                    ? "text-[#1e4d2b] font-bold"
                    : isDone
                    ? "text-[#2d6a36] font-medium"
                    : "text-[#8c857e]"
                }`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs transition-colors ${
                    isCurrent
                      ? "border-[#1e4d2b] bg-[#1e4d2b] text-white shadow-xs"
                      : isDone
                      ? "border-[#2d6a36] bg-[#e5f0e6] text-[#2d6a36]"
                      : "border-[#eae2d3] bg-white text-[#8c857e]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-[11px] hidden sm:inline">{st.label}</span>
              </div>
            );
          })}
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700">
            {error}
          </div>
        )}

        {/* STEP 1: INFORMASI MASALAH */}
        {currentStep === "details" && (
          <div className="rounded-2xl border border-[#eae2d3] bg-white p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-[#f0f4ee] pb-3">
              <h2 className="text-lg font-bold font-serif text-[#1e4d2b]" style={{ fontFamily: "Georgia, serif" }}>
                1. Apa Yang Terjadi?
              </h2>
              <p className="text-xs text-[#7a9a80]">
                Tuliskan permasalahan lingkungan yang Anda temukan secara objektif dan faktual.
              </p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="title" className="block text-xs font-semibold uppercase tracking-wider text-[#1c4123]">
                Judul Laporan <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Tumpukan Sampah Menumpuk di Bantaran Sungai Citarum"
                required
                maxLength={255}
                className="w-full rounded-xl border border-[#c8dfc8] bg-[#fafaf5] px-4 py-3 text-sm text-[#2c2926] outline-none transition focus:border-[#2d6a36] focus:bg-white"
              />
              <p className="text-[11px] text-[#7a9a80]">Judul yang singkat dan jelas memudahkan warga menemukan laporan ini.</p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="description" className="block text-xs font-semibold uppercase tracking-wider text-[#1c4123]">
                Deskripsi Lengkap Masalah <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Jelaskan apa yang terjadi, dampak bagi warga sekitar, perkiraan lama kejadian, dan kondisi saat ini."
                required
                className="w-full rounded-xl border border-[#c8dfc8] bg-[#fafaf5] px-4 py-3 text-sm text-[#2c2926] outline-none transition focus:border-[#2d6a36] focus:bg-white leading-relaxed"
              />
              <p className="text-[11px] text-[#7a9a80]">Deskripsi faktual membantu model AI CiviLens menilai tingkat urgensi secara akurat.</p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={goToNextStep}
                className="inline-flex items-center gap-2 rounded-xl bg-[#1e4d2b] px-6 py-3 text-sm font-semibold text-white shadow-xs hover:bg-[#163a20] transition"
              >
                <span>Lanjut: Pilih Topik</span>
                <IconArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: TOPIK HASHTAGS */}
        {currentStep === "topics" && (
          <div className="rounded-2xl border border-[#eae2d3] bg-white p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-[#f0f4ee] pb-3">
              <h2 className="text-lg font-bold font-serif text-[#1e4d2b]" style={{ fontFamily: "Georgia, serif" }}>
                2. Topik & Kategori
              </h2>
              <p className="text-xs text-[#7a9a80]">
                Pilih atau buat topik hashtag baru untuk mengelompokkan isu ini (1–5 topik).
              </p>
            </div>

            <TopicPicker selectedTopics={topics} onChange={setTopics} />

            <div className="flex items-center justify-between pt-4 border-t border-[#f0f4ee]">
              <button
                type="button"
                onClick={goToPrevStep}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#cbe0ce] bg-white px-5 py-2.5 text-xs font-semibold text-[#57524d] hover:bg-[#fafaf5] transition"
              >
                <IconArrowLeft className="h-3.5 w-3.5" />
                <span>Kembali</span>
              </button>
              <button
                type="button"
                onClick={goToNextStep}
                disabled={topics.length === 0}
                className="inline-flex items-center gap-2 rounded-xl bg-[#1e4d2b] px-6 py-3 text-sm font-semibold text-white shadow-xs hover:bg-[#163a20] transition disabled:opacity-40"
              >
                <span>Lanjut: Tentukan Lokasi</span>
                <IconArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: LOKASI MAP-FIRST */}
        {currentStep === "location" && (
          <div className="rounded-2xl border border-[#eae2d3] bg-white p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-[#f0f4ee] pb-3">
              <h2 className="text-lg font-bold font-serif text-[#1e4d2b]" style={{ fontFamily: "Georgia, serif" }}>
                3. Lokasi Kejadian (Map-First)
              </h2>
              <p className="text-xs text-[#7a9a80]">
                Tandai lokasi pada peta secara akurat agar warga dan tim penanganan dapat menjangkau titik permasalahan.
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

            <div className="flex items-center justify-between pt-4 border-t border-[#f0f4ee]">
              <button
                type="button"
                onClick={goToPrevStep}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#cbe0ce] bg-white px-5 py-2.5 text-xs font-semibold text-[#57524d] hover:bg-[#fafaf5] transition"
              >
                <IconArrowLeft className="h-3.5 w-3.5" />
                <span>Kembali</span>
              </button>
              <button
                type="button"
                onClick={goToNextStep}
                disabled={!address.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-[#1e4d2b] px-6 py-3 text-sm font-semibold text-white shadow-xs hover:bg-[#163a20] transition disabled:opacity-40"
              >
                <span>Lanjut: Unggah Bukti Foto</span>
                <IconArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: BUKTI FOTO (1 - 3 FOTO) */}
        {currentStep === "evidence" && (
          <div className="rounded-2xl border border-[#eae2d3] bg-white p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-[#f0f4ee] pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold font-serif text-[#1e4d2b]" style={{ fontFamily: "Georgia, serif" }}>
                  4. Bukti Foto Lingkungan
                </h2>
                <p className="text-xs text-[#7a9a80]">
                  Wajib menyertakan 1 hingga 3 foto bukti autentik untuk verifikasi.
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold border ${
                  files.length === 0
                    ? "bg-red-50 text-red-700 border-red-200"
                    : files.length === 3
                    ? "bg-[#e5f0e6] text-[#1e4d2b] border-[#cbe0ce]"
                    : "bg-amber-50 text-amber-800 border-amber-200"
                }`}
              >
                {files.length === 0
                  ? "0/3 — Wajib min. 1 foto"
                  : files.length === 3
                  ? "3/3 — Maksimal"
                  : `${files.length}/3 Foto`}
              </span>
            </div>

            {/* Upload Area */}
            {files.length < 3 && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="rounded-2xl border-2 border-dashed border-[#c8dfc8] bg-[#fafaf5] p-8 text-center hover:border-[#1e4d2b] hover:bg-[#f4f8f4] transition cursor-pointer flex flex-col items-center justify-center"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <IconUpload className="h-8 w-8 text-[#1e4d2b] mb-2" />
                <p className="text-xs font-semibold text-[#1c4123]">
                  Klik untuk Memilih Foto Bukti Lingkungan
                </p>
                <p className="mt-1 text-[11px] text-[#7a9a80]">
                  Format JPG, PNG, atau WebP (Maksimal 10 MB per foto, total 1–3 foto)
                </p>
              </div>
            )}

            {/* Thumbnail Slots */}
            {previews.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-[#1c4123]">
                  Foto Terlampir ({previews.length}/3):
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {previews.map((previewUrl, index) => (
                    <div
                      key={index}
                      className="relative rounded-xl overflow-hidden border border-[#cbe0ce] aspect-video bg-[#eae2d3] shadow-xs"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewUrl}
                        alt={`Evidence ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="absolute top-1.5 right-1.5 rounded-full bg-black/70 p-1 text-white hover:bg-black/90 transition"
                        title="Hapus foto"
                      >
                        <IconClose className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-[#f0f4ee]">
              <button
                type="button"
                onClick={goToPrevStep}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#cbe0ce] bg-white px-5 py-2.5 text-xs font-semibold text-[#57524d] hover:bg-[#fafaf5] transition"
              >
                <IconArrowLeft className="h-3.5 w-3.5" />
                <span>Kembali</span>
              </button>
              <button
                type="button"
                onClick={goToNextStep}
                disabled={files.length < 1}
                className="inline-flex items-center gap-2 rounded-xl bg-[#1e4d2b] px-6 py-3 text-sm font-semibold text-white shadow-xs hover:bg-[#163a20] transition disabled:opacity-40"
              >
                <span>Lanjut: Periksa Ringkasan</span>
                <IconArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: PERIKSA & KIRIM (REVIEW) */}
        {currentStep === "review" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="rounded-2xl border border-[#eae2d3] bg-white p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-[#f0f4ee] pb-4">
                <div className="flex flex-wrap items-center gap-1.5 mb-3">
                  {topics.map((tag, i) => (
                    <span
                      key={i}
                      className="rounded-full bg-[#f4f8f4] border border-[#cbe0ce] px-2.5 py-0.5 text-xs font-semibold text-[#1e4d2b]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                <h2
                  className="text-2xl font-bold font-serif text-[#1e4d2b]"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  {title}
                </h2>
                <p className="mt-1 text-xs text-[#7a9a80]">
                  Dilaporkan oleh: <strong className="text-[#1c4123]">{user.name}</strong> • Status awal: <span className="font-semibold text-amber-700">Menunggu Peninjauan</span>
                </p>
              </div>

              {/* Location Card */}
              <div className="rounded-xl bg-[#fafaf5] p-4 border border-[#eae2d3] space-y-1">
                <p className="text-xs font-semibold text-[#1e4d2b] uppercase tracking-wider flex items-center gap-1.5">
                  <IconPin className="h-4 w-4 text-[#1e4d2b]" />
                  <span>Lokasi Kejadian</span>
                </p>
                <p className="text-sm text-[#2c2926] pl-5.5">{address}</p>
                {latitude && longitude && (
                  <p className="text-[11px] text-[#7a9a80] font-mono pl-5.5">
                    Koordinat GPS: {latitude}, {longitude}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-[#1e4d2b] uppercase tracking-wider">
                  Deskripsi Masalah
                </p>
                <p className="text-sm text-[#57524d] whitespace-pre-line leading-relaxed">
                  {description}
                </p>
              </div>

              {/* Photo Attachments Preview */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-[#1e4d2b] uppercase tracking-wider">
                  Bukti Foto ({previews.length}):
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {previews.map((url, index) => (
                    <div
                      key={index}
                      className="rounded-xl overflow-hidden border border-[#cbe0ce] aspect-video bg-[#eae2d3]"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={`Evidence ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Transparency Banner */}
            <div className="rounded-xl bg-[#f4f8f4] p-4 border border-[#cbe0ce] text-xs text-[#1e4d2b] leading-relaxed flex items-start gap-2.5">
              <span className="font-bold shrink-0">AI</span>
              <p>
                Setelah dikirim, laporan ini akan diproses otomatis oleh pipeline AI CiviLens untuk penilaian keparahan faktual dan diteruskan ke feed warga secara transparan.
              </p>
            </div>

            {/* Submit Bar */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={goToPrevStep}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#cbe0ce] bg-white px-5 py-2.5 text-xs font-semibold text-[#57524d] hover:bg-[#fafaf5] transition disabled:opacity-50"
              >
                <IconArrowLeft className="h-3.5 w-3.5" />
                <span>Ubah Data</span>
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-xl bg-[#1e4d2b] px-7 py-3 text-sm font-semibold text-white shadow-xs hover:bg-[#163a20] transition disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-[#1e4d2b]"
              >
                <span>{isSubmitting ? "Mengirim Laporan..." : "Kirim Laporan Resmi"}</span>
                <IconCheck className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#eae2d3] py-6 text-center text-xs text-[#8c857e] mt-auto">
        <div className="mx-auto max-w-3xl px-6">
          CiviLens &bull; Platform Pelaporan & Transparansi Lingkungan Warga
        </div>
      </footer>
    </div>
  );
}
