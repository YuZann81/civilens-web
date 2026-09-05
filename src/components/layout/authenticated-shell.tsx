"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { AUTH_NAV_ITEMS } from "./navigation-config";
import { IconSearch, IconUser } from "@/components/ui/icons";

interface AuthenticatedShellProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  maxWidth?: "default" | "wide" | "narrow" | "full";
}

export function AuthenticatedShell({
  children,
  showSidebar = true,
  maxWidth = "default",
}: AuthenticatedShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, status, logout } = useAuth();
  const [globalSearch, setGlobalSearch] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (globalSearch.trim()) {
      router.push(`/reports?q=${encodeURIComponent(globalSearch.trim())}`);
    }
  };

  const isNavActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const visibleNavItems = AUTH_NAV_ITEMS.filter((item) => {
    if (item.requiresAuth && !user) return false;
    if (item.requiredRoles && (!user || !item.requiredRoles.includes(user.role))) {
      return false;
    }
    return true;
  });

  const maxWidthClasses = {
    narrow: "max-w-4xl",
    default: "max-w-[1360px]",
    wide: "max-w-7xl",
    full: "max-w-full",
  };

  return (
    <div className="min-h-screen bg-[#fafaf7] text-[#1c241e] flex flex-col pb-20 lg:pb-10">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-[#e2e6df] bg-[#fafaf7]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1360px] items-center justify-between px-4 sm:px-6 py-3">
          <Link href="/reports" className="flex items-center gap-2.5 transition opacity hover:opacity-90">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#225332] text-white font-bold text-sm shadow-xs">
              C
            </div>
            <span className="text-xl font-bold tracking-tight text-[#1c241e]">
              CiviLens
            </span>
          </Link>

          {/* Desktop Search Header */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md mx-6 relative">
            <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8c978f]" />
            <input
              type="text"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="Cari laporan, topik, atau wilayah..."
              className="w-full rounded-full border border-[#e2e6df] bg-white pl-9 pr-4 py-1.5 text-xs text-[#1c241e] placeholder-[#8c978f] outline-none transition focus:border-[#225332] focus:ring-1 focus:ring-[#225332] shadow-2xs"
            />
          </form>

          {/* Right Header User Controls */}
          <div className="flex items-center gap-3">
            <Link
              href="/reports/create"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#225332] px-4 py-2 text-xs font-semibold text-white hover:bg-[#173722] transition duration-150 active:scale-[0.98] shadow-xs"
            >
              <span>+ Buat Laporan</span>
            </Link>

            {status === "authenticated" && user ? (
              <div className="flex items-center gap-2">
                <Link
                  href={`/users/${user.id}`}
                  className="hidden sm:block text-xs font-semibold text-[#1c241e] hover:text-[#225332] transition"
                >
                  {user.name}
                </Link>
                <button
                  type="button"
                  onClick={() => void logout()}
                  className="rounded-lg border border-[#e2e6df] bg-white px-2.5 py-1 text-xs font-semibold text-[#5c685f] hover:bg-[#f4f5f0] transition"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="rounded-lg border border-[#e2e6df] bg-white px-3 py-1.5 text-xs font-semibold text-[#225332] hover:bg-[#f2f7f3] transition"
              >
                Masuk
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Body Area */}
      <div className={`mx-auto w-full ${maxWidthClasses[maxWidth]} px-4 sm:px-6 py-6 flex flex-col lg:flex-row gap-6 items-start flex-1`}>
        {showSidebar && (
          <aside className="hidden lg:block w-[240px] shrink-0 space-y-4">
            <div className="sticky top-20 rounded-2xl border border-[#e2e6df] bg-white p-3.5 shadow-xs space-y-3">
              <nav className="space-y-1 text-xs font-medium" aria-label="Navigasi Samping">
                {visibleNavItems.map((item) => {
                  const active = isNavActive(item.href, item.exact);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition ${
                        active
                          ? "bg-[#f2f7f3] font-semibold text-[#225332] border border-[#c5dcce]"
                          : "text-[#5c685f] hover:bg-[#fafaf7] hover:text-[#1c241e]"
                      }`}
                    >
                      <Icon className={`h-4 w-4 shrink-0 ${active ? "text-[#225332]" : "text-[#8c978f]"}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
                {user && (
                  <Link
                    href={`/users/${user.id}`}
                    className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition ${
                      pathname === `/users/${user.id}`
                        ? "bg-[#f2f7f3] font-semibold text-[#225332] border border-[#c5dcce]"
                        : "text-[#5c685f] hover:bg-[#fafaf7] hover:text-[#1c241e]"
                    }`}
                  >
                    <IconUser className={`h-4 w-4 shrink-0 ${pathname === `/users/${user.id}` ? "text-[#225332]" : "text-[#8c978f]"}`} />
                    <span>Profil Publik</span>
                  </Link>
                )}
              </nav>

              <div className="pt-2 border-t border-[#edf0ea]">
                <Link
                  href="/reports/create"
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-[#225332] py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#173722] transition active:scale-[0.98]"
                >
                  <span>+ Buat Laporan</span>
                </Link>
              </div>
            </div>
          </aside>
        )}

        {/* Dynamic Page Content */}
        <main className="w-full flex-1 min-w-0">{children}</main>
      </div>

      {/* Universal Mobile Bottom Navigation */}
      <nav
        aria-label="Navigasi Bawah Mobile"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-[#e2e6df] bg-[#fafaf7]/95 backdrop-blur-md px-3 py-2 flex items-center justify-around text-[10px] font-medium text-[#5c685f]"
      >
        {visibleNavItems.slice(0, 4).map((item) => {
          const active = isNavActive(item.href, item.exact);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 transition ${
                active ? "font-bold text-[#225332]" : "hover:text-[#1c241e]"
              }`}
            >
              <Icon className={`h-4 w-4 ${active ? "text-[#225332]" : "text-[#8c978f]"}`} />
              <span>{item.shortLabel}</span>
            </Link>
          );
        })}

        {user ? (
          <Link
            href={`/users/${user.id}`}
            className={`flex flex-col items-center gap-0.5 transition ${
              pathname === `/users/${user.id}` ? "font-bold text-[#225332]" : "hover:text-[#1c241e]"
            }`}
          >
            <IconUser className={`h-4 w-4 ${pathname === `/users/${user.id}` ? "text-[#225332]" : "text-[#8c978f]"}`} />
            <span>Profil</span>
          </Link>
        ) : (
          <Link
            href="/login"
            className="flex flex-col items-center gap-0.5 transition hover:text-[#225332]"
          >
            <IconUser className="h-4 w-4 text-[#8c978f]" />
            <span>Masuk</span>
          </Link>
        )}
      </nav>
    </div>
  );
}
