import api from '@/lib/axios';

export const campaignApi = {
    getActive: () =>
        api.get('/api/campaigns'),
};
