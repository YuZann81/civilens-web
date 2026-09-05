import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import CreateReportPage from "../create/page";
import ReportFeedPage from "../page";
import ReportDetailPage from "../[id]/page";
import { AuthProvider } from "@/lib/auth/auth-context";
import * as apiClient from "@/lib/api/client";
import { Topic, Report } from "@/lib/api/types";

// Mock router & searchParams
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => "/reports",
  useParams: () => ({
    id: "101",
  }),
  useSearchParams: () => ({
    get: (key: string) => (key === "created" ? null : null),
  }),
}));

const mockTopics: Topic[] = [
  { id: 1, name: "Sampah", slug: "sampah", is_official: true, reports_count: 5 },
  { id: 2, name: "Polusi Air", slug: "polusi-air", is_official: true, reports_count: 3 },
  { id: 3, name: "Banjir", slug: "banjir", is_official: false, reports_count: 2 },
];

const mockReport: Report = {
  id: 101,
  title: "Tumpukan Sampah Menumpuk di Sungai",
  description: "Ada tumpukan sampah plastik yang menyumbat aliran sungai di dekat jembatan panjang.",
  status: "pending",
  created_at: "2026-08-31T08:00:00Z",
  updated_at: "2026-08-31T08:00:00Z",
  topics: [mockTopics[0], mockTopics[1]],
  location: {
    address: "Jl. Sudirman No. 12, Jakarta Pusat",
    latitude: -6.2088,
    longitude: 106.8456,
  },
  media: [
    {
      id: 1,
      original_name: "evidence_photo.jpg",
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
    confidence: 0.95,
    completed_at: "2026-08-31T08:05:00Z",
  },
};

describe("TASK-011 Report UX & Dynamic Topic Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(apiClient, "getTopics").mockResolvedValue(mockTopics);
    vi.spyOn(apiClient, "getAuthUser").mockResolvedValue({
      id: 1,
      name: "Budi Santoso",
      email: "budi@example.com",
      role: "citizen",
      status: "active",
      email_verified_at: "2026-08-30T00:00:00Z",
    });
  });

  describe("CreateReportPage 2-Step Flow", () => {
    it("validates evidence photos and location before advancing to details", async () => {
      render(
        <AuthProvider>
          <CreateReportPage />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText("1. Bukti & Lokasi")).toBeDefined();
      });

      const nextButton = screen.getByRole("button", { name: /Lanjut: Detail Masalah & Review/i });
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText("Wajib menyertakan minimal 1 foto bukti kondisi lingkungan.")).toBeDefined();
      });
    });

    it("advances through evidence & location, details, and submits report successfully", async () => {
      vi.spyOn(apiClient, "createReport").mockResolvedValue(mockReport);
      vi.spyOn(apiClient, "uploadReportMedia").mockResolvedValue(mockReport.media![0]);

      // Mock URL.createObjectURL for JSDOM
      window.URL.createObjectURL = vi.fn(() => "blob:http://localhost/fake-img");
      window.URL.revokeObjectURL = vi.fn();

      render(
        <AuthProvider>
          <CreateReportPage />
        </AuthProvider>
      );

      // --- STEP 1: Evidence & Location ---
      await waitFor(() => {
        expect(screen.getByText("1. Bukti & Lokasi")).toBeDefined();
      });

      // Attach 1 photo
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const fakeFile = new File(["fake_content"], "evidence.jpg", { type: "image/jpeg" });
      fireEvent.change(fileInput, { target: { files: [fakeFile] } });

      await waitFor(() => {
        expect(screen.getByText(/1\/3 Foto/i)).toBeDefined();
      });

      // Address landmark input
      const addressInput = screen.getByLabelText(/Alamat \/ Patokan Lokasi Lengkap/i);
      fireEvent.change(addressInput, { target: { value: "Jl. Sudirman No. 12, Jakarta Pusat" } });

      const nextToDetails = screen.getByRole("button", { name: /Lanjut: Detail Masalah & Review/i });
      fireEvent.click(nextToDetails);

      // --- STEP 2: Details & Review ---
      await waitFor(() => {
        expect(screen.getByText("2. Detail Masalah & Kirim")).toBeDefined();
        expect(screen.getByLabelText(/Judul Laporan/i)).toBeDefined();
      });

      fireEvent.change(screen.getByLabelText(/Judul Laporan/i), {
        target: { value: "Tumpukan Sampah Menumpuk di Sungai" },
      });
      fireEvent.change(screen.getByLabelText(/Deskripsi Lengkap Masalah/i), {
        target: { value: "Ada tumpukan sampah plastik yang menyumbat aliran sungai di dekat jembatan panjang." },
      });

      // Select existing topic chip #Sampah
      fireEvent.click(screen.getByText(/#Sampah/));

      // Create a custom dynamic topic tag #LimbahPlastik
      const topicInput = screen.getByPlaceholderText(/Ketik topik baru atau cari/i);
      fireEvent.change(topicInput, { target: { value: "LimbahPlastik" } });
      fireEvent.keyDown(topicInput, { key: "Enter", code: "Enter" });

      await waitFor(() => {
        expect(screen.getByText("#LimbahPlastik")).toBeDefined();
      });

      // Submit
      const submitBtn = screen.getAllByRole("button", { name: /Kirim Laporan Resmi/i })[0];
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(apiClient.createReport).toHaveBeenCalledWith({
          title: "Tumpukan Sampah Menumpuk di Sungai",
          description: "Ada tumpukan sampah plastik yang menyumbat aliran sungai di dekat jembatan panjang.",
          topics: ["Sampah", "LimbahPlastik"],
          location: {
            address: "Jl. Sudirman No. 12, Jakarta Pusat",
            latitude: null,
            longitude: null,
          },
        });
        expect(mockPush).toHaveBeenCalledWith("/reports/101?created=1");
      });
    });
  });

  describe("ReportFeedPage", () => {
    it("renders report feed with topic badges and topic filters", async () => {
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
        expect(screen.getAllByText(/#Sampah/).length).toBeGreaterThan(0);
        expect(screen.getByText("Jl. Sudirman No. 12, Jakarta Pusat")).toBeDefined();
      });
    });
  });

  describe("ReportDetailPage", () => {
    it("renders report details, topic chips, and AI analysis in completed state", async () => {
      vi.spyOn(apiClient, "getReport").mockResolvedValue(mockReport);

      render(
        <AuthProvider>
          <ReportDetailPage />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByRole("heading", { level: 1, name: "Tumpukan Sampah Menumpuk di Sungai" })).toBeDefined();
        expect(screen.getByText("#Sampah")).toBeDefined();
        expect(screen.getByText("Analisis Dampak Lingkungan (AI Assessment)")).toBeDefined();
        expect(screen.getByText("Penyumbatan parah dengan potensi banjir saat hujan deras.")).toBeDefined();
        expect(screen.getByText(/Tinggi/)).toBeDefined();
      });
    });

    it("renders pending / processing AI analysis state gracefully", async () => {
      const pendingReport: Report = {
        ...mockReport,
        ai_analysis: {
          id: 1,
          status: "processing",
        },
      };

      vi.spyOn(apiClient, "getReport").mockResolvedValue(pendingReport);

      render(
        <AuthProvider>
          <ReportDetailPage />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/Analisis AI sedang diproses secara asinkron/i)).toBeDefined();
      });
    });

    it("renders failed AI state with retry button and triggers retry", async () => {
      const failedReport: Report = {
        ...mockReport,
        ai_analysis: {
          id: 1,
          status: "failed",
        },
      };

      vi.spyOn(apiClient, "getReport").mockResolvedValue(failedReport);
      vi.spyOn(apiClient, "retryReportAiAnalysis").mockResolvedValue({
        ...mockReport,
        ai_analysis: { id: 2, status: "pending" },
      });

      render(
        <AuthProvider>
          <ReportDetailPage />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/Analisis AI otomatis belum berhasil diselesaikan/i)).toBeDefined();
        expect(screen.getByRole("button", { name: /Ulangi Analisis AI/i })).toBeDefined();
      });

      fireEvent.click(screen.getByRole("button", { name: /Ulangi Analisis AI/i }));

      await waitFor(() => {
        expect(apiClient.retryReportAiAnalysis).toHaveBeenCalledWith("101");
      });
    });
  });
});
