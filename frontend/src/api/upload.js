import api from './client';

export const uploadProductImage = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/api/upload', formData);
};
