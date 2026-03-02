import api from '@/lib/axios';

export const adminDashboardApi = {
    getStats: () =>
        api.get('/api/admin/dashboard/stats'),
};
