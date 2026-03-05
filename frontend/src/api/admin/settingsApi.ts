import api from '@/lib/axios';

export const settingsApi = {
    getAll: () => api.get('/api/admin/settings'),
    getGroup: (group: string) => api.get(`/api/admin/settings/${group}`),
    update: (settings: { key: string; value: string | boolean | null }[]) =>
        api.put('/api/admin/settings', { settings }),
};
