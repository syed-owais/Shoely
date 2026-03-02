import axios from 'axios';
import { useStore } from '@/store/useStore';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
});

// Automatically attach the Bearer token to every request based on the route
api.interceptors.request.use((config) => {
    // If we're on an admin page, use the admin token. Otherwise use the consumer token.
    const isAdminRoute = window.location.pathname.startsWith('/admin');
    const token = isAdminRoute
        ? localStorage.getItem('admin_auth_token')
        : localStorage.getItem('auth_token');

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 responses globally (token expired/invalid)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const isAdminRoute = window.location.pathname.startsWith('/admin');
            const store = useStore.getState();

            if (isAdminRoute) {
                localStorage.removeItem('admin_auth_token');
                if (store.isAdminAuthenticated) {
                    store.adminLogout();
                }
            } else {
                localStorage.removeItem('auth_token');
                if (store.isAuthenticated) {
                    store.logout();
                }
            }
        }
        return Promise.reject(error);
    }
);

/**
 * Validate the stored tokens on app load.
 * Checks both consumer and admin tokens side-by-side.
 */
export async function validateToken(): Promise<void> {
    const customerToken = localStorage.getItem('auth_token');
    const adminToken = localStorage.getItem('admin_auth_token');

    const validationPromises: Promise<void>[] = [];

    // 1. Validate Consumer Token
    if (customerToken) {
        validationPromises.push(
            api.get('/api/user', {
                headers: { Authorization: `Bearer ${customerToken}` }
            }).then((response) => {
                const { user } = response.data;
                useStore.getState().setUser({
                    id: String(user.id),
                    email: user.email,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    role: user.role,
                    orders: [],
                    createdAt: new Date().toISOString(),
                });
            }).catch(() => {
                localStorage.removeItem('auth_token');
                useStore.getState().logout();
            })
        );
    }

    // 2. Validate Admin Token
    if (adminToken) {
        validationPromises.push(
            api.get('/api/user', {
                headers: { Authorization: `Bearer ${adminToken}` }
            }).then((response) => {
                const { user } = response.data;
                useStore.getState().setAdminUser({
                    id: String(user.id),
                    email: user.email,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    role: user.role,
                    orders: [],
                    createdAt: new Date().toISOString(),
                });
            }).catch(() => {
                localStorage.removeItem('admin_auth_token');
                useStore.getState().adminLogout();
            })
        );
    }

    await Promise.all(validationPromises);
}

export default api;
