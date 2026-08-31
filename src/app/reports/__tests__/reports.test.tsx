import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import CreateReportPage from "../create/page";
import ReportFeedPage from "../page";
import ReportDetailPage from "../[id]/page";
import { AuthProvider } from "@/lib/auth/auth-context";
import * as apiClient from "@/lib/api/client";
import { Category, Report, ApiError } from "@/lib/api/types";

// Mock router & searchParams
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useParams: () => ({
    id: "101",
  }),
  useSearchParams: () => ({
    get: (key: string) => (key === "created" ? null : null),
  }),
}));

const mockCategories: Category[] = [
  { id: 1, name: "Persampahan", slug: "persampahan", description: "Limbah liar" },
  { id: 2, name: "Pencemaran Air", slug: "pencemaran-air", description: "Limbah sungai" },
];

const mockReport: Report = {
  id: 101,
  title: "Tumpukan Sampah Menumpuk di Sungai",
  description: "Ada tumpukan sampah plastik yang menyumbat aliran sungai di dekat jembatan panjang.",
  status: "pending",
  created_at: "2026-08-31T08:00:00Z",
  updated_at: "2026-08-31T08:00:00Z",
  category: mockCategories[0],
  location: {
    address: "Jl. Sudirman No. 12, Jakarta Pusat",
    latitude: -6.2088,
    longitude: 106.8456,
  },
  media: [
    {
      id: 1,
      original_name: "photo.jpg",
      mime_type: "image/jpeg",
      size: 102400,
      created_at: "2026-08-31T08:00:00Z",
    },
  ],
  ai_analysis: {
    id: 1,
    status: "completed",
    severity: "high",
    summary: "Penyumbatan parah dengan potensi banjir saat hujan deras.",
    completed_at: "2026-08-31T08:05:00Z",
  },
};

describe("Report Flow Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(apiClient, "getCategories").mockResolvedValue(mockCategories);
    vi.spyOn(apiClient, "getAuthUser").mockResolvedValue({
      id: 1,
      name: "Budi Santoso",
      email: "budi@example.com",
      role: "citizen",
      status: "active",
      email_verified_at: "2026-08-30T00:00:00Z",
    });
  });

  describe("CreateReportPage", () => {
    it("renders form with category options, title, description, and location", async () => {
      render(
        <AuthProvider>
          <CreateReportPage />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText("Buat Laporan Lingkungan Baru")).toBeDefined();
        expect(screen.getByText(/Persampahan/)).toBeDefined();
      });

      expect(screen.getByLabelText(/Judul Laporan/i)).toBeDefined();
      expect(screen.getByLabelText(/Deskripsi Masalah/i)).toBeDefined();
      expect(screen.getByLabelText(/Alamat Lengkap \/ Patokan Lokasi/i)).toBeDefined();
    });

    it("validates required fields before advancing to step 2 preview", async () => {
      const { container } = render(
        <AuthProvider>
          <CreateReportPage />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText("Buat Laporan Lingkungan Baru")).toBeDefined();
      });

      const form = container.querySelector("form")!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText("Judul laporan wajib diisi.")).toBeDefined();
      });
    });

    it("creates report and uploads photos successfully", async () => {
      vi.spyOn(apiClient, "createReport").mockResolvedValue(mockReport);
      vi.spyOn(apiClient, "uploadReportMedia").mockResolvedValue(mockReport.media![0]);

      render(
        <AuthProvider>
          <CreateReportPage />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText("Buat Laporan Lingkungan Baru")).toBeDefined();
      });

      // Fill title, description, address
      fireEvent.change(screen.getByLabelText(/Judul Laporan/i), {
        target: { value: "Tumpukan Sampah Menumpuk di Sungai" },
      });
      fireEvent.change(screen.getByLabelText(/Deskripsi Masalah/i), {
        target: { value: "Ada tumpukan sampah plastik yang menyumbat aliran sungai di dekat jembatan panjang." },
      });
      fireEvent.change(screen.getByLabelText(/Alamat Lengkap \/ Patokan Lokasi/i), {
        target: { value: "Jl. Sudirman No. 12, Jakarta Pusat" },
      });

      // Advance to step 2
      fireEvent.click(screen.getByRole("button", { name: /Lanjut ke Pratinjau/i }));

      await waitFor(() => {
        expect(screen.getByText("Pratinjau & Konfirmasi Laporan")).toBeDefined();
        expect(screen.getAllByText("Tumpukan Sampah Menumpuk di Sungai").length).toBeGreaterThan(0);
      });

      // Submit
      const submitButton = screen.getByRole("button", { name: /Kirim Laporan Resmi/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(apiClient.createReport).toHaveBeenCalledWith(
          expect.objectContaining({
            category_id: 1,
            title: "Tumpukan Sampah Menumpuk di Sungai",
            description: "Ada tumpukan sampah plastik yang menyumbat aliran sungai di dekat jembatan panjang.",
            location: expect.objectContaining({
              address: "Jl. Sudirman No. 12, Jakarta Pusat",
            }),
          })
        );
        expect(mockPush).toHaveBeenCalledWith("/reports/101?created=1");
      });
    });
  });

  describe("ReportFeedPage", () => {
    it("renders report feed with filters and cards", async () => {
      vi.spyOn(apiClient, "getReports").mockResolvedValue({
        data: [mockReport],
        meta: { current_page: 1, last_page: 1, per_page: 15, total: 1 },
      });

      render(
        <AuthProvider>
          <ReportFeedPage />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText("Feed Laporan Lingkungan")).toBeDefined();
        expect(screen.getByText("Tumpukan Sampah Menumpuk di Sungai")).toBeDefined();
        expect(screen.getByText("Jl. Sudirman No. 12, Jakarta Pusat")).toBeDefined();
        expect(screen.getAllByText("Menunggu").length).toBeGreaterThan(0);
      });
    });

    it("displays empty state when no reports found", async () => {
      vi.spyOn(apiClient, "getReports").mockResolvedValue({
        data: [],
        meta: { current_page: 1, last_page: 1, per_page: 15, total: 0 },
      });

      render(
        <AuthProvider>
          <ReportFeedPage />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText("Belum Ada Laporan yang Cocok")).toBeDefined();
      });
    });
  });

  describe("ReportDetailPage", () => {
    it("renders report details, location, status, and AI analysis", async () => {
      vi.spyOn(apiClient, "getReport").mockResolvedValue(mockReport);

      render(
        <AuthProvider>
          <ReportDetailPage />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByRole("heading", { level: 1, name: "Tumpukan Sampah Menumpuk di Sungai" })).toBeDefined();
        expect(screen.getByText("Jl. Sudirman No. 12, Jakarta Pusat")).toBeDefined();
        expect(screen.getByText("Analisis Dampak Lingkungan (AI Assessment)")).toBeDefined();
        expect(screen.getByText("Penyumbatan parah dengan potensi banjir saat hujan deras.")).toBeDefined();
        expect(screen.getByText(/Tinggi/)).toBeDefined();
      });
    });

    it("displays error state when report is not found", async () => {
      vi.spyOn(apiClient, "getReport").mockRejectedValue(new ApiError(404, "Laporan tidak ditemukan."));

      render(
        <AuthProvider>
          <ReportDetailPage />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "Laporan Tidak Ditemukan" })).toBeDefined();
        expect(screen.getByText("Laporan tidak ditemukan.")).toBeDefined();
      });
    });
  });
});
