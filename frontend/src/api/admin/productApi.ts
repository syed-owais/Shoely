import api from '@/lib/axios';

export const adminProductApi = {
    getAll: (params?: Record<string, any>) =>
        api.get('/api/admin/products', { params }),

    create: (data: FormData | Record<string, any>) =>
        api.post('/api/admin/products', data),

    update: (id: string | number, data: FormData | Record<string, any>) =>
        api.put(`/api/admin/products/${id}`, data),

    delete: (id: string | number) =>
        api.delete(`/api/admin/products/${id}`),
};
