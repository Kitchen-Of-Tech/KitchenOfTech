export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black">
      {/* Header Skeleton */}
      <div className="pt-32 pb-20 md:pt-40 md:pb-32">
        <div className="container-custom">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            {/* Badge Skeleton */}
            <div className="flex justify-center mb-4">
              <div className="h-8 w-48 bg-white/5 rounded-full animate-pulse" />
            </div>
            
            {/* Title Skeleton */}
            <div className="space-y-4">
              <div className="h-12 bg-white/5 rounded-lg animate-pulse mx-auto max-w-2xl" />
              <div className="h-12 bg-white/5 rounded-lg animate-pulse mx-auto max-w-xl" />
            </div>
            
            {/* Description Skeleton */}
            <div className="space-y-3 pt-4">
              <div className="h-6 bg-white/5 rounded-lg animate-pulse mx-auto max-w-3xl" />
              <div className="h-6 bg-white/5 rounded-lg animate-pulse mx-auto max-w-2xl" />
            </div>

            {/* Stats Skeleton */}
            <div className="flex gap-8 justify-center pt-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="text-center">
                  <div className="h-10 w-20 bg-white/5 rounded-lg animate-pulse mx-auto mb-2" />
                  <div className="h-4 w-16 bg-white/5 rounded-lg animate-pulse mx-auto" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="container-custom pb-20">
        {/* Search Bar Skeleton */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="h-14 bg-white/5 rounded-xl animate-pulse" />
        </div>

        {/* Filter Buttons Skeleton */}
        <div className="flex gap-3 mb-12 overflow-x-auto pb-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-10 w-32 bg-white/5 rounded-lg animate-pulse flex-shrink-0" />
          ))}
        </div>

        {/* Cards Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 animate-pulse">
              {/* Image Skeleton */}
              <div className="aspect-video bg-white/10 rounded-xl mb-4" />
              
              {/* Title Skeleton */}
              <div className="h-6 bg-white/10 rounded-lg mb-3 w-3/4" />
              
              {/* Description Skeleton */}
              <div className="space-y-2 mb-4">
                <div className="h-4 bg-white/10 rounded-lg" />
                <div className="h-4 bg-white/10 rounded-lg w-5/6" />
              </div>
              
              {/* Tags Skeleton */}
              <div className="flex gap-2 mb-4">
                <div className="h-6 w-16 bg-white/10 rounded-full" />
                <div className="h-6 w-20 bg-white/10 rounded-full" />
              </div>
              
              {/* Button Skeleton */}
              <div className="h-10 bg-white/10 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
