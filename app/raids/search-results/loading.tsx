import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function SearchResultsLoading() {
  return (
    <div className="min-h-screen bg-neutral-900 text-white pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Skeleton className="w-8 h-8" />
          <Skeleton className="h-8 w-64" />
        </div>

        {/* Search Results Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Skeleton className="w-6 h-6" />
            <Skeleton className="h-8 w-80" />
          </div>
          <Skeleton className="h-4 w-48" />
        </div>

        {/* Tabs Skeleton */}
        <div className="mb-6">
          <Skeleton className="h-10 w-96" />
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="bg-neutral-800 border-neutral-600">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <Skeleton className="h-3 w-8" />
                  <Skeleton className="w-4 h-4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 