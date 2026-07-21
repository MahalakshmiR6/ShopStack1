import api from './client';

// Public
export const searchProducts = (params) =>
  api.get('/api/products/public', { params });

export const getProductBySlug = (slug) =>
  api.get(`/api/products/public/${slug}`);

export const getCategories = () =>
  api.get('/api/categories/public');

// Vendor
export const getVendorProducts = () =>
  api.get('/api/vendor/products');

export const createProduct = (data, categoryId) =>
  api.post('/api/vendor/products', data, { params: { categoryId } });

export const updateProduct = (id, data, categoryId) =>
  api.put(`/api/vendor/products/${id}`, data, { params: { categoryId } });

export const deleteProduct = (id) =>
  api.delete(`/api/vendor/products/${id}`);

export const submitProductForApproval = (id) =>
  api.post(`/api/vendor/products/${id}/submit`);

export const addProductImage = (id, imageUrl, isPrimary = false) =>
  api.post(`/api/vendor/products/${id}/image`, { imageUrl, isPrimary });

// Reviews
export const addReview = (productId, rating, comment) =>
  api.post(`/api/products/${productId}/review`, { rating, comment });

// Admin
export const getPendingProducts = () =>
  api.get('/api/admin/products/pending');

export const approveProduct = (id, status) =>
  api.put(`/api/admin/products/${id}/approve`, { status });

// Stock Management
export const updateVendorStock = (id, stockQuantity) =>
  api.put(`/api/vendor/products/${id}/stock`, { stockQuantity });

export const updateAdminStock = (id, stockQuantity) =>
  api.put(`/api/admin/products/${id}/stock`, { stockQuantity });

export const createCategory = (data, parentId) =>
  api.post('/api/admin/categories', data, { params: parentId ? { parentId } : {} });

export const deleteCategory = (id) =>
  api.delete(`/api/admin/categories/${id}`);
