import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { CartLine, Product } from "../types";

interface CartContextValue {
  lines: CartLine[];
  addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);
const STORAGE_KEY = "valuecare_cart_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines]);

  function addToCart(product: Product, quantity = 1) {
    setLines((current) => {
      const existing = current.find((line) => line.product.id === product.id);
      if (existing) {
        return current.map((line) =>
          line.product.id === product.id
            ? { ...line, quantity: line.quantity + quantity }
            : line
        );
      }
      return [...current, { product, quantity }];
    });
  }

  function updateQuantity(productId: number, quantity: number) {
    setLines((current) =>
      quantity <= 0
        ? current.filter((line) => line.product.id !== productId)
        : current.map((line) =>
            line.product.id === productId ? { ...line, quantity } : line
          )
    );
  }

  function removeFromCart(productId: number) {
    setLines((current) => current.filter((line) => line.product.id !== productId));
  }

  function clearCart() {
    setLines([]);
  }

  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = lines.reduce(
    (sum, line) => sum + Number(line.product.selling_price) * line.quantity,
    0
  );

  const value = useMemo(
    () => ({ lines, addToCart, updateQuantity, removeFromCart, clearCart, itemCount, subtotal }),
    [lines]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
