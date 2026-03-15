/**
 * Application configuration
 * Centralizes environment-specific URLs
 */

export const config = {
    // API Base URL - uses environment variable or defaults to production
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'https://igloo-housing-backend.vercel.app/api',

    // Backend Base URL (for images and socket connections)
    backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || 'https://igloo-housing-backend.vercel.app',

    // WebSocket URL (same as backend for now, but can be different)
    socketUrl: process.env.NEXT_PUBLIC_SOCKET_URL || 'https://igloo-housing-backend.vercel.app',
};
