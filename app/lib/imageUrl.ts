import { config } from './config';

/**
 * Formats image URLs correctly by prepending the backend URL if the path is relative.
 * 
 * @param path The image path from the backend
 * @returns The full URL to the image
 */
export const getImageUrl = (path: string | null | undefined): string => {
    if (!path) return '/placeholder-property.jpg';

    let actualPath = path;

    // Handle case where path is a JSON string (e.g. '["https://..."]')
    if (typeof path === 'string' && path.startsWith('[')) {
        try {
            const parsed = JSON.parse(path);
            if (Array.isArray(parsed) && parsed.length > 0) {
                actualPath = parsed[0];
            } else if (typeof parsed === 'string') {
                actualPath = parsed;
            }
        } catch (e) {
            // Not JSON or parse failed, continue with original path
            console.warn('Failed to parse image path:', path);
        }
    }

    // If it's already a full URL or a data URI, return as is
    if (actualPath.startsWith('http') || actualPath.startsWith('data:')) {
        return actualPath;
    }

    // Append baseURL if it's a relative path from the uploads folder
    const baseURL = config.backendUrl;

    // Safety: If the path is a legacy local upload (/uploads/...) and we are on Vercel,
    // it's guaranteed to 404. Return a placeholder instead.
    if (actualPath.startsWith('/uploads/') && baseURL.includes('vercel.app')) {
        return '/placeholder-property.jpg';
    }

    // Ensure we don't end up with double slashes
    const cleanPath = actualPath.startsWith('/') ? actualPath : `/${actualPath}`;

    return `${baseURL}${cleanPath}`;
};
