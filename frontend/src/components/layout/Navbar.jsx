import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { 
  LayoutDashboard, 
  LogOut, 
  Package, 
  User, 
  ChevronDown, 
  ShoppingBag, 
  Search, 
  ShoppingCart, 
  HelpCircle, 
  Info, 
  ExternalLink, 
  Activity 
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartItems, removeFromCart, cartCount, cartSubtotal } = useCart();
  const navigate = useNavigate();
  
  // Dropdown states
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  // Refs for click outside
  const dropdownRef = useRef(null);
  const aboutRef = useRef(null);
  const helpRef = useRef(null);
  const cartRef = useRef(null);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (!user) return null;
    switch (user.role) {
      case 'ADMIN': return '/admin';
      case 'VENDOR': return '/vendor';
      default: return '/dashboard';
    }
  };

  // Close all dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (aboutRef.current && !aboutRef.current.contains(event.target)) {
        setAboutOpen(false);
      }
      if (helpRef.current && !helpRef.current.contains(event.target)) {
        setHelpOpen(false);
      }
      if (cartRef.current && !cartRef.current.contains(event.target)) {
        setCartOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-bg-primary/85 backdrop-blur-xl border-b border-glass-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Main Nav Links */}
          <div className="flex items-center gap-6 shrink-0">
            <Link to="/" className="flex items-center gap-2 font-display font-extrabold text-xl text-text-primary shrink-0">
              <ShoppingBag size={22} className="text-accent-primary" />
              <span className="gradient-text">ShopStack</span>
            </Link>

            {/* Nav Links (Desktop) */}
            <div className="hidden md:flex items-center gap-1.5">
              <Link 
                to="/" 
                className="text-text-secondary text-sm font-medium px-3 py-2 rounded-md hover:text-text-primary hover:bg-bg-tertiary transition-all duration-300"
              >
                Marketplace
              </Link>
              
              {user && getDashboardLink() && (
                <Link 
                  to={getDashboardLink()} 
                  className="flex items-center gap-1.5 text-text-secondary text-sm font-medium px-3 py-2 rounded-md hover:text-text-primary hover:bg-bg-tertiary transition-all duration-300"
                >
                  <LayoutDashboard size={14} />
                  Dashboard
                </Link>
              )}

              {/* About Dropdown */}
              <div className="relative" ref={aboutRef}>
                <button
                  onClick={() => {
                    setAboutOpen(!aboutOpen);
                    setHelpOpen(false);
                    setDropdownOpen(false);
                    setCartOpen(false);
                  }}
                  className="flex items-center gap-1 text-text-secondary text-sm font-medium px-3 py-2 rounded-md hover:text-text-primary hover:bg-bg-tertiary transition-all duration-300 select-none cursor-pointer"
                >
                  <Info size={14} />
                  <span>About</span>
                  <ChevronDown size={12} className={`transition-transform duration-200 ${aboutOpen ? 'rotate-180' : ''}`} />
                </button>

                {aboutOpen && (
                  <div className="absolute left-0 mt-2 w-72 rounded-lg border border-glass-border bg-bg-secondary shadow-2xl p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-text-primary">
                    <h4 className="font-display font-bold text-sm mb-2 text-text-primary flex items-center gap-1.5">
                      <ShoppingBag size={16} className="text-accent-primary" />
                      About ShopStack
                    </h4>
                    <p className="text-xs text-text-secondary leading-relaxed mb-4">
                      ShopStack is an enterprise-grade multi-vendor marketplace platform enabling seamless catalog discovery, verified merchants, and instant digital checkout.
                    </p>
                    <div className="grid grid-cols-2 gap-2 mb-4 pt-3 border-t border-glass-border">
                      <div className="bg-bg-tertiary/50 p-2 rounded-lg text-center">
                        <span className="block font-bold text-sm text-accent-primary">10k+</span>
                        <span className="text-[10px] text-text-muted">Products</span>
                      </div>
                      <div className="bg-bg-tertiary/50 p-2 rounded-lg text-center">
                        <span className="block font-bold text-sm text-accent-secondary">500+</span>
                        <span className="text-[10px] text-text-muted">Vendors</span>
                      </div>
                    </div>
                    <a 
                      href="https://github.com" 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-xs font-semibold text-accent-primary hover:text-indigo-600 transition-colors flex items-center gap-1 justify-center py-1.5 border border-glass-border rounded-md hover:bg-bg-tertiary"
                    >
                      Documentation <ExternalLink size={12} />
                    </a>
                  </div>
                )}
              </div>

              {/* Help & Support Dropdown */}
              <div className="relative" ref={helpRef}>
                <button
                  onClick={() => {
                    setHelpOpen(!helpOpen);
                    setAboutOpen(false);
                    setDropdownOpen(false);
                    setCartOpen(false);
                  }}
                  className="flex items-center gap-1 text-text-secondary text-sm font-medium px-3 py-2 rounded-md hover:text-text-primary hover:bg-bg-tertiary transition-all duration-300 select-none cursor-pointer"
                >
                  <HelpCircle size={14} />
                  <span>Help</span>
                  <ChevronDown size={12} className={`transition-transform duration-200 ${helpOpen ? 'rotate-180' : ''}`} />
                </button>

                {helpOpen && (
                  <div className="absolute left-0 mt-2 w-72 rounded-lg border border-glass-border bg-bg-secondary shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-text-primary flex flex-col gap-3">
                    <div>
                      <h4 className="font-semibold text-xs text-text-muted uppercase tracking-wider mb-2">Frequently Asked FAQs</h4>
                      <div className="flex flex-col gap-2">
                        <div className="text-xs">
                          <span className="font-semibold block text-text-primary">How do I become a seller?</span>
                          <span className="text-text-secondary">Register and select "Vendor" role in the form.</span>
                        </div>
                        <div className="text-xs">
                          <span className="font-semibold block text-text-primary">What about product shipping?</span>
                          <span className="text-text-secondary">Shipping speeds depend on vendor specifications.</span>
                        </div>
                      </div>
                    </div>
                    <div className="h-px bg-glass-border" />
                    <div>
                      <h4 className="font-semibold text-xs text-text-muted uppercase tracking-wider mb-1.5">Direct Contacts</h4>
                      <p className="text-xs text-text-secondary">Email: <span className="text-text-primary font-medium">support@shopstack.com</span></p>
                      <p className="text-xs text-text-secondary">Hotline: <span className="text-text-primary font-medium">1-800-SHOP-STACK</span></p>
                    </div>
                    <div className="h-px bg-glass-border" />
                    <div className="flex items-center justify-between text-[11px] text-text-secondary">
                      <span className="flex items-center gap-1.5">
                        <Activity size={12} className="text-emerald-500 animate-pulse" />
                        Status: <span className="font-bold text-emerald-600">Operational</span>
                      </span>
                      <span className="text-[10px] text-text-muted">v1.0.0</span>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Search Bar (Center/Desktop) */}
          <div className="hidden sm:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Search products, brands, or stores..."
                className="w-full bg-bg-tertiary/50 border border-glass-border rounded-lg text-text-primary text-xs px-3 py-2 pl-9 outline-none transition-all duration-300 placeholder-text-muted focus:border-accent-primary focus:ring-2 focus:ring-accent-primary-glow focus:bg-bg-secondary"
              />
            </div>
          </div>

          {/* Right side actions: Cart & Profile */}
          <div className="flex items-center gap-3 shrink-0">
            
            {/* Shopping Cart Button & Dropdown */}
            {user && user.role === 'CUSTOMER' && (
              <div className="relative" ref={cartRef}>
                <button
                  onClick={() => {
                    setCartOpen(!cartOpen);
                    setAboutOpen(false);
                    setHelpOpen(false);
                    setDropdownOpen(false);
                  }}
                  className="relative flex items-center justify-center w-10 h-10 rounded-md border border-glass-border bg-glass backdrop-blur-md text-text-secondary hover:text-text-primary hover:border-accent-primary transition-all duration-300 cursor-pointer"
                >
                  <ShoppingCart size={18} />
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-accent-primary text-[10px] font-bold text-white shadow-sm animate-in zoom-in duration-200">
                      {cartCount}
                    </span>
                  )}
                </button>

                {cartOpen && (
                  <div className="absolute right-0 mt-2 w-80 rounded-lg border border-glass-border bg-bg-secondary shadow-2xl py-3 px-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-text-primary flex flex-col gap-3">
                    <div className="flex items-center justify-between border-b border-glass-border pb-2">
                      <span className="font-display font-bold text-sm">Shopping Cart</span>
                      <span className="text-xs text-accent-primary font-semibold">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}</span>
                    </div>
                    
                    {/* Cart Items List */}
                    <div className="flex flex-col gap-3 max-h-60 overflow-y-auto">
                      {cartItems.length === 0 ? (
                        <p className="text-xs text-text-muted italic py-4 text-center">Your cart is empty.</p>
                      ) : (
                        cartItems.map((item) => {
                          const primaryImage = item.product.images?.find((i) => i.isPrimary)?.imageUrl || item.product.images?.[0]?.imageUrl;
                          return (
                            <div key={item.product.id} className="flex gap-3 items-center">
                              {primaryImage ? (
                                <img src={primaryImage} alt={item.product.name} className="w-10 h-10 rounded object-cover shrink-0" />
                              ) : (
                                <div className="w-10 h-10 rounded bg-bg-tertiary flex items-center justify-center text-xs font-semibold text-text-secondary shrink-0">
                                  <Package size={16} />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <h5 className="text-xs font-semibold text-text-primary truncate">{item.product.name}</h5>
                                <p className="text-[10px] text-text-muted">Qty {item.quantity} • {item.product.brand || 'No Brand'}</p>
                              </div>
                              <div className="flex flex-col items-end shrink-0 gap-0.5">
                                <span className="text-xs font-semibold text-text-primary">₹{(parseFloat(item.product.price) * item.quantity).toFixed(2)}</span>
                                <button
                                  onClick={() => removeFromCart(item.product.id)}
                                  className="text-[10px] text-accent-danger hover:underline cursor-pointer"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    <div className="h-px bg-glass-border my-1" />

                    {/* Summary & Buttons */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-text-secondary">Subtotal</span>
                      <span className="text-sm font-bold text-text-primary">₹{cartSubtotal.toFixed(2)}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <button 
                        onClick={() => setCartOpen(false)}
                        className="py-2 text-center rounded-md border border-glass-border hover:bg-bg-tertiary text-xs font-semibold transition-colors cursor-pointer text-text-secondary hover:text-text-primary"
                      >
                        View Cart
                      </button>
                      <button 
                        onClick={() => {
                          setCartOpen(false);
                          navigate('/login');
                        }}
                        className="py-2 text-center rounded-md bg-accent-primary hover:bg-accent-primary-hover text-white text-xs font-semibold transition-colors cursor-pointer shadow-sm shadow-accent-primary/10"
                      >
                        Checkout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Profile / Dropdown or Login Options */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => {
                    setDropdownOpen(!dropdownOpen);
                    setAboutOpen(false);
                    setHelpOpen(false);
                    setCartOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-glass-border bg-glass backdrop-blur-md text-text-primary text-sm font-medium hover:border-accent-primary transition-all duration-300 select-none cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-primary to-indigo-600 flex items-center justify-center font-display font-bold text-xs text-white shrink-0">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </div>
                  <span className="hidden sm:inline">{user.firstName}</span>
                  <ChevronDown size={14} className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-lg border border-glass-border bg-bg-secondary shadow-2xl py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-3 border-b border-glass-border flex flex-col gap-0.5">
                      <span className="font-semibold text-sm text-text-primary">{user.firstName} {user.lastName}</span>
                      <span className="text-[10px] font-bold text-accent-primary uppercase tracking-wider">{user.role}</span>
                    </div>
                    <Link to={getDashboardLink()} className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors" onClick={() => setDropdownOpen(false)}>
                      <LayoutDashboard size={15} /> Dashboard
                    </Link>
                    {user.role === 'CUSTOMER' && (
                      <Link to="/orders" className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors" onClick={() => setDropdownOpen(false)}>
                        <Package size={15} /> My Orders
                      </Link>
                    )}
                    {user.role === 'CUSTOMER' && (
                      <Link to="/profile" className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors" onClick={() => setDropdownOpen(false)}>
                        <User size={15} /> Profile
                      </Link>
                    )}
                    {user.role === 'VENDOR' && (
                      <Link to="/vendor/profile" className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors" onClick={() => setDropdownOpen(false)}>
                        <User size={15} /> Store Profile
                      </Link>
                    )}
                    {user.role === 'ADMIN' && (
                      <Link to="/admin/profile" className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors" onClick={() => setDropdownOpen(false)}>
                        <User size={15} /> Manage Vendors
                      </Link>
                    )}
                    <div className="h-px bg-glass-border my-1" />
                    <button
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-accent-danger hover:bg-bg-tertiary transition-colors cursor-pointer text-left"
                      onClick={handleLogout}
                    >
                      <LogOut size={15} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-text-primary hover:bg-bg-tertiary px-3.5 py-2 rounded-md text-sm font-semibold transition-colors duration-300">
                  Login
                </Link>
                <Link to="/register" className="bg-gradient-to-r from-accent-primary to-indigo-600 hover:from-indigo-600 hover:to-accent-primary text-white shadow-lg shadow-accent-primary/20 hover:shadow-accent-primary/30 px-4 py-2 rounded-md text-sm font-semibold transition-all duration-300 transform hover:-translate-y-0.5">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
