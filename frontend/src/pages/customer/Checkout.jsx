import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { validateCoupon, checkoutOrder, createPaymentSession } from '../../api/orders';
import {
  ShoppingBag,
  MapPin,
  CreditCard,
  Tag,
  XCircle,
  ChevronRight,
  ShieldCheck,
  Package,
  Truck
} from 'lucide-react';

export default function Checkout() {
  const { cartItems, cartSubtotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    phoneNumber: '',
    paymentMethod: 'COD',
  });

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discountType === 'PERCENTAGE') {
      return (cartSubtotal * parseFloat(appliedCoupon.discountValue)) / 100;
    } else {
      return Math.min(cartSubtotal, parseFloat(appliedCoupon.discountValue));
    }
  };

  const discountAmount = calculateDiscount();
  const shippingFee = cartSubtotal > 1000 ? 0 : 99;
  const finalTotal = Math.max(0, cartSubtotal - discountAmount + shippingFee);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponError('');
    setCouponLoading(true);
    try {
      const res = await validateCoupon(couponCode.trim());
      setAppliedCoupon(res.data);
      setCouponError('');
    } catch (err) {
      setAppliedCoupon(null);
      setCouponError(err.response?.data?.error || 'Invalid or expired coupon code.');
    } finally {
      setCouponLoading(false);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      let paymentId = 'PAY-COD-' + Date.now();

      if (form.paymentMethod === 'ONLINE') {
        try {
          const sessionRes = await createPaymentSession(finalTotal);
          paymentId = sessionRes.data?.razorpayOrderId || ('PAY-ONLINE-' + Date.now());
        } catch {
          paymentId = 'PAY-SIMULATED-' + Date.now();
        }
      }

      const checkoutPayload = {
        shippingAddressLine1: form.streetAddress,
        city: form.city,
        state: form.state,
        postalCode: form.postalCode,
        phoneNumber: form.phoneNumber,
        paymentMethod: form.paymentMethod,
        paymentId: paymentId,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        items: cartItems.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: parseFloat(item.product.price),
        })),
      };

      await checkoutOrder(checkoutPayload);
      clearCart();
      navigate('/orders', { state: { orderSuccess: true } });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col items-center justify-center gap-4 py-20 px-4">
        <ShoppingBag size={48} className="text-text-muted opacity-50" />
        <h2 className="text-xl font-bold text-text-primary">Your Cart is Empty</h2>
        <p className="text-sm text-text-secondary">Add some items to your cart before proceeding to checkout.</p>
        <Link
          to="/"
          className="mt-2 bg-gradient-to-r from-accent-primary to-indigo-600 text-white text-xs font-bold px-6 py-2.5 rounded-lg shadow-md hover:from-indigo-600 hover:to-accent-primary transition-all"
        >
          Explore Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary py-10 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="gradient-text text-3xl font-extrabold tracking-tight">Checkout</h1>
            <p className="text-sm text-text-secondary mt-1 font-medium">Complete your order details & shipping address</p>
          </div>
          <Link to="/" className="text-xs font-bold text-accent-primary hover:underline flex items-center gap-1">
            Back to Marketplace <ChevronRight size={14} />
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-accent-danger/10 border border-accent-danger/25 text-accent-danger text-sm flex items-center gap-2">
            <XCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            <div className="p-6 sm:p-8 rounded-2xl border border-glass-border bg-glass/10 backdrop-blur-md">
              <h3 className="text-base font-bold text-text-primary mb-6 flex items-center gap-2">
                <MapPin size={18} className="text-accent-primary" />
                Shipping Address
              </h3>

              <form id="checkout-form" onSubmit={handlePlaceOrder} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Street Address *</label>
                  <input
                    name="streetAddress"
                    value={form.streetAddress}
                    onChange={handleChange}
                    placeholder="House No., Building, Street Name"
                    className="w-full bg-bg-tertiary/50 border border-glass-border rounded-lg text-text-primary text-sm px-4 py-3 outline-none focus:border-accent-primary"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">City *</label>
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="e.g. Mumbai"
                    className="w-full bg-bg-tertiary/50 border border-glass-border rounded-lg text-text-primary text-sm px-4 py-3 outline-none focus:border-accent-primary"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">State / Province *</label>
                  <input
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    placeholder="e.g. Maharashtra"
                    className="w-full bg-bg-tertiary/50 border border-glass-border rounded-lg text-text-primary text-sm px-4 py-3 outline-none focus:border-accent-primary"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Postal / ZIP Code *</label>
                  <input
                    name="postalCode"
                    value={form.postalCode}
                    onChange={handleChange}
                    placeholder="e.g. 400001"
                    className="w-full bg-bg-tertiary/50 border border-glass-border rounded-lg text-text-primary text-sm px-4 py-3 outline-none focus:border-accent-primary"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Phone Number *</label>
                  <input
                    name="phoneNumber"
                    type="tel"
                    value={form.phoneNumber}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    className="w-full bg-bg-tertiary/50 border border-glass-border rounded-lg text-text-primary text-sm px-4 py-3 outline-none focus:border-accent-primary"
                    required
                  />
                </div>
              </form>
            </div>

            <div className="p-6 sm:p-8 rounded-2xl border border-glass-border bg-glass/10 backdrop-blur-md">
              <h3 className="text-base font-bold text-text-primary mb-6 flex items-center gap-2">
                <CreditCard size={18} className="text-accent-primary" />
                Payment Options
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label
                  onClick={() => setForm((prev) => ({ ...prev, paymentMethod: 'COD' }))}
                  className={`p-4 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                    form.paymentMethod === 'COD' ? 'bg-accent-primary/10 border-accent-primary' : 'bg-bg-tertiary/40 border-glass-border hover:border-text-secondary'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={form.paymentMethod === 'COD'}
                    onChange={handleChange}
                    className="accent-accent-primary"
                  />
                  <div>
                    <span className="font-bold text-sm text-text-primary block">Cash on Delivery (COD)</span>
                    <span className="text-xs text-text-muted">Pay with cash upon delivery</span>
                  </div>
                </label>

                <label
                  onClick={() => setForm((prev) => ({ ...prev, paymentMethod: 'ONLINE' }))}
                  className={`p-4 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                    form.paymentMethod === 'ONLINE' ? 'bg-accent-primary/10 border-accent-primary' : 'bg-bg-tertiary/40 border-glass-border hover:border-text-secondary'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="ONLINE"
                    checked={form.paymentMethod === 'ONLINE'}
                    onChange={handleChange}
                    className="accent-accent-primary"
                  />
                  <div>
                    <span className="font-bold text-sm text-text-primary block">Online Payment (Razorpay)</span>
                    <span className="text-xs text-text-muted">Credit/Debit Card, UPI, Netbanking</span>
                  </div>
                </label>
              </div>
            </div>

          </div>

          <div className="flex flex-col gap-6">
            <div className="p-6 rounded-2xl border border-glass-border bg-glass/10 backdrop-blur-md flex flex-col gap-4">
              <h3 className="text-base font-bold text-text-primary pb-3 border-b border-glass-border">
                Order Summary ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
              </h3>

              <div className="flex flex-col gap-3 max-h-56 overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <div key={item.product.id} className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded bg-bg-tertiary flex items-center justify-center shrink-0 border border-glass-border">
                        <Package size={14} className="text-text-muted" />
                      </div>
                      <div className="truncate">
                        <span className="font-semibold text-text-primary block truncate">{item.product.name}</span>
                        <span className="text-[10px] text-text-muted">Qty {item.quantity}</span>
                      </div>
                    </div>
                    <span className="font-bold text-text-primary shrink-0 ml-2">
                      ₹{(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-glass-border">
                <form onSubmit={handleApplyCoupon} className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                      type="text"
                      placeholder="Coupon Code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="w-full bg-bg-tertiary/50 border border-glass-border rounded-lg text-xs px-3 py-2 pl-8 outline-none uppercase font-bold text-text-primary focus:border-accent-primary"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={couponLoading}
                    className="bg-bg-tertiary hover:bg-bg-tertiary/80 border border-glass-border text-text-primary text-xs font-bold px-3.5 py-2 rounded-lg transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    {couponLoading ? '...' : 'Apply'}
                  </button>
                </form>

                {couponError && (
                  <p className="text-[11px] text-accent-danger font-semibold mt-2">{couponError}</p>
                )}

                {appliedCoupon && (
                  <div className="mt-2.5 p-2.5 rounded-lg bg-accent-secondary/10 border border-accent-secondary/20 text-accent-secondary text-xs font-bold flex justify-between items-center">
                    <span>Coupon &apos;{appliedCoupon.code}&apos; Applied!</span>
                    <button
                      type="button"
                      onClick={() => setAppliedCoupon(null)}
                      className="text-[10px] hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-glass-border flex flex-col gap-2.5 text-xs">
                <div className="flex justify-between text-text-secondary">
                  <span>Subtotal</span>
                  <span className="font-semibold text-text-primary">₹{cartSubtotal.toFixed(2)}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-accent-secondary font-semibold">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-text-secondary">
                  <span className="flex items-center gap-1">
                    <Truck size={12} /> Shipping Fee
                  </span>
                  <span className="font-semibold text-text-primary">
                    {shippingFee === 0 ? 'FREE' : `₹${shippingFee.toFixed(2)}`}
                  </span>
                </div>

                <div className="h-px bg-glass-border my-1" />

                <div className="flex justify-between text-sm font-extrabold text-text-primary">
                  <span>Total Amount</span>
                  <span className="text-accent-secondary font-display">₹{finalTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                form="checkout-form"
                disabled={loading}
                className="w-full mt-2 bg-gradient-to-r from-accent-primary to-indigo-600 hover:from-indigo-600 hover:to-accent-primary text-white text-sm font-bold py-3.5 rounded-xl shadow-lg shadow-accent-primary/20 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <ShieldCheck size={18} />
                <span>{loading ? 'Processing Order…' : 'Place Order'}</span>
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}