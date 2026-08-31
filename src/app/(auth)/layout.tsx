import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "CiviLens — Masuk / Daftar",
  description: "Masuk atau buat akun CiviLens untuk melaporkan dan memantau isu warga.",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
