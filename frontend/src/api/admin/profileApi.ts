import api from '@/lib/axios';

export const profileApi = {
    get: () =>
        api.get('/api/admin/profile'),

    updateProfile: (data: { first_name: string; last_name: string }) =>
        api.put('/api/admin/profile', data),

    updatePassword: (data: {
        current_password: string;
        password: string;
        password_confirmation: string;
    }) =>
        api.put('/api/admin/profile/password', data),
};
