/**
 * Public asset path that works on Netlify / Vite preview / subpath deploys.
 * Example: assetUrl('assets/maps/battlefield.png')
 */
export function assetUrl(path: string): string {
  const base = import.meta.env.BASE_URL || '/';
  const normalized = path.replace(/^\/+/, '');
  const prefix = base.endsWith('/') ? base : `${base}/`;
  return `${prefix}${normalized}`;
}
