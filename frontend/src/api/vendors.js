import api from './client';

// Vendor own profile
export const getVendorProfile = () =>
  api.get('/api/profiles/vendor');

export const updateVendorProfile = (data) =>
  api.put('/api/profiles/vendor', data);

// Customer own profile
export const getCustomerProfile = () =>
  api.get('/api/profiles/customer');

export const updateCustomerProfile = (data) =>
  api.put('/api/profiles/customer', data);

// Admin vendor management
export const getAllVendors = (status) =>
  api.get('/api/admin/vendors', { params: status ? { status } : {} });

export const updateVendorStatus = (id, status, commissionRate) =>
  api.put(`/api/admin/vendors/${id}/status`, { status, commissionRate });

export const updateAvatar = (avatarUrl) =>
  api.put('/api/profiles/avatar', { avatarUrl });
