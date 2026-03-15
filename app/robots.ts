import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/admin/',
                '/agents/dashboard/',
                '/api/',
                '/*/settings',
            ],
        },
        sitemap: 'https://igloo-housing-fe.vercel.app/sitemap.xml',
    }
}
