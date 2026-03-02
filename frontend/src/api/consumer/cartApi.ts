import api from '@/lib/axios';

export const cartApi = {
    get: () =>
        api.get('/api/cart'),

    addItem: (data: { product_id: number; size: number; quantity: number }) =>
        api.post('/api/cart/items', data),

    updateItem: (itemId: number, data: { quantity: number }) =>
        api.put(`/api/cart/items/${itemId}`, data),

    removeItem: (itemId: number) =>
        api.delete(`/api/cart/items/${itemId}`),

    sync: (items: Array<{ product_id: number; size: number; quantity: number }>) =>
        api.post('/api/cart/sync', { items }),
};
