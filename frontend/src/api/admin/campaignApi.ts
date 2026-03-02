import api from '@/lib/axios';

export const adminCampaignApi = {
    getAll: (params?: Record<string, any>) =>
        api.get('/api/admin/campaigns', { params }),

    getById: (id: string | number) =>
        api.get(`/api/admin/campaigns/${id}`),

    create: (data: Record<string, any>) =>
        api.post('/api/admin/campaigns', data),

    update: (id: string | number, data: Record<string, any>) =>
        api.put(`/api/admin/campaigns/${id}`, data),

    delete: (id: string | number) =>
        api.delete(`/api/admin/campaigns/${id}`),
};
