import { Check, CheckCircle2, Package, Sparkles, X, Truck, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function OrderSuccessModal({ order, onClose, onTrackOrder }) {
  if (!order) return null;

  const orderId = order.id || 'N/A';
  const displayId = orderId.length > 18 ? orderId.slice(0, 18) + '…' : orderId;
  const finalAmount = parseFloat(order.finalAmount || order.totalAmount || 0).toFixed(2);
  const isOnline = (order.paymentMethod || '').toUpperCase().includes('RAZORPAY') || (order.paymentMethod || '').toUpperCase() === 'ONLINE';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-bg-primary border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-500/10 text-center overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Glow ambient background sphere */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-muted hover:text-text-primary p-1 rounded-full hover:bg-bg-tertiary transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>

        {/* Animated Checkmark Circle */}
        <div className="relative mx-auto mb-6 w-24 h-24 flex items-center justify-center">
          {/* Outer Pulsing Rings */}
          <div className="absolute inset-0 rounded-full bg-emerald-500/15 animate-ping opacity-75" />
          <div className="absolute inset-2 rounded-full bg-emerald-500/20 border border-emerald-500/40 animate-pulse" />
          
          {/* Main Icon Badge */}
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-xl shadow-emerald-500/40 transform scale-100 transition-transform">
            <CheckCircle2 size={36} className="stroke-[2.5]" />
          </div>

          {/* Sparkles */}
          <Sparkles size={18} className="absolute -top-1 -right-1 text-emerald-400 animate-bounce" />
          <Sparkles size={14} className="absolute bottom-1 -left-1 text-teal-300 animate-pulse" />
        </div>

        {/* Title & Description */}
        <h2 className="text-2xl font-extrabold text-text-primary tracking-tight mb-2">
          Order Placed Successfully!
        </h2>
        <p className="text-xs text-text-secondary leading-relaxed mb-6">
          Thank you for your purchase! We have received your order and are preparing it for shipment.
        </p>

        {/* Order Details Highlight Box */}
        <div className="p-4 rounded-2xl bg-bg-tertiary/60 border border-glass-border/60 text-left flex flex-col gap-3 mb-6">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-glass-border/40">
            <span className="text-text-muted font-medium">Order Reference</span>
            <span className="font-mono font-bold text-text-primary" title={orderId}>
              #{displayId}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs pb-2 border-b border-glass-border/40">
            <span className="text-text-muted font-medium">Total Paid</span>
            <span className="font-extrabold text-emerald-400 text-sm font-display">
              ₹{finalAmount}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs pb-2 border-b border-glass-border/40">
            <span className="text-text-muted font-medium">Payment Mode</span>
            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
              isOnline 
                ? 'bg-accent-primary/15 border border-accent-primary/30 text-accent-primary'
                : 'bg-amber-500/15 border border-amber-500/30 text-amber-500'
            }`}>
              <ShieldCheck size={11} /> {isOnline ? 'Razorpay Online (PAID)' : 'Cash on Delivery'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-text-muted font-medium">Estimated Delivery</span>
            <span className="font-bold text-text-primary flex items-center gap-1">
              <Truck size={12} className="text-accent-primary" /> 3–5 Business Days
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => {
              onClose();
              if (onTrackOrder) onTrackOrder(order);
            }}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-accent-primary to-indigo-600 hover:from-indigo-600 hover:to-accent-primary text-white text-xs font-bold shadow-lg shadow-accent-primary/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Package size={15} />
            <span>Track Order</span>
          </button>

          <Link
            to="/"
            onClick={onClose}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-bg-tertiary hover:bg-bg-tertiary/80 border border-glass-border text-text-primary text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Explore More</span>
            <ArrowRight size={14} />
          </Link>
        </div>

      </div>
    </div>
  );
}
