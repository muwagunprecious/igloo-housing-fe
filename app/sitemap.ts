import { MetadataRoute } from 'next'
import { config } from './lib/config'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://igloo-housing-fe.vercel.app'

    // Basic static routes
    const routes = [
        '',
        '/roommates',
        '/search',
        '/login',
        '/signup',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
    }))

    try {
        // Fetch properties for dynamic routes
        const response = await fetch(`${config.apiUrl}/properties`)
        const properties = await response.json()

        if (properties.success && Array.isArray(properties.data)) {
            const propertyRoutes = properties.data.map((property: any) => ({
                url: `${baseUrl}/rooms/${property.id}`,
                lastModified: new Date(property.updatedAt),
                changeFrequency: 'weekly' as const,
                priority: 0.7,
            }))
            return [...routes, ...propertyRoutes]
        }
    } catch (error) {
        console.error('Sitemap generation failed:', error)
    }

    return routes
}
