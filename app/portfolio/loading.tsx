export default function Loading() {
  return (
    <div className="min-h-screen">
      {/* Hero Section Skeleton */}
      <div className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
        <div className="container-custom relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            {/* Title Skeleton */}
            <div className="space-y-4">
              <div className="h-12 bg-white/5 rounded-lg animate-pulse mx-auto max-w-xl" />
              <div className="h-12 bg-white/5 rounded-lg animate-pulse mx-auto max-w-md" />
            </div>
            
            {/* Description Skeleton */}
            <div className="space-y-3 pt-4">
              <div className="h-6 bg-white/5 rounded-lg animate-pulse mx-auto max-w-3xl" />
              <div className="h-6 bg-white/5 rounded-lg animate-pulse mx-auto max-w-2xl" />
            </div>

            {/* CTA Button Skeleton */}
            <div className="pt-8">
              <div className="h-12 w-48 bg-white/5 rounded-lg animate-pulse mx-auto" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Section Skeleton */}
      <div className="container-custom pb-12">
        <div className="flex gap-4 overflow-x-auto pb-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 w-32 bg-white/5 rounded-lg animate-pulse flex-shrink-0" />
          ))}
        </div>
      </div>

      {/* Featured Projects Skeleton */}
      <div className="container-custom pb-20">
        <div className="mb-12">
          <div className="h-8 w-56 bg-white/5 rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-96 bg-white/5 rounded-lg animate-pulse" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden animate-pulse">
              {/* Image Skeleton */}
              <div className="aspect-video bg-white/10" />
              
              {/* Content */}
              <div className="p-8">
                {/* Badge */}
                <div className="h-6 w-24 bg-white/10 rounded-full mb-4" />
                
                {/* Title */}
                <div className="h-8 bg-white/10 rounded-lg mb-4" />
                
                {/* Description */}
                <div className="space-y-2 mb-6">
                  <div className="h-4 bg-white/10 rounded-lg" />
                  <div className="h-4 bg-white/10 rounded-lg" />
                  <div className="h-4 bg-white/10 rounded-lg w-3/4" />
                </div>
                
                {/* Tags */}
                <div className="flex gap-2 mb-6">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="h-6 w-20 bg-white/10 rounded-full" />
                  ))}
                </div>
                
                {/* Button */}
                <div className="h-10 bg-white/10 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Regular Projects Grid Skeleton */}
      <div className="container-custom pb-20">
        <div className="h-8 w-48 bg-white/5 rounded-lg animate-pulse mb-12" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden animate-pulse">
              {/* Image */}
              <div className="aspect-video bg-white/10" />
              
              {/* Content */}
              <div className="p-6">
                <div className="h-6 bg-white/10 rounded-lg mb-3" />
                <div className="space-y-2 mb-4">
                  <div className="h-3 bg-white/10 rounded-lg" />
                  <div className="h-3 bg-white/10 rounded-lg w-5/6" />
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-5 w-16 bg-white/10 rounded-full" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section Skeleton */}
      <div className="container-custom pb-20">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-16 text-center animate-pulse">
          <div className="h-10 bg-white/10 rounded-lg mx-auto max-w-2xl mb-6" />
          <div className="h-6 bg-white/10 rounded-lg mx-auto max-w-xl mb-8" />
          <div className="flex gap-4 justify-center">
            <div className="h-12 w-48 bg-white/10 rounded-lg" />
            <div className="h-12 w-32 bg-white/10 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
