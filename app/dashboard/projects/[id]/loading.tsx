import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 p-8 text-slate-900">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Skeleton */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-16" />
              <span className="text-slate-200">/</span>
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-5 w-96 rounded-md" />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Member Stack Skeleton */}
            <div className="flex -space-x-2 mr-4 overflow-hidden">
              {[1, 2, 3].map((i) => (
                <Skeleton
                  key={i}
                  className="h-8 w-8 rounded-full ring-2 ring-white"
                />
              ))}
            </div>

            <Skeleton className="h-10 w-24 rounded-lg" />
            <div className="h-6 w-px bg-gray-200 mx-2 hidden sm:block" />
            <Skeleton className="h-10 w-32 rounded-lg" />
            <Skeleton className="h-10 w-36 rounded-lg" />
          </div>
        </header>

        {/* Groups Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden"
            >
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-5">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
                <Skeleton className="h-6 w-3/4 mb-3" />
                <div className="space-y-2 mb-6">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>

                {/* Progress Bar Skeleton */}
                <Skeleton className="w-full h-2 rounded-full mb-2" />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <div className="flex -space-x-2">
                  <Skeleton className="h-6 w-6 rounded-full" />
                </div>
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
