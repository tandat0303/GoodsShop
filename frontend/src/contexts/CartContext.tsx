import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import orderApi from "../api/features/order";

interface CartContextValue {
  cartCount: number;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue>({
  cartCount: 0,
  refreshCart: async () => {},
});

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartCount, setCartCount] = useState(0);

  const refreshCart = useCallback(async () => {
    try {
      const cart = await orderApi.getCart();
      const count = (cart?.items ?? []).reduce(
        (sum, item) => sum + item.quantity,
        0,
      );
      setCartCount(count);
    } catch {
      setCartCount(0);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  return (
    <CartContext.Provider value={{ cartCount, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
