import { Skeleton } from "@/components/ui/skeleton";

export function PropertyGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="container-luxe section-y !pt-10">
      <div className="flex flex-col gap-8 lg:flex-row">
        <Skeleton className="hidden lg:block h-[600px] w-72 shrink-0 rounded-2xl" />

        <div className="min-w-0 flex-1">
          <div className="mb-6 flex items-center justify-between">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-9 w-40" />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-border">
                <Skeleton className="aspect-[4/3] w-full rounded-none" />
                <div className="space-y-3 p-5">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
