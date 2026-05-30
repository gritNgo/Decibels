import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

interface CartContextType {
  cartCount: number;
  refreshCartCount: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartCount, setCartCount] = useState(0);
  const { isAuthenticated } = useAuth(); // Removed isAdmin from destructuring if not needed elsewhere

  const refreshCartCount = useCallback(async () => {
    // Only short-circuit if the user is completely unauthenticated
    if (!isAuthenticated) {
      setCartCount(0);
      return;
    }

    try {
      const storedUser = localStorage.getItem('decibels_session');
      if (!storedUser) return;
      const session = JSON.parse(storedUser);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/cart`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.token}`
        }
      });

      if (response.ok) {
        const cartVm = await response.json();
        const totalItems = (cartVm.shoppingCartList || []).reduce(
          (acc: number, item: { quantity: number }) => acc + item.quantity, 
          0
        );
        
        setCartCount(totalItems);
      }
    } catch (err) {
      console.error('Telemetry fault synchronizing global cart context state:', err);
    }
  }, [isAuthenticated]); // Removed isAdmin from dependency array

  // Safely execute the state mutation loop within a standard asynchronous side-effect lifecycle
  useEffect(() => {
    let active = true;
    
    const triggerSync = async () => {
      if (active) {
        await refreshCartCount();
      }
    };

    triggerSync();
    
    return () => {
      active = false;
    };
  }, [refreshCartCount]);

  return (
    <CartContext.Provider value={{ cartCount, refreshCartCount }}>
      {children}
    </CartContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be executed inside a valid CartProvider scope.');
  return context;
}