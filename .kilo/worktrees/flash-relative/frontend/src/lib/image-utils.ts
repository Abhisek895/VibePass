/**
 * Normalizes an image URL from the backend.
 * Handles relative paths by prefixing them with the backend host,
 * and passes through absolute URLs.
 */
export function normalizeImageUrl(url?: string | null): string | undefined {
  if (!url) {
    return undefined;
  }

  // If it's already an absolute URL, return as is
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }

  // Ensure relative path has leading slash
  const cleanPath = url.startsWith('/') ? url : `/${url}`;

  // Local backend fallback - should ideally come from env
  const backendHost = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';
  
  // Strip trailing slash from host if present
  const base = backendHost.endsWith('/') ? backendHost.slice(0, -1) : backendHost;
  
  return `${base}${cleanPath}`;
}
