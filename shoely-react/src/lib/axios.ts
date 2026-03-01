import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,         // sends cookies for Sanctum SPA auth
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
});

export default api;
