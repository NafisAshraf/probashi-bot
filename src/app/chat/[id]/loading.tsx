import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-4 space-y-4">
        {/* Assistant Message */}
        <div className="flex items-start gap-4">
          <Skeleton className="w-8 h-8 rounded-full" /> {/* Avatar */}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-24" /> {/* Name */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        </div>

        {/* User Message */}
        <div className="flex items-start gap-4 justify-end">
          <div className="flex-1 space-y-2 text-right">
            <Skeleton className="h-4 w-24 ml-auto" /> {/* Name */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4 ml-auto" />
              <Skeleton className="h-4 w-1/2 ml-auto" />
            </div>
          </div>
          <Skeleton className="w-8 h-8 rounded-full" /> {/* Avatar */}
        </div>

        {/* Assistant Message */}
        <div className="flex items-start gap-4">
          <Skeleton className="w-8 h-8 rounded-full" /> {/* Avatar */}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-24" /> {/* Name */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
          <div className="flex items-center gap-2 max-w-4xl mx-auto">
            <Skeleton className="flex-1 h-14 rounded-2xl" /> {/* Input */}
            <Skeleton className="w-10 h-10 rounded-full" /> {/* Mic Button */}
            <Skeleton className="w-10 h-10 rounded-full" /> {/* Send Button */}
          </div>
        </div>
      </div>
    </div>
  );
}
