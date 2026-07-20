import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getWishlist, addToWishlist as apiAddToWishlist, removeFromWishlist as apiRemoveFromWishlist } from '../api/wishlist';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!user || user.role !== 'CUSTOMER') {
      setWishlistItems([]);
      return;
    }
    setLoading(true);
    try {
      const res = await getWishlist();
      setWishlistItems(res.data || []);
    } catch (err) {
      console.error('Failed to fetch wishlist:', err);
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const removeFromWishlist = useCallback(async (productId) => {
    if (!user) return;
    try {
      await apiRemoveFromWishlist(productId);
      setWishlistItems(prev => prev.filter(item => item.product.id !== productId));
    } catch (err) {
      console.error('Failed to remove from wishlist:', err);
      throw new Error(err.response?.data?.error || 'Failed to remove from wishlist');
    }
  }, [user]);

  const toggleWishlist = useCallback(async (product) => {
    if (!user) {
      throw new Error('Please login to use the wishlist');
    }

    const inWishlist = wishlistItems.some(item => item.product.id === product.id);
    
    try {
      if (inWishlist) {
        await apiRemoveFromWishlist(product.id);
        setWishlistItems(prev => prev.filter(item => item.product.id !== product.id));
      } else {
        await apiAddToWishlist(product.id);
        // Add the product to wishlist optimistically
        setWishlistItems(prev => [...prev, { product }]);
      }
    } catch (err) {
      console.error('Failed to toggle wishlist:', err);
      throw new Error(err.response?.data?.error || 'Failed to update wishlist');
    }
  }, [user, wishlistItems]);

  const isInWishlist = useCallback((productId) => {
    return wishlistItems.some(item => item.product.id === productId);
  }, [wishlistItems]);

  const wishlistCount = wishlistItems.length;

  const value = {
    wishlistItems,
    loading,
    toggleWishlist,
    removeFromWishlist,
    isInWishlist,
    wishlistCount,
    refetchWishlist: fetchWishlist
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
