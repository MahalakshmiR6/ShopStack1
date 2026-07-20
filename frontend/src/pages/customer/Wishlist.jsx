import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { Heart, Trash2, ShoppingCart, Package } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Wishlist() {
  const { wishlistItems, toggleWishlist, removeFromWishlist, loading } = useWishlist();
  const { addToCart } = useCart();

  const handleRemove = async (e, product) => {
    e.stopPropagation();
    try {
      await toggleWishlist(product);
    } catch (err) {
      alert(err.message || 'Failed to remove from wishlist');
    }
  };

  const handleAddToCart = async (e, product) => {
    e.stopPropagation();
    try {
      await addToCart(product, 1);
      await removeFromWishlist(product.id);
    } catch (err) {
      console.error('Failed to move item to cart:', err);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-8 border-b border-glass-border pb-4">
          <Heart className="text-accent-primary" size={28} fill="currentColor" />
          <h1 className="text-2xl font-extrabold tracking-tight font-display">My Wishlist</h1>
          <span className="text-xs font-bold text-text-muted bg-bg-tertiary px-3 py-1 rounded-full">
            {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-80 rounded-xl border border-glass-border bg-glass/10 animate-pulse" />
            ))}
          </div>
        ) : wishlistItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-text-muted max-w-md mx-auto text-center">
            <div className="w-16 h-16 rounded-full bg-accent-primary/10 flex items-center justify-center text-accent-primary mb-2">
              <Heart size={32} />
            </div>
            <h3 className="text-lg font-bold text-text-secondary">Your wishlist is empty</h3>
            <p className="text-sm">Explore our products and tap the heart icon on any product to save it here.</p>
            <Link
              to="/"
              className="mt-4 px-6 py-2.5 rounded-lg bg-gradient-to-r from-accent-primary to-indigo-600 hover:from-indigo-600 hover:to-accent-primary text-white text-sm font-bold shadow-md transition-all duration-300"
            >
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlistItems.map((item) => {
              const product = item.product;
              const primaryImage = product.images?.find((i) => i.isPrimary)?.imageUrl || product.images?.[0]?.imageUrl;
              
              return (
                <div 
                  key={item.id}
                  className="group flex flex-col overflow-hidden rounded-xl border border-glass-border bg-glass/10 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-accent-primary/20 hover:shadow-xl hover:shadow-accent-primary-glow/10"
                >
                  {/* Image & Category Tag */}
                  <div className="relative aspect-[4/3] bg-bg-tertiary overflow-hidden">
                    {primaryImage ? (
                      <img src={primaryImage} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-muted">
                        <Package size={40} />
                      </div>
                    )}
                    <span className="absolute top-3 left-3 bg-yellow-400/100 backdrop-blur-md text-text-secondary text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {product.category?.name || 'Uncategorized'}
                    </span>
                    
                    {/* Quick Remove Button */}
                    <button
                      onClick={(e) => handleRemove(e, product)}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 hover:bg-accent-danger text-white flex items-center justify-center transition-colors duration-300 cursor-pointer"
                      title="Remove from wishlist"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Details */}
                  <div className="p-5 flex-1 flex flex-col gap-2">
                    <p className="text-[11px] text-accent-primary font-bold uppercase tracking-wider">{product.vendor?.storeName}</p>
                    <h3 className="text-sm font-bold text-text-primary line-clamp-2 min-h-[40px]">{product.name}</h3>
                    {product.brand && <p className="text-xs text-text-muted">{product.brand}</p>}
                    
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-glass-border gap-2">
                      <span className="font-display text-sm font-extrabold text-accent-secondary">₹{parseFloat(product.price).toFixed(2)}</span>
                      
                      {product.stockQuantity > 0 ? (
                        <button
                          onClick={(e) => handleAddToCart(e, product)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent-primary/10 border border-accent-primary/20 hover:bg-accent-primary hover:text-white text-[10px] font-bold text-accent-primary transition-all duration-300 cursor-pointer"
                        >
                          <ShoppingCart size={12} />
                          Add to Cart
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold text-accent-danger">Out of Stock</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
