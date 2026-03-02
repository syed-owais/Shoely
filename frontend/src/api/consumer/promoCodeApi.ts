import api from '@/lib/axios';

export const promoCodeApi = {
    validate: (code: string, subtotal: number) =>
        api.post('/api/promo-codes/validate', { code, subtotal }),
};
