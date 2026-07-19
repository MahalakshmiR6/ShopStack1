import api from './client';

export const getWishlist = () => api.get('/api/wishlist');
export const addToWishlist = (productId) => api.post(`/api/wishlist/${productId}`);
export const removeFromWishlist = (productId) => api.delete(`/api/wishlist/${productId}`);
export const checkWishlistStatus = (productId) => api.get(`/api/wishlist/check/${productId}`);
