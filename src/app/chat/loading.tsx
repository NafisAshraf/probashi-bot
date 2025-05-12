import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full pb-32">
      {/* Welcome Section */}
      <div className="flex flex-col items-center justify-center w-full">
        <div className="flex items-center justify-center mb-6">
          <Skeleton className="w-18 h-18 rounded-full" />
        </div>
        <Skeleton className="h-8 w-64 mb-2" /> {/* Title */}
        <Skeleton className="h-6 w-96 mb-8" /> {/* Subtitle */}
        <div className="hidden xl:flex xl:flex-row gap-6 w-full max-w-4xl justify-center">
          {[1, 2, 3].map((idx) => (
            <div
              key={idx}
              className="flex-1 bg-white dark:bg-zinc-900 rounded-xl shadow-md p-8 flex flex-col items-center text-center"
            >
              <Skeleton className="w-12 h-12 mb-4 rounded-full" /> {/* Icon */}
              <Skeleton className="h-6 w-32 mb-2" /> {/* Card Title */}
              <Skeleton className="h-4 w-48" /> {/* Card Description */}
            </div>
          ))}
        </div>
      </div>
      {/* Input Area */}
      <div className="flex items-center justify-center md:max-w-2xl px-8 md:px-10 lg:px-4 mx-auto mt-12 w-full gap-2">
        <Skeleton className="flex-1 h-14 rounded-2xl" /> {/* Input */}
        <Skeleton className="w-10 h-10 rounded-full" /> {/* Mic Button */}
        <Skeleton className="w-10 h-10 rounded-full" /> {/* Send Button */}
      </div>
    </div>
  );
}
