import api from '@/lib/axios';

export const adminDashboardApi = {
    getStats: () =>
        api.get('/api/admin/dashboard/stats'),
    getChartData: () =>
        api.get('/api/admin/dashboard/chart'),
    exportOrders: (params?: Record<string, string>) =>
        api.get('/api/admin/exports/orders', { params, responseType: 'blob' }),
    exportCustomers: () =>
        api.get('/api/admin/exports/customers', { responseType: 'blob' }),
};
