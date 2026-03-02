import api from '@/lib/axios';

export const productApi = {
  getAll: (params?: Record<string, any>) =>
    api.get('/api/products', { params }),

  getFeatured: () =>
    api.get('/api/products/featured'),

  getById: (id: string | number) =>
    api.get(`/api/products/${id}`),
};
