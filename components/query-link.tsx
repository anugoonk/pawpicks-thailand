"use client";

import type { ReactNode } from "react";
import { useSearch, useJumpToProducts } from "@/components/search-context";

/**
 * An anchor that also seeds the storefront search — the migration of the
 * original `[data-query]` collection and cat-team links.
 */
export function QueryLink({
  query,
  className,
  id,
  ariaLabel,
  children,
}: {
  query: string;
  className?: string;
  id?: string;
  ariaLabel?: string;
  children: ReactNode;
}) {
  const { setQuery } = useSearch();
  const jump = useJumpToProducts();

  return (
    <a
      href="#new"
      id={id}
      className={className}
      aria-label={ariaLabel}
      data-query={query}
      onClick={() => {
        setQuery(query);
        // Let the hash navigation happen, then align to the section.
        requestAnimationFrame(jump);
      }}
    >
      {children}
    </a>
  );
}
