"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/lib/api/client";
import { InAppNotification } from "@/lib/api/types";
import {
  IconBell,
  IconCheck,
  IconShield,
  IconMessage,
  IconSparkles,
  IconThumbsUp,
  IconArrowRight,
} from "@/components/ui/icons";
import { formatRelativeTime } from "@/components/reports/report-status-badge";
import { NotificationSkeleton } from "@/components/ui/skeletons";
import { AuthenticatedShell } from "@/components/layout/authenticated-shell";

function getNotificationCategoryMeta(type?: string) {
  switch (type) {
    case "report_status":
    case "government_action":
    case "verified":
    case "resolved":
      return {
        icon: IconShield,
        iconColor: "text-[#225332]",
        bgColor: "bg-[#e2ede4]",
        borderColor: "border-[#c5dcce]",
        badgeLabel: "Tindak Lanjut Instansi",
        isCivic: true,
      };
    case "ai_completed":
    case "ai_assessment":
      return {
        icon: IconSparkles,
        iconColor: "text-[#6d28d9]",
        bgColor: "bg-[#f5f3ff]",
        borderColor: "border-[#ddd6fe]",
        badgeLabel: "Analisis AI",
        isCivic: true,
      };
    case "comment":
    case "comment_reply":
      return {
        icon: IconMessage,
        iconColor: "text-[#1d4ed8]",
        bgColor: "bg-[#eff6ff]",
        borderColor: "border-[#bfdbfe]",
        badgeLabel: "Diskusi Warga",
        isCivic: false,
      };
    case "reaction":
    case "support":
      return {
        icon: IconThumbsUp,
        iconColor: "text-[#b45309]",
        bgColor: "bg-[#fef3c7]",
        borderColor: "border-[#fde68a]",
        badgeLabel: "Dukungan Warga",
        isCivic: false,
      };
    default:
      return {
        icon: IconBell,
        iconColor: "text-[#225332]",
        bgColor: "bg-[#f2f7f3]",
        borderColor: "border-[#e2e6df]",
        badgeLabel: "Pemberitahuan",
        isCivic: false,
      };
  }
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  useEffect(() => {
    let mounted = true;

    getNotifications()
      .then((res) => {
        if (mounted) {
          setNotifications(res.data);
          setUnreadCount(res.meta.unread_count || 0);
          setError("");
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Gagal memuat daftar notifikasi.");
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [reloadTrigger]);

  const handleMarkAllRead = async () => {
    if (isMarkingAll || unreadCount === 0) return;
    setIsMarkingAll(true);

    const prevNotifications = [...notifications];
    const prevUnreadCount = unreadCount;

    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
    );
    setUnreadCount(0);

    try {
      await markAllNotificationsAsRead();
    } catch {
      // Rollback on error
      setNotifications(prevNotifications);
      setUnreadCount(prevUnreadCount);
      setError("Gagal memperbarui status notifikasi. Silakan coba lagi.");
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleNotificationClick = async (notif: InAppNotification) => {
    if (!notif.is_read) {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notif.id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
        )
      );
      setUnreadCount((c) => Math.max(0, c - 1));

      try {
        await markNotificationAsRead(notif.id);
      } catch {
        // Rollback silently on click error
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, is_read: false } : n))
        );
        setUnreadCount((c) => c + 1);
      }
    }
  };

  return (
    <AuthenticatedShell maxWidth="narrow">
      <div className="space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#5c685f]">
          <Link href="/reports" className="hover:text-[#1c241e] transition flex items-center gap-1 font-medium text-[#225332]">
            <span>&larr; Kembali ke Feed Laporan</span>
          </Link>
          <span>/</span>
          <span className="text-[#1c241e] font-semibold">
            Pusat Notifikasi
          </span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <IconBell className="h-6 w-6 text-[#225332]" />
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1c241e]">
                Pusat Notifikasi
              </h1>
              {unreadCount > 0 && (
                <span className="text-xs rounded-full bg-[#fee2e2] text-[#b91c1c] border border-[#fecaca] px-2.5 py-0.5 font-bold">
                  {unreadCount} baru
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-[#5c685f]">
              Pembaruan terkini terkait status penanganan laporan, tindak lanjut instansi, dan partisipasi warga.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={isMarkingAll}
              className="self-start sm:self-auto inline-flex items-center gap-1.5 rounded-xl border border-[#c5dcce] bg-white px-3.5 py-2 text-xs font-semibold text-[#225332] hover:bg-[#f2f7f3] transition active:scale-[0.98] shadow-xs disabled:opacity-50"
            >
              <IconCheck className="h-3.5 w-3.5 text-[#225332]" />
              <span>{isMarkingAll ? "Memproses..." : "Tandai Semua Dibaca"}</span>
            </button>
          )}
        </div>

        {/* Error Alert with Retry */}
        {error && (
          <div className="rounded-xl border border-[#fecaca] bg-[#fee2e2] p-4 text-xs text-[#b91c1c] flex items-center justify-between gap-3">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setReloadTrigger((prev) => prev + 1)}
              className="font-semibold underline hover:opacity-80 shrink-0"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Notifications Stream */}
        {loading ? (
          <div className="space-y-3" aria-busy="true" aria-label="Memuat notifikasi...">
            <NotificationSkeleton />
            <NotificationSkeleton />
            <NotificationSkeleton />
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-2xl border border-[#e2e6df] bg-white p-10 sm:p-12 text-center space-y-3 shadow-xs">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f2f7f3] text-[#225332] mx-auto">
              <IconBell className="h-6 w-6" />
            </div>
            <h2 className="text-base font-bold text-[#1c241e]">Tidak Ada Notifikasi</h2>
            <p className="text-xs text-[#5c685f] max-w-sm mx-auto leading-relaxed">
              Saat ada perkembangan laporan, tindak lanjut dinas terkait, atau interaksi warga pada laporan Anda, pembaruan akan muncul di sini.
            </p>
            <div className="pt-2">
              <Link
                href="/reports"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#225332] px-4 py-2 text-xs font-semibold text-white hover:bg-[#173722] transition shadow-xs"
              >
                <span>Jelajahi Feed Laporan</span>
                <IconArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-[#e2e6df] bg-white divide-y divide-[#edf0ea] overflow-hidden shadow-xs">
            {notifications.map((notif) => {
              const targetUrl = notif.link || "/reports";
              const meta = getNotificationCategoryMeta(notif.type);
              const CategoryIcon = meta.icon;

              return (
                <Link
                  key={notif.id}
                  href={targetUrl}
                  onClick={() => handleNotificationClick(notif)}
                  className={`flex items-start gap-3.5 p-4 sm:p-5 transition group ${
                    notif.is_read
                      ? "bg-white hover:bg-[#fafaf7]"
                      : "bg-[#f2f7f3]/70 hover:bg-[#e2ede4]/60 border-l-4 border-l-[#225332]"
                  }`}
                >
                  {/* Category Accent Icon */}
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl shrink-0 border ${meta.bgColor} ${meta.borderColor} ${meta.iconColor}`}
                    aria-hidden="true"
                  >
                    <CategoryIcon className="h-4 w-4" />
                  </div>

                  {/* Notification Content Body */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#5c685f] bg-[#f4f5f0] border border-[#e2e6df] px-2 py-0.2 rounded-full">
                          {meta.badgeLabel}
                        </span>
                        <h2 className={`text-xs sm:text-sm truncate max-w-sm sm:max-w-md ${
                          notif.is_read ? "font-semibold text-[#1c241e]" : "font-bold text-[#173722]"
                        }`}>
                          {notif.title || "Pemberitahuan Laporan"}
                        </h2>
                      </div>

                      {/* Relative Timestamp */}
                      <span className="text-[11px] text-[#8c978f] shrink-0 font-medium">
                        {formatRelativeTime(notif.created_at)}
                      </span>
                    </div>

                    <p className={`text-xs leading-relaxed ${
                      notif.is_read ? "text-[#5c685f]" : "text-[#1c241e]"
                    }`}>
                      {notif.message || "Ada perkembangan terbaru mengenai aktivitas laporan Anda."}
                    </p>
                  </div>

                  {/* Unread dot indicator */}
                  {!notif.is_read && (
                    <span
                      className="h-2 w-2 rounded-full bg-[#225332] shrink-0 mt-2"
                      title="Belum dibaca"
                    />
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AuthenticatedShell>
  );
}
