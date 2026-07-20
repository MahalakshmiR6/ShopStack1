import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, AlertCircle, ShoppingBag, Package } from 'lucide-react';
import { getOrderById } from '../../api/orders';
import OrderTracker from '../../components/orders/OrderTracker';
import { useAuth } from '../../context/AuthContext';

export default function OrderTrackPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getOrderById(id)
      .then((res) => {
        setOrder(res.data);
      })
      .catch((err) => {
        setError(err.response?.data?.error || 'Failed to load order tracking details.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusUpdate = (updatedOrder) => {
    setOrder(updatedOrder);
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary py-10 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Navigation back */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/orders"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-accent-primary hover:underline"
          >
            <ChevronLeft size={16} /> Back to My Orders
          </Link>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="gradient-text text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <Package size={28} className="text-accent-primary" />
            Order Tracking
          </h1>
          <p className="text-sm text-text-secondary mt-1 font-medium">
            Real-time status updates and shipment tracking details
          </p>
        </div>

        {loading ? (
          <div className="p-16 border border-glass-border rounded-2xl bg-glass/10 text-center text-text-muted">
            <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm">Fetching tracking information…</p>
          </div>
        ) : error ? (
          <div className="p-8 rounded-2xl bg-accent-danger/10 border border-accent-danger/20 text-accent-danger flex flex-col items-center justify-center gap-3 text-center">
            <AlertCircle size={36} />
            <h3 className="font-bold text-base">Unable to load order tracking</h3>
            <p className="text-xs">{error}</p>
            <Link
              to="/orders"
              className="mt-2 bg-accent-primary text-white text-xs font-bold px-4 py-2 rounded-lg"
            >
              View Order History
            </Link>
          </div>
        ) : !order ? (
          <div className="p-16 border border-glass-border rounded-2xl bg-glass/5 text-center text-text-muted">
            <ShoppingBag size={40} className="mx-auto mb-3 opacity-50" />
            <h3 className="text-base font-bold text-text-secondary">Order not found</h3>
          </div>
        ) : (
          <OrderTracker 
            order={order} 
            onStatusUpdate={handleStatusUpdate}
            isCustomer={user?.role === 'CUSTOMER'}
            userRole={user?.role || 'CUSTOMER'}
          />
        )}
      </div>
    </div>
  );
}
