import api from './axios';

/**
 * Compresses an image file in the browser using an HTML5 Canvas.
 * Reduces 5MB-10MB camera photos to ~250KB without visual quality loss.
 */
export async function compressImage(file: File, maxWidth = 1920, quality = 0.85): Promise<File> {
    if (typeof window === 'undefined' || !file.type.startsWith('image/') || file.size < 500 * 1024) {
        return file; // Already small or not an image
    }

    return new Promise((resolve) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(url);
            let { width, height } = img;

            if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                resolve(file);
                return;
            }

            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob(
                (blob) => {
                    if (blob && blob.size < file.size) {
                        const newName = file.name.replace(/\.[^.]+$/, '.jpg');
                        resolve(new File([blob], newName, { type: 'image/jpeg' }));
                    } else {
                        resolve(file);
                    }
                },
                'image/jpeg',
                quality
            );
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            resolve(file);
        };

        img.src = url;
    });
}

/**
 * Uploads files directly to Supabase Storage via signed upload URLs.
 * This completely bypasses Vercel's 4.5MB serverless function limit and prevents "Network Error".
 *
 * @param files Array of File objects (images or videos)
 * @param onProgress Callback to report current progress message
 * @returns Array of public URLs for the uploaded files
 */
export async function uploadFilesDirectly(
    files: File[],
    onProgress?: (msg: string) => void
): Promise<string[]> {
    if (!files || files.length === 0) return [];

    // Step 1: Optimize images in the browser
    const processedFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
        const f = files[i];
        if (f.type.startsWith('image/')) {
            onProgress?.(`Optimizing photo ${i + 1} of ${files.length}...`);
            const compressed = await compressImage(f);
            processedFiles.push(compressed);
        } else {
            processedFiles.push(f);
        }
    }

    // Step 2: Request signed upload URLs from the backend
    onProgress?.('Preparing secure media upload...');
    const fileMetadata = processedFiles.map(f => ({
        fileName: f.name,
        fileType: f.type || 'application/octet-stream'
    }));

    const signResponse = await api.post('/properties/upload-url', { files: fileMetadata });
    const signedData: Array<{ signedUrl: string; publicUrl: string }> =
        signResponse.data.data || signResponse.data;

    if (!Array.isArray(signedData) || signedData.length !== processedFiles.length) {
        throw new Error('Failed to obtain upload authorization for all files.');
    }

    // Step 3: Upload directly to Supabase Storage
    const uploadedUrls: string[] = [];
    for (let i = 0; i < processedFiles.length; i++) {
        const file = processedFiles[i];
        const item = signedData[i];

        const isVideo = file.type.startsWith('video/');
        onProgress?.(
            isVideo
                ? `Uploading video tour... (this may take a moment)`
                : `Uploading photo ${i + 1} of ${processedFiles.length}...`
        );

        const uploadRes = await fetch(item.signedUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': file.type || 'application/octet-stream',
            },
            body: file,
        });

        if (!uploadRes.ok) {
            throw new Error(`Media upload failed (${uploadRes.status}: ${uploadRes.statusText})`);
        }

        uploadedUrls.push(item.publicUrl);
    }

    return uploadedUrls;
}
