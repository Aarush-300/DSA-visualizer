export interface Point {
  x: number;
  y: number;
}

export function computeCubicBezierPath(
  p1: Point,
  p2: Point,
  curvature: number = 0.4,
  direction: 'horizontal' | 'vertical' | 'arc' = 'horizontal'
): string {
  if (direction === 'horizontal') {
    const dx = p2.x - p1.x;
    const cx1 = p1.x + dx * curvature;
    const cy1 = p1.y;
    const cx2 = p2.x - dx * curvature;
    const cy2 = p2.y;
    return `M ${p1.x} ${p1.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p2.x} ${p2.y}`;
  }

  if (direction === 'vertical') {
    const dy = p2.y - p1.y;
    const cx1 = p1.x;
    const cy1 = p1.y + dy * curvature;
    const cx2 = p2.x;
    const cy2 = p2.y - dy * curvature;
    return `M ${p1.x} ${p1.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p2.x} ${p2.y}`;
  }

  // Arc over the top or bottom (useful for reversals or jump links)
  const mx = (p1.x + p2.x) / 2;
  const my = Math.min(p1.y, p2.y) - Math.abs(p2.x - p1.x) * curvature;
  return `M ${p1.x} ${p1.y} Q ${mx} ${my}, ${p2.x} ${p2.y}`;
}

export function computeSelfLoopPath(p: Point, radius: number = 24): string {
  const x = p.x;
  const y = p.y;
  return `M ${x} ${y} C ${x - radius} ${y - radius * 2}, ${x + radius} ${y - radius * 2}, ${x} ${y}`;
}

