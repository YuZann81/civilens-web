import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import GovernmentDashboardPage from "../../government/page";
import ReportDetailPage from "../[id]/page";
import { AuthProvider } from "@/lib/auth/auth-context";
import * as apiClient from "@/lib/api/client";
import { GovernmentOverviewMetrics, Report, ReportFlag } from "@/lib/api/types";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useParams: () => ({ id: "101" }),
  useSearchParams: () => ({ get: () => null }),
}));

const mockMetrics: GovernmentOverviewMetrics = {
  total_reports: 25,
  pending_reports: 5,
  under_review_reports: 4,
  verified_reports: 3,
  in_progress_reports: 5,
  resolved_reports: 8,
  rejected_reports: 0,
  closed_reports: 0,
  high_priority_count: 3,
  resolution_rate: 32.0,
  severity_breakdown: {
    critical: 2,
    high: 5,
    medium: 10,
    low: 8,
  },
  top_topics: [{ id: 1, name: "Sampah", slug: "sampah", is_official: true, reports_count: 12 }],
};

const mockReport: Report = {
  id: 101,
  title: "Tumpukan Sampah Menumpuk di Sungai",
  description: "Ada tumpukan sampah plastik yang menyumbat aliran sungai di dekat jembatan panjang.",
  status: "under_review",
  created_at: "2026-08-31T08:00:00Z",
  updated_at: "2026-08-31T08:00:00Z",
  topics: [{ id: 1, name: "Sampah", slug: "sampah" }],
  location: { address: "Jl. Sudirman No. 12, Jakarta Pusat", latitude: -6.2088, longitude: 106.8456 },
  ai_analysis: {
    id: 1,
    status: "completed",
    severity: "critical",
    summary: "Penyumbatan parah dengan potensi banjir saat hujan deras.",
    confidence: 0.95,
  },
  status_histories: [
    {
      id: 1,
      status: "pending",
      notes: "Laporan masuk",
      actor_role: "system",
      actor_name: "Sistem CiviLens",
      created_at: "2026-08-31T08:00:00Z",
    },
  ],
};

const mockFlag: ReportFlag = {
  id: 1,
  report_id: 101,
  reason: "spam",
  description: "Iklan pinjol",
  status: "pending",
  reporter: { id: 2, name: "Citizen A" },
  report: { id: 101, title: "Laporan Bermasalah", status: "pending" },
  created_at: "2026-08-31T08:30:00Z",
};

describe("TASK-014 Government + Moderation + Civic Workflow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders government dashboard with metrics overview and report triage queue", async () => {
    vi.spyOn(apiClient, "getAuthUser").mockResolvedValue({
      id: 1,
      name: "Dinas Lingkungan Hidup",
      email: "dlh@gov.id",
      role: "government",
      status: "active",
      email_verified_at: "2026-08-30T00:00:00Z",
    });

    vi.spyOn(apiClient, "getGovernmentAnalytics").mockResolvedValue(mockMetrics);
    vi.spyOn(apiClient, "getReports").mockResolvedValue({
      data: [mockReport],
      meta: { current_page: 1, last_page: 1, per_page: 20, total: 1 },
    });

    render(
      <AuthProvider>
        <GovernmentDashboardPage />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Portal Instansi (government)")).toBeDefined();
      expect(screen.getByText("25")).toBeDefined(); // Total reports
      expect(screen.getByText("32%")).toBeDefined(); // Resolution rate
      expect(screen.getByText("Tumpukan Sampah Menumpuk di Sungai")).toBeDefined();
    });
  });

  it("allows citizen to open flag modal and submit report violation flag", async () => {
    vi.spyOn(apiClient, "getAuthUser").mockResolvedValue({
      id: 2,
      name: "Citizen Budi",
      email: "budi@example.com",
      role: "citizen",
      status: "active",
      email_verified_at: "2026-08-30T00:00:00Z",
    });

    vi.spyOn(apiClient, "getReport").mockResolvedValue({
      ...mockReport,
      author: { id: 99, name: "Other User", role: "citizen" },
    });
    vi.spyOn(apiClient, "getReportComments").mockResolvedValue({
      data: [],
      meta: { current_page: 1, last_page: 1, per_page: 20, total: 0 },
    });
    vi.spyOn(apiClient, "flagReport").mockResolvedValue(mockFlag);

    render(
      <AuthProvider>
        <ReportDetailPage />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Laporkan/i })).toBeDefined();
    });

    // Open flag modal
    fireEvent.click(screen.getByRole("button", { name: /Laporkan/i }));

    await waitFor(() => {
      expect(screen.getByText("Laporkan Pelanggaran Konten")).toBeDefined();
    });

    // Submit flag
    fireEvent.click(screen.getByRole("button", { name: "Kirim Laporan" }));

    await waitFor(() => {
      expect(apiClient.flagReport).toHaveBeenCalledWith(101, "spam", undefined);
    });
  });

  it("allows government official to update status with official note on detail page", async () => {
    vi.spyOn(apiClient, "getAuthUser").mockResolvedValue({
      id: 1,
      name: "Petugas DLH",
      email: "dlh@gov.id",
      role: "government",
      status: "active",
      email_verified_at: "2026-08-30T00:00:00Z",
    });

    vi.spyOn(apiClient, "getReport").mockResolvedValue(mockReport);
    vi.spyOn(apiClient, "getReportComments").mockResolvedValue({
      data: [],
      meta: { current_page: 1, last_page: 1, per_page: 20, total: 0 },
    });
    vi.spyOn(apiClient, "updateReportStatus").mockResolvedValue({
      ...mockReport,
      status: "resolved",
    });

    render(
      <AuthProvider>
        <ReportDetailPage />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Tindakan Resmi Instansi / Verifikasi (Petugas)")).toBeDefined();
      expect(screen.getByRole("button", { name: /Perbarui Status Resmi/i })).toBeDefined();
    });

    fireEvent.click(screen.getByRole("button", { name: /Perbarui Status Resmi/i }));

    await waitFor(() => {
      expect(apiClient.updateReportStatus).toHaveBeenCalledWith(101, "under_review", undefined);
    });
  });
});
