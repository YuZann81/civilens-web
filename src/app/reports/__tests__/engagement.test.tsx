import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import ReportDetailPage from "../[id]/page";
import BookmarksPage from "../../bookmarks/page";
import NotificationsPage from "../../notifications/page";
import UserProfilePage from "../../users/[id]/page";
import { AuthProvider } from "@/lib/auth/auth-context";
import * as apiClient from "@/lib/api/client";
import { Report, InAppNotification, UserProfile } from "@/lib/api/types";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/reports",
  useParams: () => ({ id: "101" }),
  useSearchParams: () => ({ get: () => null }),
}));

const mockReport: Report = {
  id: 101,
  title: "Tumpukan Sampah Menumpuk di Sungai",
  description: "Ada tumpukan sampah plastik yang menyumbat aliran sungai di dekat jembatan panjang.",
  status: "pending",
  created_at: "2026-08-31T08:00:00Z",
  updated_at: "2026-08-31T08:00:00Z",
  reactions_count: 5,
  user_reacted: false,
  bookmarks_count: 2,
  user_bookmarked: false,
  comments_count: 1,
  topics: [{ id: 1, name: "Sampah", slug: "sampah" }],
  location: { address: "Jl. Sudirman No. 12, Jakarta Pusat", latitude: -6.2088, longitude: 106.8456 },
  status_histories: [
    {
      id: 1,
      status: "pending",
      notes: "Laporan diterima sistem.",
      actor_role: "system",
      actor_name: "Sistem CiviLens",
      created_at: "2026-08-31T08:00:00Z",
    },
  ],
};

const mockNotification: InAppNotification = {
  id: 1,
  type: "report_status",
  title: "Pembaruan Status Laporan",
  message: "Laporan Anda telah diverifikasi oleh dinas terkait.",
  link: "/reports/101",
  read_at: null,
  is_read: false,
  created_at: "2026-08-31T09:00:00Z",
};

const mockUserProfile: UserProfile = {
  id: 101,
  name: "Budi Santoso",
  role: "citizen",
  status: "active",
  total_reports: 12,
  resolved_reports: 8,
  member_since: "2026-01-01T00:00:00Z",
  recent_reports: [mockReport],
};

describe("TASK-013 Full Civic Product Expansion", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(apiClient, "getAuthUser").mockResolvedValue({
      id: 1,
      name: "Budi Santoso",
      email: "budi@example.com",
      role: "citizen",
      status: "active",
      email_verified_at: "2026-08-30T00:00:00Z",
    });
  });

  it("toggles civic support reaction and bookmark on report detail", async () => {
    vi.spyOn(apiClient, "getReport").mockResolvedValue(mockReport);
    vi.spyOn(apiClient, "getReportComments").mockResolvedValue({
      data: [],
      meta: { current_page: 1, last_page: 1, per_page: 20, total: 0 },
    });
    vi.spyOn(apiClient, "toggleReportReaction").mockResolvedValue({
      reacted: true,
      reactions_count: 6,
    });
    vi.spyOn(apiClient, "toggleReportBookmark").mockResolvedValue({
      bookmarked: true,
      bookmarks_count: 3,
    });

    render(
      <AuthProvider>
        <ReportDetailPage />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Dukung Laporan/i })).toBeDefined();
      expect(screen.getByRole("button", { name: /Simpan/i })).toBeDefined();
    });

    // Click reaction
    fireEvent.click(screen.getByRole("button", { name: /Dukung Laporan/i }));
    await waitFor(() => {
      expect(apiClient.toggleReportReaction).toHaveBeenCalledWith(101, "support");
    });

    // Click bookmark
    fireEvent.click(screen.getByRole("button", { name: /Simpan/i }));
    await waitFor(() => {
      expect(apiClient.toggleReportBookmark).toHaveBeenCalledWith(101);
    });
  });

  it("renders bookmarks list page with saved reports", async () => {
    vi.spyOn(apiClient, "getBookmarks").mockResolvedValue({
      data: [mockReport],
      meta: { current_page: 1, last_page: 1, per_page: 15, total: 1 },
    });

    render(
      <AuthProvider>
        <BookmarksPage />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /Laporan Tersimpan/i })).toBeDefined();
      expect(screen.getByText("Tumpukan Sampah Menumpuk di Sungai")).toBeDefined();
    });
  });

  it("renders notifications center with unread items and marks all read", async () => {
    vi.spyOn(apiClient, "getNotifications").mockResolvedValue({
      data: [mockNotification],
      meta: { current_page: 1, last_page: 1, per_page: 20, total: 1, unread_count: 1 },
    });
    vi.spyOn(apiClient, "markAllNotificationsAsRead").mockResolvedValue();

    render(
      <AuthProvider>
        <NotificationsPage />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /Pusat Notifikasi/i })).toBeDefined();
      expect(screen.getByText("Pembaruan Status Laporan")).toBeDefined();
      expect(screen.getByRole("button", { name: /Tandai Semua Dibaca/i })).toBeDefined();
    });

    fireEvent.click(screen.getByRole("button", { name: /Tandai Semua Dibaca/i }));
    await waitFor(() => {
      expect(apiClient.markAllNotificationsAsRead).toHaveBeenCalled();
    });
  });

  it("renders public user profile with civic statistics and recent reports", async () => {
    vi.spyOn(apiClient, "getUserProfile").mockResolvedValue(mockUserProfile);

    render(
      <AuthProvider>
        <UserProfilePage />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Budi Santoso" })).toBeDefined();
      expect(screen.getByText("12")).toBeDefined(); // Total laporan
      expect(screen.getByText("8")).toBeDefined();  // Resolved reports
      expect(screen.getByText("Tumpukan Sampah Menumpuk di Sungai")).toBeDefined();
    });
  });
});
