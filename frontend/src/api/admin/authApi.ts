import api from '@/lib/axios';

export const adminAuthApi = {
    login: (data: { email: string; password: string }) =>
        api.post('/api/admin/login', data),

    logout: () =>
        api.post('/api/admin/logout'),
};
