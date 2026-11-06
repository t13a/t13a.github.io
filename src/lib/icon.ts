// Build-time rasters of src/assets/icon.svg for browsers and devices that do not take SVG.

import sharp from 'sharp';
import icon from '../assets/icon.svg?raw';

export interface Raster {
  size: number;
  png: Uint8Array<ArrayBuffer>;
}

/** The icon as a square PNG of `size` pixels, without an alpha channel like the drawing. */
export async function raster(size: number): Promise<Raster> {
  const png = await sharp(Buffer.from(icon), { density: (72 * size) / 64 })
    .resize(size, size)
    .removeAlpha()
    .png()
    .toBuffer();
  return { size, png: new Uint8Array(png) };
}

/** Packs PNGs into one .ico file: a directory of sizes, then each PNG as is. */
export function ico(images: Raster[]): Uint8Array<ArrayBuffer> {
  const start = 6 + 16 * images.length;
  const out = new Uint8Array(start + images.reduce((n, { png }) => n + png.length, 0));
  const view = new DataView(out.buffer);
  view.setUint16(2, 1, true); // an icon rather than a cursor
  view.setUint16(4, images.length, true);
  let offset = start;
  images.forEach(({ size, png }, i) => {
    const entry = 6 + 16 * i;
    view.setUint8(entry, size); // width and height; 0 would mean 256
    view.setUint8(entry + 1, size);
    view.setUint16(entry + 4, 1, true); // colour planes
    view.setUint16(entry + 6, 24, true); // bits per pixel: RGB
    view.setUint32(entry + 8, png.length, true);
    view.setUint32(entry + 12, offset, true);
    out.set(png, offset);
    offset += png.length;
  });
  return out;
}
