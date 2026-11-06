import type { APIRoute } from 'astro';
import icon from '../assets/icon.svg?raw';

// Written to dist/icon.svg at build time: the favicon for browsers that take SVG.
export const GET: APIRoute = () => new Response(icon, { headers: { 'Content-Type': 'image/svg+xml' } });
