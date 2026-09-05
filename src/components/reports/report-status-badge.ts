export interface StatusBadgeMeta {
  label: string;
  bg: string;
  dot?: string;
}

export function getStatusBadge(status?: string | null): StatusBadgeMeta {
  switch (status?.toLowerCase()) {
    case "closed":
    case "ditutup":
      return {
        label: "Ditutup Resmi",
        bg: "bg-[#f4f5f0] text-[#5c685f] border-[#e2e6df]",
        dot: "bg-[#5c685f]",
      };
    case "resolved":
    case "selesai":
      return {
        label: "Selesai",
        bg: "bg-[#edf7ed] text-[#15803d] border-[#bbf7d0]",
        dot: "bg-[#15803d]",
      };
    case "in_progress":
    case "ditindaklanjuti":
      return {
        label: "Ditindaklanjuti",
        bg: "bg-[#f5f3ff] text-[#6d28d9] border-[#ddd6fe]",
        dot: "bg-[#6d28d9]",
      };
    case "verified":
    case "terverifikasi":
      return {
        label: "Terverifikasi",
        bg: "bg-[#f0fdfa] text-[#0f766e] border-[#99f6e4]",
        dot: "bg-[#0f766e]",
      };
    case "under_review":
    case "diproses":
      return {
        label: "Peninjauan",
        bg: "bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]",
        dot: "bg-[#1d4ed8]",
      };
    case "rejected":
    case "ditolak":
      return {
        label: "Ditolak",
        bg: "bg-[#fee2e2] text-[#b91c1c] border-[#fecaca]",
        dot: "bg-[#b91c1c]",
      };
    case "pending":
    default:
      return {
        label: "Menunggu",
        bg: "bg-[#fef3c7] text-[#b45309] border-[#fde68a]",
        dot: "bg-[#b45309]",
      };
  }
}

export interface SeverityBadgeMeta {
  label: string;
  bg: string;
}

export function getSeverityBadge(severity?: string | null): SeverityBadgeMeta {
  switch (severity?.toLowerCase()) {
    case "critical":
      return { label: "Kritis", bg: "bg-[#fee2e2] text-[#b91c1c] border-[#fecaca]" };
    case "high":
      return { label: "Tinggi", bg: "bg-[#ffedd5] text-[#c2410c] border-[#fed7aa]" };
    case "medium":
      return { label: "Sedang", bg: "bg-[#fef3c7] text-[#b45309] border-[#fde68a]" };
    case "low":
    default:
      return { label: "Rendah", bg: "bg-[#edf7ed] text-[#15803d] border-[#bbf7d0]" };
  }
}

export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return "Baru saja";
    if (diffMin < 60) return `${diffMin}m lalu`;
    if (diffHour < 24) return `${diffHour}j lalu`;
    if (diffDay === 1) return "Kemarin";
    if (diffDay < 7) return `${diffDay}h lalu`;

    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  } catch {
    return dateString;
  }
}
