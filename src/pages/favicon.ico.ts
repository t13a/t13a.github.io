import type { APIRoute } from 'astro';
import { ico, raster } from '../lib/icon';

// Written to dist/favicon.ico at build time, at the sizes tabs and bookmarks ask for.
export const GET: APIRoute = async () =>
  new Response(ico(await Promise.all([16, 32].map(raster))), { headers: { 'Content-Type': 'image/x-icon' } });
