import React from 'react';

interface EventCardSkeletonProps {
  count?: number;
}

export default function EventCardSkeleton({ count = 8 }: EventCardSkeletonProps) {
  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 animate-pulse"
        >
          {/* Image Skeleton */}
          <div className="h-48 md:h-56 bg-gray-200 relative">
            <div className="absolute top-4 left-4">
              <div className="h-7 w-24 bg-gray-300 rounded-full" />
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="p-5 space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <div className="h-5 bg-gray-200 rounded w-3/4" />
              <div className="h-5 bg-gray-200 rounded w-1/2" />
            </div>

            {/* Venue */}
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded flex-1" />
            </div>

            {/* Date & Time */}
            <div className="flex gap-4">
              <div className="h-4 bg-gray-200 rounded w-24" />
              <div className="h-4 bg-gray-200 rounded w-16" />
            </div>

            {/* Price & Button */}
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="h-3 bg-gray-200 rounded w-12" />
                <div className="h-6 bg-gray-200 rounded w-20" />
              </div>
              <div className="h-10 bg-gray-200 rounded-xl w-32" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
