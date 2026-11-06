import type { APIRoute } from 'astro';
import { raster } from '../lib/icon';

// Written to dist/apple-touch-icon.png at build time, for home screens.
export const GET: APIRoute = async () =>
  new Response((await raster(180)).png, { headers: { 'Content-Type': 'image/png' } });
