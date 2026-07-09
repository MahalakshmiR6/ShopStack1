import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity) => {
    setCartItems((prevItems) => {
      const existing = prevItems.find((item) => item.product.id === product.id);
      if (existing) {
        return prevItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(product.stockQuantity, item.quantity + quantity) }
            : item
        );
      }
      return [...prevItems, { product, quantity: Math.min(product.stockQuantity, quantity) }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((total, item) => total + (parseFloat(item.product.price) * item.quantity), 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, cartCount, cartSubtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
