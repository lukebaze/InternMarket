"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

export function LoadMoreButton({ cursor }: { cursor: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleLoadMore() {
    const params = new URLSearchParams(searchParams.toString());
    params.set("cursor", cursor);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <button
      onClick={handleLoadMore}
      className="font-mono text-xs font-medium text-text-secondary border border-bg-border px-6 py-2.5 hover:bg-bg-surface hover:border-text-muted transition-colors"
    >
      Load More
    </button>
  );
}
