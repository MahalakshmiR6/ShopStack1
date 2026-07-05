import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { searchProducts, getCategories } from '../../api/products';
import { Search, Filter, Star, Package, ShoppingBag, TrendingUp } from 'lucide-react';

function ProductCard({ product }) {
  const primaryImage = product.images?.find((i) => i.isPrimary)?.imageUrl || product.images?.[0]?.imageUrl;
  const avgRating = product.reviews?.length
    ? (product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length).toFixed(1)
    : null;

  return (
    <Link to={`/product/${product.slug}`} className="group flex flex-col overflow-hidden rounded-xl border border-glass-border bg-glass/10 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-accent-primary/20 hover:shadow-xl hover:shadow-accent-primary-glow/10">
      <div className="relative aspect-[4/3] bg-bg-tertiary overflow-hidden">
        {primaryImage ? (
          <img src={primaryImage} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-muted">
            <Package size={40} />
          </div>
        )}
        <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-text-secondary text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
          {product.category?.name || 'Uncategorized'}
        </span>
      </div>
      <div className="p-5 flex-1 flex flex-col gap-2">
        <p className="text-[11px] text-accent-primary font-bold uppercase tracking-wider">{product.vendor?.storeName}</p>
        <h3 className="text-sm font-bold text-text-primary line-clamp-2 min-h-[40px]">{product.name}</h3>
        {product.brand && <p className="text-xs text-text-muted">{product.brand}</p>}
        
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-glass-border">
          <span className="font-display text-base font-extrabold text-accent-secondary">₹{parseFloat(product.price).toFixed(2)}</span>
          {avgRating && (
            <span className="flex items-center gap-1 text-xs font-bold text-accent-warning">
              <Star size={13} fill="currentColor" /> {avgRating}
              <span className="text-[10px] text-text-muted font-normal">({product.reviews.length})</span>
            </span>
          )}
        </div>
        {product.stockQuantity < 10 && product.stockQuantity > 0 && (
          <p className="text-[11px] text-accent-warning font-semibold mt-1">Only {product.stockQuantity} left!</p>
        )}
        {product.stockQuantity === 0 && <p className="text-[11px] text-accent-danger font-semibold mt-1">Out of Stock</p>}
      </div>
    </Link>
  );
}

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (query.trim()) params.query = query.trim();
      if (selectedCategory) params.categoryId = selectedCategory;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      const res = await searchProducts(params);
      setProducts(res.data);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [query, selectedCategory, minPrice, maxPrice]);

  useEffect(() => {
    getCategories().then((r) => setCategories(r.data)).catch(() => {});
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="min-h-screen bg-bg-primary pb-20">
      {/* Hero */}
      <section className="relative py-24 overflow-hidden text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgba(99,102,241,0.18),transparent_65%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-accent-primary/10 border border-accent-primary/20 text-accent-primary mb-6">
            <TrendingUp size={12} /> Multi-Vendor Marketplace
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none mb-6">
            Discover Products from<br />
            <span className="gradient-text">Thousands of Vendors</span>
          </h1>
          <p className="text-base text-text-secondary max-w-xl mx-auto mb-10">Shop the world&apos;s best vendors in one enterprise marketplace platform</p>

          <div className="flex justify-center">
            <div className="flex items-center bg-bg-secondary border border-glass-border rounded-full p-1.5 pl-5 w-full max-w-2xl backdrop-blur-xl shadow-lg focus-within:border-accent-primary focus-within:ring-4 focus-within:ring-accent-primary-glow transition-all duration-300">
              <Search size={18} className="text-text-muted shrink-0" />
              <input
                type="text"
                placeholder="Search products, brands, categories…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchProducts()}
                className="flex-1 bg-transparent border-none outline-none text-text-primary text-sm px-3.5 placeholder-text-muted"
              />
              <button
                className="bg-gradient-to-r from-accent-primary to-indigo-600 hover:from-indigo-600 hover:to-accent-primary text-white text-sm font-bold px-6 py-2.5 rounded-full shadow-md shadow-accent-primary/15 transition-all duration-300 cursor-pointer"
                onClick={fetchProducts}
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8 items-start">
        {/* Sidebar filters */}
        <aside className="p-6 rounded-xl border border-glass-border bg-glass/10 backdrop-blur-md flex flex-col gap-6 lg:sticky lg:top-24">
          <h3 className="flex items-center gap-2 text-sm font-bold text-text-primary uppercase tracking-wider border-b border-glass-border pb-3">
            <Filter size={15} /> Filters
          </h3>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Category</label>
            <select
              className="w-full bg-bg-secondary border border-glass-border rounded-lg text-text-primary text-sm px-3.5 py-2.5 outline-none transition-colors duration-300 focus:border-accent-primary"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Price Range</label>
            <div className="flex items-center gap-2">
              <input
                className="w-full bg-bg-secondary border border-glass-border rounded-lg text-text-primary text-sm px-3 py-2.5 outline-none transition-colors duration-300 focus:border-accent-primary placeholder-text-muted"
                type="number"
                placeholder="Min ₹"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                min={0}
              />
              <span className="text-text-muted text-xs">—</span>
              <input
                className="w-full bg-bg-secondary border border-glass-border rounded-lg text-text-primary text-sm px-3 py-2.5 outline-none transition-colors duration-300 focus:border-accent-primary placeholder-text-muted"
                type="number"
                placeholder="Max ₹"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                min={0}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-2">
            <button
              className="w-full bg-gradient-to-r from-accent-primary to-indigo-600 hover:from-indigo-600 hover:to-accent-primary text-white text-xs font-bold py-3 rounded-lg shadow-md transition-all duration-300 cursor-pointer"
              onClick={fetchProducts}
            >
              Apply Filters
            </button>
            <button
              className="w-full bg-transparent hover:bg-bg-tertiary border border-glass-border hover:border-text-secondary text-text-primary text-xs font-bold py-3 rounded-lg transition-colors duration-300 cursor-pointer"
              onClick={() => {
                setQuery(''); setSelectedCategory(''); setMinPrice(''); setMaxPrice('');
              }}
            >
              Clear All
            </button>
          </div>
        </aside>

        {/* Products grid */}
        <main className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-text-primary">
              {query ? `Results for "${query}"` : 'All Products'}
              <span className="ml-3 text-[11px] font-bold text-text-muted bg-bg-tertiary px-3 py-1 rounded-full">{products.length} items</span>
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 rounded-xl border border-glass-border bg-glass/10 animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-20 text-text-muted">
              <ShoppingBag size={48} className="text-text-muted opacity-50" />
              <h3 className="text-base font-bold text-text-secondary">No products found</h3>
              <p className="text-sm">Try adjusting your search filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </main>
      </section>
    </div>
  );
}
