import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex dark:bg-neutral-900 relative">
      <div className="flex min-h-svh w-full xl:w-1/2 items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-9 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="grid gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="grid gap-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="grid gap-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="grid gap-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-10 w-full" />
              <div className="mt-4 text-center">
                <Skeleton className="h-4 w-48 mx-auto" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-1/2 hidden xl:flex items-center justify-center">
        <Skeleton className="h-[600px] w-[500px]" />
      </div>
    </div>
  );
}
