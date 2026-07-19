import api from './client';

// Create Razorpay payment session
export const createPaymentSession = (amount) =>
  api.post('/api/orders/create-payment-session', { amount });

// Place Checkout Order
export const checkoutOrder = (data) =>
  api.post('/api/orders/checkout', data);

// Customer: Get logged in user orders
export const getMyOrders = () =>
  api.get('/api/orders/my-orders');

// Get specific order details
export const getOrderById = (id) =>
  api.get(`/api/orders/${id}`);

// Update Order Status (Vendor / Admin)
export const updateOrderStatus = (id, status) =>
  api.put(`/api/orders/${id}/status`, { status });

// Vendor: Get orders containing vendor's products
export const getVendorOrders = () =>
  api.get('/api/vendor/orders');

// Admin: Get all platform orders
export const getAdminOrders = () =>
  api.get('/api/admin/orders');

// Validate Coupon Code
export const validateCoupon = (code) =>
  api.get(`/api/coupons/validate/${code}`);
