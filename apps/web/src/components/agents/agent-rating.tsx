import { cn } from "@/lib/utils";

interface AgentRatingProps {
  rating: string;
  totalCalls?: number;
  className?: string;
}

export function AgentRating({ rating, totalCalls, className }: AgentRatingProps) {
  const num = parseFloat(rating);
  const filled = Math.round(isNaN(num) ? 0 : num);

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg
            key={i}
            className={cn("w-3.5 h-3.5", i < filled ? "text-yellow-400" : "text-gray-200")}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <span className="text-xs text-gray-500">
        {isNaN(num) ? "0.0" : num.toFixed(1)}
        {totalCalls !== undefined && ` (${totalCalls.toLocaleString()})`}
      </span>
    </div>
  );
}
