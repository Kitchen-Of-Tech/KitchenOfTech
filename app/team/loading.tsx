export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Hero Section Skeleton */}
      <div className="relative py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            {/* Badge Skeleton */}
            <div className="flex justify-center mb-6">
              <div className="h-8 w-40 bg-white/5 rounded-full animate-pulse" />
            </div>
            
            {/* Title Skeleton */}
            <div className="h-14 bg-white/5 rounded-lg animate-pulse mx-auto max-w-2xl mb-6" />
            
            {/* Description Skeleton */}
            <div className="space-y-3">
              <div className="h-6 bg-white/5 rounded-lg animate-pulse mx-auto max-w-3xl" />
              <div className="h-6 bg-white/5 rounded-lg animate-pulse mx-auto max-w-2xl" />
            </div>
          </div>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 animate-pulse">
                <div className="h-12 w-12 bg-white/10 rounded-xl mb-4 mx-auto" />
                <div className="h-8 bg-white/10 rounded-lg mb-2" />
                <div className="h-4 bg-white/10 rounded-lg" />
              </div>
            ))}
          </div>

          {/* Team Members Grid Skeleton */}
          <div>
            {/* Featured Section */}
            <div className="mb-16">
              <div className="h-8 w-48 bg-white/5 rounded-lg animate-pulse mb-8" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 animate-pulse">
                    {/* Profile Image Skeleton */}
                    <div className="w-32 h-32 bg-white/10 rounded-full mx-auto mb-6" />
                    
                    {/* Name Skeleton */}
                    <div className="h-6 bg-white/10 rounded-lg mb-2" />
                    
                    {/* Role Skeleton */}
                    <div className="h-4 bg-white/10 rounded-lg mb-4 w-2/3 mx-auto" />
                    
                    {/* Bio Skeleton */}
                    <div className="space-y-2 mb-4">
                      <div className="h-3 bg-white/10 rounded-lg" />
                      <div className="h-3 bg-white/10 rounded-lg" />
                      <div className="h-3 bg-white/10 rounded-lg w-5/6" />
                    </div>
                    
                    {/* Skills Skeleton */}
                    <div className="flex gap-2 flex-wrap mb-4">
                      {[1, 2, 3].map((j) => (
                        <div key={j} className="h-6 w-16 bg-white/10 rounded-full" />
                      ))}
                    </div>
                    
                    {/* Button Skeleton */}
                    <div className="h-10 bg-white/10 rounded-lg" />
                  </div>
                ))}
              </div>
            </div>

            {/* Regular Team Section */}
            <div>
              <div className="h-8 w-56 bg-white/5 rounded-lg animate-pulse mb-8" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 animate-pulse">
                    <div className="w-24 h-24 bg-white/10 rounded-full mx-auto mb-4" />
                    <div className="h-5 bg-white/10 rounded-lg mb-2" />
                    <div className="h-3 bg-white/10 rounded-lg w-3/4 mx-auto" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
