import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CiviLens — Community Environmental Issue Platform",
  description:
    "A transparent community platform connecting citizens, AI analysis, and government action to resolve environmental challenges.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased bg-[#faf8f5] text-[#2c2926]">
        {children}
      </body>
    </html>
  );
}
