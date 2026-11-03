import type { APIRoute } from 'astro';
import { contourSvg } from '../lib/shapes';

// Written to dist/contour.svg at build time and used as the page background.
export const GET: APIRoute = () =>
  new Response(contourSvg('44, 52, 35'), { headers: { 'Content-Type': 'image/svg+xml' } });
