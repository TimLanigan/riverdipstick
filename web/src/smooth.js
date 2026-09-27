// Centered average of nearby readings. 1 leaves the line raw.
// Not a spline. The ends use whatever neighbours exist.
export function smoothPoints(points, window) {
  const size = Math.max(1, Math.round(Number(window) || 1));
  if (size <= 1 || points.length < 3) return points;
  const half = Math.floor(size / 2);
  return points.map((point, index) => {
    const from = Math.max(0, index - half);
    const to = Math.min(points.length - 1, index + half);
    let sum = 0;
    for (let i = from; i <= to; i += 1) sum += points[i].value;
    return { time: point.time, value: sum / (to - from + 1) };
  });
}
