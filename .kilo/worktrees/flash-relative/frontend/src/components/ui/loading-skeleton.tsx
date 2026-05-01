interface LoadingSkeletonProps {
  className?: string;
}

export function LoadingSkeleton({ className = '' }: LoadingSkeletonProps) {
  return (
    <div 
      className={`animate-pulse bg-gray-200 rounded-lg ${className}`}
      style={{ 
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
      }}
    />
  );
}

export function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="max-w-5xl mx-auto">
        <LoadingSkeleton className="h-64 w-full rounded-b-xl" />
        
        <div className="px-4 sm:px-6 lg:px-8 -mt-16">
          <LoadingSkeleton className="w-32 h-32 rounded-full" />
        </div>
        
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-6">
              <LoadingSkeleton className="h-64 rounded-2xl" />
              <LoadingSkeleton className="h-48 rounded-2xl" />
              <LoadingSkeleton className="h-48 rounded-2xl" />
            </div>
            
            <div className="lg:col-span-2 space-y-4">
              <LoadingSkeleton className="h-20 rounded-2xl" />
              <LoadingSkeleton className="h-64 rounded-2xl" />
              <LoadingSkeleton className="h-64 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
