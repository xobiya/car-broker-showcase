import React from "react";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className = "", ...props }: SkeletonProps) {
  return (
    <div
      className={`bg-slate-200/90 dark:bg-slate-800/80 rounded-lg skeleton-shimmer ${className}`}
      {...props}
    />
  );
}

export function CarCardSkeleton() {
  return (
    <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 rounded-3xl overflow-hidden flex flex-col shadow-xs">
      {/* Image container shimmer */}
      <div className="h-52 sm:h-56 relative bg-slate-200/80 dark:bg-slate-800/70 skeleton-shimmer overflow-hidden">
        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex gap-1.5 z-10">
          <Skeleton className="w-20 h-5 rounded-full bg-slate-300/80 dark:bg-slate-700/80" />
          <Skeleton className="w-14 h-5 rounded-full bg-slate-300/80 dark:bg-slate-700/80" />
        </div>
        {/* Heart icon placeholder */}
        <div className="absolute top-3 right-3">
          <Skeleton className="w-8 h-8 rounded-full bg-slate-300/80 dark:bg-slate-700/80" />
        </div>
      </div>

      {/* Floating rating pill skeleton */}
      <div className="flex justify-center -mt-3.5 relative z-10">
        <Skeleton className="w-28 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Brand & Model */}
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="w-32 h-5 rounded-md" />
            <Skeleton className="w-12 h-4 rounded-md" />
          </div>

          {/* Subtitle / condition */}
          <Skeleton className="w-48 h-3.5 rounded-md mb-3" />

          {/* Specs grid */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-1.5">
              <Skeleton className="w-4 h-4 rounded-full" />
              <Skeleton className="w-16 h-3 rounded-md" />
            </div>
            <div className="flex items-center gap-1.5">
              <Skeleton className="w-4 h-4 rounded-full" />
              <Skeleton className="w-14 h-3 rounded-md" />
            </div>
            <div className="flex items-center gap-1.5">
              <Skeleton className="w-4 h-4 rounded-full" />
              <Skeleton className="w-16 h-3 rounded-md" />
            </div>
            <div className="flex items-center gap-1.5">
              <Skeleton className="w-4 h-4 rounded-full" />
              <Skeleton className="w-12 h-3 rounded-md" />
            </div>
          </div>
        </div>

        {/* Pricing & Button footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="w-12 h-3 rounded-md" />
            <Skeleton className="w-24 h-6 rounded-md" />
          </div>
          <Skeleton className="w-24 h-9 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function ShowroomSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 pb-20">
      {/* Top Header skeleton */}
      <div className="bg-white dark:bg-[#0E131F] border-b border-slate-200 dark:border-slate-800 py-6 px-4 sm:px-6 md:px-8">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center gap-2">
            <Skeleton className="w-16 h-3.5 rounded-md" />
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <Skeleton className="w-24 h-3.5 rounded-md" />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="w-48 sm:w-64 h-8 rounded-xl" />
              <Skeleton className="w-72 sm:w-96 h-4 rounded-md" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="w-28 h-9 rounded-xl" />
              <Skeleton className="w-28 h-9 rounded-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid + Filter Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar skeleton (hidden on mobile, visible on desktop) */}
          <div className="hidden lg:block w-72 shrink-0 space-y-6">
            <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 space-y-5">
              <div className="flex items-center justify-between">
                <Skeleton className="w-20 h-5 rounded-md" />
                <Skeleton className="w-12 h-3.5 rounded-md" />
              </div>
              <Skeleton className="w-full h-10 rounded-xl" />
              <div className="space-y-2.5">
                <Skeleton className="w-28 h-4 rounded-md" />
                <Skeleton className="w-full h-9 rounded-xl" />
              </div>
              <div className="space-y-2.5">
                <Skeleton className="w-24 h-4 rounded-md" />
                <Skeleton className="w-full h-9 rounded-xl" />
              </div>
              <div className="space-y-2 pt-2">
                <Skeleton className="w-20 h-4 rounded-md" />
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Skeleton className="w-4 h-4 rounded" />
                      <Skeleton className="w-32 h-3.5 rounded" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="flex-1 space-y-6">
            <div className="flex items-center justify-between">
              <Skeleton className="w-36 h-4 rounded-md" />
              <Skeleton className="w-28 h-8 rounded-xl" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <CarCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function VehicleDetailSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 py-6 sm:py-10 px-4 sm:px-6 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Back navigation & breadcrumb */}
        <div className="flex items-center justify-between">
          <Skeleton className="w-32 h-8 rounded-xl" />
          <div className="flex gap-2">
            <Skeleton className="w-9 h-9 rounded-xl" />
            <Skeleton className="w-9 h-9 rounded-xl" />
          </div>
        </div>

        {/* Title & Price Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="w-24 h-6 rounded-full" />
              <Skeleton className="w-20 h-6 rounded-full" />
            </div>
            <Skeleton className="w-64 sm:w-96 h-9 rounded-xl" />
            <Skeleton className="w-48 h-4 rounded-md" />
          </div>
          <div className="space-y-2 lg:text-right">
            <Skeleton className="w-20 h-4 rounded-md ml-auto" />
            <Skeleton className="w-48 h-10 rounded-xl ml-auto" />
            <Skeleton className="w-36 h-4 rounded-md ml-auto" />
          </div>
        </div>

        {/* Main Grid: Gallery + Sticky Info */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Gallery & Details */}
          <div className="lg:col-span-8 space-y-8">
            {/* Hero Image */}
            <div className="w-full h-72 sm:h-96 md:h-[450px] rounded-3xl bg-slate-200/90 dark:bg-slate-800/80 skeleton-shimmer overflow-hidden" />
            
            {/* Thumbnail Gallery Strip */}
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-20 sm:h-24 rounded-2xl bg-slate-200/80 dark:bg-slate-800/70 skeleton-shimmer" />
              ))}
            </div>

            {/* Key Specs Grid */}
            <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
              <Skeleton className="w-40 h-6 rounded-md" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-2">
                    <Skeleton className="w-6 h-6 rounded-full" />
                    <Skeleton className="w-16 h-3 rounded-md" />
                    <Skeleton className="w-24 h-4 rounded-md" />
                  </div>
                ))}
              </div>
            </div>

            {/* Inspection Checklist */}
            <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
              <Skeleton className="w-56 h-6 rounded-md" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                    <Skeleton className="w-5 h-5 rounded-full" />
                    <Skeleton className="w-44 h-4 rounded-md" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Broker & Action Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 space-y-6 sticky top-24">
              <div className="space-y-2">
                <Skeleton className="w-32 h-4 rounded-md" />
                <Skeleton className="w-full h-12 rounded-2xl" />
              </div>

              {/* Broker Profile Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 flex items-center gap-4">
                <Skeleton className="w-14 h-14 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="w-28 h-4 rounded-md" />
                  <Skeleton className="w-20 h-3 rounded-md" />
                  <Skeleton className="w-24 h-3 rounded-md" />
                </div>
              </div>

              {/* Action CTA buttons */}
              <div className="space-y-3 pt-2">
                <Skeleton className="w-full h-12 rounded-xl" />
                <Skeleton className="w-full h-12 rounded-xl" />
                <Skeleton className="w-full h-10 rounded-xl" />
              </div>

              {/* Trust Badges */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <Skeleton className="w-full h-4 rounded-md" />
                <Skeleton className="w-4/5 h-4 rounded-md" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="min-h-[70vh] w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-10 space-y-8 animate-pulse">
      {/* Top Banner shimmer */}
      <div className="w-full h-48 sm:h-64 rounded-3xl bg-slate-200/80 dark:bg-slate-800/70 skeleton-shimmer p-6 sm:p-10 flex flex-col justify-end space-y-3">
        <Skeleton className="w-24 h-6 rounded-full bg-slate-300/80 dark:bg-slate-700/80" />
        <Skeleton className="w-64 sm:w-96 h-8 rounded-xl bg-slate-300/80 dark:bg-slate-700/80" />
        <Skeleton className="w-48 sm:w-72 h-4 rounded-md bg-slate-300/80 dark:bg-slate-700/80" />
      </div>

      {/* Grid of content cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <CarCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
