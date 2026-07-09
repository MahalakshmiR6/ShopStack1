import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { Link } from 'react-router-dom';
import { User, ShoppingBag, CreditCard, ChevronRight, Settings, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const { cartCount, cartSubtotal } = useCart();
  const [orderCount, setOrderCount] = useState(0);

  useEffect(() => {
    try {
      const savedOrders = localStorage.getItem('orders');
      if (savedOrders) {
        setOrderCount(JSON.parse(savedOrders).length);
      } else {
        // Default seed count
        setOrderCount(2);
      }
    } catch {
      setOrderCount(2);
    }
  }, []);

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary py-10 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Welcome Header */}
        <div className="mb-10 bg-gradient-to-r from-accent-primary/10 to-indigo-600/5 border border-accent-primary/20 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Hello, <span className="gradient-text">{user?.firstName || 'Valued Customer'}</span>! 👋
            </h1>
            <p className="text-sm text-text-secondary mt-1.5 font-medium">Welcome back to your ShopStack buyer account dashboard.</p>
          </div>
          <Link 
            to="/" 
            className="bg-gradient-to-r from-accent-primary to-indigo-600 hover:from-indigo-600 hover:to-accent-primary text-white text-xs font-bold px-5 py-3 rounded-lg shadow-lg shadow-accent-primary/15 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer shrink-0"
          >
            Continue Shopping
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          {[
            { icon: Clock, label: 'Total Orders', value: orderCount, bg: 'bg-accent-primary/10 text-accent-primary', desc: 'Placed in this account' },
            { icon: ShoppingBag, label: 'Cart Items', value: cartCount, bg: 'bg-accent-secondary/10 text-accent-secondary', desc: `Subtotal: ₹${cartSubtotal.toFixed(2)}` },
            { icon: User, label: 'Account Status', value: 'Active', bg: 'bg-emerald-500/10 text-emerald-600', desc: 'Verified Member' },
          ].map(({ icon: Icon, label, value, bg, desc }) => (
            <div key={label} className="p-6 rounded-xl border border-glass-border bg-glass/10 backdrop-blur-md flex items-center gap-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${bg}`}>
                <Icon size={22} />
              </div>
              <div>
                <p className="font-display text-2xl font-extrabold text-text-primary leading-none">{value}</p>
                <p className="text-xs font-bold text-text-muted uppercase tracking-wider mt-1.5">{label}</p>
                <p className="text-[10px] text-text-secondary mt-1 font-medium">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Sections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions Panel */}
          <div className="lg:col-span-2 p-6 rounded-xl border border-glass-border bg-glass/10 backdrop-blur-md flex flex-col gap-6">
            <h3 className="text-base font-bold text-text-primary uppercase tracking-wider border-b border-glass-border pb-3">
              Account Management
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link 
                to="/orders"
                className="group p-5 border border-glass-border hover:border-accent-primary/20 rounded-xl bg-glass/5 hover:bg-glass/10 flex items-center justify-between transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent-primary/10 text-accent-primary flex items-center justify-center shrink-0">
                    <Clock size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-text-primary">Order History</h4>
                    <p className="text-[10px] text-text-secondary mt-0.5 font-medium">Track and view invoices</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-text-muted group-hover:text-accent-primary transition-colors duration-300" />
              </Link>

              <Link 
                to="/profile"
                className="group p-5 border border-glass-border hover:border-accent-primary/20 rounded-xl bg-glass/5 hover:bg-glass/10 flex items-center justify-between transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
                    <Settings size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-text-primary">Profile & Addresses</h4>
                    <p className="text-[10px] text-text-secondary mt-0.5 font-medium">Update shipping & contacts</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-text-muted group-hover:text-accent-primary transition-colors duration-300" />
              </Link>
            </div>
          </div>

          {/* User Details Sidebar */}
          <div className="p-6 rounded-xl border border-glass-border bg-glass/10 backdrop-blur-md flex flex-col gap-5">
            <h3 className="text-base font-bold text-text-primary uppercase tracking-wider border-b border-glass-border pb-3">
              User Profile
            </h3>
            
            <div className="flex flex-col gap-3 text-xs leading-relaxed">
              <div className="flex justify-between items-center py-2 border-b border-glass-border/30">
                <span className="text-text-secondary font-medium">Email</span>
                <span className="font-semibold text-text-primary">{user?.email}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-glass-border/30">
                <span className="text-text-secondary font-medium">Role</span>
                <span className="font-bold text-accent-primary uppercase tracking-wider text-[10px] bg-accent-primary/10 border border-accent-primary/20 px-2 py-0.5 rounded-full">{user?.role}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-text-secondary font-medium">Full Name</span>
                <span className="font-semibold text-text-primary">{user?.firstName} {user?.lastName}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
