import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function RaidsLoading() {
  return (
    <div className="min-h-screen bg-neutral-900 text-white pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Skeleton */}
        <div className="text-center mb-12">
          <Skeleton className="h-12 w-64 mx-auto mb-4" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>

        {/* Search Section Skeleton */}
        <div className="max-w-2xl mx-auto mb-12">
          <Skeleton className="h-14 w-full" />
        </div>

        {/* Trending Tokens Section Skeleton */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Skeleton className="w-6 h-6" />
            <Skeleton className="h-8 w-48" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="bg-neutral-800 border-neutral-600">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-20 mb-1" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-3 w-full mb-2" />
                  <Skeleton className="h-3 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions Skeleton */}
        <div className="text-center">
          <Skeleton className="h-4 w-80 mx-auto mb-4" />
          <div className="flex flex-wrap justify-center gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-16" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 