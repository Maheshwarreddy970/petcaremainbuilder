export function optimizeCloudinaryImage(url: string | undefined | null, width: number = 800) {
    if (!url || typeof url !== 'string' || !url.includes('res.cloudinary.com')) {
        return url || "";
    }

    const uploadIndex = url.indexOf('/upload/');
    if (uploadIndex === -1) return url;

    const prefix = url.substring(0, uploadIndex + 8);
    const suffix = url.substring(uploadIndex + 8);

    // Look for the version string (e.g., v1785604722/) to safely strip old, unoptimized transformations
    const versionMatch = suffix.match(/(v\d+\/.*)/);
    
    // c_limit: Only scales down (saves bandwidth), never upscales.
    // f_auto: Delivers AVIF/WebP automatically.
    // q_auto: Employs AI to compress without visible quality loss.
    const optimalTransforms = `c_limit,w_${width},f_auto,q_auto`;

    if (versionMatch) {
        return `${prefix}${optimalTransforms}/${versionMatch[1]}`;
    } else {
        return `${prefix}${optimalTransforms}/${suffix}`;
    }
}