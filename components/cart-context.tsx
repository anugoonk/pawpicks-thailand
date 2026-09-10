"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  clampQty,
  computeTotals,
  sanitizeStoredItems,
  type CartLine,
  type StoredItem,
} from "@/lib/cart";
import type { Product } from "@/lib/types";

const STORAGE_KEY = "pawpicks:cart:v1";

export type { CartLine } from "@/lib/cart";

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotalThb: number;
  shippingThb: number;
  totalThb: number;
  freeShippingThreshold: number;
  add: (productId: string, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  /** payload for POST /api/checkout */
  checkoutItems: { productId: string; quantity: number }[];
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({
  products,
  shippingFlatRate,
  freeShippingThreshold,
  children,
}: {
  products: Product[];
  shippingFlatRate: number;
  freeShippingThreshold: number;
  children: ReactNode;
}) {
  const byId = useMemo(() => {
    const m = new Map<string, Product>();
    for (const p of products) m.set(p.id, p);
    return m;
  }, [products]);

  const [items, setItems] = useState<StoredItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Load once on mount — starting empty keeps SSR and first render in sync.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setItems(sanitizeStoredItems(JSON.parse(raw), (id) => byId.has(id)));
      }
    } catch {
      // ignore corrupt / unavailable storage
    }
    setHydrated(true);
  }, [byId]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore quota / unavailable storage
    }
  }, [items, hydrated]);

  const add = useCallback(
    (productId: string, quantity = 1) => {
      if (!byId.has(productId)) return;
      setItems((prev) => {
        const existing = prev.find((it) => it.productId === productId);
        if (existing) {
          return prev.map((it) =>
            it.productId === productId
              ? { ...it, quantity: clampQty(it.quantity + quantity) }
              : it,
          );
        }
        return [...prev, { productId, quantity: clampQty(quantity) }];
      });
    },
    [byId],
  );

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((it) => it.productId !== productId)
        : prev.map((it) =>
            it.productId === productId
              ? { ...it, quantity: clampQty(quantity) }
              : it,
          ),
    );
  }, []);

  const remove = useCallback((productId: string) => {
    setItems((prev) => prev.filter((it) => it.productId !== productId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const lines: CartLine[] = items
      .map((it) => {
        const product = byId.get(it.productId);
        return product ? { product, quantity: it.quantity } : null;
      })
      .filter((l): l is CartLine => l !== null);

    const totals = computeTotals(lines, {
      shippingFlatRate,
      freeShippingThreshold,
    });

    return {
      lines,
      ...totals,
      freeShippingThreshold,
      add,
      setQuantity,
      remove,
      clear,
      cartOpen,
      setCartOpen,
      checkoutItems: lines.map((l) => ({
        productId: l.product.id,
        quantity: l.quantity,
      })),
    };
  }, [
    items,
    byId,
    shippingFlatRate,
    freeShippingThreshold,
    add,
    setQuantity,
    remove,
    clear,
    cartOpen,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within <CartProvider>");
  return ctx;
}
