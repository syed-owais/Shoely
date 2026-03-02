import api from '@/lib/axios';

export const adminOrderApi = {
    getAll: (params?: Record<string, any>) =>
        api.get('/api/admin/orders', { params }),

    getById: (id: string | number) =>
        api.get(`/api/admin/orders/${id}`),

    updateStatus: (id: string | number, data: { status: string; tracking_number?: string }) =>
        api.put(`/api/admin/orders/${id}/status`, data),
};
