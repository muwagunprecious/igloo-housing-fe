import axios from 'axios';
import { config } from './config';

const api = axios.create({
    baseURL: config.apiUrl,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to attach the current token
api.interceptors.request.use(
    (config) => {
        // We need to access storage directly or use the store's state if possible.
        // For simplicity, we'll try to read from localStorage if on client.
        if (typeof window !== 'undefined') {
            const storage = localStorage.getItem('igloo-auth-storage');
            if (storage) {
                try {
                    const parsed = JSON.parse(storage);
                    const token = parsed.state?.user?.token;
                    if (token) {
                        config.headers.Authorization = `Bearer ${token}`;
                    }
                } catch (e) {
                    console.error("Error parsing auth storage", e);
                }
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
