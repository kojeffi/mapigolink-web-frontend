export default function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-gray-200 rounded-lg" />
          <div className="h-4 w-64 bg-gray-100 rounded" />
        </div>
        <div className="h-10 w-32 bg-gray-200 rounded-lg" />
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-20 bg-gray-200 rounded" />
              <div className="h-7 w-16 bg-gray-200 rounded" />
              <div className="h-3 w-24 bg-gray-100 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Chart skeleton */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="card xl:col-span-2 h-64 flex items-end gap-2 p-6">
          {[40, 60, 45, 80, 55, 70, 90, 65, 75, 50, 85, 95].map((h, i) => (
            <div key={i} className="flex-1 bg-gray-200 rounded-t" style={{ height: `${h}%` }} />
          ))}
        </div>
        <div className="card h-64">
          <div className="h-4 w-32 bg-gray-200 rounded mb-4" />
          <div className="flex items-center justify-center h-40">
            <div className="w-32 h-32 rounded-full bg-gray-200" />
          </div>
        </div>
      </div>

      {/* Table skeleton */}
      <div className="table-container">
        <div className="p-4 border-b border-gray-100 flex gap-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded flex-1" />
          ))}
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4 border-b border-gray-50 flex gap-4">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-40 bg-gray-200 rounded" />
              <div className="h-3 w-24 bg-gray-100 rounded" />
            </div>
            <div className="h-4 w-20 bg-gray-200 rounded" />
            <div className="h-4 w-16 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
