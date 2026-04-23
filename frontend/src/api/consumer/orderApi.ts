import api from '@/lib/axios';

export const orderApi = {
    checkout: (data: {
        email: string;
        first_name: string;
        last_name: string;
        phone?: string;
        address: string;
        city: string;
        state?: string;
        zip_code: string;
        country?: string;
        promo_code?: string;
        payment_method: string;
        items?: { product_id: string; size: number; quantity: number }[];
    }) =>
        api.post('/api/orders/checkout', data),

    getAll: () =>
        api.get('/api/orders'),

    getById: (id: string | number) =>
        api.get(`/api/orders/${id}`),

    track: (orderNumber: string, email: string) =>
        api.post(`/api/orders/track/${orderNumber}`, { email }),
};
