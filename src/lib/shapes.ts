// Build-time SVG geometry for the contour background.

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

/** Concentric contour lines around the lower right, every fifth one heavier and stronger. */
export function contourSvg(rgb: string, minor: number, major: number): string {
  let paths = '';
  for (let i = 1; i <= 30; i++) {
    const wobble: Wobble = (t) =>
      0.1 * Math.sin(3 * t + 0.8 + i * 0.12) + 0.06 * Math.sin(5 * t + 2.1 - i * 0.09) + 0.03 * Math.sin(9 * t + i * 0.2);
    const heavy = i % 5 === 0;
    paths += `<path d="${loop(1180, 760, 30 + i * 52, wobble, 64, 0.82, 0)}" stroke-width="${heavy ? 1.6 : 1}" stroke-opacity="${heavy ? major : minor}"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000"><g fill="none" stroke="rgb(${rgb})">${paths}</g></svg>`;
}
