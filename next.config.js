/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'plus.unsplash.com',
            },
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '5000',
                pathname: '/uploads/**',
            },
            {
                protocol: 'http',
                hostname: '127.0.0.1',
                port: '5000',
                pathname: '/uploads/**',
            },
            {
                protocol: 'https',
                hostname: 'igloo-housing-backend.vercel.app',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'ialjamifosdmalaecqpa.supabase.co',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: '*.googleusercontent.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'avatars.githubusercontent.com',
                pathname: '/**',
            }
        ]
    },
    async redirects() {
        return [
            {
                source: '/sign-in/:path*',
                destination: '/login',
                permanent: true,
            },
            {
                source: '/sign-up/:path*',
                destination: '/signup',
                permanent: true,
            },
            {
                source: '/auth/clerk-callback',
                destination: '/login',
                permanent: true,
            },
        ];
    },
};

module.exports = nextConfig;
