import React from "react";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className = "", ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-lg bg-[#eae3d5]/70 ${className}`}
      {...props}
    />
  );
}

export function FeedReportSkeleton() {
  return (
    <article
      aria-busy="true"
      aria-label="Memuat laporan..."
      className="rounded-2xl border border-[#eae2d3] bg-white p-5 sm:p-6 shadow-xs space-y-4"
    >
      {/* Header author + status */}
      <div className="flex items-start justify-between gap-3 border-b border-[#f2ede4] pb-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-full shrink-0" />
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>

      {/* Title & description */}
      <div className="space-y-2">
        <Skeleton className="h-5 w-3/4 rounded-md" />
        <Skeleton className="h-3.5 w-full rounded-md" />
        <Skeleton className="h-3.5 w-5/6 rounded-md" />
      </div>

      {/* Media placeholder */}
      <Skeleton className="h-44 sm:h-52 w-full rounded-xl" />

      {/* Topic chips */}
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>

      {/* Analisis CiviLens box */}
      <div className="rounded-xl border border-[#d6e4d4] bg-[#f4f7f2] p-4 space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-16 rounded-sm" />
        </div>
        <Skeleton className="h-3.5 w-full" />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-[#f2ede4] pt-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-14 rounded-lg" />
          <Skeleton className="h-7 w-14 rounded-lg" />
          <Skeleton className="h-7 w-8 rounded-lg" />
        </div>
        <Skeleton className="h-4 w-24" />
      </div>
    </article>
  );
}

export function TrendingWidgetSkeleton() {
  return (
    <div aria-hidden="true" className="space-y-2">
      <Skeleton className="h-10 w-full rounded-xl" />
      <Skeleton className="h-10 w-full rounded-xl" />
      <Skeleton className="h-10 w-full rounded-xl" />
      <Skeleton className="h-10 w-full rounded-xl" />
    </div>
  );
}

export function CommentSkeleton() {
  return (
    <div aria-hidden="true" className="p-4 rounded-xl border border-[#eae2d3] bg-white space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-3.5 w-24" />
        </div>
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
    </div>
  );
}

export function NotificationSkeleton() {
  return (
    <div aria-hidden="true" className="p-4 rounded-xl border border-[#eae2d3] bg-white space-y-2">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

export function UserProfileSkeleton() {
  return (
    <div aria-busy="true" aria-label="Memuat profil..." className="space-y-6">
      <div className="rounded-2xl border border-[#eae2d3] bg-white p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#f0f4ee] pb-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-14 w-14 rounded-full shrink-0" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <div className="flex gap-2">
                <Skeleton className="h-4 w-20 rounded-full" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-14 w-24 rounded-xl" />
            <Skeleton className="h-14 w-24 rounded-xl" />
          </div>
        </div>

        <div className="space-y-3">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function ReportDetailSkeleton() {
  return (
    <div aria-busy="true" aria-label="Memuat detail laporan..." className="space-y-6">
      <div className="rounded-2xl border border-[#eae2d3] bg-white p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex justify-between border-b border-[#f0f4ee] pb-4">
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="h-6 w-28 rounded-full" />
        </div>

        <div className="space-y-3">
          <Skeleton className="h-8 w-4/5" />
          <div className="flex gap-3">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3.5 w-40" />
          </div>
        </div>

        <div className="flex gap-2 border-t border-[#f0f4ee] pt-3">
          <Skeleton className="h-8 w-28 rounded-xl" />
          <Skeleton className="h-8 w-24 rounded-xl" />
        </div>

        <Skeleton className="h-16 w-full rounded-xl" />

        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-2/3" />
        </div>

        <Skeleton className="h-56 w-full rounded-xl" />
      </div>

      {/* AI Box */}
      <div className="rounded-2xl border border-[#cbe0ce] bg-white p-6 shadow-xs space-y-4">
        <div className="flex justify-between border-b border-[#f0f4ee] pb-3">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  );
}

export function GovernmentDashboardSkeleton() {
  return (
    <div aria-busy="true" aria-label="Memuat dasbor instansi..." className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
      </div>

      {/* Overview Table/List */}
      <div className="rounded-2xl border border-[#eae2d3] bg-white p-6 shadow-xs space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-8 w-32 rounded-xl" />
        </div>
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </div>
  );
}
