import React from "react";
import {
  IconDocument,
  IconCamera,
  IconBookmark,
  IconBell,
  IconShield,
} from "@/components/ui/icons";

export interface NavItemConfig {
  label: string;
  shortLabel: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  requiresAuth?: boolean;
  requiredRoles?: string[];
  exact?: boolean;
}

export const AUTH_NAV_ITEMS: NavItemConfig[] = [
  {
    label: "Feed Utama",
    shortLabel: "Feed",
    href: "/reports",
    icon: IconDocument,
    exact: true,
  },
  {
    label: "Buat Laporan",
    shortLabel: "Lapor",
    href: "/reports/create",
    icon: IconCamera,
  },
  {
    label: "Laporan Tersimpan",
    shortLabel: "Simpan",
    href: "/bookmarks",
    icon: IconBookmark,
    requiresAuth: true,
  },
  {
    label: "Pusat Notifikasi",
    shortLabel: "Notifikasi",
    href: "/notifications",
    icon: IconBell,
    requiresAuth: true,
  },
  {
    label: "Portal Instansi",
    shortLabel: "Instansi",
    href: "/government",
    icon: IconShield,
    requiresAuth: true,
    requiredRoles: ["government", "admin"],
  },
];
