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
  Truck,
  FileText,
  CheckSquare,
  Square,
  Lock,
  Zap,
  QrCode,
  Building2,
  Wallet,
  Smartphone,
  Check
} from 'lucide-react';

export default function Checkout() {
  const { cartItems, cartSubtotal, clearCart } = useCart();
  const navigate = useNavigate();

  // Form state
  const [form, setForm] = useState({
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    phoneNumber: '',
    paymentMethod: 'COD',

    // Billing fields
    billingName: '',
    billingStreetAddress: '',
    billingCity: '',
    billingState: '',
    billingPostalCode: '',
    billingPhoneNumber: '',
    gstNumber: '',

    // Card Details
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    cardHolder: '',

    // UPI Details
    upiId: '',
    selectedUpiApp: 'gpay',

    // Netbanking Details
    selectedBank: 'SBI',

    // Wallet Details
    selectedWallet: 'Amazon Pay',
  });

  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [onlineMethod, setOnlineMethod] = useState('CARD'); // 'CARD', 'UPI', 'NETBANKING', 'WALLET'

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  // Submission state
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
          paymentId = sessionRes.data?.razorpayOrderId || (`PAY-${onlineMethod}-` + Date.now());
        } catch {
          paymentId = `PAY-${onlineMethod}-SIMULATED-` + Date.now();
        }
      }

      const shippingFull = `${form.streetAddress}, ${form.city}, ${form.state} - ${form.postalCode} (Ph: ${form.phoneNumber})`;
      
      let billingFull = shippingFull;
      if (form.paymentMethod === 'ONLINE' && !sameAsShipping) {
        billingFull = `${form.billingStreetAddress || form.streetAddress}, ${form.billingCity || form.city}, ${form.billingState || form.state} - ${form.billingPostalCode || form.postalCode} (Name: ${form.billingName || 'N/A'}, Ph: ${form.billingPhoneNumber || form.phoneNumber})`;
      }

      const billingInfoText = form.paymentMethod === 'ONLINE'
        ? `Method: ${onlineMethod}, GST: ${form.gstNumber || 'N/A'}, Billing Name: ${form.billingName || 'Same as Shipping'}`
        : 'COD';

      const checkoutPayload = {
        shippingAddress: shippingFull,
        billingAddress: billingFull,
        paymentMethod: form.paymentMethod,
        paymentId: paymentId,
        billingInfo: billingInfoText,
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
        
        {/* Header */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="gradient-text text-3xl font-extrabold tracking-tight">Checkout</h1>
            <p className="text-sm text-text-secondary mt-1 font-medium">Complete your order details, shipping & billing options</p>
          </div>
          <Link to="/cart" className="text-xs font-bold text-accent-primary hover:underline flex items-center gap-1">
            Back to Cart <ChevronRight size={14} />
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-accent-danger/10 border border-accent-danger/25 text-accent-danger text-sm flex items-center gap-2">
            <XCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Form Columns */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Shipping Address Form */}
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

            {/* Payment Options */}
            <div className="p-6 sm:p-8 rounded-2xl border border-glass-border bg-glass/10 backdrop-blur-md">
              <h3 className="text-base font-bold text-text-primary mb-6 flex items-center gap-2">
                <CreditCard size={18} className="text-accent-primary" />
                Payment Options
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
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
                    <span className="font-bold text-sm text-text-primary flex items-center gap-1.5">
                      Razorpay Online Payment <Zap size={14} className="text-amber-400 fill-amber-400" />
                    </span>
                    <span className="text-xs text-text-muted">Cards, UPI, NetBanking, Wallets</span>
                  </div>
                </label>
              </div>

              {/* Dynamic Online Payment & Billing Options */}
              {form.paymentMethod === 'ONLINE' && (
                <div className="p-6 rounded-xl border border-accent-primary/30 bg-accent-primary/5 flex flex-col gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
                  
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-glass-border/40 pb-3">
                    <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
                      <Zap size={16} className="text-accent-primary" />
                      Choose Online Payment Method
                    </h4>
                  </div>

                  {/* Sub Payment Method Switcher Tabs */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { id: 'CARD', label: 'Credit/Debit Card', icon: CreditCard },
                      { id: 'UPI', label: 'UPI / QR Code', icon: QrCode },
                      { id: 'NETBANKING', label: 'NetBanking', icon: Building2 },
                      { id: 'WALLET', label: 'Wallets', icon: Wallet },
                    ].map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setOnlineMethod(id)}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer text-center gap-1.5 ${
                          onlineMethod === id
                            ? 'bg-accent-primary text-white border-accent-primary shadow-md shadow-accent-primary/20 scale-[1.02]'
                            : 'bg-bg-secondary/70 border-glass-border hover:border-accent-primary/50 text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        <Icon size={20} />
                        <span className="text-[11px] font-bold">{label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Tab 1: Credit / Debit Card Fields */}
                  {onlineMethod === 'CARD' && (
                    <div className="p-4 rounded-xl bg-bg-secondary/80 border border-glass-border flex flex-col gap-3.5 animate-in fade-in duration-200">
                      <h5 className="text-xs font-bold text-text-primary uppercase tracking-wider">Card Payment Details</h5>
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-semibold text-text-secondary">Card Number</label>
                        <input
                          name="cardNumber"
                          value={form.cardNumber}
                          onChange={(e) => setForm((prev) => ({ ...prev, cardNumber: e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim() }))}
                          placeholder="4532 1234 5678 9010"
                          maxLength={19}
                          className="w-full bg-bg-tertiary/50 border border-glass-border rounded-lg text-xs px-3.5 py-2.5 outline-none font-mono text-text-primary focus:border-accent-primary"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-[11px] font-semibold text-text-secondary">Expiry Date</label>
                          <input
                            name="cardExpiry"
                            value={form.cardExpiry}
                            onChange={(e) => setForm((prev) => ({ ...prev, cardExpiry: e.target.value }))}
                            placeholder="MM / YY"
                            maxLength={5}
                            className="w-full bg-bg-tertiary/50 border border-glass-border rounded-lg text-xs px-3.5 py-2.5 outline-none font-mono text-text-primary focus:border-accent-primary"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[11px] font-semibold text-text-secondary">CVV</label>
                          <input
                            name="cardCvv"
                            type="password"
                            value={form.cardCvv}
                            onChange={(e) => setForm((prev) => ({ ...prev, cardCvv: e.target.value.replace(/\D/g, '') }))}
                            placeholder="•••"
                            maxLength={4}
                            className="w-full bg-bg-tertiary/50 border border-glass-border rounded-lg text-xs px-3.5 py-2.5 outline-none font-mono text-text-primary focus:border-accent-primary"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-semibold text-text-secondary">Name on Card</label>
                        <input
                          name="cardHolder"
                          value={form.cardHolder}
                          onChange={handleChange}
                          placeholder="Full Name as printed on card"
                          className="w-full bg-bg-tertiary/50 border border-glass-border rounded-lg text-xs px-3.5 py-2.5 outline-none text-text-primary focus:border-accent-primary"
                        />
                      </div>
                      <p className="text-[10px] text-text-muted">Accepts Visa, MasterCard, RuPay, Maestro & Diners Club.</p>
                    </div>
                  )}

                  {/* Tab 2: UPI / QR Code Options */}
                  {onlineMethod === 'UPI' && (
                    <div className="p-4 rounded-xl bg-bg-secondary/80 border border-glass-border flex flex-col gap-3.5 animate-in fade-in duration-200">
                      <h5 className="text-xs font-bold text-text-primary uppercase tracking-wider">UPI App / VPA ID</h5>
                      
                      {/* Popular App Pickers */}
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { id: 'gpay', name: 'Google Pay', handle: '@okicici' },
                          { id: 'phonepe', name: 'PhonePe', handle: '@ybl' },
                          { id: 'paytm', name: 'Paytm', handle: '@paytm' },
                          { id: 'bhim', name: 'BHIM UPI', handle: '@upi' },
                        ].map((app) => (
                          <button
                            key={app.id}
                            type="button"
                            onClick={() => setForm((prev) => ({ ...prev, selectedUpiApp: app.id }))}
                            className={`p-2.5 rounded-lg border text-xs font-bold text-center flex flex-col items-center gap-1 transition-all cursor-pointer ${
                              form.selectedUpiApp === app.id
                                ? 'bg-accent-primary/10 border-accent-primary text-accent-primary'
                                : 'bg-bg-tertiary/40 border-glass-border text-text-secondary hover:text-text-primary'
                            }`}
                          >
                            <Smartphone size={16} />
                            <span className="text-[10px]">{app.name}</span>
                          </button>
                        ))}
                      </div>

                      <div className="flex flex-col gap-1 mt-1">
                        <label className="text-[11px] font-semibold text-text-secondary">Enter Virtual Payment Address (VPA / UPI ID)</label>
                        <input
                          name="upiId"
                          value={form.upiId}
                          onChange={handleChange}
                          placeholder="e.g. mobile@paytm or name@okicici"
                          className="w-full bg-bg-tertiary/50 border border-glass-border rounded-lg text-xs px-3.5 py-2.5 outline-none font-mono text-text-primary focus:border-accent-primary"
                        />
                      </div>
                      <p className="text-[10px] text-text-muted">A payment request notification will be sent to your UPI app for instant approval.</p>
                    </div>
                  )}

                  {/* Tab 3: NetBanking Options */}
                  {onlineMethod === 'NETBANKING' && (
                    <div className="p-4 rounded-xl bg-bg-secondary/80 border border-glass-border flex flex-col gap-3.5 animate-in fade-in duration-200">
                      <h5 className="text-xs font-bold text-text-primary uppercase tracking-wider">Popular NetBanking Banks</h5>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {['SBI', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Bank', 'PNB'].map((bank) => (
                          <button
                            key={bank}
                            type="button"
                            onClick={() => setForm((prev) => ({ ...prev, selectedBank: bank }))}
                            className={`p-2.5 rounded-lg border text-xs font-bold text-center transition-all cursor-pointer ${
                              form.selectedBank === bank
                                ? 'bg-accent-primary/10 border-accent-primary text-accent-primary'
                                : 'bg-bg-tertiary/40 border-glass-border text-text-secondary hover:text-text-primary'
                            }`}
                          >
                            {bank}
                          </button>
                        ))}
                      </div>

                      <div className="flex flex-col gap-1 mt-1">
                        <label className="text-[11px] font-semibold text-text-secondary">Or Select Other Bank</label>
                        <select
                          name="selectedBank"
                          value={form.selectedBank}
                          onChange={handleChange}
                          className="w-full bg-bg-tertiary/50 border border-glass-border rounded-lg text-xs px-3 py-2.5 outline-none text-text-primary focus:border-accent-primary"
                        >
                          <option value="SBI">State Bank of India (SBI)</option>
                          <option value="HDFC">HDFC Bank</option>
                          <option value="ICICI">ICICI Bank</option>
                          <option value="AXIS">Axis Bank</option>
                          <option value="KOTAK">Kotak Mahindra Bank</option>
                          <option value="PNB">Punjab National Bank</option>
                          <option value="BOB">Bank of Baroda</option>
                          <option value="CANARA">Canara Bank</option>
                          <option value="YES">Yes Bank</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Tab 4: Wallet Options */}
                  {onlineMethod === 'WALLET' && (
                    <div className="p-4 rounded-xl bg-bg-secondary/80 border border-glass-border flex flex-col gap-3.5 animate-in fade-in duration-200">
                      <h5 className="text-xs font-bold text-text-primary uppercase tracking-wider">Select Digital Wallet</h5>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {['Amazon Pay', 'Paytm Wallet', 'Mobikwik', 'Freecharge', 'Airtel Money', 'JioMoney'].map((wallet) => (
                          <button
                            key={wallet}
                            type="button"
                            onClick={() => setForm((prev) => ({ ...prev, selectedWallet: wallet }))}
                            className={`p-2.5 rounded-lg border text-xs font-bold text-center transition-all cursor-pointer ${
                              form.selectedWallet === wallet
                                ? 'bg-accent-primary/10 border-accent-primary text-accent-primary'
                                : 'bg-bg-tertiary/40 border-glass-border text-text-secondary hover:text-text-primary'
                            }`}
                          >
                            {wallet}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Billing Address Section */}
                  <div className="pt-4 border-t border-glass-border/40 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-text-primary flex items-center gap-1.5 uppercase tracking-wider">
                        <FileText size={14} className="text-accent-primary" />
                        Billing Address & Tax Info
                      </h5>
                    </div>

                    {/* Same as Shipping Checkbox */}
                    <div
                      onClick={() => setSameAsShipping(!sameAsShipping)}
                      className="flex items-center gap-2.5 cursor-pointer select-none text-xs font-semibold text-text-primary"
                    >
                      {sameAsShipping ? (
                        <CheckSquare size={18} className="text-accent-primary" />
                      ) : (
                        <Square size={18} className="text-text-muted" />
                      )}
                      <span>Billing address is same as shipping address</span>
                    </div>

                    {/* Custom Billing Address Inputs if Not Same */}
                    {!sameAsShipping && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 animate-in fade-in duration-200">
                        <div className="sm:col-span-2 flex flex-col gap-1">
                          <label className="text-[11px] font-semibold text-text-secondary uppercase">Billing Name / Business Name</label>
                          <input
                            name="billingName"
                            value={form.billingName}
                            onChange={handleChange}
                            placeholder="Full Name or Company Name"
                            className="w-full bg-bg-secondary border border-glass-border rounded-lg text-xs px-3.5 py-2.5 outline-none focus:border-accent-primary"
                          />
                        </div>

                        <div className="sm:col-span-2 flex flex-col gap-1">
                          <label className="text-[11px] font-semibold text-text-secondary uppercase">Billing Street Address</label>
                          <input
                            name="billingStreetAddress"
                            value={form.billingStreetAddress}
                            onChange={handleChange}
                            placeholder="Billing House / Office Address"
                            className="w-full bg-bg-secondary border border-glass-border rounded-lg text-xs px-3.5 py-2.5 outline-none focus:border-accent-primary"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[11px] font-semibold text-text-secondary uppercase">City</label>
                          <input
                            name="billingCity"
                            value={form.billingCity}
                            onChange={handleChange}
                            placeholder="City"
                            className="w-full bg-bg-secondary border border-glass-border rounded-lg text-xs px-3.5 py-2.5 outline-none focus:border-accent-primary"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[11px] font-semibold text-text-secondary uppercase">State</label>
                          <input
                            name="billingState"
                            value={form.billingState}
                            onChange={handleChange}
                            placeholder="State"
                            className="w-full bg-bg-secondary border border-glass-border rounded-lg text-xs px-3.5 py-2.5 outline-none focus:border-accent-primary"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[11px] font-semibold text-text-secondary uppercase">ZIP / Postal Code</label>
                          <input
                            name="billingPostalCode"
                            value={form.billingPostalCode}
                            onChange={handleChange}
                            placeholder="ZIP Code"
                            className="w-full bg-bg-secondary border border-glass-border rounded-lg text-xs px-3.5 py-2.5 outline-none focus:border-accent-primary"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[11px] font-semibold text-text-secondary uppercase">Billing Phone</label>
                          <input
                            name="billingPhoneNumber"
                            value={form.billingPhoneNumber}
                            onChange={handleChange}
                            placeholder="Billing Phone Number"
                            className="w-full bg-bg-secondary border border-glass-border rounded-lg text-xs px-3.5 py-2.5 outline-none focus:border-accent-primary"
                          />
                        </div>
                      </div>
                    )}

                    {/* GSTIN Field */}
                    <div className="flex flex-col gap-1 border-t border-glass-border/40 pt-3">
                      <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                        GSTIN / Tax ID (Optional for Tax Invoice)
                      </label>
                      <input
                        name="gstNumber"
                        value={form.gstNumber}
                        onChange={(e) => setForm((prev) => ({ ...prev, gstNumber: e.target.value.toUpperCase() }))}
                        placeholder="e.g. 27AAAAA0000A1Z5"
                        className="w-full bg-bg-secondary border border-glass-border rounded-lg text-xs px-3.5 py-2.5 outline-none uppercase font-semibold text-text-primary focus:border-accent-primary"
                      />
                    </div>
                  </div>

                </div>
              )}
            </div>

          </div>

          {/* Right Column: Order Summary & Coupon */}
          <div className="flex flex-col gap-6">
            
            <div className="p-6 rounded-2xl border border-glass-border bg-glass/10 backdrop-blur-md flex flex-col gap-4">
              <h3 className="text-base font-bold text-text-primary pb-3 border-b border-glass-border">
                Order Summary ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
              </h3>

              {/* Items preview list */}
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

              {/* Coupon Form */}
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

              {/* Pricing breakdown */}
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

              {/* Submit Button */}
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