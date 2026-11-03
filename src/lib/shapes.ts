// Build-time SVG geometry: the contour background and the tree-ring chart.

type Wobble = (angle: number) => number;

/** A closed loop around (cx, cy), its radius scaled by 1 + wobble(angle), smoothed with quadratic curves. */
function loop(cx: number, cy: number, radius: number, wobble: Wobble, points = 64, squash = 1, digits = 1): string {
  const pts: [number, number][] = [];
  for (let i = 0; i < points; i++) {
    const t = (i / points) * Math.PI * 2;
    const r = radius * (1 + wobble(t));
    pts.push([cx + r * Math.cos(t), cy + r * Math.sin(t) * squash]);
  }
  const mid = (a: [number, number], b: [number, number]) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const xy = (p: number[]) => `${p[0].toFixed(digits)} ${p[1].toFixed(digits)}`;
  let d = `M${xy(mid(pts[points - 1], pts[0]))}`;
  pts.forEach((p, i) => (d += `Q${xy(p)} ${xy(mid(p, pts[(i + 1) % points]))}`));
  return `${d}Z`;
}

/** Concentric contour lines around the lower right, every fifth one heavier. */
export function contourSvg(rgb: string): string {
  let paths = '';
  for (let i = 1; i <= 30; i++) {
    const wobble: Wobble = (t) =>
      0.1 * Math.sin(3 * t + 0.8 + i * 0.12) + 0.06 * Math.sin(5 * t + 2.1 - i * 0.09) + 0.03 * Math.sin(9 * t + i * 0.2);
    const major = i % 5 === 0;
    paths += `<path d="${loop(1180, 760, 30 + i * 52, wobble, 64, 0.82, 0)}" stroke-width="${major ? 1.6 : 1}" stroke-opacity="${major ? 0.16 : 0.094}"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000"><g fill="none" stroke="rgb(${rgb})">${paths}</g></svg>`;
}

export type Ring = { d: string; fill: string };

/**
 * One ring per year, innermost first, each ring's area proportional to that year's count.
 * Quiet years still get a thin ring so every year stays visible.
 */
export function treeRings(counts: number[], size = 112): Ring[] {
  const total = counts.reduce((a, b) => a + b, 0);
  const floor = total * 0.04;
  const outer = size / 2 - 3;
  const wobble: Wobble = (t) => 0.03 * Math.sin(3 * t + 0.6) + 0.015 * Math.sin(5 * t + 2);
  let sum = 0;
  return counts.map((count, i) => {
    sum += count + floor;
    const r = outer * Math.sqrt(sum / (total + floor * counts.length));
    // The pith sits a little off centre, like real wood.
    const shift = (outer - r) * 0.1;
    const fill = i === counts.length - 1 ? 'var(--ring-now)' : i % 2 ? 'var(--ring-a)' : 'var(--ring-b)';
    return { d: loop(size / 2 - shift, size / 2 - shift * 0.6, r, wobble, 48), fill };
  });
}
