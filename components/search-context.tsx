"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type SearchContextValue = {
  query: string;
  setQuery: (value: string) => void;
  /** Open state of the header search panel. */
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
};

const SearchContext = createContext<SearchContextValue | null>(null);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const value = useMemo<SearchContextValue>(
    () => ({ query, setQuery, searchOpen, setSearchOpen }),
    [query, searchOpen],
  );

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
}

export function useSearch(): SearchContextValue {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error("useSearch must be used within <SearchProvider>");
  return ctx;
}

/** Matches the original filterProducts(): jump to #new after setting a query. */
export function useJumpToProducts() {
  return useCallback(() => {
    document.getElementById("new")?.scrollIntoView();
  }, []);
}
