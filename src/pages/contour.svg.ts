import type { APIRoute } from 'astro';
import { contourSvg } from '../lib/shapes';

// Written to dist/contour.svg at build time and used as the page background.
export const GET: APIRoute = () =>
  new Response(contourSvg('255, 255, 255', 0.08, 0.15), { headers: { 'Content-Type': 'image/svg+xml' } });
