export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="flex items-start">
        {/* Main Content */}
        <div className="flex-1 py-8 pl-8 lg:pl-12 pr-4">
          <div className="max-w-4xl mx-auto">
            {/* Search Bar Skeleton */}
            <div className="w-full h-12 bg-gray-800 rounded-lg animate-pulse mb-8" />

            {/* Profile Header Skeleton */}
            <div className="bg-gray-800 p-6 rounded-lg animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-24 h-24 bg-gray-700 rounded-full" />
                <div className="space-y-3 flex-1">
                  <div className="h-6 bg-gray-700 rounded w-48" />
                  <div className="h-4 bg-gray-700 rounded w-72" />
                </div>
              </div>
            </div>

            {/* Charts Skeleton */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="bg-gray-800 p-6 rounded-lg h-64 animate-pulse"
                >
                  <div className="h-4 bg-gray-700 rounded w-32 mb-4" />
                  <div className="h-48 bg-gray-700 rounded" />
                </div>
              ))}
            </div>

            {/* Market Cap Distribution Skeleton */}
            <div className="mt-8">
              <div className="bg-gray-800 p-6 rounded-lg h-64 animate-pulse">
                <div className="h-4 bg-gray-700 rounded w-48 mb-4" />
                <div className="h-52 bg-gray-700 rounded" />
              </div>
            </div>

            {/* Token Overview Skeleton */}
            <div className="mt-8">
              <div className="bg-gray-800 p-6 rounded-lg animate-pulse">
                <div className="h-4 bg-gray-700 rounded w-40 mb-4" />
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-gray-700 rounded" />
                  ))}
                </div>
              </div>
            </div>

            {/* Influencer Matchmaking Skeleton */}
            <div className="mt-8 mb-8">
              <div className="bg-gray-800 p-6 rounded-lg animate-pulse">
                <div className="h-4 bg-gray-700 rounded w-56 mb-4" />
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-16 bg-gray-700 rounded" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Smart Feed Sidebar Skeleton */}
        <div className="w-[480px] lg:w-[480px] md:w-80 sm:w-72 py-8 pr-8 lg:pr-12 self-start sticky top-8">
          <div className="bg-gray-800 p-6 rounded-lg animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-32 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-20 bg-gray-700 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
