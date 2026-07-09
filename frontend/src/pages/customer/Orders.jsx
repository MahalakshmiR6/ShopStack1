import { useEffect, useState } from 'react';
import { Package, Clock, CheckCircle2, ChevronRight, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

const STATUS_META = {
  PROCESSING: { label: 'Processing', cls: 'bg-accent-primary/10 border-accent-primary/20 text-accent-primary' },
  SHIPPED:    { label: 'Shipped',    cls: 'bg-accent-warning/10 border-accent-warning/20 text-accent-warning' },
  DELIVERED:  { label: 'Delivered',  cls: 'bg-accent-secondary/10 border-accent-secondary/20 text-accent-secondary' },
};

const DEFAULT_ORDERS = [
  {
    id: "ORD-991122",
    date: "July 08, 2026",
    status: "DELIVERED",
    total: 71298.00,
    items: [
      { name: "SuperPhone X12", brand: "Electra", qty: 1, price: 69999.00 },
      { name: "Organic Rosewater Mist", brand: "GlowLab", qty: 1, price: 699.00 },
      { name: "Premium Roasted Almonds", brand: "Natura", qty: 1, price: 799.00 }
    ]
  },
  {
    id: "ORD-882255",
    date: "July 09, 2026",
    status: "SHIPPED",
    total: 5998.00,
    items: [
      { name: "Active Knit Sneakers", brand: "Stride", qty: 2, price: 2999.00 }
    ]
  }
];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('orders');
      if (saved) {
        setOrders(JSON.parse(saved));
      } else {
        localStorage.setItem('orders', JSON.stringify(DEFAULT_ORDERS));
        setOrders(DEFAULT_ORDERS);
      }
    } catch {
      setOrders(DEFAULT_ORDERS);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary text-text-primary py-16 text-center">
        <p className="text-sm text-text-muted">Loading orders list…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary py-10 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="gradient-text text-3xl font-extrabold tracking-tight">Order History</h1>
            <p className="text-sm text-text-secondary mt-1.5 font-medium">Track your shipments and view purchase history</p>
          </div>
          <Link 
            to="/dashboard"
            className="text-xs font-bold text-accent-primary hover:underline flex items-center gap-1"
          >
            Back to Dashboard <ChevronRight size={14} />
          </Link>
        </div>

        {/* Orders List */}
        <div className="flex flex-col gap-6">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-20 border border-glass-border rounded-xl bg-glass/5 text-text-muted">
              <ShoppingBag size={44} className="opacity-50" />
              <h3 className="text-base font-bold text-text-secondary">No orders found</h3>
              <p className="text-sm">You haven&apos;t placed any orders yet.</p>
              <Link 
                to="/" 
                className="mt-2 bg-gradient-to-r from-accent-primary to-indigo-600 hover:from-indigo-600 hover:to-accent-primary text-white text-xs font-bold px-5 py-2.5 rounded-lg shadow-md transition-all duration-300"
              >
                Shop Now
              </Link>
            </div>
          ) : (
            orders.map((order) => (
              <div 
                key={order.id} 
                className="rounded-xl border border-glass-border bg-glass/10 backdrop-blur-md overflow-hidden"
              >
                {/* Order Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4.5 bg-bg-tertiary/40 border-b border-glass-border/40 text-xs">
                  <div className="flex gap-5 flex-wrap">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Order ID</span>
                      <span className="font-semibold text-text-primary">{order.id}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Date Placed</span>
                      <span className="font-semibold text-text-primary text-text-secondary">{order.date}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Total Amount</span>
                      <span className="font-bold text-accent-secondary">₹{parseFloat(order.total).toFixed(2)}</span>
                    </div>
                  </div>
                  
                  {/* Status Pill */}
                  <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    STATUS_META[order.status]?.cls || STATUS_META.PROCESSING.cls
                  }`}>
                    {STATUS_META[order.status]?.label || order.status}
                  </span>
                </div>

                {/* Items List */}
                <div className="p-6 flex flex-col gap-4">
                  {order.items.map((item, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center justify-between gap-4 text-xs pb-4 last:pb-0 border-b border-glass-border/20 last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-bg-tertiary border border-glass-border/40 flex items-center justify-center shrink-0">
                          <Package size={18} className="text-text-muted" />
                        </div>
                        <div>
                          <h4 className="font-bold text-text-primary">{item.name}</h4>
                          <p className="text-[10px] text-text-muted mt-0.5 font-medium">{item.brand} • Qty {item.qty}</p>
                        </div>
                      </div>
                      <span className="font-semibold text-text-primary">₹{parseFloat(item.price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
