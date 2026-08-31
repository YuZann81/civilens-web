"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { getCategories, createReport, uploadReportMedia } from "@/lib/api/client";
import { Category } from "@/lib/api/types";

export default function CreateReportPage() {
  const router = useRouter();
  const { user, status, loginWithGoogle } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");

  // Media files & previews
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // UI state
  const [step, setStep] = useState<"form" | "preview">("form");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCategories() {
      try {
        const list = await getCategories();
        setCategories(list);
        if (list.length > 0) {
          setCategoryId(list[0].id);
        }
      } catch {
        setError("Gagal memuat kategori laporan. Periksa koneksi internet Anda.");
      } finally {
        setLoadingCategories(false);
      }
    }

    void loadCategories();
  }, []);

  // Cleanup object URLs on unmount or files change
  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    setError("");

    // Validate maximum 5 files
    if (files.length + selectedFiles.length > 5) {
      setError("Maksimal 5 foto bukti yang dapat diunggah.");
      return;
    }

    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    for (const file of selectedFiles) {
      // Validate type
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        setError("Format foto harus berupa JPG, PNG, atau WebP.");
        return;
      }

      // Validate size (10 MB = 10 * 1024 * 1024 bytes)
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

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Perangkat Anda tidak mendukung fitur lokasi GPS.");
      return;
    }

    setError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(6));
        setLongitude(pos.coords.longitude.toFixed(6));
      },
      () => {
        setError("Gagal mendeteksi lokasi GPS. Masukkan alamat secara manual.");
      }
    );
  };

  const handleValidateStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Judul laporan wajib diisi.");
      return;
    }

    if (!description.trim()) {
      setError("Deskripsi masalah lingkungan wajib diisi.");
      return;
    }

    if (!categoryId) {
      setError("Pilih salah satu kategori laporan.");
      return;
    }

    if (!address.trim()) {
      setError("Alamat atau lokasi kejadian wajib diisi.");
      return;
    }

    if ((latitude && !longitude) || (!latitude && longitude)) {
      setError("Koordinat lintang (latitude) dan bujur (longitude) harus keduanya diisi atau keduanya dikosongkan.");
      return;
    }

    setStep("preview");
    if (typeof window !== "undefined" && typeof window.scrollTo === "function") {
      try {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch {
        // Ignore scrollTo errors in test/non-supporting envs
      }
    }
  };

  const handleSubmitReport = async () => {
    if (isSubmitting) return;

    setError("");
    setIsSubmitting(true);

    try {
      // 1. Create Report & Location in single atomic API request
      const latNum = latitude ? parseFloat(latitude) : null;
      const lngNum = longitude ? parseFloat(longitude) : null;

      const report = await createReport({
        title: title.trim(),
        description: description.trim(),
        category_id: Number(categoryId),
        location: {
          address: address.trim(),
          latitude: latNum,
          longitude: lngNum,
        },
      });

      // 2. Upload attached media photos if provided
      if (files.length > 0) {
        for (const file of files) {
          try {
            await uploadReportMedia(report.id, file);
          } catch {
            // Log & proceed if individual photo upload fails
          }
        }
      }

      // 3. Redirect to report detail & tracking page
      router.push(`/reports/${report.id}?created=1`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Gagal membuat laporan. Silakan coba lagi.");
      } else {
        setError("Terjadi kesalahan jaringan saat mengirim laporan.");
      }
      setStep("form");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategory = categories.find((c) => c.id === Number(categoryId));

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafaf5]">
        <p className="text-sm font-medium text-[#1c4123]">Memeriksa autentikasi...</p>
      </div>
    );
  }

  if (status === "unauthenticated" || !user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#fafaf5] px-6 text-center">
        <div className="w-full max-w-md rounded-2xl border border-[#eae2d3] bg-white p-8 shadow-xs">
          <Image
            src="/logos/civilens-logo-stacked-dark.svg"
            alt="CiviLens"
            width={56}
            height={56}
            className="mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold font-serif text-[#1c4123] mb-2" style={{ fontFamily: "Georgia, serif" }}>
            Autentikasi Diperlukan
          </h1>
          <p className="text-sm text-[#57524d] mb-6 leading-relaxed">
            Anda harus masuk atau mendaftar terlebih dahulu untuk membuat laporan lingkungan resmi di CiviLens.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/login"
              className="w-full py-2.5 rounded-xl font-semibold text-sm text-white bg-[#2d6a36] hover:bg-[#22512a] transition shadow-xs"
            >
              Masuk dengan Akun
            </Link>
            <button
              type="button"
              onClick={loginWithGoogle}
              className="w-full py-2.5 rounded-xl text-sm font-medium border border-[#cbe0ce] bg-white hover:bg-[#f4f8f4] text-[#1c4123] transition flex items-center justify-center gap-2"
            >
              <span>Masuk dengan Google</span>
            </button>
            <Link
              href="/"
              className="mt-2 text-xs text-[#7a9a80] hover:text-[#1c4123] transition"
            >
              &larr; Kembali ke Beranda
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
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-85">
            <svg
              className="h-6 w-6 text-[#2d6a36]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
            </svg>
            <span className="text-lg font-bold tracking-tight text-[#1c4123]" style={{ fontFamily: "Georgia, serif" }}>
              CiviLens
            </span>
          </Link>

          <div className="flex items-center gap-3 text-xs text-[#57524d]">
            <span>Pelapor: <strong className="text-[#1c4123] font-semibold">{user.name}</strong></span>
            <span className="rounded-full bg-[#e5f0e6] px-2.5 py-0.5 font-semibold text-[#22512a] uppercase text-[10px]">
              {user.role}
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-10">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4a6b52] hover:text-[#1e4d2b] transition mb-3"
          >
            &larr; Kembali ke Beranda
          </Link>
          <h1
            className="text-3xl font-extrabold tracking-tight text-[#17361d] sm:text-4xl"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Buat Laporan Lingkungan Baru
          </h1>
          <p className="mt-2 text-sm text-[#57524d] leading-relaxed">
            Sampaikan permasalahan lingkungan di sekitar Anda secara detail dan akurat untuk ditindaklanjuti komunitas dan pemerintah.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Step 1: Form Filling View */}
        {step === "form" && (
          <form noValidate onSubmit={handleValidateStep} className="space-y-8">
            {/* Section 1: Informasi Dasar */}
            <div className="rounded-2xl border border-[#eae2d3] bg-white p-6 sm:p-8 shadow-xs space-y-6">
              <h2 className="text-lg font-bold font-serif text-[#1e4d2b] border-b border-[#f0f4ee] pb-3" style={{ fontFamily: "Georgia, serif" }}>
                1. Informasi Laporan
              </h2>

              {/* Judul Laporan */}
              <div className="space-y-1.5">
                <label htmlFor="title" className="block text-xs font-semibold uppercase tracking-wider text-[#1c4123]">
                  Judul Laporan <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Tumpukan Sampah Liar di Pinggir Sungai Citarum"
                  required
                  maxLength={255}
                  className="w-full rounded-xl border border-[#c8dfc8] bg-[#fafaf5] px-4 py-3 text-sm text-[#2c2926] outline-none transition focus:border-[#2d6a36] focus:bg-white"
                />
                <p className="text-[11px] text-[#7a9a80]">Gunakan judul yang ringkas, jelas, dan menggambarkan pokok masalah.</p>
              </div>

              {/* Kategori */}
              <div className="space-y-1.5">
                <label htmlFor="category" className="block text-xs font-semibold uppercase tracking-wider text-[#1c4123]">
                  Kategori Masalah <span className="text-red-500">*</span>
                </label>
                {loadingCategories ? (
                  <p className="text-xs text-[#7a9a80]">Memuat daftar kategori...</p>
                ) : (
                  <select
                    id="category"
                    value={categoryId}
                    onChange={(e) => setCategoryId(Number(e.target.value))}
                    required
                    className="w-full rounded-xl border border-[#c8dfc8] bg-[#fafaf5] px-4 py-3 text-sm text-[#2c2926] outline-none transition focus:border-[#2d6a36] focus:bg-white"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} {cat.description ? `— ${cat.description}` : ""}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Deskripsi Laporan */}
              <div className="space-y-1.5">
                <label htmlFor="description" className="block text-xs font-semibold uppercase tracking-wider text-[#1c4123]">
                  Deskripsi Masalah <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Jelaskan secara detail: apa yang terjadi, dampak bagi warga sekitar, perkiraan lama kejadian, dan kondisi di lokasi saat ini."
                  required
                  className="w-full rounded-xl border border-[#c8dfc8] bg-[#fafaf5] px-4 py-3 text-sm text-[#2c2926] outline-none transition focus:border-[#2d6a36] focus:bg-white leading-relaxed"
                />
                <p className="text-[11px] text-[#7a9a80]">Deskripsi faktual membantu analisis otomatis AI dan verifikasi tim lapangan.</p>
              </div>
            </div>

            {/* Section 2: Lokasi Kejadian */}
            <div className="rounded-2xl border border-[#eae2d3] bg-white p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-[#f0f4ee] pb-3">
                <h2 className="text-lg font-bold font-serif text-[#1e4d2b]" style={{ fontFamily: "Georgia, serif" }}>
                  2. Lokasi Kejadian
                </h2>
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#cbe0ce] bg-[#f4f8f4] px-3 py-1.5 text-xs font-semibold text-[#2d6a36] hover:bg-[#e5f0e6] transition"
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="3 11 22 2 13 21 11 13 3 11" />
                  </svg>
                  <span>Gunakan Lokasi GPS Saya</span>
                </button>
              </div>

              {/* Alamat */}
              <div className="space-y-1.5">
                <label htmlFor="address" className="block text-xs font-semibold uppercase tracking-wider text-[#1c4123]">
                  Alamat Lengkap / Patokan Lokasi <span className="text-red-500">*</span>
                </label>
                <input
                  id="address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Contoh: Jl. Bojongsoang No. 45, dekat Jembatan Citarum, Kec. Dayeuhkolot, Bandung"
                  required
                  className="w-full rounded-xl border border-[#c8dfc8] bg-[#fafaf5] px-4 py-3 text-sm text-[#2c2926] outline-none transition focus:border-[#2d6a36] focus:bg-white"
                />
              </div>

              {/* Koordinat GPS Opsional */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="latitude" className="block text-xs font-medium text-[#4a6b52]">
                    Latitude (Lintang, Opsional)
                  </label>
                  <input
                    id="latitude"
                    type="number"
                    step="any"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="-6.917464"
                    className="w-full rounded-xl border border-[#c8dfc8] bg-[#fafaf5] px-4 py-2.5 text-sm text-[#2c2926] outline-none transition focus:border-[#2d6a36] focus:bg-white font-mono text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="longitude" className="block text-xs font-medium text-[#4a6b52]">
                    Longitude (Bujur, Opsional)
                  </label>
                  <input
                    id="longitude"
                    type="number"
                    step="any"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="107.619123"
                    className="w-full rounded-xl border border-[#c8dfc8] bg-[#fafaf5] px-4 py-2.5 text-sm text-[#2c2926] outline-none transition focus:border-[#2d6a36] focus:bg-white font-mono text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Foto & Bukti Visual */}
            <div className="rounded-2xl border border-[#eae2d3] bg-white p-6 sm:p-8 shadow-xs space-y-6">
              <h2 className="text-lg font-bold font-serif text-[#1e4d2b] border-b border-[#f0f4ee] pb-3" style={{ fontFamily: "Georgia, serif" }}>
                3. Foto Bukti Lapangan (Maks. 5 Foto)
              </h2>

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#cbe0ce] bg-[#fafaf5] p-8 text-center cursor-pointer transition hover:bg-[#f4f8f4] hover:border-[#2d6a36]"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <svg className="h-10 w-10 text-[#7a9a80] mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <p className="text-sm font-semibold text-[#1c4123]">
                  Klik untuk memilih foto atau seret foto ke sini
                </p>
                <p className="mt-1 text-xs text-[#7a9a80]">
                  Format JPG, PNG, atau WebP (Maksimal 10 MB per foto)
                </p>
              </div>

              {/* Image Previews */}
              {previews.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-[#1c4123]">
                    Foto Terpilih ({previews.length}/5):
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {previews.map((previewUrl, index) => (
                      <div key={index} className="relative rounded-xl overflow-hidden border border-[#cbe0ce] aspect-square bg-[#eae2d3]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={previewUrl}
                          alt={`Preview ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(index)}
                          className="absolute top-1.5 right-1.5 rounded-full bg-black/60 p-1 text-white hover:bg-black/80 transition"
                          title="Hapus foto"
                        >
                          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-end gap-3 pt-4">
              <Link
                href="/"
                className="rounded-xl border border-[#cbe0ce] bg-white px-5 py-3 text-sm font-semibold text-[#57524d] hover:bg-[#fafaf5] transition"
              >
                Batal
              </Link>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-[#2d6a36] px-6 py-3 text-sm font-semibold text-white shadow-xs hover:bg-[#22512a] transition focus-visible:outline-2 focus-visible:outline-[#2d6a36]"
              >
                <span>Lanjut ke Pratinjau</span>
                <span>&rarr;</span>
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Preview & Confirmation View */}
        {step === "preview" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="rounded-2xl border border-[#eae2d3] bg-white p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-[#f0f4ee] pb-4">
                <span className="inline-block rounded-full bg-[#f4f8f4] px-3 py-1 text-xs font-semibold text-[#22512a] border border-[#cbe0ce] mb-2">
                  {selectedCategory?.name}
                </span>
                <h2 className="text-xl font-bold text-[#7a9a80] mb-1">
                  Pratinjau & Konfirmasi Laporan
                </h2>
                <h3 className="text-2xl font-bold font-serif text-[#1e4d2b]" style={{ fontFamily: "Georgia, serif" }}>
                  {title}
                </h3>
                <p className="mt-1 text-xs text-[#7a9a80]">
                  Dilaporkan oleh: <strong className="text-[#1c4123]">{user.name}</strong> • Status awal: <span className="font-semibold text-amber-600">Menunggu Verifikasi</span>
                </p>
              </div>

              {/* Location Summary */}
              <div className="rounded-xl bg-[#fafaf5] p-4 border border-[#eae2d3] space-y-1">
                <p className="text-xs font-semibold text-[#1c4123] uppercase tracking-wider flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-[#2d6a36]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  Lokasi Kejadian
                </p>
                <p className="text-sm text-[#2c2926] pl-5.5">{address}</p>
                {latitude && longitude && (
                  <p className="text-xs text-[#7a9a80] font-mono pl-5.5">GPS: {latitude}, {longitude}</p>
                )}
              </div>

              {/* Description Summary */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-[#1c4123] uppercase tracking-wider">
                  Deskripsi Laporan
                </p>
                <p className="text-sm text-[#57524d] whitespace-pre-line leading-relaxed">
                  {description}
                </p>
              </div>

              {/* Photos Summary */}
              {previews.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-[#f0f4ee]">
                  <p className="text-xs font-semibold text-[#1c4123] uppercase tracking-wider">
                    Foto Bukti ({previews.length})
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {previews.map((url, i) => (
                      <div key={i} className="rounded-xl overflow-hidden border border-[#cbe0ce] aspect-square bg-[#eae2d3]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`Bukti ${i + 1}`} className="h-full w-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirmation Banner */}
            <div className="rounded-xl bg-[#f4f8f4] p-4 border border-[#cbe0ce] text-xs text-[#22512a] leading-relaxed">
              💡 <strong>Transparansi Lingkungan:</strong> Setelah dikirim, laporan Anda akan dianalisis secara otomatis oleh AI untuk klasifikasi dampak keparahan dan diteruskan ke feed warga serta ditindaklanjuti secara terbuka.
            </div>

            {/* Submit Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep("form")}
                disabled={isSubmitting}
                className="rounded-xl border border-[#cbe0ce] bg-white px-5 py-3 text-sm font-semibold text-[#57524d] hover:bg-[#fafaf5] transition disabled:opacity-50"
              >
                &larr; Ubah Laporan
              </button>

              <button
                type="button"
                onClick={handleSubmitReport}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-xl bg-[#2d6a36] px-7 py-3 text-sm font-semibold text-white shadow-xs hover:bg-[#22512a] transition disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-[#2d6a36]"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Mengirim Laporan...</span>
                  </>
                ) : (
                  <>
                    <span>Kirim Laporan Resmi</span>
                    <span>&check;</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
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
