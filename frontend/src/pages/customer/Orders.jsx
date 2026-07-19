import { useEffect, useState } from 'react';
import { Package, ChevronRight, ShoppingBag, CheckCircle, Truck, AlertCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { getMyOrders } from '../../api/orders';

const STATUS_META = {
  PENDING:    { label: 'Pending',    cls: 'bg-accent-warning/10 border-accent-warning/20 text-accent-warning' },
  PROCESSING: { label: 'Processing', cls: 'bg-accent-primary/10 border-accent-primary/20 text-accent-primary' },
  SHIPPED:    { label: 'Shipped',    cls: 'bg-accent-warning/10 border-accent-warning/20 text-accent-warning' },
  DELIVERED:  { label: 'Delivered',  cls: 'bg-accent-secondary/10 border-accent-secondary/20 text-accent-secondary' },
  CANCELLED:  { label: 'Cancelled',  cls: 'bg-accent-danger/10 border-accent-danger/20 text-accent-danger' },
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const location = useLocation();

  const isJustPlaced = location.state?.orderSuccess;

  useEffect(() => {
    setLoading(true);
    getMyOrders()
      .then((res) => {
        setOrders(res.data);
      })
      .catch((err) => {
        setError(err.response?.data?.error || 'Failed to load order history.');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary text-text-primary py-16 text-center">
        <p className="text-sm text-text-muted">Loading your order history…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary py-10 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {isJustPlaced && (
          <div className="mb-6 p-4 rounded-xl bg-accent-secondary/10 border border-accent-secondary/20 text-accent-secondary text-sm flex items-center justify-between gap-4 animate-in fade-in duration-300">
            <div className="flex items-center gap-2">
              <CheckCircle size={20} className="shrink-0 text-accent-secondary" />
              <span className="font-bold">Order placed successfully! Thank you for your purchase.</span>
            </div>
          </div>
        )}

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

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-accent-danger/10 border border-accent-danger/25 text-accent-danger text-sm flex items-center gap-2">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

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
            orders.map((order) => {
              const statusMeta = STATUS_META[order.orderStatus] || STATUS_META.PROCESSING;
              const dateStr = order.orderDate
                ? new Date(order.orderDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                : 'Recent';

              return (
                <div 
                  key={order.id} 
                  className="rounded-xl border border-glass-border bg-glass/10 backdrop-blur-md overflow-hidden"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 bg-bg-tertiary/40 border-b border-glass-border/40 text-xs">
                    <div className="flex gap-6 flex-wrap">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Order Reference</span>
                        <span className="font-mono font-bold text-text-primary text-xs">{order.id?.substring(0, 18)}...</span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Date Placed</span>
                        <span className="font-semibold text-text-secondary">{dateStr}</span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Total Amount</span>
                        <span className="font-bold text-accent-secondary">₹{parseFloat(order.totalAmount || 0).toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${statusMeta.cls}`}>
                      {statusMeta.label}
                    </span>
                  </div>

                  <div className="p-6 flex flex-col gap-4">
                    {order.orderItems?.map((item, idx) => (
                      <div 
                        key={item.id || idx}
                        className="flex items-center justify-between gap-4 text-xs pb-4 last:pb-0 border-b border-glass-border/20 last:border-b-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-bg-tertiary border border-glass-border/40 flex items-center justify-center shrink-0">
                            <Package size={18} className="text-text-muted" />
                          </div>
                          <div>
                            <h4 className="font-bold text-text-primary">{item.product?.name || item.productName || 'Marketplace Item'}</h4>
                            <p className="text-[10px] text-text-muted mt-0.5 font-medium">
                              {item.product?.brand ? `${item.product.brand} • ` : ''} Qty {item.quantity}
                            </p>
                          </div>
                        </div>
                        <span className="font-semibold text-text-primary">
                          ₹{(parseFloat(item.price || 0) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {(order.shippingAddress || order.shippingAddressLine1) && (
                    <div className="px-6 py-3 bg-bg-tertiary/20 border-t border-glass-border/30 text-[11px] text-text-secondary flex items-center gap-2">
                      <Truck size={14} className="text-text-muted shrink-0" />
                      <span className="truncate">
                        Shipping to: <strong className="text-text-primary">{order.shippingAddress || `${order.shippingAddressLine1}, ${order.city}, ${order.state} - ${order.postalCode}`}</strong>
                      </span>
                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
