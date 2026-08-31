import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth/auth-context";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://civilens.razzan.site"),
  title: {
    default: "CiviLens — Platform Pelaporan Masalah Lingkungan & Fasilitas Publik",
    template: "%s | CiviLens",
  },
  description:
    "CiviLens adalah platform keterbukaan sipil berbasis lokasi untuk melaporkan masalah sampah, banjir, jalan rusak, dan polusi dengan bukti foto serta pemantauan tindak lanjut transparan.",
  keywords: [
    "lapor masalah lingkungan",
    "lapor lingkungan",
    "pelaporan lingkungan",
    "laporan masalah lingkungan",
    "lapor sampah",
    "lapor banjir",
    "lapor jalan rusak",
    "lapor polusi",
    "lapor fasilitas umum",
    "pengaduan lingkungan",
    "pengaduan masyarakat",
    "laporan warga",
    "pelaporan warga",
    "masalah lingkungan Indonesia",
  ],
  authors: [{ name: "CiviLens" }],
  creator: "CiviLens",
  publisher: "CiviLens",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "https://civilens.razzan.site",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://civilens.razzan.site",
    siteName: "CiviLens",
    title: "CiviLens — Platform Pelaporan Masalah Lingkungan & Fasilitas Publik",
    description:
      "Laporkan permasalahan sampah, banjir, jalan rusak, dan pencemaran lingkungan di sekitar Anda dengan bukti foto dan lokasi presisi untuk tindak lanjut transparan.",
  },
  twitter: {
    card: "summary_large_image",
    title: "CiviLens — Platform Pelaporan Masalah Lingkungan & Fasilitas Publik",
    description:
      "Laporkan permasalahan sampah, banjir, jalan rusak, dan pencemaran lingkungan di sekitar Anda dengan bukti foto dan lokasi presisi.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://civilens.razzan.site/#website",
        "url": "https://civilens.razzan.site",
        "name": "CiviLens",
        "description": "Platform keterbukaan sipil berbasis lokasi untuk pelaporan masalah lingkungan dan fasilitas publik di Indonesia.",
        "inLanguage": "id-ID",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://civilens.razzan.site/reports?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "Organization",
        "@id": "https://civilens.razzan.site/#organization",
        "name": "CiviLens",
        "url": "https://civilens.razzan.site",
        "logo": "https://civilens.razzan.site/logos/civilens-logo-horizontal.svg",
        "description": "Platform transparansi pelaporan lingkungan dan fasilitas umum partisipatif bagi warga dan pengambil kebijakan."
      }
    ]
  };

  return (
    <html lang="id" className="h-full">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col antialiased bg-[#fafaf5] text-[#2c2926]">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
