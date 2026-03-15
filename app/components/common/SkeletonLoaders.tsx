export function PropertyCardSkeleton() {
    return (
        <div className="flex flex-col gap-2 w-full animate-pulse">
            <div className="aspect-square w-full bg-gray-200 rounded-xl"></div>
            <div className="flex flex-col gap-2 mt-2">
                <div className="flex justify-between">
                    <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
                    <div className="h-4 w-8 bg-gray-200 rounded"></div>
                </div>
                <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
                <div className="h-3 w-1/3 bg-gray-200 rounded"></div>
                <div className="h-4 w-1/4 bg-gray-200 rounded mt-1"></div>
            </div>
        </div>
    );
}

export function Skeleton({ className }: { className?: string }) {
    return (
        <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
    );
}
