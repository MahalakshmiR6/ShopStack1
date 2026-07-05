import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, LogOut, Package, User, ChevronDown, ShoppingBag } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-bg-primary/85 backdrop-blur-xl border-b border-glass-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-display font-extrabold text-xl text-text-primary shrink-0">
            <ShoppingBag size={22} className="text-accent-primary" />
            <span className="gradient-text">ShopStack</span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-2 flex-1">
            <Link to="/" className="text-text-secondary text-sm font-medium px-3 py-2 rounded-md hover:text-text-primary hover:bg-bg-tertiary transition-all duration-300">
              Marketplace
            </Link>
            {user && getDashboardLink() && (
              <Link to={getDashboardLink()} className="flex items-center gap-1.5 text-text-secondary text-sm font-medium px-3 py-2 rounded-md hover:text-text-primary hover:bg-bg-tertiary transition-all duration-300">
                <LayoutDashboard size={15} />
                Dashboard
              </Link>
            )}
          </div>

          {/* User actions */}
          <div className="flex items-center gap-3 shrink-0">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
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
                    <Link to="/profile" className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors" onClick={() => setDropdownOpen(false)}>
                      <User size={15} /> Profile
                    </Link>
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
