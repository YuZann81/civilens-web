"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/lib/api/client";
import { InAppNotification } from "@/lib/api/types";
import { IconBell, IconCheck } from "@/components/ui/icons";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = () => {
    getNotifications()
      .then((res) => {
        setNotifications(res.data);
        setUnreadCount(res.meta.unread_count || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true, read_at: new Date().toISOString() })));
      setUnreadCount(0);
    } catch {
      // Ignored
    }
  };

  const handleNotificationClick = async (notif: InAppNotification) => {
    if (!notif.is_read) {
      try {
        await markNotificationAsRead(notif.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch {
        // Ignored
      }
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#fafaf5] text-[#2c2926]">
      {/* Top Header */}
      <header className="border-b border-[#eae2d3] bg-[#fafaf5]/90 backdrop-blur-xs sticky top-0 z-20">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-85">
            <div className="h-6 w-6 rounded-full bg-[#1e4d2b] text-white flex items-center justify-center text-xs font-bold font-serif">
              C
            </div>
            <span className="text-lg font-bold tracking-tight text-[#1c4123]" style={{ fontFamily: "Georgia, serif" }}>
              CiviLens
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/reports" className="text-xs font-semibold text-[#4a6b52] hover:text-[#1e4d2b] transition">
              Semua Laporan
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <IconBell className="h-6 w-6 text-[#1e4d2b]" />
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17361d]" style={{ fontFamily: "Georgia, serif" }}>
                Pusat Notifikasi {unreadCount > 0 && <span className="text-xs rounded-full bg-red-600 text-white px-2 py-0.5 ml-1">{unreadCount} baru</span>}
              </h1>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#cbe0ce] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#1e4d2b] hover:bg-[#f4f8f4] transition shadow-xs"
              >
                <IconCheck className="h-3.5 w-3.5" />
                <span>Tandai Semua Dibaca</span>
              </button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-16 text-xs text-[#7a9a80]">Memuat notifikasi...</div>
          ) : notifications.length === 0 ? (
            <div className="rounded-2xl border border-[#eae2d3] bg-white p-12 text-center space-y-3 shadow-xs">
              <p className="text-base font-semibold text-[#1c4123]">Tidak Ada Notifikasi</p>
              <p className="text-xs text-[#7a9a80] max-w-md mx-auto">
                Anda akan menerima pembaruan di sini ketika ada respon resmi, komentar, atau perubahan status pada laporan yang Anda buat atau ikuti.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notif) => {
                const linkHref = notif.link || "/reports";

                return (
                  <Link
                    key={notif.id}
                    href={linkHref}
                    onClick={() => handleNotificationClick(notif)}
                    className={`block p-4 rounded-xl border transition shadow-xs ${
                      !notif.is_read
                        ? "bg-[#f4f8f4] border-[#cbe0ce] hover:border-[#1e4d2b]"
                        : "bg-white border-[#eae2d3] hover:border-[#c8dfc8]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {!notif.is_read && <span className="h-2 w-2 rounded-full bg-[#1e4d2b]" />}
                          <h2 className="text-xs sm:text-sm font-bold text-[#1c4123]">{notif.title}</h2>
                        </div>
                        <p className="text-xs text-[#57524d] leading-relaxed">{notif.message}</p>
                      </div>
                      <span className="text-[10px] text-[#8c857e] shrink-0 font-mono">
                        {new Date(notif.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-[#eae2d3] py-6 text-center text-xs text-[#8c857e] mt-auto">
        <div className="mx-auto max-w-3xl px-6">
          CiviLens &bull; Platform Pelaporan Lingkungan Warga
        </div>
      </footer>
    </div>
  );
}
