import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

const ThreadViewSkeleton = () => (
  <>
    {/* Header Skeleton */}
    <div className="sticky top-12 bg-white border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/90 p-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
        {/* Left Side */}
        <div className="flex-1 min-w-0 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="h-6 w-24 rounded" />
            <Skeleton className="h-6 w-20 rounded" />
            <Skeleton className="h-4 w-32 rounded" />
          </div>
          <Skeleton className="h-8 w-2/3 rounded mb-2" />
          <div className="flex flex-col space-y-2 mt-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-20 rounded" />
              <div className="flex flex-wrap gap-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-6 w-20 rounded-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* Right Side */}
        <div className="md:w-1/2 flex flex-col gap-2 min-w-0">
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-2/3 rounded" />
        </div>
      </div>
    </div>
    <div className="flex flex-col flex-1 justify-center min-h-[calc(100vh-50px)] bg-background">
      {/* Message Skeletons */}
      <div className="px-2 py-4">
        <div className="flex mb-2">
          <Skeleton className="h-12 w-1/3 max-w-lg rounded-lg" />
        </div>
        <div className="flex justify-end mb-2">
          <Skeleton className="h-12 w-1/3 max-w-lg rounded-lg" />
        </div>
        <div className="flex justify-end mb-2">
          <Skeleton className="h-12 w-1/3 max-w-lg rounded-lg" />
        </div>
        <div className="flex mb-2">
          <Skeleton className="h-12 w-1/3 max-w-lg rounded-lg" />
        </div>
        <div className="flex justify-end mb-2">
          <Skeleton className="h-12 w-1/3 max-w-lg rounded-lg" />
        </div>
      </div>
    </div>
  </>
);

export default ThreadViewSkeleton;
