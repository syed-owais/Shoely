import api from '@/lib/axios';

export const adminPromoCodeApi = {
    getAll: (params?: Record<string, any>) =>
        api.get('/api/admin/promo-codes', { params }),

    getById: (id: string | number) =>
        api.get(`/api/admin/promo-codes/${id}`),

    create: (data: Record<string, any>) =>
        api.post('/api/admin/promo-codes', data),

    update: (id: string | number, data: Record<string, any>) =>
        api.put(`/api/admin/promo-codes/${id}`, data),

    delete: (id: string | number) =>
        api.delete(`/api/admin/promo-codes/${id}`),
};
